import { Router } from 'express';
import * as complaintController from '../controllers/complaintController.js';
import validate from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { uploadComplaintImages } from '../middleware/upload.js';
import { ROLES } from '../utils/constants.js';
import {
  createComplaintSchema,
  updateComplaintSchema,
  listComplaintsQuerySchema,
  assignComplaintSchema,
  statusChangeSchema,
  rejectComplaintSchema,
} from '../validators/complaintValidator.js';

const router = Router();

// Public tracking must be declared before the auth guard on dynamic routes.
router.get('/track/:trackingCode', complaintController.trackPublic);

// Authenticated complaint routes
router.use(requireAuth);

router.get('/images/:filename', complaintController.serveImage);

router.post(
  '/',
  requireRole(ROLES.CITIZEN),
  uploadComplaintImages,
  validate({ body: createComplaintSchema }),
  complaintController.createComplaint
);

router.get('/', validate({ query: listComplaintsQuerySchema }), complaintController.listComplaints);
router.get('/:id', complaintController.getComplaint);
router.get('/:id/history', complaintController.getHistory);
router.patch('/:id', validate({ body: updateComplaintSchema }), complaintController.updateComplaint);
router.post('/:id/reopen', complaintController.reopenComplaint);

router.post(
  '/:id/assign',
  requireRole(ROLES.ADMIN),
  validate({ body: assignComplaintSchema }),
  complaintController.assignComplaint
);

router.patch(
  '/:id/status',
  requireRole(ROLES.ADMIN, ROLES.STAFF),
  uploadComplaintImages,
  validate({ body: statusChangeSchema }),
  complaintController.changeStatus
);

router.post(
  '/:id/reject',
  requireRole(ROLES.ADMIN),
  validate({ body: rejectComplaintSchema }),
  complaintController.rejectComplaint
);

export default router;
