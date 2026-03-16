import { Hono } from "@hono/hono";
import { ReportController } from "../controller/report.controller.ts";

const reportRouter = new Hono();
const controller = new ReportController();

reportRouter.post("/", controller.create);
reportRouter.get("/pending", controller.getPending);
reportRouter.post("/:id/status", controller.updateStatus);

export default reportRouter;