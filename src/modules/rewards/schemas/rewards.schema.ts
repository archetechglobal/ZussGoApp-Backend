import { z } from "zod";

export const earnPointsSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  amount: z.number().int().positive("Amount must be positive"),
  type: z.enum([
    "SIGNUP_BONUS",
    "TRIP_COMPLETED",
    "COMPANION_MATCHED",
    "RATING_GIVEN",
    "CASHBACK_REDEEMED",
    "PROFILE_BOOST",
    "VERIFIED_BADGE",
    "GROUP_JOIN",
  ]),
  description: z.string().min(1).max(200),
  referenceId: z.string().optional(),
});

export type EarnPointsInput = z.infer<typeof earnPointsSchema>;

export const redeemPointsSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  amount: z.number().int().positive("Amount must be positive"),
  type: z.enum([
    "CASHBACK_REDEEMED",
    "PROFILE_BOOST",
    "VERIFIED_BADGE",
    "GROUP_JOIN",
  ]),
  description: z.string().min(1).max(200),
});

export type RedeemPointsInput = z.infer<typeof redeemPointsSchema>;