import { z } from "zod";

export const createRatingSchema = z.object({
  ratedId: z.string().uuid("Invalid user ID"),
  tripId: z.string().uuid("Invalid trip ID"),
  score: z.number().min(1, "Minimum 1 star").max(5, "Maximum 5 stars"),
  review: z.string().max(500).optional(),
  moodTags: z.array(z.string()).max(5).optional(),
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>;