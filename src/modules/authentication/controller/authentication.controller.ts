import type { Context } from "@hono/hono";
import { signupSchema } from "../schemas/signup.schema.ts";
import { loginSchema } from "../schemas/login.schema.ts";
import { verifyOtpSchema } from "../schemas/verify-otp.schema.ts";
import { forgotPasswordSchema, resetPasswordSchema } from "../schemas/forgot-password.schema.ts";
import { SignupService } from "../service/signup.service.ts";
import { LoginService } from "../service/login.service.ts";
import { VerifyOtpService } from "../service/verify-otp.service.ts";
import { ForgotPasswordService } from "../service/forgot-password.service.ts";
import { ResendOtpService } from "../service/resend-otp.service.ts";
import { profileSetupSchema } from "../schemas/profile-setup.schema.ts";
import { ProfileSetupService } from "../service/profile-setup.service.ts";
import { UsersService } from "../service/users.service.ts";

export class AuthenticationController {
  private signupService = new SignupService();
  private loginService = new LoginService();
  private verifyOtpService = new VerifyOtpService();
  private forgotPasswordService = new ForgotPasswordService();
  private resendOtpService = new ResendOtpService();
  private profileSetupService = new ProfileSetupService();
  private usersService = new UsersService();

  // POST /auth/signup
  signup = async (c: Context) => {
    try {
      const body = await c.req.json();
      const parsedData = signupSchema.safeParse(body);

      if (!parsedData.success) {
        return c.json({ success: false, message: "Validation failed", errors: parsedData.error.flatten() }, 400);
      }

      const result = await this.signupService.execute(parsedData.data);

      return c.json({ success: true, message: "Verification code sent to your email", data: result }, 201);

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          return c.json({ success: false, message: error.message }, 409);
        }
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /auth/login
  login = async (c: Context) => {
    try {
      const body = await c.req.json();
      const parsedData = loginSchema.safeParse(body);

      if (!parsedData.success) {
        return c.json({ success: false, message: "Validation failed", errors: parsedData.error.flatten() }, 400);
      }

      const result = await this.loginService.execute(parsedData.data);

      return c.json({ success: true, message: "Login successful", data: result }, 200);

    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "EMAIL_NOT_VERIFIED") {
          return c.json({ success: false, message: "Please verify your email first", code: "EMAIL_NOT_VERIFIED" }, 403);
        }
        if (error.message.includes("Invalid email or password")) {
          return c.json({ success: false, message: "Invalid email or password" }, 401);
        }
        if (error.message.includes("not found")) {
          return c.json({ success: false, message: "User account not found" }, 404);
        }
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /auth/verify-otp
  verifyOtp = async (c: Context) => {
    try {
      const body = await c.req.json();
      const parsedData = verifyOtpSchema.safeParse(body);

      if (!parsedData.success) {
        return c.json({ success: false, message: "Validation failed", errors: parsedData.error.flatten() }, 400);
      }

      const result = await this.verifyOtpService.execute(parsedData.data);

      return c.json({ success: true, message: "Email verified successfully", data: result }, 200);

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Invalid or expired")) {
          return c.json({ success: false, message: error.message }, 400);
        }
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /auth/forgot-password
  forgotPassword = async (c: Context) => {
    try {
      const body = await c.req.json();
      const parsedData = forgotPasswordSchema.safeParse(body);

      if (!parsedData.success) {
        return c.json({ success: false, message: "Validation failed", errors: parsedData.error.flatten() }, 400);
      }

      const result = await this.forgotPasswordService.sendResetOtp(parsedData.data);

      return c.json({ success: true, message: result.message }, 200);

    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /auth/reset-password
  resetPassword = async (c: Context) => {
    try {
      const body = await c.req.json();
      const parsedData = resetPasswordSchema.safeParse(body);

      if (!parsedData.success) {
        return c.json({ success: false, message: "Validation failed", errors: parsedData.error.flatten() }, 400);
      }

      const result = await this.forgotPasswordService.resetPassword(parsedData.data);

      return c.json({ success: true, message: result.message }, 200);

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Invalid or expired")) {
          return c.json({ success: false, message: error.message }, 400);
        }
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /auth/resend-otp
  resendOtp = async (c: Context) => {
    try {
      const body = await c.req.json();
      const email = body.email;

      if (!email) {
        return c.json({ success: false, message: "Email is required" }, 400);
      }

      const result = await this.resendOtpService.execute(email);

      return c.json({ success: true, message: result.message }, 200);

    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, message: error.message }, 429);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /auth/profile-setup
  profileSetup = async (c: Context) => {
    try {
      const body = await c.req.json();

      // userId comes from the request body
      // Later when we add auth middleware, this will come from the JWT token
      const userId = body.userId;

      if (!userId) {
        return c.json({ success: false, message: "User ID is required" }, 400);
      }

      const parsedData = profileSetupSchema.safeParse(body);

      if (!parsedData.success) {
        return c.json(
          { success: false, message: "Validation failed", errors: parsedData.error.flatten() },
          400
        );
      }

      const result = await this.profileSetupService.execute(userId, parsedData.data);

      return c.json(
        { success: true, message: "Profile updated successfully", data: result },
        200
      );

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Record to update not found")) {
          return c.json({ success: false, message: "User not found" }, 404);
        }
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /auth/users?userId=xxx
  getUsers = async (c: Context) => {
    try {
      const currentUserId = c.req.query("userId");

      if (!currentUserId) {
        return c.json({ success: false, message: "User ID is required" }, 400);
      }

      const users = await this.usersService.getOtherUsers(currentUserId);

      return c.json({ success: true, data: users }, 200);

    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };
}