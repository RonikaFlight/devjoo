# Project
DevJoo

# Current Phase
Phase 0 — Foundation (COMPLETE)

# Last Completed Task
Phase 0 foundation complete: all documentation, Prisma schema, RTL layout, design system, homepage, header/footer

# Currently Working On
Ready to start Phase 1 — Design System + SEO Foundation

# Completed Features
- All 10 project memory files created (AGENTS.md, PROJECT_STATE.md, TODO.md, SEO_PLAN.md, ARCHITECTURE.md, DATABASE.md, DESIGN_SYSTEM.md, API_STATUS.md, CHANGELOG.md, DECISIONS.md)
- Prisma schema with 30+ models (User, Role, Session, OAuth, Profile, Category, Skill, Project, Proposal, MatchScore, Review, Notification, Blog, Audit, etc.)
- Database synced and Prisma client generated
- TypeScript enum constants with Persian labels
- Site configuration (site.ts)
- Feature flags system (feature-flags.ts)
- Currency formatting utilities (rial/toman, Persian numbers)
- Persian text normalization utilities
- Vazirmatn font (self-hosted woff2)
- Purple design system tokens in Tailwind
- Dark mode configuration (next-themes)
- RTL layout (html lang="fa" dir="rtl")
- Header component (desktop nav + mobile sheet nav)
- Footer component (brand, navigation, popular skills, about)
- Homepage with hero, search, popular skills, differentiators, employer CTA
- SEO metadata on homepage
- .env.example created
- ESLint passes
- Dev server runs and renders correctly
- Browser verified: all sections render properly

# Partially Completed Features
- SEO infrastructure (helpers not yet created)
- Breadcrumb component (not yet created)

# Pending Features
- Phase 1: SEO metadata helpers, robots.txt, sitemap, canonical helpers, structured data, breadcrumbs
- Phase 2: Authentication
- Phase 3: Marketplace Core
- Phase 4: SEO Landing Pages
- Phase 5-12: See TODO.md

# Important Architecture Decisions
- ADR-001: Modular Monolith with Next.js API Routes
- ADR-002: SQLite for Dev, PostgreSQL for Production
- ADR-003: shadcn/ui (New York Style)
- ADR-004: Vazirmatn Font (self-hosted)
- ADR-005: Purple Design System (#7C3AED)
- ADR-006: Server Components by Default
- ADR-007: Money as Integer Rial
- ADR-008: Feature Flags from Config
- ADR-009: TanStack Query for Server State
- ADR-010: CUID for SQLite, UUID for PostgreSQL

# Database Status
- Prisma schema: 30+ models defined
- SQLite database: synced
- Prisma client: generated
- Seed data: not yet created

# Migration Status
- Using db:push (no migration files yet)

# API Status
- No API routes implemented
- Route structure planned

# Frontend Status
- Next.js 16 App Router running
- RTL layout configured
- Vazirmatn font loaded
- Purple design tokens active
- Dark mode supported
- Header + Footer components
- Homepage with all sections
- Empty state for projects (honest, no fake data)

# Authentication Status
- NextAuth.js v4 available (not configured)
- No auth flows implemented

# SEO Status
- Homepage metadata configured
- robots.txt: default (needs production-aware version)
- Sitemap: not yet created
- Structured data helpers: not yet created
- Breadcrumbs: not yet created

# Search Status
- Not implemented

# Matching Engine Status
- Not implemented

# Notification Status
- Not implemented

# Admin Panel Status
- Not implemented

# Testing Status
- No tests written

# Production Readiness
- Not production ready

# Known Bugs
- None

# Technical Debt
- None

# Blockers
- None

# Last Successful Commands
- bun run lint ✓
- bun run db:push ✓
- bun run db:generate ✓
- dev server: HTTP 200 ✓
- browser verification: passed ✓

# Recently Modified Files
- prisma/schema.prisma
- src/app/layout.tsx
- src/app/page.tsx
- src/app/globals.css
- src/components/layout/header.tsx
- src/components/layout/header-mobile-nav.tsx
- src/components/layout/footer.tsx
- src/config/site.ts
- src/config/feature-flags.ts
- src/types/enums.ts
- src/lib/utils/currency.ts
- src/lib/utils/persian-normalize.ts
- public/fonts/*.woff2

# Next Recommended Task
Start Phase 1: Create SEO metadata helpers, production robots.txt, sitemap architecture, canonical URL helpers, structured data helpers, breadcrumb component