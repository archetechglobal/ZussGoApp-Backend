import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z
    .email("Please enter a valid email address"),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits"),

  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;