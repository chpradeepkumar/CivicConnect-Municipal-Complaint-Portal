import crypto from 'node:crypto';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { setCsrfCookie } from '../utils/cookies.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const EXEMPT_PATHS = new Set(['/health']);

function safeEqual(a = '', b = '') {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Double-submit cookie CSRF protection.
 * A non-httpOnly token cookie is issued; mutating requests must echo it
 * back in the `X-CSRF-Token` header with an exact match.
 */
export function csrfProtection(req, res, next) {
  let token = req.cookies?.[env.CSRF_COOKIE_NAME];
  if (!token) {
    token = crypto.randomBytes(24).toString('hex');
    setCsrfCookie(res, token);
  }
  res.locals.csrfToken = token;

  if (SAFE_METHODS.has(req.method)) return next();
  if (EXEMPT_PATHS.has(req.path)) return next();

  const header = req.get('x-csrf-token') || req.body?._csrf;
  if (!header || !safeEqual(header, token)) {
    return next(ApiError.forbidden('Invalid or missing CSRF token'));
  }
  return next();
}

export default csrfProtection;
