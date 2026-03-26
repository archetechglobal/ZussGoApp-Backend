import { z } from "zod";
 
export const createGroupSchema = z.object({
  name: z.string().min(3).max(50),
  destinationId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  budget: z.enum(["Budget", "Mid-range", "Luxury"]).optional(),
  maxMembers: z.number().min(3).max(20).default(6),
  description: z.string().max(300).optional(),
  tags: z.array(z.string()).max(5).optional(),
  genderFilter: z.enum(["Everyone", "Women only", "Men only"]).default("Everyone"),
  ageMin: z.number().min(18).optional(),
  ageMax: z.number().max(65).optional(),
});
 
export type CreateGroupInput = z.infer<typeof createGroupSchema>;