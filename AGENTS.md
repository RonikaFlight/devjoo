# DevJoo — Agent Instructions

## Product Name
**DevJoo** — The smart Persian marketplace for technology and digital projects.
Persian: بازار هوشمند پروژه‌های تکنولوژی و دیجیتال

## Product Vision
A real, production-ready, SEO-first Persian freelance marketplace where professionals find the right projects and employers find the right talent. Brand concept: Dev + Joo (جو = seeker).

## Architecture
- **Monorepo**: Single Next.js 16 app with modular internal structure (designed for future extraction to Turborepo monorepo with apps/web + apps/api)
- **Frontend**: Next.js 16, App Router, TypeScript strict, Tailwind CSS 4, shadcn/ui, Radix UI, TanStack Query, React Hook Form, Zod, Lucide Icons
- **Backend**: Next.js API Routes (Route Handlers) — modular structure designed for future NestJS extraction
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (production)
- **Caching**: In-memory (dev) / Redis (production)
- **Runtime**: bun

## Frontend Stack
- Server Components by default; Client Components only when client interaction needed
- SEO-critical content must be server-rendered (SSR/SSG/ISR)
- shadcn/ui (New York style) + Radix UI primitives
- TanStack Query for server state
- React Hook Form + Zod for forms
- Zustand for client state
- Framer Motion for animations

## Backend Stack
- Next.js Route Handlers under `/api/v1/*`
- Modular structure: each domain in `src/modules/`
- REST API with OpenAPI documentation planned
- Validation: Zod on both frontend and backend
- Authentication: NextAuth.js v4 (to be replaced with custom JWT session later)

## Database Rules
- Prisma ORM, migration-based
- UUID identifiers (using cuid() in SQLite, uuid in PostgreSQL)
- Timestamps: `createdAt`, `updatedAt`, `deletedAt` where required
- Money stored as integers in IRR (Rial), never floating point
- Soft deletes only where business-required
- No important business data in JSON files
- GIN indexes and pg_trgm planned for PostgreSQL search

## API Rules
- Versioned: `/api/v1/*`
- Consistent resource naming (REST)
- Consistent error format: `{ code, message, fieldErrors?, requestId }`
- Backend validation is authoritative
- Never expose stack traces, SQL errors, secrets in production
- Cursor pagination for feeds, conventional pagination for SEO-crawlable pages

## SEO Rules
- SEO is the #1 priority
- Every public page needs: title, meta description, canonical, OpenGraph, Twitter, robots
- Titles target user intent first, brand second
- RTL: `<html lang="fa" dir="rtl">`
- Breadcrumbs with BreadcrumbList structured data on all public pages
- JSON-LD structured data where appropriate (Organization, WebSite, BreadcrumbList, etc.)
- No fake reviews, fake stats, fake structured data
- Sitemap with separate sitemaps per content type
- robots.txt blocks private areas
- Internal linking strategy for SEO crawl depth
- Faceted filter URLs: noindex,follow (avoid index bloat)
- Only intentional keyword-targeted pages get indexed

## RTL Rules
- `<html lang="fa" dir="rtl">`
- Audit: navigation, icons, arrows, forms, dropdowns, selects, pagination, tables, breadcrumbs, sidebars, modals, toasts
- Technology names (React, Next.js, etc.) remain LTR
- Use Tailwind RTL logical properties (start/end instead of left/right)

## Persian Language Rules
- Primary language: fa-IR
- All primary UI copy in professional Persian
- Avoid machine-like Persian
- Technical terms (React, Next.js, GitHub, TypeScript, UI/UX) remain English when natural
- No unnecessary Persian/English mixing

## Design System
- **Primary**: #7C3AED (purple)
- **Primary Light**: #8B5CF6
- **Primary Dark**: #6D28D9
- **Primary Soft**: #F5F3FF
- **Background**: #F8FAFC
- **Surface**: #FFFFFF
- **Text Primary**: #0F172A
- **Text Secondary**: #475569
- **Border**: #E2E8F0
- **Success**: #16A34A
- **Warning**: #D97706
- **Danger**: #DC2626
- **Font**: Vazirmatn (self-hosted, weights: 400, 500, 600, 700, 800)
- Cards: 12-16px radius, subtle border, very subtle shadow
- Dark mode supported
- No excessive glassmorphism, blur, animations, or childish UI

## Authentication Architecture
- Instant Join: Google OAuth, GitHub OAuth, Mobile OTP
- Secure session: HttpOnly, Secure, SameSite cookies
- Session rotation and revocation
- Progressive onboarding (role selection → profile completion)
- No giant registration forms; target < 30 seconds
- Account linking for duplicate emails

## Security Requirements
- Protect against: XSS, CSRF, SQL injection, IDOR, brute force, OAuth attacks, spam, mass assignment, file upload abuse, rate abuse
- Server-side authorization on every protected resource
- Rate limiting per action type
- Audit logging for security-sensitive operations
- Structured server logs (no passwords, OTPs, tokens logged)
- File upload validation: type, MIME, size, extension
- Feature flags for regulatory-dependent features

## Testing Requirements
- Frontend: unit/component tests + Playwright E2E
- Backend: unit + integration + API tests
- SEO tests: title, canonical, robots, sitemap, structured data, status codes
- CI: install, lint, typecheck, test, build

## Naming Conventions
- Technical identifiers: `devjoo`, `@devjoo/*`
- File names: kebab-case for files, PascalCase for components
- Database: PascalCase models, camelCase fields
- API: kebab-case routes, camelCase JSON fields
- CSS: Tailwind utilities, no custom CSS unless necessary

## Project Directory Conventions
```
src/
  app/              # Next.js App Router pages & layouts
  api/v1/           # API route handlers
  components/
    layout/         # Header, Footer, Sidebar
    shared/         # Reusable UI components
    seo/            # SEO-specific components (breadcrumbs, structured data)
    ui/             # shadcn/ui components
  config/           # App configuration, feature flags, constants
  hooks/            # Custom React hooks
  lib/
    seo/            # SEO utilities (metadata, canonical, structured data)
    utils/          # General utilities (currency, persian-normalize, etc.)
    validators/     # Zod schemas
  modules/          # Domain modules (auth, projects, profiles, etc.)
  types/            # TypeScript type definitions
prisma/             # Prisma schema & migrations
public/             # Static assets
```

## Definition of Done
A feature is complete only when:
1. Database schema exists
2. Migrations applied
3. Backend logic exists
4. API exists
5. Authorization exists
6. Validation exists (frontend + backend)
7. Frontend exists
8. Frontend uses real API
9. Loading state exists
10. Empty state exists
11. Error state exists
12. Responsive design works
13. RTL is correct
14. Security concerns addressed
15. Tests exist where appropriate
16. Lint passes
17. Typecheck passes
18. Build passes

## Rules Against Fake Implementation
- No random Match Scores
- No fake ratings, user counts, project counts
- No fake notifications or Price Radar data
- No fake hiring probability or employer verification
- No fake payments
- No static hardcoded dashboard stats
- If real data doesn't exist, show honest empty state

## Session Continuation Protocol
1. Read `AGENTS.md`
2. Read `PROJECT_STATE.md`
3. Read `TODO.md`
4. Identify first relevant unfinished task
5. Read only files relevant to that task
6. Continue implementation
7. Do NOT restart from scratch
8. Do NOT recreate already completed pages or modules
