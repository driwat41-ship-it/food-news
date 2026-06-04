import { z } from "zod";

export const idSchema = z.object({ id: z.string().min(1) });
export const newsUpdateSchema = z.object({ id: z.string(), title: z.string().min(1), excerpt: z.string().optional(), body: z.string().optional() });
export const reviewSchema = z.object({ id: z.string(), note: z.string().optional() });
export const brandSchema = z.object({ name: z.string().min(1), slug: z.string().min(1), aliases: z.string().optional(), countryId: z.string().optional(), industryType: z.string().min(1), websiteUrl: z.string().url().optional().or(z.literal("")), logoUrl: z.string().url().optional().or(z.literal("")), description: z.string().optional(), status: z.string().optional() });
export const countrySchema = z.object({ name: z.string().min(1), slug: z.string().min(1), iso2: z.string().length(2), iso3: z.string().length(3), region: z.string().optional(), description: z.string().optional(), status: z.string().optional() });
export const categorySchema = z.object({ name: z.string().min(1), slug: z.string().min(1), parentId: z.string().optional(), industryType: z.string().min(1), description: z.string().optional(), status: z.string().optional() });
export const sourceSchema = z.object({ name: z.string().min(1), slug: z.string().min(1), url: z.string().url(), type: z.string().default("rss"), countryId: z.string().optional(), language: z.string().min(2), categoryId: z.string().optional(), active: z.coerce.boolean().default(true), priority: z.coerce.number().int().min(0).max(100).default(50), reliabilityScore: z.coerce.number().min(0).max(1).default(0.75), crawlInterval: z.coerce.number().int().min(5).default(60), notes: z.string().optional() });

export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
