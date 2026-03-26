// src/modules/matching/controller/matching.controller.ts

import type { Context } from "@hono/hono";
import { MatchingEngine } from "../matching.engine.ts";

export class MatchingController {
  private engine = new MatchingEngine();

  // GET /matching/:tripId?userId=xxx&preferSameGender=false&minScore=30
  findMatches = async (c: Context) => {
    try {
      const tripId = c.req.param("tripId") || "";
      const userId = c.req.query("userId") || "";
      const preferSameGender = c.req.query("preferSameGender") === "true";
      const minScore = parseInt(c.req.query("minScore") || "30");

      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);
      if (!tripId) return c.json({ success: false, message: "Trip ID required" }, 400);

      const matches = await this.engine.findMatches(userId, tripId, {
        preferSameGender,
        minScore,
      });

      // Add labels to each match
      const enriched = matches.map((m: any) => ({
        ...m,
        matchLabel: MatchingEngine.getMatchLabel(m.score),
      }));

      return c.json({
        success: true,
        data: {
          matches: enriched,
          total: enriched.length,
          filters: { preferSameGender, minScore },
        },
      }, 200);
    } catch (error) {
      console.error("MATCHING ERROR:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return c.json({ success: false, message: "Trip not found" }, 404);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };
}