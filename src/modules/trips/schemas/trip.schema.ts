import { z } from "zod";

export const createTripSchema = z.object({
  destinationId: z.string().uuid("Invalid destination ID"),
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
  budget: z.enum(["Budget", "Mid-range", "Luxury"]).optional(),
  notes: z.string().max(500).optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;

export const updateTripSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.enum(["Budget", "Mid-range", "Luxury"]).optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(["PLANNED", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
});

export type UpdateTripInput = z.infer<typeof updateTripSchema>;