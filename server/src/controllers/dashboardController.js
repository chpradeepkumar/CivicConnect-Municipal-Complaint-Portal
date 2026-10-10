import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { sendSuccess, parsePagination, buildPaginationMeta } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ROLES, COMPLAINT_STATUS } from '../utils/constants.js';

const OPEN_STATUSES = [
  COMPLAINT_STATUS.SUBMITTED,
  COMPLAINT_STATUS.UNDER_REVIEW,
  COMPLAINT_STATUS.ASSIGNED,
  COMPLAINT_STATUS.IN_PROGRESS,
  COMPLAINT_STATUS.REOPENED,
];

async function statusDistribution(match = {}) {
  const rows = await Complaint.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return rows.map((r) => ({ status: r._id, count: r.count }));
}

async function categoryDistribution(match = {}) {
  const rows = await Complaint.aggregate([
    { $match: match },
    { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
    { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
    { $group: { _id: '$cat.name', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return rows.map((r) => ({ category: r._id || 'Uncategorized', count: r.count }));
}

async function resolutionTrend(match = {}) {
  const rows = await Complaint.aggregate([
    {
      $match: {
        ...match,
        status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
        resolvedAt: { $ne: null },
      },
    },
    {
      $group: {
        _id: { y: { $year: '$resolvedAt' }, m: { $month: '$resolvedAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
    { $limit: 12 },
  ]);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return rows.map((r) => ({ label: `${months[r._id.m - 1]} ${r._id.y}`, count: r.count }));
}

function monthStart(offset) {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + offset);
  return d;
}

// ---------------- Public statistics ----------------
export const publicStats = asyncHandler(async (_req, res) => {
  const [total, resolved, inProgress, pending, categories] = await Promise.all([
    Complaint.countDocuments({ isPublic: true }),
    Complaint.countDocuments({ status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] } }),
    Complaint.countDocuments({ status: COMPLAINT_STATUS.IN_PROGRESS }),
    Complaint.countDocuments({ status: { $in: [COMPLAINT_STATUS.SUBMITTED, COMPLAINT_STATUS.UNDER_REVIEW] } }),
    categoryDistribution(),
  ]);
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  return sendSuccess(res, {
    data: { total, resolved, inProgress, pending, resolutionRate, categories },
  });
});

// ---------------- Citizen ----------------
export const citizenDashboard = asyncHandler(async (req, res) => {
  const match = { citizen: req.user._id };
  const [total, pending, inProgress, resolved, closed, recent, statuses, categories] = await Promise.all([
    Complaint.countDocuments(match),
    Complaint.countDocuments({ ...match, status: { $in: [COMPLAINT_STATUS.SUBMITTED, COMPLAINT_STATUS.UNDER_REVIEW] } }),
    Complaint.countDocuments({ ...match, status: { $in: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.REOPENED] } }),
    Complaint.countDocuments({ ...match, status: COMPLAINT_STATUS.RESOLVED }),
    Complaint.countDocuments({ ...match, status: COMPLAINT_STATUS.CLOSED }),
    Complaint.find(match)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('category', 'name slug icon colorHex')
      .lean(),
    statusDistribution(match),
    categoryDistribution(match),
  ]);

  return sendSuccess(res, {
    data: {
      metrics: { total, pending, inProgress, resolved, closed },
      recent,
      statusDistribution: statuses,
      categoryDistribution: categories,
    },
  });
});

// ---------------- Staff ----------------
export const staffDashboard = asyncHandler(async (req, res) => {
  const base = { assignedTo: req.user._id };
  const now = new Date();
  const [assigned, inProgress, resolved, overdue, recent, statuses, categories] = await Promise.all([
    Complaint.countDocuments(base),
    Complaint.countDocuments({ ...base, status: { $in: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.IN_PROGRESS] } }),
    Complaint.countDocuments({ ...base, status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] } }),
    Complaint.countDocuments({
      ...base,
      dueAt: { $lt: now },
      status: { $nin: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.REJECTED] },
    }),
    Complaint.find(base)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('category', 'name slug icon colorHex')
      .lean(),
    statusDistribution(base),
    categoryDistribution(base),
  ]);

  return sendSuccess(res, {
    data: {
      metrics: { assigned, inProgress, resolved, overdue },
      recent,
      statusDistribution: statuses,
      categoryDistribution: categories,
    },
  });
});

// ---------------- Admin ----------------
export const adminDashboard = asyncHandler(async (_req, res) => {
  const now = new Date();
  const twelveMonthsAgo = monthStart(-11);

  const [total, open, resolved, overdue, citizens, staffCount, recent, statuses, categories, trend, staffWorkload] =
    await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: { $in: OPEN_STATUSES } }),
      Complaint.countDocuments({ status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] } }),
      Complaint.countDocuments({
        dueAt: { $lt: now },
        status: { $nin: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.REJECTED] },
      }),
      User.countDocuments({ role: ROLES.CITIZEN }),
      User.countDocuments({ role: ROLES.STAFF, isActive: true }),
      Complaint.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('category', 'name slug icon colorHex')
        .populate('citizen', 'name')
        .lean(),
      statusDistribution(),
      categoryDistribution(),
      resolutionTrend({ createdAt: { $gte: twelveMonthsAgo } }),
      Complaint.aggregate([
        { $match: { assignedTo: { $ne: null } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 }, resolved: { $sum: { $cond: [{ $in: ['$status', [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED]] }, 1, 0] } } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $project: { count: 1, resolved: 1, name: '$user.name', department: '$user.department' } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

  const resolvedOnTime = await Complaint.countDocuments({
    status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
    resolvedAt: { $ne: null },
    $expr: { $lte: ['$resolvedAt', '$dueAt'] },
  });

  return sendSuccess(res, {
    data: {
      metrics: {
        total,
        open,
        resolved,
        overdue,
        citizens,
        staff: staffCount,
        resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
        onTimeRate: resolved ? Math.round((resolvedOnTime / resolved) * 100) : 0,
      },
      recent,
      statusDistribution: statuses,
      categoryDistribution: categories,
      resolutionTrend: trend,
      staffWorkload,
    },
  });
});

// ---------------- Audit logs ----------------
export const listAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
  const filter = {};
  if (req.query.action) filter.action = req.query.action;
  if (req.query.entityType) filter.entityType = req.query.entityType;
  if (req.query.actor) filter.actor = req.query.actor;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('actor', 'name email role'),
    AuditLog.countDocuments(filter),
  ]);
  return sendSuccess(res, { data: { logs }, meta: buildPaginationMeta({ page, limit, total }) });
});

export default {
  publicStats,
  citizenDashboard,
  staffDashboard,
  adminDashboard,
  listAuditLogs,
};
