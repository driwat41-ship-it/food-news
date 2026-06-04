import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const searchBuilder = readFileSync(new URL('../src/features/search/lib/search-query-builder.ts', import.meta.url), 'utf8');
const seoHelpers = readFileSync(new URL('../src/features/public/lib/seo.ts', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../src/app/sitemap.ts', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../src/app/robots.ts', import.meta.url), 'utf8');
const searchRoute = readFileSync(new URL('../src/app/api/search/route.ts', import.meta.url), 'utf8');
const searchLogger = readFileSync(new URL('../src/features/search/lib/search-logger.ts', import.meta.url), 'utf8');
const prismaSchema = readFileSync(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');

test('search query builder includes full-text, trigram, fallback, pagination, and sorting hooks', () => {
  assert.match(searchBuilder, /plainto_tsquery/);
  assert.match(searchBuilder, /similarity/);
  assert.match(searchBuilder, /ILIKE/);
  assert.match(searchBuilder, /LIMIT \$?\{?filters\.limit/);
  assert.match(searchBuilder, /most-mentioned/);
});

test('SEO helpers include core JSON-LD and hreflang support', () => {
  assert.match(seoHelpers, /NewsArticle/);
  assert.match(seoHelpers, /Organization/);
  assert.match(seoHelpers, /BreadcrumbList/);
  assert.match(seoHelpers, /SearchAction/);
  assert.match(seoHelpers, /languages: \{ en/);
});

test('sitemap is pagination-safe and includes core public entity routes', () => {
  assert.match(sitemap, /take: 45_000/);
  assert.match(sitemap, /\/news\/\$\{item\.slug\}/);
  assert.match(sitemap, /\/brands\/\$\{item\.slug\}/);
  assert.match(sitemap, /\/reports\/\$\{item\.slug\}/);
});

test('robots disallows private and API routes', () => {
  assert.match(robots, /\/admin/);
  assert.match(robots, /\/auth/);
  assert.match(robots, /\/api/);
  assert.match(robots, /sitemap/);
});

test('search endpoint searches every report family and logs durable request metadata', () => {
  assert.match(searchRoute, /marketReport\.findMany/);
  assert.match(searchRoute, /dailyReport\.findMany/);
  assert.match(searchRoute, /weeklyReport\.findMany/);
  assert.match(searchRoute, /monthlyReport\.findMany/);
  assert.match(searchLogger, /ipHash: hashIp/);
  assert.match(searchLogger, /userAgent: input\.userAgent/);
  assert.match(prismaSchema, /ipHash\s+String\?/);
  assert.match(prismaSchema, /userAgent\s+String\?/);
});
