import { Hono } from "@hono/hono";
 
const eventRouter = new Hono();
 
// GET /events — get upcoming events (next 3 months)
eventRouter.get("/", async (c) => {
  try {
    const { prisma } = await import("../../../config/prisma_client.ts");
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const months = [currentMonth, (currentMonth % 12) + 1, ((currentMonth + 1) % 12) + 1];
    const destSlug = c.req.query("destination") || undefined;
 
    const where: any = {
      isActive: true,
      month: { in: months },
    };
 
    if (destSlug) {
      where.OR = [
        { destinationSlug: destSlug },
        { destinationSlug: null }, // national events
      ];
    }
 
    const events = await prisma.event.findMany({
      where,
      orderBy: [{ month: "asc" }, { name: "asc" }],
    });
 
    return c.json({ success: true, data: events }, 200);
  } catch (e) {
    console.error("Events error:", e);
    return c.json({ success: false, message: "Something went wrong" }, 500);
  }
});
 
// GET /events/all — get all events (for admin)
eventRouter.get("/all", async (c) => {
  try {
    const { prisma } = await import("../../../config/prisma_client.ts");
    const events = await prisma.event.findMany({ orderBy: [{ month: "asc" }, { name: "asc" }] });
    return c.json({ success: true, data: events }, 200);
  } catch (e) {
    return c.json({ success: false, message: "Something went wrong" }, 500);
  }
});
 
// POST /events — create event (admin)
eventRouter.post("/", async (c) => {
  try {
    const { prisma } = await import("../../../config/prisma_client.ts");
    const body = await c.req.json();
    const event = await prisma.event.create({
      data: {
        name: body.name,
        emoji: body.emoji || "🎉",
        destination: body.destination,
        destinationSlug: body.destinationSlug || null,
        dates: body.dates,
        month: body.month,
        year: body.year || null,
        tag: body.tag || "Festival",
        description: body.description || null,
      },
    });
    return c.json({ success: true, data: event }, 201);
  } catch (e) {
    return c.json({ success: false, message: "Something went wrong" }, 500);
  }
});
 
// DELETE /events/:id
eventRouter.delete("/:id", async (c) => {
  try {
    const { prisma } = await import("../../../config/prisma_client.ts");
    const id = c.req.param("id");
    await prisma.event.delete({ where: { id } });
    return c.json({ success: true }, 200);
  } catch (e) {
    return c.json({ success: false, message: "Something went wrong" }, 500);
  }
});
 
export default eventRouter;
 