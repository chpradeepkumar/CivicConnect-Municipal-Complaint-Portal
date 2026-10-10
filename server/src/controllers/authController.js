import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { signToken } from '../utils/jwt.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies.js';
import { recordAudit } from '../services/auditService.js';
import { ROLES } from '../utils/constants.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    role: ROLES.CITIZEN,
  });

  const token = signToken(user);
  setAuthCookie(res, token);

  await recordAudit({
    actor: user._id,
    actorRole: user.role,
    action: 'auth.register',
    entityType: 'User',
    entityId: user._id,
    description: `Citizen ${user.email} registered`,
    req,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Registration successful',
    data: { user: user.toJSON() },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('Your account has been deactivated');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user);
  setAuthCookie(res, token);

  await recordAudit({
    actor: user._id,
    actorRole: user.role,
    action: 'auth.login',
    entityType: 'User',
    entityId: user._id,
    description: `${user.email} logged in`,
    req,
  });

  return sendSuccess(res, { message: 'Login successful', data: { user: user.toJSON() } });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  if (req.user) {
    await recordAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'auth.logout',
      entityType: 'User',
      entityId: req.user._id,
      description: `${req.user.email} logged out`,
      req,
    });
  }
  return sendSuccess(res, { message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, { data: { user: req.user.toJSON() } });
});

export default { register, login, logout, getMe };
