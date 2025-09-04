import { z } from 'zod';

export const CreateBusDtoSchema = z.object({
  busNumber: z.number().min(1),
  capacity: z.number().min(40).max(100),
  type: z.enum(['MINIBUS', 'STANDARD', 'LUXURY']).default('STANDARD'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).default('ACTIVE'),
});

export type CreateBusDto = z.infer<typeof CreateBusDtoSchema>;
