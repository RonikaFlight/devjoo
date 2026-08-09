import { z } from 'zod';

/**
 * Update freelancer availability
 */
export const availabilityUpdateSchema = z.object({
  availability: z.enum(['AVAILABLE', 'LIMITED', 'BUSY', 'UNAVAILABLE'], {
    errorMap: () => ({ message: 'وضعیت نامعتبر است.' }),
  }),
  hoursPerWeek: z
    .number()
    .int()
    .min(1, 'حداقل ۱ ساعت در هفته')
    .max(80, 'حداکثر ۸۰ ساعت در هفته')
    .optional(),
  availableFrom: z.string().datetime().optional(),
});

export type AvailabilityUpdateInput = z.infer<typeof availabilityUpdateSchema>;
