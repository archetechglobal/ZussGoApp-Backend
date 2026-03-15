import type { Context } from "@hono/hono";
import { HealthService } from "../service/health.service.ts";

export class HealthController {
    private healthService = new HealthService();

    getHealth = (c: Context) => {
        const result = this.healthService.getHealthStatus();
        return c.json(result, 200);
    };
}