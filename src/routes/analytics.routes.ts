import express from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import {
  getAnalytics,
  getOverallAnalytics,
  getTopicAnalytics,
} from "../controller/analyticsController";
const analyticsRouter = express.Router();
analyticsRouter.get("/:alias", authenticateUser, getAnalytics);
analyticsRouter.get("/topic/:topic", getTopicAnalytics);
analyticsRouter.get("/overall/summary", authenticateUser, getOverallAnalytics);
export default analyticsRouter;
