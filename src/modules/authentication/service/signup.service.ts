import type { SignupInput } from "../schemas/signup.schema.ts";
import { supabaseAdmin } from "../../../config/supabase_client.ts";
import { AuthenticationRepository } from "../repository/authentication.repository.ts";
import { AuthenticationMapper } from "../mapper/authentication.mapper.ts";

export class SignupService {
  private repository = new AuthenticationRepository();
  private mapper = new AuthenticationMapper();

  execute = async (signupData: SignupInput) => {

    // Step 1: Check if user already exists in our DB
    const existingUser = await this.repository.findUserByEmail(signupData.email);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Step 2: Create auth user in Supabase Auth
    // email_confirm: false → user must verify via OTP
    // Supabase automatically sends a confirmation email with 6-digit OTP
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: signupData.email,
        password: signupData.password,
        email_confirm: false,
        user_metadata: {
          fullName: signupData.fullName,
        },
      });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create auth user");
    }

    // Step 3: Create app user in our DB via Prisma
    // isEmailVerified starts as false
    const appUser = await this.repository.createUser({
      authUserId: authData.user.id,
      fullName: signupData.fullName,
      email: signupData.email,
    });

    // Step 4: Send OTP email via Supabase
    // signInWithOtp sends the 6-digit code to the user's email
    const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
      email: signupData.email,
    });

    if (otpError) {
      console.error("Failed to send OTP email:", otpError.message);
      // Don't throw — user is created, they can resend OTP later
    }

    // Step 5: Return response (without session — user not verified yet)
    return {
      ...this.mapper.toSignupResponse(appUser),
      message: "Verification code sent to your email",
    };
  };
}