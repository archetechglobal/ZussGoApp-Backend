import { Hono } from "@hono/hono";
import { SafetyController } from "../controller/safety.controller.ts";
 
const safetyRouter = new Hono();
const c = new SafetyController();
 
safetyRouter.post("/start", c.startTrip);
safetyRouter.post("/:id/complete", c.completeTrip);
safetyRouter.post("/:id/sos", c.triggerSOS);
safetyRouter.post("/:id/location", c.updateLocation);
safetyRouter.get("/active", c.getActiveTrip);
safetyRouter.post("/contacts", c.addContact);
safetyRouter.get("/contacts", c.getContacts);
safetyRouter.delete("/contacts/:id", c.deleteContact);
 
export default safetyRouter;