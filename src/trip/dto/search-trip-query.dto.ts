/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from 'zod';
import { add } from 'date-fns';

const today = new Date();
const tomorrow: Date = add(today, { days: 1 });

export const SearchTripSchema = z.object({
  routeId: z.string().min(1, 'Route is required'),
  tripDate: z.date().min(tomorrow, 'Trip date cannot be in the past'),
});

export type SearchTripDto = z.infer<typeof SearchTripSchema>;
