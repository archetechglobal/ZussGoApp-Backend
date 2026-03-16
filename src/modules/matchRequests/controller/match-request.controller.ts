import type { Context } from "@hono/hono";
import { MatchRequestService } from "../service/match-request.service.ts";
import { sendMatchRequestSchema } from "../schemas/match-request.schema.ts";

export class MatchRequestController {
  private service = new MatchRequestService();

  // POST /match-requests
  send = async (c: Context) => {
    try {
      const body = await c.req.json();
      const senderId = body.userId;
      if (!senderId) return c.json({ success: false, message: "User ID required" }, 400);

      const parsed = sendMatchRequestSchema.safeParse(body);
      if (!parsed.success) return c.json({ success: false, message: "Validation failed", errors: parsed.error.flatten() }, 400);

      const request = await this.service.send(senderId, parsed.data.receiverId, parsed.data.tripId, parsed.data.message);
      return c.json({ success: true, message: "Match request sent", data: request }, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already sent")) return c.json({ success: false, message: error.message }, 409);
        if (error.message.includes("yourself")) return c.json({ success: false, message: error.message }, 400);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /match-requests/pending?userId=xxx
  getPending = async (c: Context) => {
    try {
      const userId = c.req.query("userId") || "";
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const requests = await this.service.getPendingRequests(userId);
      return c.json({ success: true, data: requests }, 200);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /match-requests/sent?userId=xxx
  getSent = async (c: Context) => {
    try {
      const userId = c.req.query("userId") || "";
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const requests = await this.service.getSentRequests(userId);
      return c.json({ success: true, data: requests }, 200);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /match-requests/:id/accept
  accept = async (c: Context) => {
    try {
      const id = c.req.param("id") || "";
      const body = await c.req.json();
      if (!body.userId) return c.json({ success: false, message: "User ID required" }, 400);

      const result = await this.service.accept(id, body.userId);
      return c.json({ success: true, message: "Match request accepted! You can now chat.", data: result }, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) return c.json({ success: false, message: error.message }, 404);
        if (error.message.includes("Not authorized")) return c.json({ success: false, message: error.message }, 403);
        if (error.message.includes("no longer pending")) return c.json({ success: false, message: error.message }, 400);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /match-requests/:id/reject
  reject = async (c: Context) => {
    try {
      const id = c.req.param("id") || "";
      const body = await c.req.json();
      if (!body.userId) return c.json({ success: false, message: "User ID required" }, 400);

      await this.service.reject(id, body.userId);
      return c.json({ success: true, message: "Match request rejected" }, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) return c.json({ success: false, message: error.message }, 404);
        if (error.message.includes("Not authorized")) return c.json({ success: false, message: error.message }, 403);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /match-requests/:id/cancel
  cancel = async (c: Context) => {
    try {
      const id = c.req.param("id") || "";
      const body = await c.req.json();
      if (!body.userId) return c.json({ success: false, message: "User ID required" }, 400);

      await this.service.cancel(id, body.userId);
      return c.json({ success: true, message: "Match request cancelled" }, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) return c.json({ success: false, message: error.message }, 404);
        if (error.message.includes("Not authorized")) return c.json({ success: false, message: error.message }, 403);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };
}