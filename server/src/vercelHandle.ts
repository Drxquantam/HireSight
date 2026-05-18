import { app } from "./app.js";
import { connectDb } from "./config/db.js";

let dbReady: Promise<void> | null = null;

export async function handleVercelRequest(req: any, res: any, url: string) {
  dbReady ??= connectDb().then(() => undefined);
  await dbReady;
  req.url = url;
  return app(req, res);
}
