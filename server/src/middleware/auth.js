import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

/**
 * Authenticates the request using the HTTP-only JWT cookie.
 * Attaches `req.user` when valid; does not throw when absent.
 */
export async function authenticate(req, _res, next) {
  try {
    const token = req.cookies?.[env.COOKIE_NAME];
    if (!token) return next();

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return next();

    req.user = user;
    return next();
  } catch {
    // Invalid/expired token — treat as anonymous.
    return next();
  }
}

export const requireAuth = (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  return next();
};

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  return next();
};

export default { authenticate, requireAuth, requireRole };
