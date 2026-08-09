# DevJoo — Architecture Decisions

## ADR-001 — Modular Monolith with Next.js API Routes

**Decision:**
Use Next.js 16 App Router with API Routes as the initial backend, with a modular domain structure (`src/modules/`).

**Reason:**
The development environment supports a single Next.js app. The modular structure allows future extraction to a NestJS monorepo without rewriting business logic.

**Status:** Accepted

---

## ADR-002 — SQLite for Development, PostgreSQL for Production

**Decision:**
Use Prisma with SQLite for development and PostgreSQL for production.

**Reason:**
SQLite works seamlessly in the development environment without requiring a separate database server. The Prisma schema is designed to be compatible with both.

**Status:** Accepted

---

## ADR-003 — shadcn/ui (New York Style)

**Decision:**
Use shadcn/ui with New York style as the component library.

**Reason:**
Provides high-quality, accessible, customizable components built on Radix UI primitives. Reduces development time while maintaining design consistency.

**Status:** Accepted

---

## ADR-004 — Vazirmatn Font

**Decision:**
Self-host Vazirmatn font (weights 400, 500, 600, 700, 800).

**Reason:**
The best Persian web font with excellent readability, comprehensive character coverage, and multiple weights. Self-hosting avoids external CDN dependency and improves performance.

**Status:** Accepted

---

## ADR-005 — Purple Design System

**Decision:**
Primary color #7C3AED (purple) with a professional, minimal design language.

**Reason:**
Differentiates from competitors (who typically use blue/green). Purple conveys creativity, technology, and premium quality. The spec explicitly requires this palette.

**Status:** Accepted

---

## ADR-006 — Server Components by Default

**Decision:**
Use React Server Components for all pages unless client interactivity is required.

**Reason:**
Critical for SEO — all content is server-rendered. Improves performance by reducing client-side JavaScript. Only use 'use client' when genuine client interaction is needed.

**Status:** Accepted

---

## ADR-007 — Money as Integer Rial

**Decision:**
Store all monetary values as integers in IRR (Rial). Display as Toman on frontend by dividing by 10.

**Reason:**
Floating point arithmetic is unreliable for money. Rial is Iran's official currency unit. Toman is colloquial (1 Toman = 10 Rial).

**Status:** Accepted

---

## ADR-008 — Feature Flags from Config

**Decision:**
Centralize feature flags in `src/config/feature-flags.ts` rather than scattering environment variable checks.

**Reason:**
Cleaner code, easier to test, can be extended to a database-driven flag system later.

**Status:** Accepted

---

## ADR-009 — TanStack Query for Server State

**Decision:**
Use TanStack Query for all server state management (API data fetching, caching, mutations).

**Reason:**
Industry-standard solution for React server state. Provides caching, refetching, optimistic updates, and loading/error states out of the box.

**Status:** Accepted

---

## ADR-010 — CUID for SQLite, UUID for PostgreSQL

**Decision:**
Use `cuid()` as ID generator in SQLite (dev) and `uuid` in PostgreSQL (production).

**Reason:**
CUID is compatible with SQLite and provides unique, non-sequential IDs. PostgreSQL's native UUID support is more efficient with uuid type.

**Status:** Accepted

---

## ADR-011 — Custom JWT Sessions over NextAuth.js

**Decision:**
Build custom JWT session management using `jose` instead of using NextAuth.js v4.

**Reason:**
- NextAuth.js adds complexity for a custom marketplace with progressive onboarding
- Custom JWT sessions allow full control over session lifecycle, rotation, and revocation
- DB-backed sessions enable proper logout across all devices
- The modular architecture allows migration to NextAuth.js or a custom OAuth server later
- `jose` is edge-compatible, lightweight, and has no native dependencies

**Consequences:**
- More initial code to write (session management, helpers, middleware)
- Full control over session behavior
- Easy to debug and extend
- OAuth flows (Google, GitHub) are manual but straightforward

**Status:** Accepted

---

## ADR-012 — Edge/Node Session Split

**Decision:**
Split session utilities into two files: `session-edge.ts` (jose only, edge-compatible) and `session.ts` (jose + Prisma, Node.js only).

