import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const seed = readFileSync(new URL('../prisma/seed.ts', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
const docs = readFileSync(new URL('../docs/SEEDING.md', import.meta.url), 'utf8');
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('seed script provides required entity libraries and idempotent writes', () => {
  assert.match(seed, /const roles = \[/);
  assert.match(seed, /const countries = \[/);
  assert.match(seed, /const categories = \[/);
  assert.match(seed, /const brands: BrandSeed\[\] = \[/);
  assert.match(seed, /const rssSources = \[/);
  assert.match(seed, /prisma\.source\.upsert/);
  assert.match(seed, /prisma\.brand\.upsert/);
  assert.match(seed, /prisma\.marketReport\.upsert/);
});

test('seed validation covers URLs, uniqueness, references, aliases, and source quality', () => {
  assert.match(seed, /assertUrl\(source\.url/);
  assert.match(seed, /Brand alias must be unique/);
  assert.match(seed, /references missing category/);
  assert.match(seed, /references missing country/);
  assert.match(seed, /priority must be 0-100/);
  assert.match(seed, /reliabilityScore must be 0-1/);
  assert.match(seed, /fetchInterval must be at least 5 minutes/);
});

test('source schema and package scripts expose seed metadata and commands', () => {
  assert.equal(pkg.scripts['prisma:seed'], 'tsx prisma/seed.ts');
  assert.equal(pkg.scripts['test:seed'], 'node --test tests/seeding.test.mjs');
  assert.match(schema, /reliabilityScore\s+Float/);
  assert.match(schema, /priority\s+Int/);
  assert.match(schema, /notes\s+String\?/);
});

test('seeding documentation explains run, RSS additions, verification, and troubleshooting', () => {
  assert.match(docs, /npm run prisma:seed/);
  assert.match(docs, /Adding RSS sources/);
  assert.match(docs, /Verifying seeded data/);
  assert.match(docs, /Troubleshooting/);
});
