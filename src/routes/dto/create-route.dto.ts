import { z } from 'zod';

export const CreateRouteDtoSchema = z.object({
  departure: z.string(),
  destination: z.string(),
  distanceKm: z.float32(),
  estimatedDuration: z.float32(),
});

export type CreateRouteDto = z.infer<typeof CreateRouteDtoSchema>;
