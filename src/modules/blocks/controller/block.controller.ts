import type { Context } from "@hono/hono";
import { BlockService } from "../service/block.service.ts";

export class BlockController {
  private service = new BlockService();

  // POST /blocks
  block = async (c: Context) => {
    try {
      const body = await c.req.json();
      if (!body.userId) return c.json({ success: false, message: "User ID required" }, 400);
      if (!body.blockedId) return c.json({ success: false, message: "Blocked user ID required" }, 400);

      await this.service.block(body.userId, body.blockedId, body.reason);
      return c.json({ success: true, message: "User blocked" }, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("yourself")) return c.json({ success: false, message: error.message }, 400);
        if (error.message.includes("already blocked")) return c.json({ success: false, message: error.message }, 409);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // DELETE /blocks
  unblock = async (c: Context) => {
    try {
      const body = await c.req.json();
      if (!body.userId) return c.json({ success: false, message: "User ID required" }, 400);
      if (!body.blockedId) return c.json({ success: false, message: "Blocked user ID required" }, 400);

      await this.service.unblock(body.userId, body.blockedId);
      return c.json({ success: true, message: "User unblocked" }, 200);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not blocked")) {
        return c.json({ success: false, message: error.message }, 404);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /blocks?userId=xxx
  getBlocked = async (c: Context) => {
    try {
      const userId = c.req.query("userId") || "";
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const blocked = await this.service.getBlockedUsers(userId);
      return c.json({ success: true, data: blocked }, 200);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };
}