import { app } from "../src/app.js";
import { connectDb } from "../src/config/db.js";

let dbReady: Promise<void> | null = null;

export default async function handler(req: any, res: any) {
  dbReady ??= connectDb().then(() => undefined);
  await dbReady;

  if (typeof req.url === "string" && !req.url.startsWith("/api/")) {
    req.url = `/api${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
  }

  return app(req, res);
}
