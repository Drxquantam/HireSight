import { handleVercelRequest } from "../../src/vercelHandle.js";

export default async function handler(req: any, res: any) {
  return handleVercelRequest(req, res, "/api/resume/upload");
}
