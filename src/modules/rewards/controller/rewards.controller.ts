import type { Context } from "@hono/hono";
import { RewardsService } from "../service/rewards.service.ts";
import { earnPointsSchema, redeemPointsSchema } from "../schemas/rewards.schema.ts";

export class RewardsController {
  private service = new RewardsService();

  // GET /rewards?userId=xxx — full rewards profile
  getProfile = async (c: Context) => {
    try {
      const userId = c.req.query("userId");
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const profile = await this.service.getProfile(userId);
      return c.json({ success: true, data: profile }, 200);
    } catch (error) {
      console.error("GET REWARDS PROFILE ERROR:", error);
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /rewards/balance?userId=xxx — lightweight balance check
  getBalance = async (c: Context) => {
    try {
      const userId = c.req.query("userId");
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const balance = await this.service.getBalance(userId);
      return c.json({ success: true, data: balance }, 200);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /rewards/earn — add points
  earn = async (c: Context) => {
    try {
      const body = await c.req.json();
      const parsed = earnPointsSchema.safeParse(body);
      if (!parsed.success) {
        return c.json({ success: false, message: "Validation failed", errors: parsed.error.flatten() }, 400);
      }

      const result = await this.service.earn(parsed.data);
      return c.json({ success: true, message: "Points earned", data: result }, 200);
    } catch (error) {
      console.error("EARN POINTS ERROR:", error);
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /rewards/earn-action — auto-earn for predefined actions
  earnForAction = async (c: Context) => {
    try {
      const body = await c.req.json();
      const { userId, action, referenceId } = body;
      if (!userId || !action) {
        return c.json({ success: false, message: "userId and action required" }, 400);
      }

      const result = await this.service.earnForAction(userId, action, referenceId);
      return c.json({ success: true, message: "Points earned", data: result }, 200);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unknown action")) {
        return c.json({ success: false, message: error.message }, 400);
      }
      console.error("EARN ACTION ERROR:", error);
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /rewards/redeem — spend points
  redeem = async (c: Context) => {
    try {
      const body = await c.req.json();
      const parsed = redeemPointsSchema.safeParse(body);
      if (!parsed.success) {
        return c.json({ success: false, message: "Validation failed", errors: parsed.error.flatten() }, 400);
      }

      const result = await this.service.redeem(parsed.data);
      return c.json({ success: true, message: "Points redeemed", data: result }, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Insufficient")) {
          return c.json({ success: false, message: "Insufficient points" }, 400);
        }
        if (error.message.includes("No trek points")) {
          return c.json({ success: false, message: "No rewards account found" }, 404);
        }
      }
      console.error("REDEEM POINTS ERROR:", error);
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /rewards/history?userId=xxx&limit=20&offset=0 — ledger history
  getHistory = async (c: Context) => {
    try {
      const userId = c.req.query("userId");
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const limit = parseInt(c.req.query("limit") ?? "20");
      const offset = parseInt(c.req.query("offset") ?? "0");

      const history = await this.service.getHistory(userId, limit, offset);
      return c.json({ success: true, data: history }, 200);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /rewards/initialize — create rewards account for new user
  initialize = async (c: Context) => {
    try {
      const body = await c.req.json();
      const { userId } = body;
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const tp = await this.service.initialize(userId);
      return c.json({ success: true, message: "Rewards initialized", data: tp }, 201);
    } catch (error) {
      console.error("INIT REWARDS ERROR:", error);
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };
}