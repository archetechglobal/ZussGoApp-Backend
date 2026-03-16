import { Hono } from "@hono/hono";
import { ConversationController } from "../controller/conversation.controller.ts";

const conversationRouter = new Hono();
const controller = new ConversationController();

conversationRouter.get("/", controller.getMyConversations);
conversationRouter.get("/:id", controller.getById);

export default conversationRouter;