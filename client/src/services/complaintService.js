import api from './api.js';

export const complaintService = {
  list: (params) => api.get('/complaints', { params }).then((r) => ({ items: r.data.data.complaints, meta: r.data.meta })),

  get: (id) => api.get(`/complaints/${id}`).then((r) => r.data.data.complaint),

  history: (id) => api.get(`/complaints/${id}/history`).then((r) => r.data.data.history),

  track: (trackingCode) =>
    api.get(`/complaints/track/${encodeURIComponent(trackingCode)}`).then((r) => r.data.data.complaint),

  create: (payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') form.append(key, value);
    });
    (payload.images || []).forEach((file) => form.append('images', file));
    return api
      .post('/complaints', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data.complaint);
  },

  update: (id, payload) => api.patch(`/complaints/${id}`, payload).then((r) => r.data.data.complaint),

  assign: (id, payload) => api.post(`/complaints/${id}/assign`, payload).then((r) => r.data.data.complaint),

  changeStatus: (id, payload) => {
    if (payload.images?.length) {
      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'images') return;
        if (value !== undefined && value !== null && value !== '') form.append(key, value);
      });
      payload.images.forEach((file) => form.append('images', file));
      return api
        .patch(`/complaints/${id}/status`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data.data.complaint);
    }
    return api.patch(`/complaints/${id}/status`, payload).then((r) => r.data.data.complaint);
  },

  reject: (id, reason) => api.post(`/complaints/${id}/reject`, { reason }).then((r) => r.data.data.complaint),

  reopen: (id, reason) => api.post(`/complaints/${id}/reopen`, { reason }).then((r) => r.data.data.complaint),
};

export default complaintService;
