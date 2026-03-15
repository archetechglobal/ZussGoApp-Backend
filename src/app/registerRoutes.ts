import { Hono } from "@hono/hono";
import { healthRouter } from "../modules/health/index.ts";
import { authenticationRouter } from "../modules/authentication/index.ts";

export function registerRoutes(app: Hono) {
    app.route("/health", healthRouter);
    app.route("/auth", authenticationRouter)
}