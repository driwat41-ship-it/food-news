# Vercel Deployment Guide

Vercel is recommended for the public/admin Next.js frontend and API routes. Long-running workers should run on a separate worker platform.

## Required environment variables

Configure the variables from `.env.example` in Vercel Project Settings:

- `DATABASE_URL`
- `DIRECT_URL`
- `REDIS_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_FALLBACK_MODEL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `INTERNAL_API_SECRET`
- `CRON_SECRET`
- `ADMIN_BYPASS=false`
- Analytics variables as needed

## PostgreSQL provider options

Recommended managed PostgreSQL providers:

- Supabase Postgres
- Neon
- Railway Postgres
- Render Postgres
- Fly Postgres for colocated worker deployments

Use pooled connection strings for serverless request paths when available and direct URLs for migrations.

## Redis provider options

Recommended Redis providers:

- Upstash Redis for serverless-friendly access
- Railway Redis
- Render Redis
- Fly Redis or self-hosted Redis near workers

BullMQ workers should use a Redis provider that supports the required commands and persistent connections.

## Background worker limitation on Vercel

Vercel serverless functions are not designed for persistent BullMQ workers, long-running RSS crawling, or continuous AI processing. Do not run `worker:rss`, `worker:ai`, or `scheduler:start` as Vercel functions.

## Recommended production architecture

- Vercel: Next.js frontend, public APIs, admin UI, sitemap, robots, health endpoint.
- Render/Fly.io/Railway: `worker-rss`, `worker-ai`, and scheduler process types.
- Supabase/Neon: PostgreSQL.
- Upstash Redis: Redis/BullMQ broker when compatible with your BullMQ usage.
- External cron: call `/api/internal/cron/rss` with `CRON_SECRET` if you prefer managed cron over a scheduler process.

## Deployment sequence

1. Provision PostgreSQL and Redis.
2. Configure Vercel env vars.
3. Run `npm run prisma:migrate` from CI or a trusted admin machine.
4. Run `npm run prisma:seed` once for initial reference data.
5. Deploy Vercel frontend.
6. Deploy worker services on the worker platform using the same image and env vars.
7. Verify `/api/health`, `/sitemap.xml`, `/robots.txt`, admin access, RSS queueing, and AI processing.
