// src/modules/matching/routes/matching.routes.ts

import { Hono } from "@hono/hono";
import { MatchingController } from "../controller/matching.controller.ts";

const matchingRouter = new Hono();
const controller = new MatchingController();

matchingRouter.get("/:tripId", controller.findMatches);

export default matchingRouter;