import { Hono } from "@hono/hono";
import { BlockController } from "../controller/block.controller.ts";

const blockRouter = new Hono();
const controller = new BlockController();

blockRouter.post("/", controller.block);
blockRouter.delete("/", controller.unblock);
blockRouter.get("/", controller.getBlocked);

export default blockRouter;