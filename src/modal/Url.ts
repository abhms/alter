import mongoose, { Schema, Document } from "mongoose";

interface IUrl extends Document {
  createdBy: mongoose.Types.ObjectId;
  longUrl: string;
  shortUrl: string;
  customAlias?: string;
  topic?: string;
  createdAt: Date;
}

const urlSchema = new Schema<IUrl>({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  longUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
  customAlias: { type: String, unique: true },
  topic: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Url = mongoose.model<IUrl>("Url", urlSchema);

export default Url;
