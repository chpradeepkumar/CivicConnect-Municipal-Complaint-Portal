import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const CSRF_COOKIE = 'civicconnect_csrf';
const MUTATING = new Set(['post', 'put', 'patch', 'delete']);

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

function readCookie(name) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

export async function ensureCsrfToken() {
  let token = readCookie(CSRF_COOKIE);
  if (!token) {
    try {
      await api.get('/auth/csrf');
      token = readCookie(CSRF_COOKIE);
    } catch {
      // network issue — the request interceptor will retry when possible
    }
  }
  return token;
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();
  if (MUTATING.has(method)) {
    const token = readCookie(CSRF_COOKIE);
    if (token) config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    if (!response) {
      error.friendlyMessage = 'Unable to reach the server. Please check your connection.';
      return Promise.reject(error);
    }

    // Refresh an expired CSRF token and retry once.
    if (response.status === 403 && response.data?.message?.includes('CSRF') && !config._csrfRetried) {
      config._csrfRetried = true;
      await api.get('/auth/csrf');
      const token = readCookie(CSRF_COOKIE);
      if (token) config.headers['X-CSRF-Token'] = token;
      return api(config);
    }

    // Session expired / not authenticated.
    if (response.status === 401 && !config.url?.includes('/auth/')) {
      if (onUnauthorized) onUnauthorized();
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  return (
    error?.friendlyMessage ||
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong'
  );
}

export default api;
