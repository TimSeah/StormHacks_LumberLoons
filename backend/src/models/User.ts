import mongoose, { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  streak: number;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    streak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;