import { Hono } from "@hono/hono";
import { RatingController } from "../controller/rating.controller.ts";

const ratingRouter = new Hono();
const controller = new RatingController();

ratingRouter.post("/", controller.create);
ratingRouter.get("/:userId", controller.getUserRatings);

export default ratingRouter;