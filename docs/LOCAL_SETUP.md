# Local Development Setup

This guide starts the Global Food & Beverage Intelligence stack locally with Next.js, PostgreSQL, Redis, Prisma, RSS workers, AI workers, and the RSS scheduler.

## 1. Install dependencies

```bash
npm install
```

If your network blocks npm, install dependencies in an environment with registry access and commit or cache the lockfile/artifacts used by your team.

## 2. Start PostgreSQL

Option A — Docker Compose infrastructure only:

```bash
docker compose up -d postgres redis
```

Option B — local PostgreSQL:

```bash
createdb gfbi
```

Create a user/password matching `.env.local`, or update `DATABASE_URL` and `DIRECT_URL` for your local database.

## 3. Start Redis

Using Docker Compose:

```bash
docker compose up -d redis
```

Or run Redis locally:

```bash
redis-server
```

## 4. Configure environment

```bash
cp .env.example .env.local
```

Update at minimum:

- `DATABASE_URL`
- `DIRECT_URL`
- `REDIS_URL`
- `NEXTAUTH_SECRET`
- `CRON_SECRET`
- `INTERNAL_API_SECRET`
- `OPENAI_API_KEY` if running AI processing

Keep `ADMIN_BYPASS=false` unless you are explicitly testing admin screens without auth in a local-only environment.

## 5. Generate Prisma client

```bash
npm run prisma:generate
```

## 6. Run database migrations

For production-like migration execution:

```bash
npm run prisma:migrate
```

For iterative local schema work, create development migrations with Prisma directly:

```bash
npx prisma migrate dev --schema=prisma/schema.prisma
```

## 7. Seed baseline data

```bash
npm run prisma:seed
```

This creates roles, a placeholder admin user, categories, countries, brands, RSS sources, tags, reports, and sample news.

## 8. Start the Next.js dev server

```bash
npm run dev
```

Open `http://localhost:3000` and verify `/api/health` returns `status: ok` once PostgreSQL and Redis are reachable.

## 9. Start workers and scheduler

Use separate terminals:

```bash
npm run worker:rss
```

```bash
npm run worker:ai
```

```bash
npm run scheduler:start
```

The scheduler registers repeatable BullMQ jobs for active RSS fetching, failed feed refreshes, and log cleanup.

## 10. Optional full Docker stack

```bash
npm run docker:up
```

Stop it with:

```bash
npm run docker:down
```

## Troubleshooting

- **`next`, `tsx`, or `prisma` not found**: run `npm install` and ensure `node_modules/.bin` exists.
- **Prisma cannot connect**: confirm `DATABASE_URL`, database name, user, password, and port.
- **Redis connection refused**: start Redis and verify `REDIS_URL`.
- **Seed duplicate/validation error**: fix the duplicate slug, alias, URL, missing country, or missing category reported by `prisma/seed.ts`.
- **Workers process nothing**: confirm sources are active, Redis is shared by app/scheduler/workers, and the scheduler has registered jobs.
- **AI worker fails**: verify `OPENAI_API_KEY`, model names, and account quota.
- **Admin is inaccessible locally**: create a real admin auth flow or use a local-only `ADMIN_BYPASS=true` while never enabling it in production.
