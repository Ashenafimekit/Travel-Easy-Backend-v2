import { z } from 'zod';
import { add } from 'date-fns';

const today = new Date();
const tomorrow: Date = add(today, { days: 1 });

export const OneWayTripSchema = z.object({
  routeId: z.string().min(1, 'Route is required'),
  tripDate: z.date().min(tomorrow, 'Trip date cannot be in the past'),
});

export type OneWayTripDto = z.infer<typeof OneWayTripSchema>;
