import { z } from 'zod';
import { add } from 'date-fns';

const today = new Date();
const tomorrow: Date = add(today, { days: 1 });

export const RoundTripSchema = z.object({
  routeId: z.string().min(1, 'Route is required'),
  departureDate: z.date().min(tomorrow, 'Trip date cannot be in the past'),
  returnDate: z.date().min(tomorrow, 'Trip date cannot be in the past'),
});

export type RoundTripDto = z.infer<typeof RoundTripSchema>;
