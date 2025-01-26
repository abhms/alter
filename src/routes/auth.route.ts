import express from "express";
import { googleSignIn } from "../controller/authController";

const authRouter = express.Router();

/**
 * @swagger
 * /google-signin:
 *   post:
 *     summary: Authenticate or register a user via Google Sign-In
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google OAuth token from the client.
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY..."
 *     responses:
 *       200:
 *         description: Successfully authenticated or registered the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message for authentication.
 *                   example: "Google Sign-In successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: The user's unique ID.
 *                           example: "6793f143b42aa5cab75877ef"
 *                       
 *                         name:
 *                           type: string
 *                           description: The user's full name.
 *                           example: "Abhishek Mishra"
 *                         email:
 *                           type: string
 *                           description: The user's email address.
 *                           example: "abhms200@gmail.com"
 *                         avatar:
 *                           type: string
 *                           description: URL to the user's avatar image.
 *                           example: "https://lh3.googleusercontent.com/a/ACg8ocKwHDeN3MS2ygKzQep6Dj_echxz5H09AEaB6TRhUWAdvxVcx4A=s96-c"
 *                 
 *                     token:
 *                       type: string
 *                       description: The authentication token.
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzkzZjE0M2I0MmFhNWNhYjc1ODc3ZWYiLCJpYXQiOjE3Mzc4NzUzNDMsImV4cCI6MTczNzg3ODk0M30.40SfXBMQFmKCCRIjkrWqJwgEpsnaQAdFC6VhDqNs0cc"
 *       400:
 *         description: Bad Request - Invalid or missing token.
 *       500:
 *         description: Internal Server Error.
 */
authRouter.post("/google-signin", googleSignIn);

export default authRouter;
