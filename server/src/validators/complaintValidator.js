import { z } from 'zod';
import { COMPLAINT_PRIORITY_VALUES, COMPLAINT_STATUS_VALUES } from '../utils/constants.js';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid identifier');

export const createComplaintSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().trim().min(15, 'Description must be at least 15 characters').max(3000),
  category: objectId,
  address: z.string().trim().min(3, 'Address is required').max(250),
  priority: z.enum(COMPLAINT_PRIORITY_VALUES).optional().default('medium'),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const updateComplaintSchema = z
  .object({
    title: z.string().trim().min(5).max(120).optional(),
    description: z.string().trim().min(15).max(3000).optional(),
    category: objectId.optional(),
    address: z.string().trim().min(3).max(250).optional(),
    priority: z.enum(COMPLAINT_PRIORITY_VALUES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });

export const listComplaintsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(COMPLAINT_STATUS_VALUES).optional(),
  category: objectId.optional(),
  priority: z.enum(COMPLAINT_PRIORITY_VALUES).optional(),
  assignedTo: objectId.optional(),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(['newest', 'oldest', 'priority', 'updated']).optional(),
});

export const assignComplaintSchema = z.object({
  staffId: objectId,
  note: z.string().trim().max(1000).optional().default(''),
});

export const statusChangeSchema = z.object({
  status: z.enum(COMPLAINT_STATUS_VALUES),
  note: z.string().trim().max(1000).optional().default(''),
  resolutionNotes: z.string().trim().max(2000).optional(),
  isPublic: z.coerce.boolean().optional().default(true),
});

export const rejectComplaintSchema = z.object({
  reason: z.string().trim().min(5, 'A rejection reason is required').max(1000),
});

export const publicTrackQuerySchema = z.object({
  trackingCode: z.string().trim().min(4).max(40).optional(),
  id: z.string().trim().max(40).optional(),
});

export default {
  createComplaintSchema,
  updateComplaintSchema,
  listComplaintsQuerySchema,
  assignComplaintSchema,
  statusChangeSchema,
  rejectComplaintSchema,
  publicTrackQuerySchema,
};
