import { z } from 'zod';

export const CreateBookingDtoSchema = z.object({
  tripId: z.string().min(1, 'tripId is required'),
  seatId: z
    .array(z.string())
    .min(1, 'seatId is required')
    .min(1, 'minimum seat reservation is 1')
    .max(10, 'maximum seat reservation is 10'),
  totalAmount: z.number().min(1, 'totalAmount is required'),
});

export type CreateBookingDto = z.infer<typeof CreateBookingDtoSchema>;
