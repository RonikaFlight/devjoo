# DevJoo — Architecture

## Overview
DevJoo is a Persian SEO-first freelance marketplace for technology and digital projects.
Current implementation: Next.js 16 App Router with API Routes.
Planned: Turborepo monorepo with NestJS backend.

## Directory Structure

```
/home/z/my-project/
├── prisma/                    # Prisma schema & migrations
│   └── schema.prisma
├── public/
│   ├── fonts/                 # Self-hosted Vazirmatn
│   └── robots.txt
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout (RTL, Vazirmatn, metadata)
│   │   ├── page.tsx           # Homepage
│   │   ├── projects/          # Project pages
│   │   ├── freelancers/       # Freelancer pages
│   │   ├── hire/              # Hire landing pages
│   │   ├── services/          # Service pages
│   │   ├── blog/              # Blog pages
│   │   ├── auth/              # Auth pages
│   │   ├── dashboard/         # Protected dashboards
│   │   ├── settings/          # User settings
│   │   └── api/v1/            # API route handlers
│   │       ├── auth/
│   │       ├── projects/
│   │       ├── profiles/
│   │       ├── skills/
│   │       ├── categories/
│   │       └── search/
│   ├── components/
│   │   ├── layout/            # Header, Footer, Sidebar
│   │   ├── shared/            # Reusable components (ProjectCard, etc.)
│   │   ├── seo/               # Breadcrumbs, StructuredData
│   │   └── ui/                # shadcn/ui components
│   ├── config/                # App config, feature flags, constants
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── seo/               # SEO utilities
│   │   ├── utils/             # General utilities
│   │   └── validators/        # Zod schemas
│   ├── modules/               # Domain logic
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── profiles/
│   │   ├── skills/
│   │   ├── categories/
│   │   ├── search/
│   │   └── proposals/
│   └── types/                 # TypeScript types
├── AGENTS.md
├── PROJECT_STATE.md
├── TODO.md
├── SEO_PLAN.md
├── ARCHITECTURE.md
├── DATABASE.md
├── DESIGN_SYSTEM.md
├── API_STATUS.md
├── CHANGELOG.md
├── DECISIONS.md
└── package.json
```

## Frontend Architecture

### Rendering Strategy
- **Server Components** by default (SEO-critical content)
- **Client Components** only for: forms, interactive elements, real-time data
- **SSR** for dynamic public pages (project detail, profiles)
- **SSG** for static pages (homepage sections, category index)
- **ISR** for semi-dynamic pages (skill pages, category pages)

### State Management
- **TanStack Query** — server state (API data, caching, refetching)
- **Zustand** — client state (UI state, preferences, filters)
- **URL State** — filter/sort state (for SEO and shareability)

### Component Architecture
- `ui/` — shadcn/ui primitives (don't modify)
- `shared/` — domain-specific reusable components
- `layout/` — page structure components
- `seo/` — SEO-specific rendering components

## Backend Architecture

### API Design
- REST under `/api/v1/*`
- Versioned APIs
- Resource-based routing
- Consistent error format
- Zod validation on every endpoint

### Module Structure
Each domain module contains:
```
src/modules/{domain}/
  ├── service.ts       # Business logic
  ├── repository.ts    # Database queries
  ├── dto.ts           # Data transfer objects
  ├── validators.ts    # Zod schemas
  └── types.ts         # Module types
```

### Authentication
- NextAuth.js v4 (initial)
- Custom JWT session planned
- HttpOnly, Secure, SameSite cookies
- Session rotation & revocation

### Future: NestJS Extraction
The modular structure is designed so each module can be extracted
to a NestJS module when the monorepo migration happens.

## Database Architecture

### ORM
- Prisma ORM
- SQLite for development
- PostgreSQL for production

### Design Principles
- UUID identifiers
- Timestamps on all entities
- Soft deletes where business-required
- Money as integers (IRR/Rial)
- Proper indexing for query patterns

## SEO Architecture

### Metadata
- Centralized metadata helpers in `lib/seo/`
- Dynamic metadata generation for all public pages
- Template-based title/description generation

### Rendering
- All SEO content server-rendered
- No client-side data fetching for SEO-critical content
- Structured data rendered server-side

## Deployment Architecture (Planned)

### Development
- bun dev on port 3000
- SQLite database
- In-memory caching

### Production
- Next.js standalone build
- PostgreSQL database
- Redis for caching & jobs
- S3-compatible object storage (MinIO for dev)
- CDN for static assets

## Feature Flags
Centralized in `src/config/feature-flags.ts`:
- PAYMENTS_ENABLED
- PAID_TRIAL_ENABLED
- AI_PROJECT_BUILDER_ENABLED
- AI_PROPOSAL_ASSISTANT_ENABLED
- TEAM_MODE_ENABLED
- MESSAGING_ENABLED

## Security Architecture
- Server-side authorization on all protected resources
- Rate limiting per action type
- Input validation (Zod) on both frontend & backend
- File upload validation (type, MIME, size)
- Audit logging for sensitive operations
- No secrets in logs or error responses