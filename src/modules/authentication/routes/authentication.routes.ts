import { Hono } from "@hono/hono";
import { AuthenticationController } from "../controller/authentication.controller.ts";

const authenticationRouter = new Hono();
const authenticationController = new AuthenticationController();

authenticationRouter.post("/signup", authenticationController.signup);
authenticationRouter.post("/login", authenticationController.login);
authenticationRouter.post("/verify-otp", authenticationController.verifyOtp);
authenticationRouter.post("/forgot-password", authenticationController.forgotPassword);
authenticationRouter.post("/reset-password", authenticationController.resetPassword);
authenticationRouter.post("/resend-otp", authenticationController.resendOtp);
authenticationRouter.post("/profile-setup", authenticationController.profileSetup);
authenticationRouter.get("/users", authenticationController.getUsers);

export default authenticationRouter;