import type { VerifyOtpInput } from "../schemas/verify-otp.schema.ts";
import { supabaseAdmin } from "../../../config/supabase_client.ts";
import { AuthenticationRepository } from "../repository/authentication.repository.ts";

export class VerifyOtpService {
  private repository = new AuthenticationRepository();

  execute = async (input: VerifyOtpInput) => {

    // Determine the OTP type for Supabase
    // "signup" → type "email" (verifying signup)
    // "recovery" → type "recovery" (verifying password reset)
    const otpType = input.type === "signup" ? "email" : "recovery";

    // Step 1: Verify the OTP with Supabase
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      email: input.email,
      token: input.otp,
      type: otpType,
    });

    if (error) {
      throw new Error("Invalid or expired verification code");
    }

    if (!data.user) {
      throw new Error("Verification failed");
    }

    // Step 2: If this was a signup verification, find and return the app user
    if (input.type === "signup") {
      const appUser = await this.repository.findUserByAuthId(data.user.id);

      if (!appUser) {
        throw new Error("User account not found");
      }

      return {
        verified: true,
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
        user: {
          userId: appUser.id,
          fullName: appUser.fullName,
          email: appUser.email,
          isProfileCompleted: appUser.isProfileCompleted,
        },
      };
    }

    // Step 3: If this was a recovery verification, return tokens for password reset
    return {
      verified: true,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    };
  };
}