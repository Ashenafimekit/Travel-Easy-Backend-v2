import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'Name is required' }).max(100),
  email: z.email().optional(),
  phone: z.string().min(10).max(15),
  password: z.string().min(6).max(100),
  role: z.enum(['PASSENGER', 'STAFF']).default('PASSENGER'),
  staffPosition: z
    .enum(['SUPER_ADMIN', 'ADMIN', 'TICKETER', 'DRIVER'])
    .optional()
    .default('TICKETER'),
});

export type User = z.infer<typeof UserSchema>;

export const updateUserSchema = UserSchema.partial();
export type UpdateUser = z.infer<typeof updateUserSchema>;
