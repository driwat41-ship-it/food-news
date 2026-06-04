# Production Readiness Audit

This audit captures the fixes applied to make the scaffold safer to install, migrate, seed, and deploy.

## Issues found and fixed

1. **Unsafe admin bypass behavior**
   - `ADMIN_BYPASS=true` previously bypassed admin protection even in production.
   - Fixed by allowing bypass only when `NODE_ENV !== "production"` in middleware and server-side RBAC.

2. **Missing auth redirect targets**
   - Admin middleware redirected unauthenticated users to `/auth/login`, but auth pages were missing.
   - Added `/auth/login` and `/auth/register` placeholder pages with `noindex` metadata.

3. **OpenAI environment mismatch**
   - `.env.example` used `OPENAI_MODEL` and `OPENAI_FALLBACK_MODEL`, while the AI client only read legacy `OPENAI_CONTENT_*` names.
   - Fixed AI config to prefer the documented env vars while retaining legacy fallback support.

4. **RSS cron interval mismatch**
   - `RSS_FETCH_INTERVAL_MINUTES` was documented but the scheduler used a hardcoded five-minute interval.
   - Added `rssConfig.fetchIntervalMinutes` and wired the scheduler to it.

5. **Source quality metadata not editable in admin**
   - `Source` had quality metadata for priority, reliability, interval, and notes, but admin source forms/actions did not persist it.
   - Added validation, form fields, and create/update persistence for source quality metadata.

6. **Next.js production readiness gaps**
   - TypeScript and Next configuration files were missing.
   - Added `tsconfig.json`, `next-env.d.ts`, and `next.config.ts`, and expanded Tailwind content scanning to include TypeScript/TSX/MDX files.

7. **Docker runtime public directory**
   - The production Dockerfile copies `public`, but the repository had no tracked `public` directory.
   - Added `public/.gitkeep` so Docker builds have a stable copy source.

## Remaining environment warnings

The current execution environment has a partial `node_modules` tree and is missing the `next`, `prisma`, `tsx`, and `tsc` binaries. Those checks should pass after a normal `npm install` in an environment with registry access.
