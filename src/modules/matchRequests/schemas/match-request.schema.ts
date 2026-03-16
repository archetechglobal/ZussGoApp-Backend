import { z } from "zod";

export const sendMatchRequestSchema = z.object({
  receiverId: z.string().uuid("Invalid receiver ID"),
  tripId: z.string().uuid("Invalid trip ID"),
  message: z.string().max(300).optional(),
});

export type SendMatchRequestInput = z.infer<typeof sendMatchRequestSchema>;