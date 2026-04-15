import { Hono } from "@hono/hono";
import { RewardsController } from "../controller/rewards.controller.ts";

const rewardsRouter = new Hono();
const controller = new RewardsController();

// GET  /rewards?userId=xxx          — full profile (balance, tier, activity, offers)
rewardsRouter.get("/", controller.getProfile);

// GET  /rewards/balance?userId=xxx  — lightweight balance check
rewardsRouter.get("/balance", controller.getBalance);

// GET  /rewards/history?userId=xxx  — paginated ledger
rewardsRouter.get("/history", controller.getHistory);

// POST /rewards/earn                — add points (manual)
rewardsRouter.post("/earn", controller.earn);

// POST /rewards/earn-action         — auto-earn for actions (TRIP_COMPLETED, etc.)
rewardsRouter.post("/earn-action", controller.earnForAction);

// POST /rewards/redeem              — spend points
rewardsRouter.post("/redeem", controller.redeem);

// POST /rewards/initialize          — create account + signup bonus
rewardsRouter.post("/initialize", controller.initialize);

export default rewardsRouter;