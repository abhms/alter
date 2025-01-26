import express from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import {
  getAnalytics,
  getOverallAnalytics,
  getTopicAnalytics,
} from "../controller/analyticsController";

const analyticsRouter = express.Router();

/**
 * @swagger
 * /api/analytics/{alias}:
 *   get:
 *     summary: Retrieve analytics for a specific short URL
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         schema:
 *           type: string
 *         description: Alias of the short URL
 *         example: "abc123"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved analytics for the given alias.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalClicks:
 *                   type: integer
 *                   description: Total number of clicks for the short URL.
 *                 uniqueUsers:
 *                   type: integer
 *                   description: Total number of unique users who clicked the short URL.
 *                 clicksByDate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       clicks:
 *                         type: integer
 *                         description: Number of clicks for a specific date.
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: Date of the clicks.
 *                       uniqueUsers:
 *                         type: integer
 *                         description: Number of unique users on that date.
 *                 osType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       osName:
 *                         type: string
 *                         description: Name of the operating system.
 *                       uniqueClicks:
 *                         type: integer
 *                         description: Number of unique clicks from that OS.
 *                       uniqueUsers:
 *                         type: integer
 *                         description: Number of unique users on that OS.
 *                 deviceType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       deviceName:
 *                         type: string
 *                         description: Name of the device type.
 *                       uniqueClicks:
 *                         type: integer
 *                         description: Number of unique clicks from that device.
 *                       uniqueUsers:
 *                         type: integer
 *                         description: Number of unique users on that device.
 *       401:
 *         description: Unauthorized - Authentication required.
 *       404:
 *         description: Analytics not found for the given alias.
 */

/**
 * @swagger
 * /api/analytics/topic/{topic}:
 *   get:
 *     summary: Retrieve analytics for a specific topic
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: path
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the topic
 *         example: "technology"
 *     responses:
 *       200:
 *         description: Successfully retrieved analytics for the topic.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalClicks:
 *                   type: integer
 *                 uniqueUsers:
 *                   type: integer
 *                 clicksByDate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       clicks:
 *                         type: integer
 *                       date:
 *                         type: string
 *                         format: date
 *                       uniqueUsers:
 *                         type: integer
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       shortUrl:
 *                         type: string
 *                       totalClicks:
 *                         type: integer
 *                       uniqueUsers:
 *                         type: integer
 *       404:
 *         description: No analytics data found for the topic.
 */

/**
 * @swagger
 * /api/analytics/overall/summary:
 *   get:
 *     summary: Retrieve overall analytics summary
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved overall analytics summary.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUrls:
 *                   type: integer
 *                   description: Total number of URLs created.
 *                 totalClicks:
 *                   type: integer
 *                   description: Total number of clicks across all URLs.
 *                 uniqueUsers:
 *                   type: integer
 *                   description: Total number of unique users.
 *                 clicksByDate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: Date of the click data.
 *                       clicks:
 *                         type: integer
 *                         description: Number of clicks for the date.
 *                 osType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       osName:
 *                         type: string
 *                         description: Name of the operating system.
 *                       uniqueClicks:
 *                         type: integer
 *                         description: Number of unique clicks on that OS.
 *                       uniqueUsers:
 *                         type: integer
 *                         description: Number of unique users using that OS.
 *                 deviceType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       deviceName:
 *                         type: string
 *                         description: Name of the device type.
 *                       uniqueClicks:
 *                         type: integer
 *                         description: Number of unique clicks on that device.
 *                       uniqueUsers:
 *                         type: integer
 *                         description: Number of unique users using that device.
 *       401:
 *         description: Unauthorized - Authentication required.
 */

analyticsRouter.get("/:alias", authenticateUser, getAnalytics);
analyticsRouter.get("/topic/:topic", getTopicAnalytics);
analyticsRouter.get("/overall/summary", authenticateUser, getOverallAnalytics);

export default analyticsRouter;
