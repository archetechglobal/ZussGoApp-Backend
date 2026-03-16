import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { registerRoutes } from "./registerRoutes.ts";
import { handleChatWebSocket } from "../modules/websocket/chat.websocket.ts";

const app = new Hono();

app.use("/*", cors());

app.get("/", (c) => {
  return c.json({
    success: true,
    message: "Zussgo Backend is running",
  });
});

registerRoutes(app);

// WebSocket endpoint — handled outside Hono because Deno.upgradeWebSocket
// needs the raw Request object
Deno.serve((req) => {
  const url = new URL(req.url);

  // WebSocket route
  if (url.pathname === "/ws/chat") {
    return handleChatWebSocket(req);
  }

  // Everything else goes to Hono
  return app.fetch(req);
});