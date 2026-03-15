import { z } from "zod";

export const profileSetupSchema = z.object({
  gender: z
    .string()
    .min(1, "Gender is required"),

  age: z
    .number()
    .min(18, "Must be at least 18")
    .max(99, "Must be 99 or under"),

  city: z
    .string()
    .optional(),

  travelStyle: z
    .string()
    .optional(),

  bio: z
    .string()
    .optional(),
});

export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;