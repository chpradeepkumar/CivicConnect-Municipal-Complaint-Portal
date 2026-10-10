import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import validate from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
} from '../validators/authValidator.js';

const router = Router();

router.use(requireAuth);

// Citizen profile
router.get('/me', userController.getProfile);
router.patch('/me', validate({ body: updateProfileSchema }), userController.updateProfile);
router.patch('/me/password', validate({ body: changePasswordSchema }), userController.changePassword);

// Admin user management
router.get('/', requireRole(ROLES.ADMIN), userController.listUsers);
router.post('/', requireRole(ROLES.ADMIN), validate({ body: adminCreateUserSchema }), userController.createUser);
router.get('/:id', requireRole(ROLES.ADMIN), userController.getUserById);
router.patch('/:id', requireRole(ROLES.ADMIN), validate({ body: adminUpdateUserSchema }), userController.updateUser);

export default router;
