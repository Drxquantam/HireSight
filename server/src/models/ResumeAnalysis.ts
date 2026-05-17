import { Schema, model } from "mongoose";

const ResumeAnalysisSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    extractedSkills: [{ type: String }],
    provider: { type: String, required: true }
  },
  { timestamps: true }
);

export const ResumeAnalysis = model("ResumeAnalysis", ResumeAnalysisSchema);

