import { createTripSchema } from './create-trip.dto';
import { z } from 'zod';

export const updateTripSchema = createTripSchema.partial();
export type UpdateTripDto = z.infer<typeof updateTripSchema>;
