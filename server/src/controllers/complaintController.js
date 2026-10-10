import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta, parsePagination } from '../utils/apiResponse.js';
import { generateTrackingCode } from '../utils/generate.js';
import { recordAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';
import { applyStatusChange, buildInitialHistory } from '../services/complaintService.js';
import {
  ROLES,
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
  STATUS_LABELS,
} from '../utils/constants.js';
import env from '../config/env.js';

const DUE_DAYS = { urgent: 1, high: 3, medium: 5, low: 7 };

function imageUrl(filename) {
  return `${env.API_PREFIX}/complaints/images/${filename}`;
}

function mapAttachments(files = [], uploadedBy) {
  return files.map((f) => ({
    filename: f.filename,
    originalName: f.originalname,
    mimeType: f.mimetype,
    size: f.size,
    url: imageUrl(f.filename),
    uploadedBy,
  }));
}

function buildFilter(req) {
  const filter = {};
  const { status, category, priority, assignedTo, search } = req.query;

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  if (req.user.role === ROLES.CITIZEN) {
    filter.citizen = req.user._id;
  } else if (req.user.role === ROLES.STAFF) {
    // Staff only see complaints assigned to them (unless an explicit filter is set).
    filter.assignedTo = assignedTo || req.user._id;
    if (assignedTo && !mongoose.isValidObjectId(assignedTo)) {
      throw ApiError.badRequest('Invalid assignedTo filter');
    }
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (search) {
    const rx = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { trackingCode: rx }, { address: rx }];
  }
  return filter;
}

function sortOption(sort) {
  switch (sort) {
    case 'oldest': return { createdAt: 1 };
    case 'updated': return { updatedAt: -1 };
    case 'priority': return { priority: -1, createdAt: -1 };
    default: return { createdAt: -1 };
  }
}

function populateComplaint(query) {
  return query
    .populate('category', 'name slug icon colorHex defaultDepartment')
    .populate('citizen', 'name email')
    .populate('assignedTo', 'name email department')
    .populate('history.actor', 'name role');
}

export const createComplaint = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category || !category.isActive) throw ApiError.badRequest('Invalid or inactive category');

  const attachments = mapAttachments(req.files || [], req.user._id);
  const priority = req.body.priority || category.defaultPriority || COMPLAINT_PRIORITY.MEDIUM;
  const dueAt = new Date(Date.now() + (DUE_DAYS[priority] || 5) * 24 * 60 * 60 * 1000);

  const complaint = new Complaint({
    trackingCode: generateTrackingCode(),
    title: req.body.title,
    description: req.body.description,
    category: category._id,
    citizen: req.user._id,
    address: req.body.address,
    priority,
    dueAt,
    attachments,
    status: COMPLAINT_STATUS.SUBMITTED,
    history: buildInitialHistory({
      actorId: req.user._id,
      actorRole: ROLES.CITIZEN,
      note: 'Complaint submitted by citizen',
    }),
  });

  if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
    complaint.location = { type: 'Point', coordinates: [req.body.longitude, req.body.latitude] };
  }

  await complaint.save();

  await createNotification({
    recipient: req.user._id,
    type: 'complaint_submitted',
    title: 'Complaint received',
    message: `Your complaint "${complaint.title}" was submitted. Tracking code: ${complaint.trackingCode}.`,
    complaint: complaint._id,
    link: `/citizen/complaints/${complaint._id}`,
  });

  await recordAudit({
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'complaint.create',
    entityType: 'Complaint',
    entityId: complaint._id,
    description: `New complaint ${complaint.trackingCode}`,
    req,
  });

  const populated = await populateComplaint(Complaint.findById(complaint._id));
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Complaint submitted successfully',
    data: { complaint: populated },
  });
});

export const listComplaints = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = buildFilter(req);

  const [complaints, total] = await Promise.all([
    populateComplaint(Complaint.find(filter).sort(sortOption(req.query.sort)).skip(skip).limit(limit)),
    Complaint.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    data: { complaints },
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

export const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await populateComplaint(Complaint.findById(req.params.id));
  if (!complaint) throw ApiError.notFound('Complaint not found');

  assertCanView(req.user, complaint);
  return sendSuccess(res, { data: { complaint } });
});

