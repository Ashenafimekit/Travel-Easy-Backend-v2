import { z } from 'zod';
import { CreateBookingDtoSchema } from './create-booking.dto';

export const UpdateBookingDtoSchema = CreateBookingDtoSchema.partial();
export type UpdateBookingDto = z.infer<typeof UpdateBookingDtoSchema>;
