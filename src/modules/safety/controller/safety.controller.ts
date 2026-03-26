import type { Context } from "@hono/hono";
import { SafetyService } from "../service/safety.service.ts";
 
export class SafetyController {
  private service = new SafetyService();
 
  startTrip = async (c: Context) => {
    try { const b = await c.req.json(); if (!b.userId) return c.json({ success: false, message: "User ID required" }, 400);
      const r = await this.service.startTrip(b.userId, b); return c.json({ success: true, data: r }, 201);
    } catch (e) { return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
 
  completeTrip = async (c: Context) => {
    try { const id = c.req.param("id") || ""; const b = await c.req.json();
      const r = await this.service.completeTrip(id, b.userId); return c.json({ success: true, data: r }, 200);
    } catch (e) { return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
 
  triggerSOS = async (c: Context) => {
    try { const id = c.req.param("id") || "";
      const r = await this.service.triggerSOS(id); return c.json({ success: true, message: "SOS triggered", data: r }, 200);
    } catch (e) { return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
 
  updateLocation = async (c: Context) => {
    try { const id = c.req.param("id") || ""; const b = await c.req.json();
      await this.service.updateLocation(id, b.latitude, b.longitude); return c.json({ success: true }, 200);
    } catch (e) { return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
 
  getActiveTrip = async (c: Context) => {
    try { const uid = c.req.query("userId") || ""; if (!uid) return c.json({ success: false, message: "User ID required" }, 400);
      const r = await this.service.getActiveTrip(uid); return c.json({ success: true, data: r }, 200);
    } catch (e) { return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
 
  addContact = async (c: Context) => {
    try { const b = await c.req.json(); if (!b.userId) return c.json({ success: false, message: "User ID required" }, 400);
      const r = await this.service.addContact(b.userId, b.name, b.phone, b.relation); return c.json({ success: true, data: r }, 201);
    } catch (e) { return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
 
  getContacts = async (c: Context) => {
    try { const uid = c.req.query("userId") || ""; if (!uid) return c.json({ success: false, message: "User ID required" }, 400);
      const r = await this.service.getContacts(uid); return c.json({ success: true, data: r }, 200);
    } catch (e) { return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
 
  deleteContact = async (c: Context) => {
    try { const id = c.req.param("id") || ""; await this.service.deleteContact(id); return c.json({ success: true }, 200);
    } catch (e) { return c.json({ success: false, message: "Something went wrong" }, 500); }
  };
}