import { z } from 'zod';

// ---------------------------------------------------------------------------
// Profile Schema
// ---------------------------------------------------------------------------

export const createProfileSchema = z.object({
  body: z.object({
    full_name: z.string({ message: 'Full name is required' }).min(2, 'Name is too short'),
    sport: z.string({ message: 'Sport is required' }),
    primary_position: z.string().optional(),
    height_cm: z.number().positive('Height must be a positive number').optional(),
    weight_kg: z.number().positive('Weight must be a positive number').optional(),
  }),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>['body'];

// ---------------------------------------------------------------------------
// Metrics Schema
// ---------------------------------------------------------------------------

const metricValue = z
  .number({ message: 'Must be a number' })
  .min(0, 'Metric value must be >= 0')
  .max(100, 'Metric value must be <= 100');

export const addMetricsSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Profile ID is required' }),
  }),
  body: z.object({
    speed:    metricValue,
    strength: metricValue,
    stamina:  metricValue,
    tactical: metricValue,
  }),
});

export type AddMetricsInput  = z.infer<typeof addMetricsSchema>['body'];
export type AddMetricsParams = z.infer<typeof addMetricsSchema>['params'];