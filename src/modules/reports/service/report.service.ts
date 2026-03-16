import { ReportRepository } from "../repository/report.repository.ts";
import type { CreateReportInput } from "../schemas/report.schema.ts";

export class ReportService {
  private repository = new ReportRepository();

  create = async (reporterId: string, input: CreateReportInput) => {
    if (reporterId === input.reportedId) throw new Error("Cannot report yourself");

    return await this.repository.create(reporterId, input);
  };

  // Admin only
  getPendingReports = async () => {
    return await this.repository.findPending();
  };

  updateStatus = async (reportId: string, status: "REVIEWED" | "RESOLVED" | "DISMISSED") => {
    return await this.repository.updateStatus(reportId, status);
  };
}