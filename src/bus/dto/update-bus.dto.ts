import { z } from 'zod';
import { CreateBusDtoSchema } from './create-bus.dto';

export const updateBusSchema = CreateBusDtoSchema.partial();
export type UpdateBusDto = z.infer<typeof updateBusSchema>;
