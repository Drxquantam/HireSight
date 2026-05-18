import { app } from "../dist/app.js";
import { connectDb } from "../dist/config/db.js";

let dbReady = null;

export default async function handler(req, res) {
  dbReady ??= connectDb().then(() => undefined);
  await dbReady;
  return app(req, res);
}
