import { supabaseAdmin } from "../../../config/supabase_client.ts";

export class ResendOtpService {

  execute = async (email: string) => {

    // Resend OTP using signInWithOtp
    // This sends a new 6-digit code to the email
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email: email,
    });

    if (error) {
      throw new Error("Failed to resend code. Please wait 60 seconds and try again.");
    }

    return { message: "A new verification code has been sent to your email" };
  };
}