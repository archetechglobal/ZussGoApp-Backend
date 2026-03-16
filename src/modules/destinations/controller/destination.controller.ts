import type { Context } from "@hono/hono";
import { DestinationService } from "../service/destination.service.ts";
import { createDestinationSchema } from "../schemas/destination.schema.ts";

export class DestinationController {
  private service = new DestinationService();

  // GET /destinations
  getAll = async (c: Context) => {
    try {
      const destinations = await this.service.getAll();
      return c.json({ success: true, data: destinations }, 200);
    } catch (error) {
      console.error("GET DESTINATIONS ERROR:", error);
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /destinations/search?q=goa
  search = async (c: Context) => {
    try {
      const query = c.req.query("q") || "";
      if (query.length < 2) {
        return c.json({ success: false, message: "Query must be at least 2 characters" }, 400);
      }
      const results = await this.service.search(query);
      return c.json({ success: true, data: results }, 200);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /destinations/:slug
  getBySlug = async (c: Context) => {
    try {
      const slug = c.req.param("slug") || "";
      const destination = await this.service.getBySlug(slug);
      return c.json({ success: true, data: destination }, 200);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return c.json({ success: false, message: "Destination not found" }, 404);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /destinations
  create = async (c: Context) => {
    try {
      const body = await c.req.json();
      const parsed = createDestinationSchema.safeParse(body);
      if (!parsed.success) {
        return c.json({ success: false, message: "Validation failed", errors: parsed.error.flatten() }, 400);
      }
      const destination = await this.service.create(parsed.data);
      return c.json({ success: true, data: destination }, 201);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /destinations/seed
  seed = async (c: Context) => {
    try {
      const result = await this.service.seed();
      return c.json({ success: true, data: result }, 201);
    } catch (error) {
      console.error("SEED ERROR:", error);
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };
}