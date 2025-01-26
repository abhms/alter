import {
  createShortUrl,
  redirectToOriginalUrl,
} from "./../controller/urlController";
import express from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import rateLimiter from "../config/rateLimiter";

const urlRouter = express.Router();

/**
 * @swagger
 * /shorten:
 *   post:
 *     summary: Create a shortened URL
 *     tags:
 *       - URLs
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               longUrl:
 *                 type: string
 *                 description: The original URL to shorten.
 *                 example: "https://example.com/long-url"
 *     responses:
 *       201:
 *         description: Successfully created a shortened URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The success message.
 *                   example: "Short URL created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     shortUrl:
 *                       type: string
 *                       description: The shortened URL.
 *                       example: "https://alter-n40w.onrender.com/my-custom-alias4"
 *                     createdAt:
 *                       type: string
 *                       description: The timestamp when the short URL was created.
 *                       example: "2025-01-26T07:09:32.021Z"
 *       400:
 *         description: Bad Request - Invalid input.
 *       401:
 *         description: Unauthorized - Missing or invalid token.
 */

urlRouter.post("/shorten", authenticateUser, rateLimiter, createShortUrl);

/**
 * @swagger
 * /{alias}:
 *   get:
 *     summary: Redirect to the original URL
 *     tags:
 *       - URLs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         schema:
 *           type: string
 *         description: The alias of the shortened URL.
 *     responses:
 *       200:
 *         description: Redirected to the original URL.
 *       404:
 *         description: Not Found - Alias does not exist.
 *       401:
 *         description: Unauthorized - Missing or invalid token.
 */
urlRouter.get("/:alias", authenticateUser, redirectToOriginalUrl);

export default urlRouter;
