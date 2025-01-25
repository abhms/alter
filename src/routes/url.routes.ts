import {
  createShortUrl,
  redirectToOriginalUrl,
} from "./../controller/urlController";
import express from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import rateLimiter from "../config/rateLimiter";
const urlRouter = express.Router();
urlRouter.post("/shorten", authenticateUser, rateLimiter, createShortUrl);
urlRouter.get("/:alias", authenticateUser, redirectToOriginalUrl);
export default urlRouter;