export const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw ApiError.notFound('Complaint not found');

  const isOwner = String(complaint.citizen) === String(req.user._id);
  const isAdmin = req.user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) throw ApiError.forbidden();

  if (isOwner && [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED].includes(complaint.status)) {
    throw ApiError.badRequest('Resolved or closed complaints cannot be edited');
  }

  const editable = ['title', 'description', 'category', 'address', 'priority'];
  for (const key of editable) {
    if (req.body[key] !== undefined) complaint[key] = req.body[key];
  }
  await complaint.save();

  await recordAudit({
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'complaint.update',
    entityType: 'Complaint',
    entityId: complaint._id,
    description: `Updated complaint ${complaint.trackingCode}`,
    metadata: req.body,
    req,
  });

  const populated = await populateComplaint(Complaint.findById(complaint._id));
  return sendSuccess(res, { message: 'Complaint updated', data: { complaint: populated } });
});

export const assignComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw ApiError.notFound('Complaint not found');

  const staff = await User.findOne({ _id: req.body.staffId, role: ROLES.STAFF, isActive: true });
  if (!staff) throw ApiError.badRequest('Selected staff member is not available');

  complaint.assignedTo = staff._id;
  complaint.assignedAt = new Date();

  // Move to "assigned" when the workflow permits it.
  if (![COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.IN_PROGRESS].includes(complaint.status)) {
    applyStatusChange(complaint, {
      toStatus: COMPLAINT_STATUS.ASSIGNED,
      actorId: req.user._id,
      actorRole: req.user.role,
      note: req.body.note || `Assigned to ${staff.name}`,
    });
  } else {
    complaint.history.push({
      status: complaint.status,
      previousStatus: complaint.status,
      note: `Reassigned to ${staff.name}`,
      actor: req.user._id,
      actorRole: req.user.role,
      isPublic: true,
      at: new Date(),
    });
  }

  await complaint.save();

  await createNotification({
    recipient: staff._id,
    type: 'assigned',
    title: 'New complaint assigned',
    message: `Complaint ${complaint.trackingCode} has been assigned to you.`,
    complaint: complaint._id,
    link: `/staff/complaints/${complaint._id}`,
  });
  await createNotification({
    recipient: complaint.citizen,
    type: 'status_changed',
    title: 'Your complaint has been assigned',
    message: `Complaint ${complaint.trackingCode} is now assigned to ${staff.name}.`,
    complaint: complaint._id,
    link: `/citizen/complaints/${complaint._id}`,
  });

  await recordAudit({
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'complaint.assign',
    entityType: 'Complaint',
    entityId: complaint._id,
    description: `Assigned ${complaint.trackingCode} to ${staff.email}`,
    req,
  });

  const populated = await populateComplaint(Complaint.findById(complaint._id));
  return sendSuccess(res, { message: 'Complaint assigned', data: { complaint: populated } });
});

export const changeStatus = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw ApiError.notFound('Complaint not found');

  const { status, note, resolutionNotes, isPublic } = req.body;

  // Staff may only act on complaints assigned to them.
  if (req.user.role === ROLES.STAFF && String(complaint.assignedTo) !== String(req.user._id)) {
    throw ApiError.forbidden('This complaint is not assigned to you');
  }

  // Only admins can reject or close directly; also gate resolution.
  if ([COMPLAINT_STATUS.REJECTED, COMPLAINT_STATUS.CLOSED].includes(status) && req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Only administrators can set this status');
  }

  applyStatusChange(complaint, {
    toStatus: status,
    actorId: req.user._id,
    actorRole: req.user.role,
    note,
    isPublic: isPublic !== false,
  });

  if (status === COMPLAINT_STATUS.RESOLVED && resolutionNotes) {
    complaint.resolutionNotes = resolutionNotes;
  }
  if (req.files?.length) {
    complaint.resolutionAttachments.push(...mapAttachments(req.files, req.user._id));
  }

  await complaint.save();

  await createNotification({
    recipient: complaint.citizen,
    type: 'status_changed',
    title: `Complaint ${STATUS_LABELS[status]}`,
    message: `Your complaint ${complaint.trackingCode} is now "${STATUS_LABELS[status]}".`,
    complaint: complaint._id,
    link: `/citizen/complaints/${complaint._id}`,
  });

  await recordAudit({
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'complaint.status',
    entityType: 'Complaint',
    entityId: complaint._id,
    description: `Status ${complaint.trackingCode} -> ${status}`,
    req,
  });

  const populated = await populateComplaint(Complaint.findById(complaint._id));
  return sendSuccess(res, { message: 'Status updated', data: { complaint: populated } });
});

