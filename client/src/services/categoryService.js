import api from './api.js';

export const categoryService = {
  list: (params) => api.get('/categories', { params }).then((r) => r.data.data.categories),
  get: (id) => api.get(`/categories/${id}`).then((r) => r.data.data.category),
  create: (payload) => api.post('/categories', payload).then((r) => r.data.data.category),
  update: (id, payload) => api.patch(`/categories/${id}`, payload).then((r) => r.data.data.category),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};

export default categoryService;
