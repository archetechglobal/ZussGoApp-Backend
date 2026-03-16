import type { Context } from "@hono/hono";
import { MatchService } from "../service/match.service.ts";

export class MatchController {
  private service = new MatchService();

  // GET /matches?userId=xxx
  getMyMatches = async (c: Context) => {
    try {
      const userId = c.req.query("userId") || "";
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const matches = await this.service.getMyMatches(userId);
      return c.json({ success: true, data: matches }, 200);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /matches/:id
  getById = async (c: Context) => {
    try {
      const matchId = c.req.param("id") || "";
      const match = await this.service.getById(matchId);
      return c.json({ success: true, data: match }, 200);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return c.json({ success: false, message: "Match not found" }, 404);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /matches/:id/unmatch
  unmatch = async (c: Context) => {
    try {
      const matchId = c.req.param("id") || "";
      const body = await c.req.json();
      if (!body.userId) return c.json({ success: false, message: "User ID required" }, 400);

      await this.service.unmatch(matchId, body.userId);
      return c.json({ success: true, message: "Unmatched successfully" }, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) return c.json({ success: false, message: error.message }, 404);
        if (error.message.includes("Not authorized")) return c.json({ success: false, message: error.message }, 403);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };
}