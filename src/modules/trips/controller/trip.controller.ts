import type { Context } from "@hono/hono";
import { TripService } from "../service/trip.service.ts";
import { createTripSchema, updateTripSchema } from "../schemas/trip.schema.ts";

export class TripController {
  private service = new TripService();

  // POST /trips
  create = async (c: Context) => {
    try {
      const body = await c.req.json();
      const userId = body.userId;
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const parsed = createTripSchema.safeParse(body);
      if (!parsed.success) {
        return c.json({ success: false, message: "Validation failed", errors: parsed.error.flatten() }, 400);
      }

      const trip = await this.service.create(userId, parsed.data);
      return c.json({ success: true, message: "Trip created", data: trip }, 201);
    } catch (error) {
      console.error("CREATE TRIP ERROR:", error);
      if (error instanceof Error) {
        if (error.message.includes("End date")) return c.json({ success: false, message: error.message }, 400);
        if (error.message.includes("past")) return c.json({ success: false, message: error.message }, 400);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /trips?userId=xxx
  getMyTrips = async (c: Context) => {
    try {
      const userId = c.req.query("userId");
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const trips = await this.service.getMyTrips(userId);
      return c.json({ success: true, data: trips }, 200);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /trips/:id
  getById = async (c: Context) => {
    try {
      const tripId = c.req.param("id") || "";
      const trip = await this.service.getById(tripId);
      return c.json({ success: true, data: trip }, 200);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return c.json({ success: false, message: "Trip not found" }, 404);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // PUT /trips/:id
  update = async (c: Context) => {
    try {
      const tripId = c.req.param("id") || "";
      const body = await c.req.json();
      const userId = body.userId;
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const parsed = updateTripSchema.safeParse(body);
      if (!parsed.success) {
        return c.json({ success: false, message: "Validation failed", errors: parsed.error.flatten() }, 400);
      }

      const trip = await this.service.update(tripId, userId, parsed.data);
      return c.json({ success: true, data: trip }, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) return c.json({ success: false, message: "Trip not found" }, 404);
        if (error.message.includes("Not authorized")) return c.json({ success: false, message: "Not authorized" }, 403);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // DELETE /trips/:id?userId=xxx
  delete = async (c: Context) => {
    try {
      const tripId = c.req.param("id") || "";
      const userId = c.req.query("userId");
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      await this.service.delete(tripId, userId);
      return c.json({ success: true, message: "Trip deleted" }, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) return c.json({ success: false, message: "Trip not found" }, 404);
        if (error.message.includes("Not authorized")) return c.json({ success: false, message: "Not authorized" }, 403);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /trips/:id/travelers — the magic endpoint
  findTravelers = async (c: Context) => {
    try {
      const tripId = c.req.param("id") || "";
      const userId = c.req.query("userId");
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);

      const travelers = await this.service.findTravelers(tripId, userId);
      return c.json({ success: true, data: travelers }, 200);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return c.json({ success: false, message: "Trip not found" }, 404);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };
}