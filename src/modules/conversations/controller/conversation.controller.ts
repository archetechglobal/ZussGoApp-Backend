import type { Context } from "@hono/hono";
import { ConversationService } from "../service/conversation.service.ts";

export class ConversationController {
  private service = new ConversationService();

  // GET /conversations?userId=xxx
  getMyConversations = async (c: Context) => {
    try {
      const userId = c.req.query("userId") || "";
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const conversations = await this.service.getMyConversations(userId);
      return c.json({ success: true, data: conversations }, 200);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /conversations/:id?userId=xxx
  getById = async (c: Context) => {
    try {
      const conversationId = c.req.param("id") || "";
      const userId = c.req.query("userId") || "";
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const conversation = await this.service.getById(conversationId, userId);
      return c.json({ success: true, data: conversation }, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) return c.json({ success: false, message: error.message }, 404);
        if (error.message.includes("Not authorized")) return c.json({ success: false, message: error.message }, 403);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };
}