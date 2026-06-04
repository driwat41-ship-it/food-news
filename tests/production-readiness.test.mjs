import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const packageJson = JSON.parse(read('package.json'));
const schema = read('prisma/schema.prisma');
const aiConfig = read('src/jobs/ai/config/ai.config.ts');
const rssConfig = read('src/jobs/rss/config/rss.config.ts');
const rssCron = read('src/jobs/rss/cron/rss.cron.ts');
const rbac = read('src/features/admin/lib/rbac.ts');
const middleware = read('src/middleware.ts');
const sourceSchema = read('src/features/admin/schemas/admin.schemas.ts');
const adminActions = read('src/features/admin/actions/admin.actions.ts');
const sourceForm = read('src/features/admin/components/entity-forms.tsx');
const aiOrchestrator = read('src/jobs/ai/services/ai-processing-orchestrator.service.ts');
const aiEntityExtraction = read('src/jobs/ai/services/entity-extraction.service.ts');
const productDetector = read('src/jobs/ai/services/product-launch-detector.service.ts');
const franchiseDetector = read('src/jobs/ai/services/franchise-detector.service.ts');
const fundingDetector = read('src/jobs/ai/services/funding-detector.service.ts');
const rssPipeline = read('src/jobs/rss/services/article-pipeline.service.ts');
const queues = read('src/jobs/rss/queues/rss.queues.ts');
const sitemap = read('src/app/sitemap.ts');
const robots = read('src/app/robots.ts');
const health = read('src/app/api/health/route.ts');

const requiredRoutes = [
  'src/app/(public)/page.tsx',
  'src/app/(public)/news/page.tsx',
  'src/app/(public)/news/[slug]/page.tsx',
  'src/app/(public)/brands/page.tsx',
  'src/app/(public)/brands/[slug]/page.tsx',
  'src/app/(public)/countries/page.tsx',
  'src/app/(public)/countries/[slug]/page.tsx',
  'src/app/(public)/categories/page.tsx',
  'src/app/(public)/categories/[slug]/page.tsx',
  'src/app/(public)/reports/page.tsx',
  'src/app/(public)/reports/[slug]/page.tsx',
  'src/app/(public)/search/page.tsx',
  'src/app/sitemap.ts',
  'src/app/robots.ts',
  'src/app/api/search/route.ts',
  'src/app/api/search/suggestions/route.ts',
  'src/app/api/health/route.ts',
  'src/app/(admin)/admin/page.tsx',
  'src/app/(admin)/admin/news/page.tsx',
  'src/app/(admin)/admin/news/[id]/page.tsx',
  'src/app/(admin)/admin/review/page.tsx',
  'src/app/(admin)/admin/review/translations/page.tsx',
  'src/app/(admin)/admin/review/product-launches/page.tsx',
  'src/app/(admin)/admin/review/franchise-opportunities/page.tsx',
  'src/app/(admin)/admin/review/funding-events/page.tsx',
  'src/app/(admin)/admin/brands/page.tsx',
  'src/app/(admin)/admin/brands/new/page.tsx',
  'src/app/(admin)/admin/brands/[id]/page.tsx',
  'src/app/(admin)/admin/countries/page.tsx',
  'src/app/(admin)/admin/countries/new/page.tsx',
  'src/app/(admin)/admin/countries/[id]/page.tsx',
  'src/app/(admin)/admin/categories/page.tsx',
  'src/app/(admin)/admin/categories/new/page.tsx',
  'src/app/(admin)/admin/categories/[id]/page.tsx',
  'src/app/(admin)/admin/sources/page.tsx',
  'src/app/(admin)/admin/sources/new/page.tsx',
  'src/app/(admin)/admin/sources/[id]/page.tsx',
  'src/app/(admin)/admin/jobs/page.tsx',
  'src/app/(admin)/admin/jobs/[id]/page.tsx',
  'src/app/(admin)/admin/logs/page.tsx',
  'src/app/(admin)/admin/settings/page.tsx',
  'src/app/api/internal/cron/rss/route.ts',
  'src/app/(auth)/auth/login/page.tsx',
  'src/app/(auth)/auth/register/page.tsx',
];

