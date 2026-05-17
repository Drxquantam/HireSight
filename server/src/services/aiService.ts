import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { analysisSchema, type AiAnalysis, type JobAnalyzeInput } from "../schemas/jobSchemas.js";
import { buildDemoAnalysis, summarizeResumeFallback } from "./demoAnalysis.js";

function jsonFromText(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI response did not include JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function analysisPrompt(job: JobAnalyzeInput, resumeSummary: string) {
  return `You are an expert technical recruiter and ATS resume coach.
Return only valid JSON with this exact shape:
{
  "companyName": "string",
  "jobTitle": "string",
  "matchScore": 0,
  "matchedSkills": ["string"],
  "missingSkills": ["string"],
  "atsSuggestions": ["string"],
  "resumeBulletSuggestions": ["string"],
  "interviewTopics": ["string"],
  "projectRecommendations": ["string"],
  "finalRecommendation": "Apply",
  "confidence": 0.8
}
finalRecommendation must be "Apply" or "Improve First".

Resume summary:
${resumeSummary}

Job title: ${job.title}
Company: ${job.company}
Job description:
${job.description.slice(0, 14000)}`;
}

export async function summarizeResume(resumeText: string) {
  if (env.aiProvider === "gemini" && env.geminiApiKey) {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Extract only professional skills, technologies, tools, domains, and project keywords from this resume. Do not include name, email, phone, links, address, education marks, or personal details. Return one concise sentence starting with "Extracted skills:".\n\n${resumeText.slice(0, 30000)}`);
    return { summary: result.response.text(), skills: [] };
  }

  if (env.aiProvider === "groq" && env.groqApiKey) {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: env.groqModel,
        messages: [
          { role: "system", content: "Extract only professional skills, technologies, tools, domains, and project keywords from resumes. Never include name, email, phone, links, address, education marks, or personal details. Return one concise sentence starting with 'Extracted skills:'." },
          { role: "user", content: resumeText.slice(0, 30000) }
        ],
        temperature: 0.2
      },
      { headers: { Authorization: `Bearer ${env.groqApiKey}` } }
    );
    return { summary: response.data.choices[0].message.content as string, skills: [] };
  }

  return summarizeResumeFallback(resumeText);
}

export async function analyzeJobWithAi(job: JobAnalyzeInput, resumeSummary: string): Promise<AiAnalysis> {
  if (env.aiProvider === "gemini" && env.geminiApiKey) {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(analysisPrompt(job, resumeSummary));
    return analysisSchema.parse(jsonFromText(result.response.text()));
  }

  if (env.aiProvider === "groq" && env.groqApiKey) {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: env.groqModel,
        messages: [
          { role: "system", content: "Return only strict JSON. No markdown." },
          { role: "user", content: analysisPrompt(job, resumeSummary) }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      },
      { headers: { Authorization: `Bearer ${env.groqApiKey}` } }
    );
    return analysisSchema.parse(JSON.parse(response.data.choices[0].message.content));
  }

  return buildDemoAnalysis(job, resumeSummary);
}
