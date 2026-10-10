import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import validate from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categoryValidator.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// Public list (used by landing page + complaint form)
router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategory);

router.post(
  '/',
  requireAuth,
  requireRole(ROLES.ADMIN),
  validate({ body: createCategorySchema }),
  categoryController.createCategory
);
router.patch(
  '/:id',
  requireAuth,
  requireRole(ROLES.ADMIN),
  validate({ body: updateCategorySchema }),
  categoryController.updateCategory
);
router.delete('/:id', requireAuth, requireRole(ROLES.ADMIN), categoryController.deleteCategory);

export default router;
