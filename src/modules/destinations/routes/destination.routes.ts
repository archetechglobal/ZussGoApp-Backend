import { Hono } from "@hono/hono";
import { DestinationController } from "../controller/destination.controller.ts";

const destinationRouter = new Hono();
const controller = new DestinationController();

destinationRouter.get("/", controller.getAll);
destinationRouter.get("/search", controller.search);
destinationRouter.post("/seed", controller.seed);
destinationRouter.get("/:slug", controller.getBySlug);
destinationRouter.post("/", controller.create);

export default destinationRouter;