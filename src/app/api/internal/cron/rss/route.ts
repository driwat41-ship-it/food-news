import { NextResponse } from "next/server";
import { QUEUE_JOB_NAMES, rssIngestionQueue } from "../../../../../jobs/rss/queues/rss.queues";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const configuredSecret = process.env.CRON_SECRET;
  if (!configuredSecret) return false;

  const authorization = request.headers.get("authorization");
  const cronSecret = request.headers.get("x-cron-secret");

  return authorization === `Bearer ${configuredSecret}` || cronSecret === configuredSecret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const job = await rssIngestionQueue.add(
    QUEUE_JOB_NAMES.fetchActiveFeeds,
    { triggeredBy: "internal-cron", requestedAt: new Date().toISOString() },
    { jobId: `internal-cron:rss:${Date.now()}` },
  );

  return NextResponse.json({ status: "queued", queue: "rss-ingestion", jobName: QUEUE_JOB_NAMES.fetchActiveFeeds, jobId: job.id, timestamp: new Date().toISOString() });
}

export async function GET(request: Request) {
  return POST(request);
}
