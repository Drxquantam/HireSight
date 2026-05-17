import { Schema, model } from "mongoose";

const UserProfileSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    resumeText: { type: String, required: true },
    resumeSummary: { type: String, required: true },
    skills: [{ type: String }]
  },
  { timestamps: true }
);

export const UserProfile = model("UserProfile", UserProfileSchema);

