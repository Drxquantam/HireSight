import type { ErrorRequestHandler } from "express";
import axios from "axios";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Invalid request payload",
      issues: error.flatten()
    });
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 502;
    const providerMessage =
      (error.response?.data as { error?: { message?: string }; message?: string } | undefined)?.error?.message ??
      (error.response?.data as { message?: string } | undefined)?.message ??
      "AI provider request failed.";

    return res.status(status).json({
      message: providerMessage
    });
  }

  const status = typeof error.status === "number" ? error.status : 500;
  res.status(status).json({
    message: error.message ?? "Unexpected server error"
  });
};
