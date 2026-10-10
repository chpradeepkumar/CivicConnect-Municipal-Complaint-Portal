import api from './api.js';

export const userService = {
  updateProfile: (payload) => api.patch('/users/me', payload).then((r) => r.data.data.user),
  changePassword: (payload) => api.patch('/users/me/password', payload).then((r) => r.data),

  // Admin
  list: (params) => api.get('/users', { params }).then((r) => ({ items: r.data.data.users, meta: r.data.meta })),
  get: (id) => api.get(`/users/${id}`).then((r) => r.data.data.user),
  create: (payload) => api.post('/users', payload).then((r) => r.data.data.user),
  update: (id, payload) => api.patch(`/users/${id}`, payload).then((r) => r.data.data.user),
  listStaff: (params) => api.get('/staff', { params }).then((r) => ({ items: r.data.data.staff, meta: r.data.meta })),
};

export default userService;
