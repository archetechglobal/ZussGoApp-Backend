import type { Context } from "@hono/hono";
import { RatingService } from "../service/rating.service.ts";
import { createRatingSchema } from "../schemas/rating.schema.ts";

export class RatingController {
  private service = new RatingService();

  // POST /ratings
  create = async (c: Context) => {
    try {
      const body = await c.req.json();
      const raterId = body.userId;
      if (!raterId) return c.json({ success: false, message: "User ID required" }, 400);

      const parsed = createRatingSchema.safeParse(body);
      if (!parsed.success) return c.json({ success: false, message: "Validation failed", errors: parsed.error.flatten() }, 400);

      const rating = await this.service.create(raterId, parsed.data);
      return c.json({ success: true, message: "Rating submitted", data: rating }, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("yourself")) return c.json({ success: false, message: error.message }, 400);
        if (error.message.includes("Already rated")) return c.json({ success: false, message: error.message }, 409);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /ratings/:userId
  getUserRatings = async (c: Context) => {
    try {
      const userId = c.req.param("userId") || "";
      const result = await this.service.getUserRatings(userId);
      return c.json({ success: true, data: result }, 200);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };
}