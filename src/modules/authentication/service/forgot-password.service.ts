import type { ForgotPasswordInput, ResetPasswordInput } from "../schemas/forgot-password.schema.ts";
import { supabaseAdmin } from "../../../config/supabase_client.ts";
import { AuthenticationRepository } from "../repository/authentication.repository.ts";

export class ForgotPasswordService {
  private repository = new AuthenticationRepository();

  // Step 1: Send OTP to email for password reset
  sendResetOtp = async (input: ForgotPasswordInput) => {

    // Check if user exists in our database
    const existingUser = await this.repository.findUserByEmail(input.email);

    if (!existingUser) {
      // Don't reveal that the email doesn't exist (security)
      // Just say "if account exists, we sent a code"
      return { message: "If an account exists with this email, a reset code has been sent" };
    }

    // Send password reset email (Supabase sends the 6-digit OTP)
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(
      input.email,
    );

    if (error) {
      throw new Error("Failed to send reset code. Please try again.");
    }

    return { message: "If an account exists with this email, a reset code has been sent" };
  };

  // Step 2: Verify OTP + set new password
  resetPassword = async (input: ResetPasswordInput) => {

    // First verify the OTP
    const { data, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      email: input.email,
      token: input.otp,
      type: "recovery",
    });

    if (verifyError || !data.user) {
      throw new Error("Invalid or expired reset code");
    }

    // Update the password using the admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      data.user.id,
      { password: input.newPassword },
    );

    if (updateError) {
      throw new Error("Failed to update password. Please try again.");
    }

    return { message: "Password updated successfully. You can now sign in." };
  };
}