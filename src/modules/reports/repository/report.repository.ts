import { prisma } from "../../../config/prisma_client.ts";
import type { CreateReportInput } from "../schemas/report.schema.ts";

export class ReportRepository {

  create = async (reporterId: string, input: CreateReportInput) => {
    return await prisma.report.create({
      data: {
        reporterId,
        reportedId: input.reportedId,
        reason: input.reason,
        description: input.description,
      },
    });
  };

  // Admin: get all pending reports
  findPending = async () => {
    return await prisma.report.findMany({
      where: { status: "PENDING" },
      include: {
        reporter: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  updateStatus = async (reportId: string, status: "REVIEWED" | "RESOLVED" | "DISMISSED") => {
    return await prisma.report.update({
      where: { id: reportId },
      data: { status },
    });
  };
}