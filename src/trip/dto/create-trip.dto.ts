import { z } from 'zod';

export const createTripSchema = z.object({
  busId: z
    .array(z.string())
    .min(1, 'busID is required')
    .min(1, 'busID is required'),
  routeId: z.string().min(1, 'routeID is required'),
  driverId: z.string().optional(),
  departureTime: z.coerce.date(),
  arrivalTime: z.coerce.date(),
  status: z
    .enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'])
    .default('SCHEDULED'),
});

export type CreateTripDto = z.infer<typeof createTripSchema>;
