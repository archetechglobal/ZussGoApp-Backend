import { Hono } from "@hono/hono";
import { healthRouter } from "../modules/health/index.ts";
import { authenticationRouter } from "../modules/authentication/index.ts";
import { destinationRouter } from "../modules/destinations/index.ts";
import { tripRouter } from "../modules/trips/index.ts";
import { matchRequestRouter } from "../modules/matchRequests/index.ts";
import { matchRouter } from "../modules/matches/index.ts";
import { conversationRouter } from "../modules/conversations/index.ts";
import { messageRouter } from "../modules/messages/index.ts";
import { ratingRouter } from "../modules/ratings/index.ts";
import { blockRouter } from "../modules/blocks/index.ts";
import { reportRouter } from "../modules/reports/index.ts";
import { groupRouter } from "../modules/groups/index.ts";
import { safetyRouter } from "../modules/safety/index.ts";
import eventRouter from "../modules/events/routes/event.route.ts";
import { matchingRouter } from "../modules/matching/index.ts";

export function registerRoutes(app: Hono) {
  app.route("/health", healthRouter);
  app.route("/auth", authenticationRouter);
  app.route("/destinations", destinationRouter);
  app.route("/trips", tripRouter);
  app.route("/match-requests", matchRequestRouter);
  app.route("/matches", matchRouter);
  app.route("/conversations", conversationRouter);
  app.route("/messages", messageRouter);
  app.route("/ratings", ratingRouter);
  app.route("/blocks", blockRouter);
  app.route("/reports", reportRouter);
  app.route("/groups", groupRouter);
  app.route("/safety", safetyRouter);
  app.route("/events", eventRouter);
  app.route("/matching", matchingRouter);
}