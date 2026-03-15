import { Hono } from "@hono/hono";
import { registerRoutes } from "./registerRoutes.ts";

const app = new Hono();

app.get("/", (c) => {
    return c.json({
        succes: true,
        message: "Zussgo Backend is running",
    });
});

registerRoutes(app);

Deno.serve(app.fetch);