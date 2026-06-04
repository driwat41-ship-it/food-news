# Production Readiness Checklist

## Environment

- [ ] All variables from `.env.example` are configured in the deployment platform.
- [ ] `NODE_ENV=production`.
- [ ] `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` use the canonical production domain.
- [ ] `NEXTAUTH_SECRET`, `INTERNAL_API_SECRET`, and `CRON_SECRET` are strong random values.
- [ ] `ADMIN_BYPASS=false`.

## Database

- [ ] PostgreSQL provider is provisioned with backups enabled.
- [ ] `DATABASE_URL` is configured for app/runtime traffic.
- [ ] `DIRECT_URL` is configured for migrations.
- [ ] `npm run prisma:generate` succeeds in CI/build.
- [ ] `npm run prisma:migrate` has been run against production.
- [ ] `npm run prisma:seed` has been run once and is safe to re-run.

## Admin and security

- [ ] Real admin account exists and placeholder admin access is replaced or secured.
- [ ] RBAC allows only `ADMIN` and `EDITOR` roles into admin routes.
- [ ] Internal cron endpoint rejects requests without `CRON_SECRET`.
- [ ] API keys and secrets are not committed to git.
- [ ] Security headers, TLS, and platform-level access controls are enabled.

## RSS and AI pipeline

- [ ] Redis is reachable from app, scheduler, and workers.
- [ ] RSS source library has been reviewed and inactive/problematic feeds are disabled.
- [ ] RSS source test succeeds for high-priority feeds.
- [ ] `worker:rss` is running with restart policy.
- [ ] `worker:ai` is running with restart policy.
- [ ] Scheduler or managed cron is enabled.
- [ ] OpenAI API key and model names are validated.
- [ ] AI cost/rate-limit monitoring is configured.

## SEO and public web

- [ ] Homepage renders in production.
- [ ] `/news`, `/brands`, `/countries`, `/categories`, `/reports`, and `/search` render.
- [ ] `/sitemap.xml` returns public URLs only.
- [ ] `/robots.txt` disallows admin/auth/API routes as intended.
- [ ] Canonical URLs use the production domain.
- [ ] OpenGraph/Twitter metadata renders for detail pages.
- [ ] `en` and `zh` hreflang alternates are verified.

## Health, monitoring, and operations

- [ ] `/api/health` returns database and Redis status.
- [ ] Error logging and alerting are configured.
- [ ] Worker queue depth and failed jobs are monitored.
- [ ] `SystemJob`, `JobExecution`, and `AIProcessingLog` are reviewed in admin logs.
- [ ] Backup restore process has been tested.
- [ ] Incident runbook covers Redis outage, DB outage, OpenAI outage, feed failures, and bad AI output rollback.
