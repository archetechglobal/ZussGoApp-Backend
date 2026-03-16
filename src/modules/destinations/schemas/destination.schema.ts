import { z } from "zod";

export const createDestinationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  emoji: z.string().min(1, "Emoji is required"),
  description: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("India"),
  imageUrl: z.string().optional(),
});

export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;