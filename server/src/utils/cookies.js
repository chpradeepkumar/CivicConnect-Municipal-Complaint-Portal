import env from '../config/env.js';

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  path: '/',
});

export function setAuthCookie(res, token) {
  res.cookie(env.COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(env.COOKIE_NAME, baseCookieOptions());
}

export function setCsrfCookie(res, token) {
  res.cookie(env.CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export default { setAuthCookie, clearAuthCookie, setCsrfCookie };
