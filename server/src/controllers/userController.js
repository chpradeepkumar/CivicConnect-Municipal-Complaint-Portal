import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta, parsePagination } from '../utils/apiResponse.js';
import { recordAudit } from '../services/auditService.js';
import { ROLES } from '../utils/constants.js';

// ---------------- Citizen profile ----------------

export const getProfile = asyncHandler(async (req, res) => {
  return sendSuccess(res, { data: { user: req.user.toJSON() } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (address !== undefined) req.user.address = address;
  await req.user.save();
  return sendSuccess(res, { message: 'Profile updated', data: { user: req.user.toJSON() } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  return sendSuccess(res, { message: 'Password changed successfully' });
});

// ---------------- Admin: user management ----------------

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true' || req.query.isActive === true;
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    data: { users },
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  return sendSuccess(res, { data: { user } });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, department } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({ name, email, password, role, phone, department });
  await recordAudit({
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'user.create',
    entityType: 'User',
    entityId: user._id,
    description: `Created ${role} account for ${email}`,
    req,
  });
  return sendSuccess(res, { statusCode: 201, message: 'User created', data: { user: user.toJSON() } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const allowed = ['name', 'phone', 'address', 'department', 'role', 'isActive'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  }
  // Prevent an admin from deactivating or demoting themselves.
  if (String(user._id) === String(req.user._id)) {
    if (req.body.role && req.body.role !== ROLES.ADMIN) {
      throw ApiError.badRequest('You cannot change your own role');
    }
    if (req.body.isActive === false) {
      throw ApiError.badRequest('You cannot deactivate your own account');
    }
  }

  await user.save();
  await recordAudit({
    actor: req.user._id,
    actorRole: req.user.role,
    action: 'user.update',
    entityType: 'User',
    entityId: user._id,
    description: `Updated user ${user.email}`,
    metadata: req.body,
    req,
  });
  return sendSuccess(res, { message: 'User updated', data: { user: user.toJSON() } });
});

export const listStaff = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { role: ROLES.STAFF, isActive: true };
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { department: rx }];
  }
  const [staff, total] = await Promise.all([
    User.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return sendSuccess(res, { data: { staff }, meta: buildPaginationMeta({ page, limit, total }) });
});

export default {
  getProfile,
  updateProfile,
  changePassword,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  listStaff,
};
