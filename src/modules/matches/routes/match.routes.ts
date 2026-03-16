import { Hono } from "@hono/hono";
import { MatchController } from "../controller/match.controller.ts";

const matchRouter = new Hono();
const controller = new MatchController();

matchRouter.get("/", controller.getMyMatches);
matchRouter.get("/:id", controller.getById);
matchRouter.post("/:id/unmatch", controller.unmatch);

export default matchRouter;