import { Schema, model } from "mongoose";

const SavedJobSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    source: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    companyName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    matchScore: { type: Number, required: true },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    atsSuggestions: [{ type: String }],
    resumeBulletSuggestions: [{ type: String }],
    interviewTopics: [{ type: String }],
    projectRecommendations: [{ type: String }],
    finalRecommendation: { type: String, enum: ["Apply", "Improve First"], required: true },
    confidence: { type: Number, required: true }
  },
  { timestamps: true }
);

export const SavedJob = model("SavedJob", SavedJobSchema);

