import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export const documentTitleSchema = z.string().min(3, 'Title must be at least 3 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const documentUploadSchema = z.object({
  title: documentTitleSchema,
});

export const sendDocumentSchema = z.object({
  signerEmail: emailSchema,
});