import IORedis from "ioredis";
import { NextResponse } from "next/server";
import { prisma } from "../../../services/database/prisma";

export const dynamic = "force-dynamic";

type DependencyStatus = "ok" | "error";

async function checkDatabase(): Promise<{ status: DependencyStatus; latencyMs: number; error?: string }> {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok", latencyMs: Date.now() - startedAt };
  } catch (error) {
    return { status: "error", latencyMs: Date.now() - startedAt, error: error instanceof Error ? error.message : String(error) };
  }
}

async function checkRedis(): Promise<{ status: DependencyStatus; latencyMs: number; error?: string }> {
  const startedAt = Date.now();
  const redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    connectTimeout: 2_000,
    enableReadyCheck: false,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  try {
    await redis.connect();
    await redis.ping();
    return { status: "ok", latencyMs: Date.now() - startedAt };
  } catch (error) {
    return { status: "error", latencyMs: Date.now() - startedAt, error: error instanceof Error ? error.message : String(error) };
  } finally {
    redis.disconnect();
  }
}

export async function GET() {
  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);
  const healthy = database.status === "ok" && redis.status === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      app: {
        name: process.env.NEXT_PUBLIC_APP_NAME ?? "Global Food & Beverage Intelligence",
        environment: process.env.NODE_ENV ?? "development",
        version: process.env.npm_package_version ?? "unknown",
      },
      database,
      redis,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
