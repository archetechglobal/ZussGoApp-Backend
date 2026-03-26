import { Hono } from "@hono/hono";
import { GroupController } from "../controller/group.controller.ts";
 
const groupRouter = new Hono();
const c = new GroupController();
 
groupRouter.post("/", c.create);
groupRouter.get("/", c.getByDestination);
groupRouter.get("/my", c.getMyGroups);
groupRouter.get("/:id", c.getById);
groupRouter.post("/:id/join", c.join);
groupRouter.post("/:id/accept", c.acceptMember);
 
export default groupRouter;