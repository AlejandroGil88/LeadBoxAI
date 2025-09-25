import { z } from 'zod';

export const filtersSchema = z.object({
  channels: z.array(z.string()).max(4),
  languages: z.array(z.string()).max(5),
  slaBreachOnly: z.boolean()
});

export type FiltersSchema = z.infer<typeof filtersSchema>;
