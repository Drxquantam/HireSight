import mongoose from "mongoose";
import { env } from "./env.js";

export let isDbConnected = false;

export async function connectDb() {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 4000 });
    isDbConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    isDbConnected = false;
    console.warn("MongoDB unavailable. Using in-memory demo storage for this server process.");
  }
}