test('all required public, admin, auth, and internal routes exist', () => {
  for (const route of requiredRoutes) {
    assert.equal(existsSync(new URL(`../${route}`, import.meta.url)), true, `${route} should exist`);
  }
});

test('documented environment variables are wired to runtime config', () => {
  assert.match(aiConfig, /OPENAI_MODEL/);
  assert.match(aiConfig, /OPENAI_FALLBACK_MODEL/);
  assert.match(rssConfig, /RSS_FETCH_INTERVAL_MINUTES/);
  assert.match(rssCron, /rssConfig\.fetchIntervalMinutes/);
  assert.match(packageJson.scripts['health:check'], /\/api\/health/);
});

test('admin bypass is disabled in production in middleware and server RBAC', () => {
  assert.match(rbac, /NODE_ENV !== "production"/);
  assert.match(middleware, /NODE_ENV !== "production"/);
  assert.doesNotMatch(rbac, /ADMIN_BYPASS === "true"\) return/);
  assert.doesNotMatch(middleware, /ADMIN_BYPASS === "true"\) return/);
});

test('Prisma schema exposes fields required by RSS, AI, admin, search, and health code', () => {
  for (const model of ['model Source', 'model News', 'model NewsTranslation', 'model BrandMention', 'model CountryMention', 'model ProductLaunch', 'model FranchiseOpportunity', 'model FundingEvent', 'model AIProcessingLog', 'model SearchQuery']) {
    assert.match(schema, new RegExp(model));
  }
  for (const field of ['reliabilityScore', 'priority', 'notes', 'aiReviewStatus', 'urlHash', 'contentHash', 'ipHash', 'userAgent']) {
    assert.match(schema, new RegExp(field));
  }
});

test('admin source actions support source quality metadata and validated ranges', () => {
  for (const token of ['priority', 'reliabilityScore', 'crawlInterval', 'notes']) {
    assert.match(sourceSchema, new RegExp(token));
    assert.match(adminActions, new RegExp(token));
    assert.match(sourceForm, new RegExp(token));
  }
  assert.match(sourceSchema, /max\(100\)/);
  assert.match(sourceSchema, /max\(1\)/);
  assert.match(sourceSchema, /min\(5\)/);
});

test('RSS queue and article pipeline are compatible with Source and News schema fields', () => {
  for (const queue of ['rss-ingestion', 'rss-processing', 'ai-processing']) assert.match(queues, new RegExp(queue));
  for (const field of ['sourceId', 'categoryId', 'primaryCountryId', 'urlHash', 'contentHash', 'canonicalUrl', 'status: "INGESTED"']) {
    assert.match(rssPipeline, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('AI pipeline writes compatible structured intelligence models', () => {
  assert.match(aiOrchestrator, /newsTranslation|saveTranslations/);
  assert.match(aiEntityExtraction, /brandMention\.upsert/);
  assert.match(aiEntityExtraction, /countryMention\.upsert/);
  assert.match(productDetector, /productLaunch\.upsert/);
  assert.match(franchiseDetector, /franchiseOpportunity\.upsert/);
  assert.match(fundingDetector, /fundingEvent\.upsert/);
  assert.match(aiOrchestrator, /aIProcessingLog\.update/);
});

test('SEO, sitemap, robots, and health checks remain production wired', () => {
  assert.match(sitemap, /take: 45_000/);
  assert.match(robots, /disallow: \["\/admin", "\/auth", "\/api"\]/);
  assert.match(health, /prisma\.\$queryRaw`SELECT 1`/);
  assert.match(health, /redis\.ping\(\)/);
});

test('Next.js, Tailwind, Docker, and public assets are configured for production', () => {
  assert.equal(existsSync(new URL('../tsconfig.json', import.meta.url)), true);
  assert.equal(existsSync(new URL('../next.config.ts', import.meta.url)), true);
  assert.equal(existsSync(new URL('../next-env.d.ts', import.meta.url)), true);
  assert.equal(existsSync(new URL('../public/.gitkeep', import.meta.url)), true);
  assert.match(read('tailwind.config.js'), /tsx/);
  assert.match(read('Dockerfile'), /COPY --from=builder \/app\/public \.\/public/);
});
