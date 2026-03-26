import type { Context } from "@hono/hono";
import { GroupService } from "../service/group.service.ts";
import { createGroupSchema } from "../schemas/group.schema.ts";
 
export class GroupController {
  private service = new GroupService();
 
  create = async (c: Context) => {
    try {
      const body = await c.req.json();
      if (!body.userId) return c.json({ success: false, message: "User ID required" }, 400);
      const parsed = createGroupSchema.safeParse(body);
      if (!parsed.success) return c.json({ success: false, message: "Validation failed", errors: parsed.error.flatten() }, 400);
      const group = await this.service.create(body.userId, parsed.data);
      return c.json({ success: true, data: group }, 201);
    } catch (e) { return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
 
  getByDestination = async (c: Context) => {
    try {
      const destId = c.req.query("destinationId") || "";
      if (!destId) return c.json({ success: false, message: "Destination ID required" }, 400);
      const groups = await this.service.getByDestination(destId);
      return c.json({ success: true, data: groups }, 200);
    } catch (e) { return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
 
  getById = async (c: Context) => {
    try {
      const id = c.req.param("id") || "";
      const group = await this.service.getById(id);
      return c.json({ success: true, data: group }, 200);
    } catch (e) { if (e instanceof Error && e.message.includes("not found")) return c.json({ success: false, message: e.message }, 404); return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
 
  join = async (c: Context) => {
    try {
      const id = c.req.param("id") || "";
      const body = await c.req.json();
      if (!body.userId) return c.json({ success: false, message: "User ID required" }, 400);
      await this.service.join(id, body.userId);
      return c.json({ success: true, message: "Join request sent" }, 201);
    } catch (e) { if (e instanceof Error) return c.json({ success: false, message: e.message }, 400); return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
 
  acceptMember = async (c: Context) => {
    try {
      const id = c.req.param("id") || "";
      const body = await c.req.json();
      if (!body.creatorId || !body.memberId) return c.json({ success: false, message: "Creator ID and Member ID required" }, 400);
      await this.service.acceptMember(id, body.memberId, body.creatorId);
      return c.json({ success: true, message: "Member accepted" }, 200);
    } catch (e) { if (e instanceof Error) return c.json({ success: false, message: e.message }, 400); return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
 
  getMyGroups = async (c: Context) => {
    try {
      const userId = c.req.query("userId") || "";
      if (!userId) return c.json({ success: false, message: "User ID required" }, 400);
      const groups = await this.service.getMyGroups(userId);
      return c.json({ success: true, data: groups }, 200);
    } catch (e) { return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
}