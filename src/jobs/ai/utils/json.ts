export function parseJsonWithFallback<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    const fenced = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
    if (fenced) return JSON.parse(fenced) as T;

    const firstBrace = value.indexOf("{");
    const lastBrace = value.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(value.slice(firstBrace, lastBrace + 1)) as T;
    }

    throw new Error("OpenAI response did not contain valid JSON");
  }
}

export function clampConfidence(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(1, numeric));
}
