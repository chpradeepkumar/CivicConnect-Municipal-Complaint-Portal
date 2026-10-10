import { z } from 'zod';

export const complaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title is too long'),
  description: z
    .string()
    .min(15, 'Please provide at least 15 characters so staff can act on it')
    .max(3000, 'Description is too long'),
  category: z.string().min(1, 'Please choose a category'),
  address: z.string().min(3, 'Address is required').max(250, 'Address is too long'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export function zodErrors(error) {
  const fieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
