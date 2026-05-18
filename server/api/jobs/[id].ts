import { handleVercelRequest } from "../../src/vercelHandle.js";

export default async function handler(req: any, res: any) {
  const id = req.query?.id ? String(req.query.id) : "";
  return handleVercelRequest(req, res, `/api/jobs/${id}`);
}
