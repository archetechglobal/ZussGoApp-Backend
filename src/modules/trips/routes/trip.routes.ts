import { Hono } from "@hono/hono";
import { TripController } from "../controller/trip.controller.ts";

const tripRouter = new Hono();
const controller = new TripController();

tripRouter.post("/", controller.create);
tripRouter.get("/", controller.getMyTrips);
tripRouter.get("/:id", controller.getById);
tripRouter.put("/:id", controller.update);
tripRouter.delete("/:id", controller.delete);
tripRouter.get("/:id/travelers", controller.findTravelers);

export default tripRouter;