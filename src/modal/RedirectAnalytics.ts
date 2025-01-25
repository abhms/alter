import mongoose, { Schema, Document } from "mongoose";

interface IRedirectAnalytics extends Document {
  userId: mongoose.Types.ObjectId;
  shortUrl: string;
  userAgent: string;
  ipAddress: string;
  timestamp: Date;
  location: {
    country: string;
    region: string;
    city: string;
  };
}

const redirectAnalyticsSchema = new Schema<IRedirectAnalytics>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  shortUrl: { type: String, required: true },
  userAgent: { type: String, required: true },
  ipAddress: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  location: {
    country: { type: String },
    region: { type: String },
    city: { type: String },
  },
});

const RedirectAnalytics = mongoose.model<IRedirectAnalytics>(
  "RedirectAnalytics",
  redirectAnalyticsSchema
);

export default RedirectAnalytics;
