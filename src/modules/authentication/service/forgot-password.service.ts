import type { ForgotPasswordInput } from "../schemas/forgot-password.schema.ts";
import { supabaseAdmin } from "../../../config/supabase_client.ts";
import { AuthenticationRepository } from "../repository/authentication.repository.ts";

export class ForgotPasswordService {
  private repository = new AuthenticationRepository();

  // Step 1: Send OTP to email
  sendResetOtp = async (input: ForgotPasswordInput) => {
    const existingUser = await this.repository.findUserByEmail(input.email);

    if (!existingUser) {
      return { message: "If an account exists with this email, a reset code has been sent" };
    }

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(input.email);

    if (error) {
      throw new Error("Failed to send reset code. Please try again.");
    }

    return { message: "If an account exists with this email, a reset code has been sent" };
  };

  // Step 2: Reset password using email
  resetPassword = async (authUserId: string, email: string, newPassword: string) => {
    // Check if new password is the same as current password
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: newPassword,
    });

    // If sign-in succeeds, the new password is the same as the old one
    if (!signInError) {
      throw new Error("New password must be different from your current password");
    }

    // Update the password
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      authUserId,
      { password: newPassword },
    );

    if (error) {
      throw new Error("Failed to update password. Please try again.");
    }

    return { message: "Password updated successfully" };
  };
}