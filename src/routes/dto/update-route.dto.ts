import { z } from 'zod';
import { CreateRouteDtoSchema } from './create-route.dto';

export const updateRouteSchema = CreateRouteDtoSchema.partial();
export type UpdateRouteDto = z.infer<typeof updateRouteSchema>;
