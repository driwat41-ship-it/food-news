# Global Food & Beverage Intelligence — Enterprise Feature-Based Project Structure

```txt
.
├── src/                                                # Source root for the Next.js 15 App Router application; keeps runtime code isolated from infrastructure, docs, and tests.
│   ├── app/                                            # Route layer only: Server Components, layouts, metadata, route handlers, streaming, errors, and cache revalidation.
│   │   ├── (public)/                                   # Public, SEO-indexable route group for anonymous readers and search engines.
│   │   │   ├── layout.tsx                              # Public shell with navigation, footer, structured data, locale handling, and provider composition.
│   │   │   ├── page.tsx                                # Homepage: market overview, latest intelligence, featured reports, sectors, countries, and brand trends.
│   │   │   ├── news/                                   # /news article discovery routes built for high-volume pagination and crawlable archives.
│   │   │   │   ├── page.tsx                            # News index with server-rendered filters for category, country, language, brand, source, and date.
│   │   │   │   └── [slug]/                             # /news/[slug] dynamic article route using stable slugs and canonical metadata.
│   │   │   │       ├── page.tsx                        # Article page composed from src/features/news with Article schema, related brands, and translated variants.
│   │   │   │       ├── loading.tsx                     # Streaming fallback for article body, related intelligence, and recommendations.
│   │   │   │       └── not-found.tsx                   # SEO-safe 404 for missing, unpublished, or redirected articles.
│   │   │   ├── brands/                                 # /brands directory routes for thousands of brand and chain profiles.
│   │   │   │   ├── page.tsx                            # Brand index with country, sector, ownership, franchise, and funding filters.
│   │   │   │   └── [slug]/                             # /brands/[slug] dynamic brand profile route.
│   │   │   │       ├── page.tsx                        # Brand profile composed from src/features/brands with news, countries, reports, and entity relationships.
│   │   │   │       └── not-found.tsx                   # 404 or redirect handling for merged/renamed brands.
│   │   │   ├── countries/                              # /countries market intelligence routes.
│   │   │   │   ├── page.tsx                            # Country directory with region, language, market maturity, and category filters.
│   │   │   │   └── [slug]/                             # /countries/[slug] country market route.
│   │   │   │       ├── page.tsx                        # Country page composed from src/features/countries with trends, brands, categories, reports, and news.
│   │   │   │       └── not-found.tsx                   # 404 for unsupported countries or invalid country slugs.
│   │   │   ├── categories/                             # /categories taxonomy routes for covered industries and sectors.
│   │   │   │   ├── page.tsx                            # Category index for Tea, Bubble Tea, Coffee, Restaurant Chains, QSR, and FMCG.
│   │   │   │   └── [slug]/                             # /categories/[slug] dynamic category route.
│   │   │   │       ├── page.tsx                        # Category intelligence page with sector news, reports, brands, countries, and market signals.
│   │   │   │       └── not-found.tsx                   # 404 for invalid or retired category slugs.
│   │   │   ├── reports/                                # /reports public and premium report discovery routes.
│   │   │   │   ├── page.tsx                            # Report listing with sector, geography, access tier, date, and format filters.
│   │   │   │   └── [slug]/                             # /reports/[slug] dynamic report route.
│   │   │   │       ├── page.tsx                        # Report detail page with executive summary, charts, related articles, and subscription gates.
│   │   │   │       └── not-found.tsx                   # 404 for missing, private, or unpublished reports.
│   │   │   └── search/                                 # /search route for server-rendered search and faceted intelligence discovery.
│   │   │       ├── page.tsx                            # Search page with query params, facets, noindex rules, saved searches, and ranked results.
│   │   │       └── loading.tsx                         # Streaming fallback while search results and facets resolve.
│   │   ├── (auth)/                                     # Authentication route group isolated from public SEO and admin authorization shells.
│   │   │   ├── layout.tsx                              # Minimal auth shell for login and registration flows.
│   │   │   └── auth/                                   # /auth URL segment.
│   │   │       ├── login/                              # /auth/login route.
│   │   │       │   └── page.tsx                        # Login page composed from src/features/auth and src/providers/auth-provider.tsx.
│   │   │       └── register/                           # /auth/register route.
│   │   │           └── page.tsx                        # Registration page for self-serve, invite-based, or enterprise onboarding.
│   │   ├── (admin)/                                    # Protected admin route group for editors, analysts, and platform operators.
│   │   │   ├── layout.tsx                              # Admin shell with RBAC guard, sidebar, audit context, and operational status indicators.
│   │   │   └── admin/                                  # /admin URL segment.
│   │   │       ├── page.tsx                            # Admin dashboard for ingestion health, article volume, AI costs, report status, and alerts.
│   │   │       ├── news/                               # /admin/news editorial queue and article operations.
│   │   │       │   ├── page.tsx                        # Moderation, deduplication, enrichment, translation, and publishing queue.
│   │   │       │   ├── new/                            # /admin/news/new manual article entry or import route.
│   │   │       │   │   └── page.tsx                    # Create article workflow.
│   │   │       │   └── [id]/                           # /admin/news/[id] dynamic article editor route.
│   │   │       │       └── page.tsx                    # Review, enrich, translate, tag, and publish a single article.
│   │   │       ├── brands/                             # /admin/brands brand intelligence management.
│   │   │       │   ├── page.tsx                        # Manage brand entities, aliases, markets, categories, franchise data, and funding links.
│   │   │       │   ├── new/                            # /admin/brands/new route.
│   │   │       │   │   └── page.tsx                    # Create brand entity workflow.
│   │   │       │   └── [id]/                           # /admin/brands/[id] dynamic brand editor route.
│   │   │       │       └── page.tsx                    # Edit brand metadata, relationships, aliases, and publishing state.
│   │   │       ├── countries/                          # /admin/countries market taxonomy management.
│   │   │       │   ├── page.tsx                        # Manage countries, regions, locales, currencies, and market metadata.
│   │   │       │   └── [id]/                           # /admin/countries/[id] dynamic country editor route.
│   │   │       │       └── page.tsx                    # Edit country intelligence, localization settings, and market relationships.
│   │   │       ├── sources/                            # /admin/sources RSS/source registry management.
│   │   │       │   ├── page.tsx                        # Monitor source quality, crawl cadence, language, reliability, and ingestion errors.
│   │   │       │   ├── new/                            # /admin/sources/new route.
│   │   │       │   │   └── page.tsx                    # Add RSS feeds, sitemaps, APIs, social feeds, or manual sources.
│   │   │       │   └── [id]/                           # /admin/sources/[id] source configuration route.
│   │   │       │       └── page.tsx                    # Configure parsing rules, trust score, crawl interval, and taxonomy mapping.
│   │   │       └── reports/                            # /admin/reports analyst publishing workflow.
│   │   │           ├── page.tsx                        # Manage report drafts, scheduled reports, premium access, charts, and publishing status.
│   │   │           ├── new/                            # /admin/reports/new route.
│   │   │           │   └── page.tsx                    # Create daily, weekly, or analyst report workflow.
│   │   │           └── [id]/                           # /admin/reports/[id] dynamic report editor route.
│   │   │               └── page.tsx                    # Edit report sections, charts, AI summaries, access level, and publication state.
│   │   ├── api/                                        # Route handlers for integration boundaries; business logic stays in features, services, and jobs.
│   │   │   ├── auth/                                   # NextAuth or Supabase Auth callback handlers.
│   │   │   │   └── [...nextauth]/                      # Optional NextAuth catch-all route.
│   │   │   │       └── route.ts                        # Auth callbacks and session exchange.
│   │   │   ├── cron/                                   # Secured HTTP cron entrypoints for hosted schedulers.
│   │   │   │   ├── rss-ingestion/                      # Trigger scheduled article ingestion.
│   │   │   │   │   └── route.ts                        # Delegates to src/jobs/rss.
│   │   │   │   ├── ai-summarization/                   # Trigger AI summarization backlog.
│   │   │   │   │   └── route.ts                        # Delegates to src/jobs/ai.
│   │   │   │   ├── translation/                        # Trigger AI/human translation backlog.
│   │   │   │   │   └── route.ts                        # Delegates to src/jobs/translation.
│   │   │   │   ├── daily-reports/                      # Trigger daily report generation.
│   │   │   │   │   └── route.ts                        # Delegates to src/jobs/reports.
│   │   │   │   ├── weekly-reports/                     # Trigger weekly report generation.
│   │   │   │   │   └── route.ts                        # Delegates to src/jobs/reports.
│   │   │   │   └── monitoring/                         # Trigger health checks and alert evaluation.
│   │   │   │       └── route.ts                        # Delegates to src/jobs/monitoring.
│   │   │   ├── webhooks/                               # Webhook receivers for Supabase, RSS aggregation services, payments, and analytics events.
│   │   │   └── revalidate/                             # On-demand revalidation for cache tags and high-value paths.
│   │   │       └── route.ts                            # Revalidates articles, brands, countries, categories, reports, and search pages.
│   │   ├── sitemap.ts                                  # Sitemap index generator designed for millions of article URLs and segmented sitemap files.
│   │   ├── robots.ts                                   # Robots policy for public, auth, admin, search, and generated archive routes.
│   │   ├── manifest.ts                                 # Site manifest and app metadata.
│   │   ├── global-error.tsx                            # Root error boundary connected to monitoring and tracing.
│   │   ├── not-found.tsx                               # Global 404 page.
│   │   └── layout.tsx                                  # Root layout that composes src/providers and sets global metadata defaults.
│   ├── features/                                       # Business-domain modules; primary place for product logic, UI composition, schemas, actions, and feature services.
│   │   ├── _template/                                  # Reference module shape enforced across all business features.
│   │   │   ├── components/                             # Feature-owned UI components used by App Router pages and admin screens.
│   │   │   ├── services/                               # Feature business services and use cases; orchestrates repositories, external services, and domain rules.
│   │   │   ├── hooks/                                  # Feature-specific client hooks for filters, forms, optimistic UI, and interactive state.
│   │   │   ├── types/                                  # Feature-specific TypeScript types, DTOs, view models, and branded identifiers.
│   │   │   ├── schemas/                                # Feature validation schemas for forms, route params, search params, and service inputs.
│   │   │   └── actions/                                # Server Actions for mutations, revalidation, publishing, and admin workflows.
│   │   ├── news/                                       # Article domain: ingestion review, editorial workflow, article pages, feeds, deduplication, and publication.
│   │   │   ├── components/                             # Article cards, article body, article metadata, moderation panels, and related-content modules.
│   │   │   ├── services/                               # Article use cases for listing, detail retrieval, publishing, deduplication, and relationship enrichment.
│   │   │   ├── hooks/                                  # Client hooks for article filters, saved articles, editor state, and feed interactions.
│   │   │   ├── types/                                  # Article DTOs, feed view models, moderation states, and pagination contracts.
│   │   │   ├── schemas/                                # Article filters, editor payloads, metadata, slug, and route parameter validation.
│   │   │   └── actions/                                # Publish, unpublish, tag, translate, revalidate, and moderation server actions.
│   │   ├── brands/                                     # Brand domain for thousands of chains, FMCG companies, beverage brands, aliases, and ownership relationships.
│   │   │   ├── components/                             # Brand cards, profile sections, relationship graphs, market presence, and admin brand forms.
│   │   │   ├── services/                               # Brand search, profile loading, alias resolution, entity merge, and relationship management.
│   │   │   ├── hooks/                                  # Brand filters, compare tools, admin brand forms, and client interactions.
│   │   │   ├── types/                                  # Brand DTOs, alias types, ownership models, and market presence contracts.
│   │   │   ├── schemas/                                # Brand forms, slug params, alias rules, and entity merge validation.
│   │   │   └── actions/                                # Create, update, merge, publish, and revalidate brand server actions.
│   │   ├── countries/                                  # Country and regional market intelligence domain.
│   │   │   ├── components/                             # Country cards, market dashboards, country selectors, and regional trend widgets.
│   │   │   ├── services/                               # Country profile loading, regional aggregation, locale mapping, and market relationship queries.
│   │   │   ├── hooks/                                  # Country filters, locale selection, and interactive market comparison hooks.
│   │   │   ├── types/                                  # Country DTOs, region types, locale metadata, and market summary contracts.
│   │   │   ├── schemas/                                # Country params, locale rules, and market metadata validation.
│   │   │   └── actions/                                # Update country metadata, refresh country pages, and revalidate market routes.
│   │   ├── categories/                                 # Industry taxonomy for Tea, Bubble Tea, Coffee, Restaurant Chains, QSR, and FMCG.
│   │   │   ├── components/                             # Category navigation, category cards, sector landing sections, and taxonomy selectors.
│   │   │   ├── services/                               # Category feed aggregation, taxonomy resolution, and sector intelligence queries.
│   │   │   ├── hooks/                                  # Category filter and preference hooks.
│   │   │   ├── types/                                  # Category DTOs, taxonomy node types, and sector summary contracts.
│   │   │   ├── schemas/                                # Category slugs, taxonomy updates, and sector filter validation.
│   │   │   └── actions/                                # Category update, taxonomy refresh, and category route revalidation actions.
│   │   ├── reports/                                    # Report domain for daily, weekly, premium, and analyst-generated intelligence products.
│   │   │   ├── components/                             # Report cards, report reader, chart blocks, premium gates, and editor panels.
│   │   │   ├── services/                               # Report generation, report retrieval, access checks, chart data, and publishing workflows.
│   │   │   ├── hooks/                                  # Report filters, report builder state, and subscription interaction hooks.
│   │   │   ├── types/                                  # Report DTOs, report sections, chart data, and access-level contracts.
│   │   │   ├── schemas/                                # Report editor payloads, publication rules, and route parameter validation.
│   │   │   └── actions/                                # Create, update, generate, publish, schedule, and revalidate report actions.
│   │   ├── search/                                     # Search and discovery domain for articles, brands, countries, categories, and reports.
│   │   │   ├── components/                             # Search box, facets, result cards, autocomplete, and saved-search UI.
│   │   │   ├── services/                               # Query parsing, ranking, indexing adapters, autocomplete, and facet aggregation.
│   │   │   ├── hooks/                                  # Search params, faceted filters, saved searches, and client-side refinements.
│   │   │   ├── types/                                  # Search result DTOs, index document types, facets, and ranking explanations.
│   │   │   ├── schemas/                                # Query params, filters, sort options, and saved search validation.
│   │   │   └── actions/                                # Save search, refresh index, revalidate search cache, and admin indexing actions.
│   │   ├── auth/                                       # Authentication, account, session, role, and permission feature logic.
│   │   │   ├── components/                             # Login forms, register forms, account menus, permission gates, and onboarding UI.
│   │   │   ├── services/                               # Session lookup, role resolution, organization membership, and authorization use cases.
│   │   │   ├── hooks/                                  # Client hooks for current user, auth forms, permissions, and account state.
│   │   │   ├── types/                                  # User, role, permission, organization, and session contracts.
│   │   │   ├── schemas/                                # Login, registration, invite, profile, and role validation.
│   │   │   └── actions/                                # Sign in, sign out, register, update profile, and role assignment actions.
│   │   ├── admin/                                      # Cross-domain administrative workflows and operational dashboards.
│   │   │   ├── components/                             # Admin tables, dashboards, command menus, audit trails, and workflow panels.
│   │   │   ├── services/                               # Admin metrics, audit logging, moderation queues, and workflow orchestration.
│   │   │   ├── hooks/                                  # Admin table state, bulk actions, dashboard refresh, and operator preferences.
│   │   │   ├── types/                                  # Admin dashboard DTOs, audit events, queue items, and bulk-operation contracts.
│   │   │   ├── schemas/                                # Admin filters, bulk action payloads, and workflow validation.
│   │   │   └── actions/                                # Bulk moderation, audit notes, system revalidation, and operational control actions.
│   │   ├── social/                                     # Social and source-signal domain for social feeds, influencer mentions, and social trend intelligence.
│   │   │   ├── components/                             # Social mention cards, trend panels, source badges, and admin review widgets.
│   │   │   ├── services/                               # Social source ingestion, mention matching, sentiment scoring, and trend extraction.
│   │   │   ├── hooks/                                  # Social filters, trend interactions, and source review hooks.
│   │   │   ├── types/                                  # Social post DTOs, mention types, sentiment models, and source contracts.
│   │   │   ├── schemas/                                # Social source configuration and mention validation.
│   │   │   └── actions/                                # Approve mentions, map social accounts, and revalidate social trend modules.
│   │   ├── franchise/                                  # Franchise intelligence domain for restaurant chains, QSR operators, expansion signals, and territory data.
│   │   │   ├── components/                             # Franchise opportunity cards, expansion maps, unit-count panels, and operator profile modules.
│   │   │   ├── services/                               # Franchise data aggregation, expansion detection, operator lookup, and territory analysis.
│   │   │   ├── hooks/                                  # Franchise filters, comparison tools, and map interactions.
│   │   │   ├── types/                                  # Franchise DTOs, operator types, territory contracts, and unit-count models.
│   │   │   ├── schemas/                                # Franchise metadata, operator forms, and expansion-signal validation.
│   │   │   └── actions/                                # Update franchise records, approve expansion signals, and revalidate franchise sections.
│   │   └── funding/                                    # Funding, M&A, investment, and corporate finance intelligence domain.
│   │       ├── components/                             # Funding round cards, investor panels, acquisition timelines, and deal tables.
│   │       ├── services/                               # Deal extraction, investor matching, funding timeline generation, and brand finance aggregation.
│   │       ├── hooks/                                  # Funding filters, saved deal searches, and comparison interactions.
│   │       ├── types/                                  # Funding DTOs, investor models, acquisition types, and financing event contracts.
│   │       ├── schemas/                                # Deal payloads, investor validation, and funding event normalization rules.
│   │       └── actions/                                # Create, verify, update, merge, and revalidate funding events.
│   ├── jobs/                                           # Dedicated background-job layer for asynchronous, scheduled, retryable, and high-throughput work.
│   │   ├── rss/                                        # RSS crawling and scheduled article ingestion jobs.
│   │   │   ├── crawlers/                               # Feed fetchers, sitemap crawlers, source adapters, and rate-limit aware polling logic.
│   │   │   ├── parsers/                                # Feed item parsers, content extraction, language detection, and metadata normalization.
│   │   │   ├── deduplication/                          # URL, canonical, title similarity, embedding, and source-level duplicate detection.
│   │   │   ├── ingestion/                              # Article upsert pipelines, source scoring, taxonomy mapping, and enqueueing for AI/translation jobs.
│   │   │   └── schedules.ts                            # RSS crawl frequencies for high-priority, normal, low-priority, and backfill sources.
│   │   ├── ai/                                         # AI summarization, classification, entity extraction, tagging, and embedding jobs.
│   │   │   ├── summarization/                          # Article and report summary generation with model, prompt, and cost controls.
│   │   │   ├── classification/                         # Category, country, brand, QSR/FMCG, franchise, and funding classification jobs.
│   │   │   ├── extraction/                             # Brand, country, product, investor, funding, franchise, and source entity extraction.
│   │   │   ├── embeddings/                             # Vector embedding generation for search, deduplication, recommendations, and clustering.
│   │   │   └── moderation/                             # Safety, quality, spam, and editorial-risk scoring jobs.
│   │   ├── translation/                                # AI translation and multilingual publishing jobs.
│   │   │   ├── articles/                               # Article title, excerpt, body, slug, metadata, and hreflang translation processing.
│   │   │   ├── reports/                                # Report translation workflows for summaries, charts, and premium sections.
│   │   │   ├── glossaries/                             # Brand, product, industry, and country terminology management for consistent translations.
│   │   │   └── quality/                                # Translation QA, missing-locale detection, and human-review queue creation.
│   │   ├── reports/                                    # Daily and weekly report generation jobs.
│   │   │   ├── daily/                                  # Daily market brief creation from news, search trends, analytics, and AI summaries.
│   │   │   ├── weekly/                                 # Weekly sector, country, brand, funding, franchise, and category reports.
│   │   │   ├── charts/                                 # Chart data generation, snapshotting, and materialized view refresh jobs.
│   │   │   └── distribution/                           # Email, export, notification, and publishing jobs for generated reports.
│   │   ├── monitoring/                                 # Monitoring and alert jobs for ingestion, AI spend, queue lag, data freshness, and SEO health.
│   │   │   ├── health-checks/                          # Database, RSS source, queue, cache, Supabase, and search availability checks.
│   │   │   ├── alerts/                                 # Alert routing for failed ingestion, unusual volume drops, high latency, and cost anomalies.
│   │   │   ├── metrics/                                # Job metrics, throughput, error-rate, source reliability, and freshness rollups.
│   │   │   └── audits/                                 # Scheduled data-quality audits for broken links, missing translations, stale pages, and duplicate brands.
│   │   ├── queues/                                     # Queue definitions, payload contracts, retry policies, priorities, and dead-letter handling.
│   │   ├── workers/                                    # Worker process entrypoints for hosted workers, containers, or serverless background processors.
│   │   └── shared/                                     # Shared job utilities for locking, idempotency, batching, rate limits, and observability.
│   ├── providers/                                      # Application-wide React providers composed in app/layout.tsx or nested route layouts.
│   │   ├── auth-provider.tsx                           # Authentication/session provider for NextAuth or Supabase Auth state.
│   │   ├── theme-provider.tsx                          # Theme provider for dark mode, design tokens, and system theme preferences.
│   │   ├── query-provider.tsx                          # React Query provider for client-side caching, invalidation, retries, and devtools.
│   │   ├── analytics-provider.tsx                      # Analytics provider for page views, events, attribution, funnels, and consent-aware tracking.
│   │   ├── i18n-provider.tsx                           # Internationalization provider for dictionaries, locale state, formatting, and language switching.
│   │   └── index.tsx                                   # Provider composition helper to keep root layouts clean and testable.
│   ├── components/                                     # Shared presentation layer for cross-feature UI; feature-specific UI remains inside src/features/*/components.
│   │   ├── ui/                                         # Shadcn UI primitives and design-system wrappers.
│   │   ├── layout/                                     # Global header, footer, sidebar, breadcrumbs, menus, and responsive shells.
│   │   ├── seo/                                        # JSON-LD, canonical, hreflang, Open Graph, and metadata presenter components.
│   │   ├── charts/                                     # Reusable chart primitives used by reports, admin dashboards, and market pages.
│   │   ├── forms/                                      # Generic form controls, field wrappers, date pickers, and validation presenters.
│   │   └── feedback/                                   # Empty states, skeletons, loading indicators, error states, toasts, and permission notices.
│   ├── services/                                       # Cross-cutting infrastructure services shared by multiple features and jobs.
│   │   ├── rss/                                        # RSS provider clients, feed discovery utilities, shared source adapters, and parser primitives.
│   │   ├── ai/                                         # OpenAI API clients, prompt utilities, model routing, cost controls, and response normalization.
│   │   ├── search/                                     # PostgreSQL full-text, vector, external search index, ranking, and autocomplete adapters.
│   │   ├── analytics/                                  # Event tracking, metrics ingestion, rollups, attribution, and business intelligence adapters.
│   │   ├── translation/                                # Translation provider clients, locale helpers, glossary adapters, and translation memory access.
│   │   ├── database/                                   # Prisma, PostgreSQL, Supabase clients, read-replica routing, transactions, and connection pooling.
│   │   ├── cache/                                      # Next.js cache tags, Redis/Supabase cache adapters, ISR helpers, and stale-while-revalidate utilities.
│   │   ├── monitoring/                                 # Structured logs, traces, metrics, alert integrations, uptime checks, and AI cost observability.
│   │   ├── storage/                                    # Supabase Storage adapters for report files, images, exports, and generated assets.
│   │   └── notifications/                              # Email, Slack, webhook, and in-app notification adapters.
│   ├── lib/                                            # Framework-agnostic utilities, configuration, constants, and low-level helpers.
│   │   ├── config/                                     # Environment validation, feature flags, runtime config, and deployment-region settings.
│   │   ├── constants/                                  # Supported locales, categories, route names, roles, cache tags, and queue names.
│   │   ├── db/                                         # Prisma singleton, Supabase server/browser clients, typed SQL helpers, and transaction helpers.
│   │   ├── auth/                                       # Low-level auth utilities, RBAC/ABAC policies, middleware helpers, and route guards.
│   │   ├── seo/                                        # Slug generation, metadata builders, sitemap segmentation, canonical URLs, and structured data helpers.
│   │   ├── i18n/                                       # Locale routing, dictionaries, formatters, translation lookup, fallback rules, and hreflang helpers.
│   │   ├── validation/                                 # Shared validation primitives and schema composition helpers.
│   │   ├── pagination/                                 # Cursor, keyset, archive, and partition-aware pagination helpers for millions of articles.
│   │   ├── errors/                                     # Domain errors, error normalization, retryable error markers, and user-safe messages.
│   │   ├── logger/                                     # Request-scoped structured logging, correlation IDs, and redaction helpers.
│   │   └── utils/                                      # Generic pure utilities with no business-domain ownership.
│   ├── hooks/                                          # Shared client-only hooks used across features; domain-specific hooks stay in feature modules.
│   ├── types/                                          # Shared TypeScript types, generated contracts, global declarations, enums, and branded IDs.
│   ├── middleware.ts                                   # Locale detection, auth redirects, admin protection, bot handling, rate limits, and security headers.
│   └── instrumentation.ts                              # Next.js instrumentation for tracing, metrics, logging, and performance monitoring.
├── prisma/                                             # Prisma and PostgreSQL/Supabase database layer.
│   ├── schema.prisma                                   # Core models for articles, brands, countries, categories, reports, users, sources, jobs, translations, and analytics.
│   ├── migrations/                                     # Versioned schema migrations for production-safe database evolution.
│   ├── seed/                                           # Seed scripts for categories, countries, roles, admin users, sources, and default settings.
│   ├── fixtures/                                       # Local/test fixtures for feeds, articles, brands, reports, and analytics events.
│   ├── indexes/                                        # SQL for high-scale indexes, partial indexes, full-text search, vector search, and partition support.
│   ├── partitions/                                     # SQL helpers for time-based article partitions and archive tables.
│   └── views/                                          # SQL views and materialized views for search, analytics, reports, rankings, and source health.
├── public/                                             # Static public assets served by CDN/static hosting.
│   ├── images/                                         # Brand, category, country, report, and editorial images.
│   ├── icons/                                          # Favicons, app icons, category icons, source icons, and PWA assets.
│   ├── locales/                                        # Public locale bundles when client-side loading is needed.
│   ├── og/                                             # Static or generated Open Graph image assets.
│   └── robots/                                         # Verification files and optional static crawler policy fragments.
├── tests/                                              # Automated validation for architecture, scale, and user-critical flows.
│   ├── unit/                                           # Fast tests for utilities, schemas, feature services, and pure business logic.
│   ├── integration/                                    # Database, Supabase, RSS, OpenAI, search, auth, API, and job integration tests.
│   ├── e2e/                                            # Playwright tests for public routes, search, auth, and admin publishing workflows.
│   ├── contract/                                       # Webhook, external RSS, AI, search, analytics, and notification service contract tests.
│   └── load/                                           # Load tests for article feeds, search, ingestion, sitemaps, cache, and brand directories.
├── scripts/                                            # Operational scripts for migrations, backfills, imports, exports, source audits, and one-off maintenance.
├── docs/                                               # Engineering documentation for architecture, SEO, operations, data models, and runbooks.
│   ├── architecture/                                   # ADRs, clean architecture boundaries, feature ownership, and scalability decisions.
│   ├── api/                                            # Internal and external API documentation.
│   ├── operations/                                     # Runbooks for ingestion, jobs, cron, monitoring, incidents, deploys, backups, and restores.
│   └── seo/                                            # Sitemap strategy, canonicalization, structured data, hreflang, archives, and crawl-budget policy.
├── supabase/                                           # Supabase-specific configuration and managed-platform assets.
│   ├── functions/                                      # Optional Supabase Edge Functions for webhooks, auth events, storage events, or background processing.
│   ├── policies/                                       # Row Level Security policies and authorization SQL.
│   └── storage/                                        # Storage bucket definitions, access policies, and lifecycle rules.
├── emails/                                             # Transactional, report, alert, auth, and editorial notification email templates.
├── config/                                             # Tooling and project configuration shared across environments.
│   ├── eslint/                                         # ESLint configuration and custom rules.
│   ├── tailwind/                                       # TailwindCSS presets, design tokens, and theme extensions.
│   └── shadcn/                                         # Shadcn UI registry, aliases, and component configuration.
├── .github/                                            # GitHub automation, issue templates, CODEOWNERS, and CI/CD workflows.
│   └── workflows/                                      # Lint, typecheck, test, build, migration, preview, and deployment workflows.
├── next.config.ts                                      # Next.js production configuration for caching, images, redirects, rewrites, and headers.
├── tailwind.config.ts                                  # TailwindCSS configuration and enterprise design tokens.
├── components.json                                     # Shadcn UI configuration.
├── tsconfig.json                                       # TypeScript configuration and path aliases for feature-driven imports.
├── postcss.config.mjs                                  # PostCSS and TailwindCSS processing configuration.
├── package.json                                        # Scripts, dependencies, engines, and package metadata.
├── .env.example                                        # Documented environment variables for local, staging, and production.
└── README.md                                           # Project overview, setup, architecture map, and operational entrypoints.
```
