import { z } from 'zod';

export const createProfileSchema = z.object({
  body: z.object({
    full_name: z.string({ message: "Full name is required" }).min(2, "Name is too short"),
    sport: z.string({ message: "Sport is required" }),
    primary_position: z.string().optional(),
    height_cm: z.number().positive("Height must be a positive number").optional(),
    weight_kg: z.number().positive("Weight must be a positive number").optional(),
  })
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>['body'];