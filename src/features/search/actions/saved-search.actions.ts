"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "../../../services/database/prisma";
import { getCurrentAdmin } from "../../admin/lib/rbac";

async function requireUserId() {
  const admin = await getCurrentAdmin();
  if (!admin?.id || admin.id === "system") throw new Error("Authentication required for saved searches");
  return admin.id;
}

function formDataToJsonObject(formData: FormData): Prisma.InputJsonObject {
  const filters: Record<string, Prisma.InputJsonValue> = {};

  for (const [key, value] of formData.entries()) {
    filters[key] = typeof value === "string" ? value : value.name;
  }

  return filters;
}

export async function listSavedSearches() {
  const userId = await requireUserId();
  return prisma.savedSearch.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

export async function createSavedSearch(formData: FormData) {
  const userId = await requireUserId();
  await prisma.savedSearch.create({ data: { userId, name: String(formData.get("name") ?? "Untitled search"), query: String(formData.get("q") ?? ""), filters: formDataToJsonObject(formData), alertEnabled: formData.get("alertEnabled") === "on" } });
  revalidatePath("/search");
}

export async function updateSavedSearch(id: string, formData: FormData) {
  const userId = await requireUserId();
  await prisma.savedSearch.update({ where: { id }, data: { userId, name: String(formData.get("name") ?? "Untitled search"), query: String(formData.get("q") ?? ""), filters: formDataToJsonObject(formData), alertEnabled: formData.get("alertEnabled") === "on" } });
  revalidatePath("/search");
}

export async function deleteSavedSearch(id: string) {
  const userId = await requireUserId();
  await prisma.savedSearch.deleteMany({ where: { id, userId } });
  revalidatePath("/search");
}
