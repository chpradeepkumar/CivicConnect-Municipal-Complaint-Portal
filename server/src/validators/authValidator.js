import { z } from 'zod';
import { ROLE_VALUES } from '../utils/constants.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long')
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  phone: z.string().trim().max(20).optional().default(''),
  address: z.string().trim().max(200).optional().default(''),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(20).optional(),
  address: z.string().trim().max(200).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72)
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  role: z.enum(ROLE_VALUES),
  phone: z.string().trim().max(20).optional().default(''),
  department: z.string().trim().max(80).optional().default(''),
});

export const adminUpdateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(20).optional(),
  address: z.string().trim().max(200).optional(),
  department: z.string().trim().max(80).optional(),
  role: z.enum(ROLE_VALUES).optional(),
  isActive: z.coerce.boolean().optional(),
});

export default {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
};
