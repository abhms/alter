import express from "express";
import { googleSignIn } from "../controller/authController";
const authRouter = express.Router();
authRouter.post("/google-signin", googleSignIn);
export default authRouter;
