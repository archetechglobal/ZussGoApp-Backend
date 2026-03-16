import type { Context } from "@hono/hono";
import { ReportService } from "../service/report.service.ts";
import { createReportSchema } from "../schemas/report.schema.ts";

export class ReportController {
  private service = new ReportService();

  // POST /reports
  create = async (c: Context) => {
    try {
      const body = await c.req.json();
      const reporterId = body.userId;
      if (!reporterId) return c.json({ success: false, message: "User ID required" }, 400);

      const parsed = createReportSchema.safeParse(body);
      if (!parsed.success) return c.json({ success: false, message: "Validation failed", errors: parsed.error.flatten() }, 400);

      const report = await this.service.create(reporterId, parsed.data);
      return c.json({ success: true, message: "Report submitted. We'll review it shortly.", data: report }, 201);
    } catch (error) {
      if (error instanceof Error && error.message.includes("yourself")) {
        return c.json({ success: false, message: error.message }, 400);
      }
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // GET /reports/pending (admin)
  getPending = async (c: Context) => {
    try {
      const reports = await this.service.getPendingReports();
      return c.json({ success: true, data: reports }, 200);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };

  // POST /reports/:id/status
  updateStatus = async (c: Context) => {
    try {
      const reportId = c.req.param("id") || "";
      const body = await c.req.json();
      const status = body.status;

      if (!["REVIEWED", "RESOLVED", "DISMISSED"].includes(status)) {
        return c.json({ success: false, message: "Invalid status" }, 400);
      }

      const report = await this.service.updateStatus(reportId, status);
      return c.json({ success: true, data: report }, 200);
    } catch (error) {
      return c.json({ success: false, message: "Something went wrong" }, 500);
    }
  };
}