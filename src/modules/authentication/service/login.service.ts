import type { LoginInput } from "../schemas/login.schema.ts";
import { supabaseAdmin } from "../../../config/supabase_client.ts";
import { AuthenticationRepository } from "../repository/authentication.repository.ts";

export class LoginService {
  private repository = new AuthenticationRepository();

  execute = async (loginData: LoginInput) => {

    // Step 1: Verify credentials with Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

    if (authError || !authData.user) {
      // Check if the error is because email is not confirmed
      if (authError?.message?.includes("Email not confirmed")) {
        throw new Error("EMAIL_NOT_VERIFIED");
      }
      throw new Error("Invalid email or password");
    }

    // Step 2: Find app user in our database
    const appUser = await this.repository.findUserByAuthId(authData.user.id);

    if (!appUser) {
      throw new Error("User account not found");
    }

    // Step 3: Return token + user data
    return {
      accessToken: authData.session?.access_token,
      refreshToken: authData.session?.refresh_token,
      user: {
        userId: appUser.id,
        fullName: appUser.fullName,
        email: appUser.email,
        isProfileCompleted: appUser.isProfileCompleted,
      },
    };
  };
}