**Reason:**
- Next.js 16 middleware runs in Edge Runtime, which doesn't support Prisma (native dependencies)
- Middleware only needs JWT verification (cryptographic), not DB session validation
- API routes and server components can use the full `session.ts` with DB validation
- This split prevents the entire auth system from breaking in Edge Runtime

**Status:** Accepted

---

## ADR-013 — Module-Based Service Layer

**Decision:**
Place business logic in `src/modules/<domain>/service.ts` files, keeping API route handlers thin (validation, auth, response formatting only).

**Reason:**
- API route handlers in Next.js App Router are tightly coupled to the request/response cycle
- Business logic (slug generation, state machine transitions, proposal limits, complex queries) needs to be reusable across routes and testable in isolation
- A module-based service layer separates concerns: routes handle HTTP, services handle domain logic
- This pattern mirrors NestJS module structure, easing future extraction to a separate backend
- Services can be imported by both API routes and server components (e.g., for SSR data)

**Conventions:**
- Each domain gets a `src/modules/<domain>/` directory with `service.ts`
- Service functions are pure (receive validated input, return data or throw errors)
- Services import `db` from `@/lib/db` directly
- Route handlers call service functions, wrapping results in `NextResponse.json()`

**Status:** Accepted

---

## ADR-014 — URL Structure for SEO Landing Pages

**Decision:**
Use the following URL patterns for SEO landing pages:
- `/categories` — categories index
- `/projects/[category-slug]` — category project listing (e.g., `/projects/web-development`)
- `/projects/skills/[skill-slug]` — skill project listing (e.g., `/projects/skills/react`)
- `/hire` — general hire landing
- `/hire/[role-slug]` — role-specific hire page (e.g., `/hire/react-developer`)
- `/project/[slug]` — individual project detail (singular, no 's')

**Reason:**
- Category slugs use `/projects/[slug]` to match SEO_PLAN.md target URLs (e.g., `/projects/frontend`)
- Skill pages use `/projects/skills/[slug]` to distinguish from category pages and avoid route collision
- Hire pages use `/hire/[role]` for clean, memorable URLs targeting Persian hiring keywords
- The singular `/project/[slug]` for project detail prevents collision with the plural `/projects/[slug]` for category pages
- All URLs use English slugs (URL-safe) while displaying Persian content

**Consequences:**
- `generateStaticParams` works for all category and skill pages
- Sitemap includes all landing page URLs with correct paths
- Internal linking connects project details to their category and skill pages

**Status:** Accepted

---

## ADR-015 — On-Read Reputation Computation

**Decision:**
Compute reputation and client scores on-read (query-time) rather than maintaining a cached `ReputationScore` table. The `ReputationScore` model exists in the schema for future use but is not written to during Phase 5.

**Reason:**
- The platform has no traffic yet — premature optimization of score caching adds complexity without benefit
- On-read computation is simpler to implement and reason about
- The `refreshEmployerMetrics` and `refreshFreelancerMetrics` functions keep denormalized counters on profiles up to date
- A caching layer (Redis, materialized view, or cron-computed scores) can be added in Phase 9 (Analytics) or Phase 12 (Production Hardening) when traffic warrants it
- The `ReputationScore` model with `signalsJson` field is ready for when cached computation is needed

**Consequences:**
- `/api/v1/reputation` may be slower at scale (multiple DB queries per request)
- Scores are always fresh (no stale cache)
- Adding caching later is a non-breaking change (same API contract)

**Status:** Accepted

---

## ADR-016 — On-Demand Match Computation

**Decision:**
The match engine computes scores on-demand when an employer requests matches for their project, rather than pre-computing scores for all freelancer-project pairs at publish time.

**Reason:**
- Pre-computing all pairs is O(N*M) where N=projects and M=freelancers — infeasible at scale
- On-demand computation only processes candidates with at least one matching skill
- The `computeAndStoreMatches()` function persists scores for the smart feed, but is triggered explicitly (e.g., by a cron job or after publish)
- The match score is split into 5 weighted signals (skill overlap 40, budget fit 20, availability 15, experience 10, reputation 15) for transparency
- The hiring probability function provides a complementary "likelihood" metric using different weights

**Consequences:**
- First match request for a project is slower (computes all candidate scores)
- Subsequent requests can use stored MatchScore records
- Smart feed uses a faster inline scoring function (no DB calls per item) instead of the full match engine

**Status:** Accepted
