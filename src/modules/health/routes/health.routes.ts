import { Hono } from "@hono/hono";
import { HealthController } from "../controller/health.controller.ts";

const healthRouter = new Hono();
const healthController = new HealthController();

healthRouter.get("/", healthController.getHealth);

export default healthRouter;