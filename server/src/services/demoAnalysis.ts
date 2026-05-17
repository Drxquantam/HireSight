import type { AiAnalysis, JobAnalyzeInput } from "../schemas/jobSchemas.js";

const knownSkills = [
  "React",
  "TypeScript",
  "Node.js",
  "Express",
  "MongoDB",
  "REST APIs",
  "Docker",
  "Redis",
  "System Design",
  "AWS",
  "GraphQL",
  "Tailwind",
  "CI/CD"
];

export function extractSkills(text: string) {
  const lower = text.toLowerCase();
  return knownSkills.filter((skill) => lower.includes(skill.toLowerCase()));
}

export function buildDemoAnalysis(job: JobAnalyzeInput, resumeSummary: string): AiAnalysis {
  const jobSkills = extractSkills(job.description);
  const resumeSkills = extractSkills(resumeSummary);
  const matchedSkills = jobSkills.filter((skill) => resumeSkills.includes(skill)).slice(0, 8);
  const missingSkills = jobSkills.filter((skill) => !resumeSkills.includes(skill)).slice(0, 6);
  const matchScore = Math.min(92, Math.max(48, 60 + matchedSkills.length * 6 - missingSkills.length * 4));

  return {
    companyName: job.company,
    jobTitle: job.title,
    matchScore,
    matchedSkills: matchedSkills.length ? matchedSkills : ["React", "Node.js", "MongoDB", "REST APIs"],
    missingSkills: missingSkills.length ? missingSkills : ["Redis", "Docker", "System Design"],
    atsSuggestions: [
      "Mirror the job title and core backend keywords in the resume summary.",
      "Add measurable impact to project bullets with scale, latency, users, or reliability metrics.",
      "Group technical skills by frontend, backend, databases, cloud, and tooling."
    ],
    resumeBulletSuggestions: [
      "Built a scalable monitoring and recovery dashboard using Node.js, MongoDB, and automated incident detection.",
      "Improved API reliability by adding structured error handling, request validation, and operational logging."
    ],
    interviewTopics: ["DSA graphs", "OS basics", "backend APIs", "system design", "database indexing"],
    projectRecommendations: [
      "Build a Dockerized job queue with Redis, Express, MongoDB, and retry monitoring.",
      "Create a production-style system design project with API rate limiting and observability."
    ],
    finalRecommendation: matchScore >= 72 ? "Apply" : "Improve First",
    confidence: 0.78
  };
}

export function summarizeResumeFallback(resumeText: string) {
  const skills = extractSkills(resumeText);
  const detectedSkills = skills.length ? skills : ["software engineering", "problem solving", "project development"];
  return {
    summary: `Extracted skills: ${detectedSkills.join(", ")}.`,
    skills
  };
}
