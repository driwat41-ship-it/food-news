import { createHash } from "node:crypto";

export function slugifyWithHash(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  const hash = createHash("sha1").update(value).digest("hex").slice(0, 8);
  return `${slug || "ai-detected"}-${hash}`;
}
