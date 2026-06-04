# Seeding Global Food & Beverage Intelligence

`prisma/seed.ts` bootstraps the platform with production-oriented reference data for local development, staging, and first-run production setup.

## What the seed creates

- RBAC role records for every `UserRole` enum value.
- A placeholder super-admin user (`admin@gfbi.local` by default).
- Industry taxonomy categories for tea, bubble tea, coffee, restaurant chains, QSR, FMCG, franchise, expansion, funding, social trends, and operations.
- Key market countries plus headquarters countries required by the initial brand library.
- Initial brand library across tea, bubble tea, coffee, restaurant/QSR, and FMCG.
- RSS source library with feed URL, language, country, category, active flag, priority, reliability score, fetch interval, and operational notes.
- Starter tags, a sample market report, a daily report placeholder, and one sample published article for validating public pages and search.

## How to run

```bash
npm run prisma:seed
```

Optional environment variable:

```bash
SEED_ADMIN_EMAIL=admin@example.com npm run prisma:seed
```

The script expects `DATABASE_URL` to point to a migrated PostgreSQL database and `tsx` to be installed.

## Idempotency

The seed script is safe to run multiple times. It uses Prisma `upsert` for roles, users, countries, categories, tags, brands, sources, reports, sample news, and translations. Existing rows with the same slug, email, enum role, or unique feed URL are updated rather than duplicated.

## Validation rules

Before writing data, the script validates:

- RSS source URL format (`http`/`https`).
- Unique slugs for countries, categories, brands, tags, and sources.
- Unique RSS source URLs.
- Category existence for every brand and source.
- Country existence for every brand and source.
- Brand alias uniqueness across the initial library.
- RSS source priority (`0-100`), reliability score (`0-1`), and fetch interval (`>= 5` minutes).

## Adding RSS sources

1. Add the source to the `rssSources` array in `prisma/seed.ts`.
2. Use the canonical feed URL when an official RSS/Atom feed exists.
3. If a publisher has no stable public RSS feed, use a clearly named fallback such as Google News RSS or RSSHub and document the reason in `notes`.
4. Set `category` to an existing seeded category.
5. Set `country` to an existing seeded country.
6. Assign:
   - `priority`: ingestion importance, `0-100`.
   - `reliabilityScore`: source confidence, `0-1`.
   - `fetchInterval`: polling interval in minutes.
7. Run `npm run prisma:seed` and review the console summary.

## Verifying seeded data

Use Prisma Studio or SQL queries:

```bash
npx prisma studio
```

```sql
select count(*) from "Source" where active = true;
select name, "feedUrl", priority, "reliabilityScore" from "Source" order by priority desc;
select name, aliases from "Brand" order by name;
select name, slug from "Category" order by name;
```

## Troubleshooting

- **`prisma` or `tsx` not found**: install dependencies with `npm install` before running the seed.
- **Database connection error**: verify `DATABASE_URL` and that PostgreSQL is reachable.
- **Duplicate alias error**: remove or rename the duplicate alias in the brand library.
- **Missing category or country error**: add the referenced category/country first, or correct the seed entry.
- **RSS route stops working**: keep the row active only if the feed is healthy; otherwise update the source URL or add a note explaining the fallback route.
