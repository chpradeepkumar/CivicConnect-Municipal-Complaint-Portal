import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.get('/public-stats', dashboardController.publicStats);

router.use(requireAuth);
router.get('/citizen', requireRole(ROLES.CITIZEN), dashboardController.citizenDashboard);
router.get('/staff', requireRole(ROLES.STAFF), dashboardController.staffDashboard);
router.get('/admin', requireRole(ROLES.ADMIN), dashboardController.adminDashboard);
router.get('/audit-logs', requireRole(ROLES.ADMIN), dashboardController.listAuditLogs);

export default router;
