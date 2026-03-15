import type { SignupInput } from "../schemas/signup.schema.ts";
import { supabaseAdmin } from "../../../config/supabase_client.ts";
import { AuthenticationRepository } from "../repository/authentication.repository.ts";

export class SignupService {
  private repository = new AuthenticationRepository();

  execute = async (signupData: SignupInput) => {

    // Step 1: Check if verified user exists in OUR database
    const existingDbUser = await this.repository.findUserByEmail(signupData.email);

    if (existingDbUser) {
      throw new Error("User with this email already exists");
    }

    // Step 2: Try to create auth user
    // If it fails because email exists in Supabase Auth (leftover unverified),
    // delete the old one and try again
    let authUser;

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: signupData.email,
        password: signupData.password,
        email_confirm: false,
        user_metadata: { fullName: signupData.fullName },
      });

    if (authError) {
      // If error is "user already exists" — it's a leftover unverified user
      if (authError.message.includes("already been registered") || 
          authError.message.includes("already exists") ||
          authError.status === 422) {

        // Find and delete the old unverified auth user
        // Since no DB user exists (checked in Step 1), this is safe to delete
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const oldUser = users.find((u) => u.email === signupData.email);

        if (oldUser) {
          await supabaseAdmin.auth.admin.deleteUser(oldUser.id);
        }

        // Retry creating the auth user
        const { data: retryData, error: retryError } =
          await supabaseAdmin.auth.admin.createUser({
            email: signupData.email,
            password: signupData.password,
            email_confirm: false,
            user_metadata: { fullName: signupData.fullName },
          });

        if (retryError || !retryData.user) {
          throw new Error(retryError?.message || "Failed to create account");
        }

        authUser = retryData.user;
      } else {
        throw new Error(authError.message || "Failed to create account");
      }
    } else {
      authUser = authData.user;
    }

    if (!authUser) {
      throw new Error("Failed to create account");
    }

    // Step 3: Send OTP
    const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
      email: signupData.email,
    });

    if (otpError) {
      console.error("Failed to send OTP:", otpError.message);
    }

    // Step 4: Return — NO DB user yet
    return {
      authUserId: authUser.id,
      email: signupData.email,
      fullName: signupData.fullName,
      message: "Verification code sent to your email",
    };
  };
}
