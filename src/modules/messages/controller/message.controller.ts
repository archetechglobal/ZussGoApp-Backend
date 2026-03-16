import type { Context } from "@hono/hono";
import { MessageService } from "../service/message.service.ts";
import { sendMessageSchema } from "../schemas/message.schema.ts";

export class MessageController {
  private service = new MessageService();

  // POST /messages
  send = async (c: Context) => {
    try {
      const body = await c.req.json();
      const senderId = body.userId;
      if (!senderId) return c.json({ success: false, message: "User ID required" }, 400);

      const parsed = sendMessageSchema.safeParse(body);
      if (!parsed.success) return c.json({ success: false, message: "Validation failed", errors: parsed.error.flatten() }, 400);

      const message = await this.service.send(parsed.data.conversationId, senderId, parsed.data.content);
      return c.json({ success: true, data: message }, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) return c.json({ success: false, message: error.message }, 404);
        if (error.message.includes("Not authorized")) return c.json({ success: false, message: error.message }, 403);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /messages/:conversationId?userId=xxx&limit=50&cursor=xxx
  getMessages = async (c: Context) => {
    try {
      const conversationId = c.req.param("conversationId") || "";
      const userId = c.req.query("userId") || "";
      const limit = parseInt(c.req.query("limit") || "50");
      const cursor = c.req.query("cursor") || undefined;
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const messages = await this.service.getMessages(conversationId, userId, limit, cursor);
      return c.json({ success: true, data: messages }, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) return c.json({ success: false, message: error.message }, 404);
        if (error.message.includes("Not authorized")) return c.json({ success: false, message: error.message }, 403);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /messages/unread?userId=xxx
  getUnreadCount = async (c: Context) => {
    try {
      const userId = c.req.query("userId") || "";
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const count = await this.service.getUnreadCount(userId);
      return c.json({ success: true, data: { unreadCount: count } }, 200);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };
}