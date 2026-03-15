import type { VerifyOtpInput } from "../schemas/verify-otp.schema.ts";
import { supabaseAdmin } from "../../../config/supabase_client.ts";
import { AuthenticationRepository } from "../repository/authentication.repository.ts";
import { AuthenticationMapper } from "../mapper/authentication.mapper.ts";

export class VerifyOtpService {
  private repository = new AuthenticationRepository();
  private mapper = new AuthenticationMapper();

  execute = async (input: VerifyOtpInput, signupData?: { fullName?: string }) => {

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

    // Step 2: If signup verification — create DB user NOW
    if (input.type === "signup") {
      // Check if DB user already exists (in case of re-verification)
      let appUser = await this.repository.findUserByAuthId(data.user.id);

      if (!appUser) {
        // Create the DB user for the first time
        const fullName = signupData?.fullName
          || data.user.user_metadata?.fullName
          || "Traveler";

        appUser = await this.repository.createUser({
          authUserId: data.user.id,
          fullName: fullName,
          email: input.email,
        });
      }

      return {
        verified: true,
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
        user: this.mapper.toSignupResponse(appUser),
      };
    }

    // Step 3: If recovery — just return tokens
    return {
      verified: true,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    };
  };
}