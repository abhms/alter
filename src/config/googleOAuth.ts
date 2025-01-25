import { OAuth2Client } from "googleapis-common";
import { google } from "googleapis";
import User from "../modal/User";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:4000/auth/google/callback"
);

export const verifyGoogleToken = async (token: string) => {
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    throw new Error("Google token verification failed");
  }
};
