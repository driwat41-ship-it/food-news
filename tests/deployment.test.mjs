import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
const compose = readFileSync(new URL('../docker-compose.yml', import.meta.url), 'utf8');
const dockerfile = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8');
const healthRoute = readFileSync(new URL('../src/app/api/health/route.ts', import.meta.url), 'utf8');
const cronRoute = readFileSync(new URL('../src/app/api/internal/cron/rss/route.ts', import.meta.url), 'utf8');
const localSetup = readFileSync(new URL('../docs/LOCAL_SETUP.md', import.meta.url), 'utf8');
const workers = readFileSync(new URL('../docs/WORKERS.md', import.meta.url), 'utf8');
const vercel = readFileSync(new URL('../docs/VERCEL_DEPLOYMENT.md', import.meta.url), 'utf8');
const checklist = readFileSync(new URL('../docs/PRODUCTION_CHECKLIST.md', import.meta.url), 'utf8');
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('environment example includes required production settings', () => {
  for (const key of ['DATABASE_URL', 'DIRECT_URL', 'REDIS_URL', 'OPENAI_API_KEY', 'OPENAI_MODEL', 'OPENAI_FALLBACK_MODEL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'ADMIN_BYPASS', 'NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_APP_NAME', 'NODE_ENV', 'ENABLE_WORKERS', 'ENABLE_CRON', 'RSS_FETCH_INTERVAL_MINUTES', 'AI_WORKER_CONCURRENCY', 'INTERNAL_API_SECRET', 'CRON_SECRET', 'NEXT_PUBLIC_GA_ID', 'NEXT_PUBLIC_PLAUSIBLE_DOMAIN']) {
    assert.match(envExample, new RegExp(`^${key}=`, 'm'));
  }
});

test('docker compose defines app infrastructure and worker process types', () => {
  for (const service of ['postgres:', 'redis:', 'app:', 'worker-rss:', 'worker-ai:', 'scheduler:']) {
    assert.match(compose, new RegExp(`\\n  ${service}`));
  }
  assert.match(compose, /npm", "run", "worker:rss/);
  assert.match(compose, /npm", "run", "worker:ai/);
  assert.match(compose, /npm", "run", "scheduler:start/);
});

test('dockerfile builds a production Next runtime', () => {
  assert.match(dockerfile, /npm run prisma:generate/);
  assert.match(dockerfile, /npm run build/);
  assert.match(dockerfile, /NEXT_TELEMETRY_DISABLED=1/);
  assert.match(dockerfile, /CMD \["npm", "run", "start"\]/);
});

test('health and cron endpoints check dependencies and protect RSS enqueueing', () => {
  assert.match(healthRoute, /prisma\.\$queryRaw`SELECT 1`/);
  assert.match(healthRoute, /redis\.ping\(\)/);
  assert.match(healthRoute, /status: healthy \? 200 : 503/);
  assert.match(cronRoute, /CRON_SECRET/);
  assert.match(cronRoute, /Bearer \$\{configuredSecret\}/);
  assert.match(cronRoute, /rssIngestionQueue\.add/);
  assert.match(cronRoute, /fetchActiveFeeds/);
});

test('deployment scripts expose production lifecycle commands', () => {
  assert.equal(pkg.scripts.dev, 'next dev');
  assert.equal(pkg.scripts.build, 'next build');
  assert.equal(pkg.scripts.start, 'next start');
  assert.equal(pkg.scripts['prisma:generate'], 'prisma generate --schema=prisma/schema.prisma');
  assert.equal(pkg.scripts['prisma:migrate'], 'prisma migrate deploy --schema=prisma/schema.prisma');
  assert.equal(pkg.scripts['worker:rss'], 'tsx src/jobs/rss/workers/rss.worker.ts');
  assert.equal(pkg.scripts['worker:ai'], 'tsx src/jobs/ai/workers/ai.worker.ts');
  assert.equal(pkg.scripts['scheduler:start'], 'tsx src/jobs/rss/cron/rss.cron.ts');
  assert.match(pkg.scripts['health:check'], /\/api\/health/);
});

test('operations docs cover local setup, workers, Vercel, and production checklist', () => {
  assert.match(localSetup, /setup PostgreSQL|Start PostgreSQL/i);
  assert.match(localSetup, /npm run worker:rss/);
  assert.match(workers, /rss-ingestion/);
  assert.match(workers, /Scaling workers/);
  assert.match(vercel, /background worker limitation/i);
  assert.match(vercel, /Render\/Fly\.io\/Railway/);
  assert.match(checklist, /disable ADMIN_BYPASS|ADMIN_BYPASS=false/i);
  assert.match(checklist, /worker health check|\/api\/health/i);
});
