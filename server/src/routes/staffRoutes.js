import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(requireAuth, requireRole(ROLES.ADMIN));
router.get('/', userController.listStaff);

export default router;
