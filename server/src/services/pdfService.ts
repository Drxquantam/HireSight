import pdf from "pdf-parse";

export async function extractTextFromPdfBase64(pdfBase64: string) {
  const buffer = Buffer.from(pdfBase64, "base64");
  const data = await pdf(buffer);
  const text = data.text.replace(/\s+/g, " ").trim();

  if (text.length < 120) {
    const error = new Error("Could not extract enough text from this PDF. Try a text-based resume PDF.");
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  return text.slice(0, 60000);
}
