import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";

export async function writeAuditLog(input: {
  action: string;
  entityType: string;
  entityId?: string;
  actorId?: string;
  before?: unknown;
  after?: unknown;
  metadata?: Prisma.InputJsonObject;
}, db: PrismaClient | Prisma.TransactionClient = defaultPrisma) {
  const metadata: Prisma.InputJsonObject = input.metadata ?? {};

  await db.auditLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      actorId: input.actorId && input.actorId !== "system" ? input.actorId : undefined,
      before: input.before as Prisma.InputJsonValue,
      after: input.after as Prisma.InputJsonValue,
      metadata,
    },
  });
}
