import { z } from 'zod';

export const CreateBookingDtoSchema = z.object({
  //   passengerId: z.string().min(1, 'passengerId is required'),
  tripId: z.string().min(1, 'tripId is required'),
  bookingDate: z.coerce.date(),
  totalAmount: z.number().min(1, 'totalAmount is required'),
});

export type CreateBookingDto = z.infer<typeof CreateBookingDtoSchema>;
