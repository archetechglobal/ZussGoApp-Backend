import { Hono } from "@hono/hono";
import { MessageController } from "../controller/message.controller.ts";

const messageRouter = new Hono();
const controller = new MessageController();

messageRouter.post("/", controller.send);
messageRouter.get("/unread", controller.getUnreadCount);
messageRouter.get("/:conversationId", controller.getMessages);

export default messageRouter;