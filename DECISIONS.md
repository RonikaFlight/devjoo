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
