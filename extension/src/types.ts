export type AiAnalysis = {
  companyName: string;
  jobTitle: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  atsSuggestions: string[];
  resumeBulletSuggestions: string[];
  interviewTopics: string[];
  projectRecommendations: string[];
  finalRecommendation: "Apply" | "Improve First";
  confidence: number;
};

export type SavedJob = AiAnalysis & {
  _id: string;
  url: string;
  source: string;
  title: string;
  company: string;
  createdAt: string;
};

export type ExtensionSettings = {
  backendUrl: string;
  userId: string;
  resumeSummary?: string;
};

export type ExtractedJob = {
  url: string;
  source: string;
  title: string;
  company: string;
  description: string;
};
