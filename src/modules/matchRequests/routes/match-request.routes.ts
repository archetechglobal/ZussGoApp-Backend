import { Hono } from "@hono/hono";
import { MatchRequestController } from "../controller/match-request.controller.ts";

const matchRequestRouter = new Hono();
const controller = new MatchRequestController();

matchRequestRouter.post("/", controller.send);
matchRequestRouter.get("/pending", controller.getPending);
matchRequestRouter.get("/sent", controller.getSent);
matchRequestRouter.post("/:id/accept", controller.accept);
matchRequestRouter.post("/:id/reject", controller.reject);
matchRequestRouter.post("/:id/cancel", controller.cancel);

export default matchRequestRouter;