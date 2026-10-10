import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(300).optional().default(''),
  icon: z.string().trim().max(40).optional().default('alert-circle'),
  colorHex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional().default('#1d4ed8'),
  defaultDepartment: z.string().trim().max(80).optional().default('General'),
  defaultPriority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    description: z.string().trim().max(300).optional(),
    icon: z.string().trim().max(40).optional(),
    colorHex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    defaultDepartment: z.string().trim().max(80).optional(),
    defaultPriority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    isActive: z.coerce.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });

export default { createCategorySchema, updateCategorySchema };
