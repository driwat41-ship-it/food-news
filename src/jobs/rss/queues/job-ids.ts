const UNSAFE_JOB_ID_CHARS = /[^A-Za-z0-9_-]+/g;

export function safeJobId(parts: Array<string | number | Date>): string {
  return parts
    .map((part) => {
      const value = part instanceof Date ? part.toISOString() : String(part);
      return value.replace(UNSAFE_JOB_ID_CHARS, "-").replace(/^-+|-+$/g, "");
    })
    .filter(Boolean)
    .join("-");
}