export const rejectComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw ApiError.notFound('Complaint not found');

  applyStatusChange(complaint, {
    toStatus: COMPLAINT_STATUS.REJECTED,
    actorId: req.user._id,
    actorRole: req.user.role,
    note: req.body.reason,
  });
  complaint.rejectionReason = req.body.reason;
  await complaint.save();

  await createNotification({
    recipient: complaint.citizen,
    type: 'status_changed',
    title: 'Complaint rejected',
    message: `Your complaint ${complaint.trackingCode} was rejected: ${req.body.reason}`,
    complaint: complaint._id,
    link: `/citizen/complaints/${complaint._id}`,
  });

  await recordAudit({
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'complaint.reject',
    entityType: 'Complaint',
    entityId: complaint._id,
    description: `Rejected ${complaint.trackingCode}`,
    req,
  });

  const populated = await populateComplaint(Complaint.findById(complaint._id));
  return sendSuccess(res, { message: 'Complaint rejected', data: { complaint: populated } });
});

export const reopenComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw ApiError.notFound('Complaint not found');

  const isOwner = String(complaint.citizen) === String(req.user._id);
  if (!isOwner && req.user.role !== ROLES.ADMIN) throw ApiError.forbidden();
  if (![COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.REJECTED].includes(complaint.status)) {
    throw ApiError.badRequest('Only resolved, closed or rejected complaints can be reopened');
  }

  applyStatusChange(complaint, {
    toStatus: COMPLAINT_STATUS.REOPENED,
    actorId: req.user._id,
    actorRole: req.user.role,
    note: req.body?.reason || 'Complaint reopened',
  });
  complaint.rejectionReason = '';
  await complaint.save();

  await recordAudit({
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'complaint.reopen',
    entityType: 'Complaint',
    entityId: complaint._id,
    description: `Reopened ${complaint.trackingCode}`,
    req,
  });

  const populated = await populateComplaint(Complaint.findById(complaint._id));
  return sendSuccess(res, { message: 'Complaint reopened', data: { complaint: populated } });
});

export const getHistory = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id).populate('history.actor', 'name role');
  if (!complaint) throw ApiError.notFound('Complaint not found');
  assertCanView(req.user, complaint);

  const history = complaint.history
    .filter((h) => h.isPublic || req.user.role !== ROLES.CITIZEN)
    .map((h) => ({
      _id: h._id,
      status: h.status,
      previousStatus: h.previousStatus,
      note: h.isPublic || req.user.role !== ROLES.CITIZEN ? h.note : '',
      actor: h.actor ? { name: h.actor.name, role: h.actor.role } : null,
      actorRole: h.actorRole,
      isPublic: h.isPublic,
      at: h.at,
    }));

  return sendSuccess(res, { data: { history } });
});

// Public, privacy-preserving tracking by tracking code.
export const trackPublic = asyncHandler(async (req, res) => {
  const code = (req.params.trackingCode || req.query.trackingCode || '').toUpperCase().trim();
  if (!code) throw ApiError.badRequest('Tracking code is required');

  const complaint = await Complaint.findOne({ trackingCode: code })
    .populate('category', 'name slug icon colorHex')
    .populate('assignedTo', 'department');
  if (!complaint || !complaint.isPublic) throw ApiError.notFound('No complaint found for that tracking code');

  const history = complaint.history
    .filter((h) => h.isPublic)
    .map((h) => ({ status: h.status, note: h.note, at: h.at }));

  return sendSuccess(res, {
    data: {
      complaint: {
        trackingCode: complaint.trackingCode,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        address: complaint.address,
        priority: complaint.priority,
        status: complaint.status,
        department: complaint.assignedTo?.department || '',
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        resolvedAt: complaint.resolvedAt,
        resolutionNotes: complaint.resolutionNotes,
        history,
      },
    },
  });
});

export const serveImage = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const safe = String(filename).replace(/[^a-zA-Z0-9._-]/g, '');
  const complaint = await Complaint.findOne({ 'attachments.filename': safe });
  if (!complaint) throw ApiError.notFound('Image not found');

  const canView =
    req.user &&
    (req.user.role === ROLES.ADMIN ||
      req.user.role === ROLES.STAFF ||
      String(complaint.citizen) === String(req.user._id));
  if (!canView) throw ApiError.unauthorized('You do not have access to this image');

  return res.sendFile(safe, { root: `${env.uploadPath}/complaints` });
});

function assertCanView(user, complaint) {
  if (user.role === ROLES.ADMIN) return;
  if (user.role === ROLES.STAFF && String(complaint.assignedTo?._id || complaint.assignedTo) === String(user._id)) return;
  if (String(complaint.citizen?._id || complaint.citizen) === String(user._id)) return;
  throw ApiError.forbidden('You do not have access to this complaint');
}

export default {
  createComplaint,
  listComplaints,
  getComplaint,
  updateComplaint,
  assignComplaint,
  changeStatus,
  rejectComplaint,
  reopenComplaint,
  getHistory,
  trackPublic,
  serveImage,
};
