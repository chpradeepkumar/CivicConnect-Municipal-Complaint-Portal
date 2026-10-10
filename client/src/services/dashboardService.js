import api from './api.js';

export const dashboardService = {
  publicStats: () => api.get('/dashboard/public-stats').then((r) => r.data.data),
  citizen: () => api.get('/dashboard/citizen').then((r) => r.data.data),
  staff: () => api.get('/dashboard/staff').then((r) => r.data.data),
  admin: () => api.get('/dashboard/admin').then((r) => r.data.data),
  auditLogs: (params) => api.get('/dashboard/audit-logs', { params }).then((r) => ({ items: r.data.data.logs, meta: r.data.meta })),
};

export default dashboardService;
