import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { env } from "../config/env.js";

export type CompanyPrepInput = {
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
};

export const companyPrepSchema = z.object({
  companyOverview: z.string(),
  mission: z.string(),
  whatTheyDo: z.string(),
  productsOrServices: z.array(z.string()),
  businessModel: z.string(),
  rolePrepTopics: z.array(z.string()),
  interviewQuestions: z.array(z.string()),
  talkingPoints: z.array(z.string()),
  whyThisCompanyAnswer: z.string(),
  confidence: z.number().min(0).max(1)
});

export type CompanyPrep = z.infer<typeof companyPrepSchema>;

function jsonFromText(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI response did not include JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function companyPrepPrompt(input: CompanyPrepInput) {
  return `You are Resume2Role, an interview preparation assistant.
Prepare concise company and role research for a candidate.
Return only valid JSON with this exact shape:
{
  "companyOverview": "string",
  "mission": "string",
  "whatTheyDo": "string",
  "productsOrServices": ["string"],
  "businessModel": "string",
  "rolePrepTopics": ["string"],
  "interviewQuestions": ["string"],
  "talkingPoints": ["string"],
  "whyThisCompanyAnswer": "string",
  "confidence": 0.8
}

Company: ${input.companyName}
Role: ${input.jobTitle}
Matched candidate skills: ${(input.matchedSkills ?? []).join(", ") || "Not provided"}
Missing candidate skills: ${(input.missingSkills ?? []).join(", ") || "Not provided"}
Job description:
${(input.jobDescription ?? "").slice(0, 10000)}

Keep it practical for interview preparation. If exact mission or products are uncertain, infer carefully and say it in general terms.`;
}

function demoCompanyPrep(input: CompanyPrepInput): CompanyPrep {
  const role = input.jobTitle || "this role";
  const company = input.companyName || "the company";

  return {
    companyOverview: `${company} appears to be hiring for ${role}. Review its core business, customers, and recent work before the interview.`,
    mission: "Understand the company's customer value proposition, operating values, and how the role supports business outcomes.",
    whatTheyDo: `${company} likely needs candidates who can connect technical execution with product, customer, and operational impact.`,
    productsOrServices: ["Core products or services from the company website", "Customer-facing platforms", "Internal business or engineering systems"],
    businessModel: "Prepare to explain how the company creates value, who its customers are, and how technology supports delivery.",
    rolePrepTopics: [
      `Explain projects relevant to ${role}`,
      "Prepare examples of ownership, debugging, teamwork, and measurable impact",
      "Revise fundamentals mentioned in the job description"
    ],
    interviewQuestions: [
      `Why do you want to join ${company}?`,
      `How does your experience fit the ${role} role?`,
      "Tell me about a project where you solved a difficult technical problem.",
      "What would you learn first if selected for this role?"
    ],
    talkingPoints: [
      "Connect your strongest skills to the job requirements.",
      "Mention one company-specific reason for your interest.",
      "Use metrics and project outcomes when explaining your resume."
    ],
    whyThisCompanyAnswer: `I am interested in ${company} because the ${role} role matches my technical interests and gives me a chance to contribute to real business problems while growing in a strong engineering environment.`,
    confidence: 0.62
  };
}

export async function prepareCompany(input: CompanyPrepInput): Promise<CompanyPrep> {
  if (env.aiProvider === "gemini" && env.geminiApiKey) {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(companyPrepPrompt(input));
    return companyPrepSchema.parse(jsonFromText(result.response.text()));
  }

  if (env.aiProvider === "groq" && env.groqApiKey) {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: env.groqModel,
        messages: [
          { role: "system", content: "Return only strict JSON. No markdown." },
          { role: "user", content: companyPrepPrompt(input) }
        ],
        temperature: 0.25,
        response_format: { type: "json_object" }
      },
      { headers: { Authorization: `Bearer ${env.groqApiKey}` } }
    );

    return companyPrepSchema.parse(JSON.parse(response.data.choices[0].message.content));
  }

  return demoCompanyPrep(input);
}
