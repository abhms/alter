import mongoose from "mongoose";

interface IUser {
  googleId: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
