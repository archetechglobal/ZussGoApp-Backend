import { z } from "zod";

export const verifyOtpSchema = z.object({
  email: z
    .email("Please enter a valid email address"),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits"),

  type: z
    .enum(["signup", "recovery"]),
    // signup = verify email after signup
    // recovery = verify email for password reset
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;