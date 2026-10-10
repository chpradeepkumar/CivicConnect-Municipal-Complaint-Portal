import api from './api.js';

export const authService = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data.data.user),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data.data.user),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data.data.user),
};

export default authService;
