import { z } from 'zod';

/**
 * Common date range filter for analytics endpoints.
 */
const dateRangeSchema = z.object({
  startDate: z.string().datetime({ message: 'تاریخ شروع نامعتبر است' }).optional(),
  endDate: z.string().datetime({ message: 'تاریخ پایان نامعتبر است' }).optional(),
});

/**
 * Proposal analytics filters (query params).
 */
export const proposalAnalyticsFiltersSchema = dateRangeSchema;

export type ProposalAnalyticsFilters = z.infer<typeof proposalAnalyticsFiltersSchema>;

/**
 * Project analytics filters (query params).
 */
export const projectAnalyticsFiltersSchema = dateRangeSchema;

export type ProjectAnalyticsFilters = z.infer<typeof projectAnalyticsFiltersSchema>;

/**
 * Price radar filters (query params).
 */
export const priceRadarFiltersSchema = z.object({
  categoryId: z.string().cuid().optional(),
});

export type PriceRadarFilters = z.infer<typeof priceRadarFiltersSchema>;
