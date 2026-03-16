import { z } from "zod";

export const createReportSchema = z.object({
  reportedId: z.string().uuid("Invalid user ID"),
  reason: z.enum(["HARASSMENT", "FAKE_PROFILE", "SPAM", "INAPPROPRIATE", "SAFETY", "OTHER"]),
  description: z.string().max(1000).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;