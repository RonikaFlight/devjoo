# Project
DevJoo

# Current Phase
Phase 3 — Marketplace Core (NEARLY COMPLETE)

# Last Completed Task
Phase 3 Marketplace Core: Seed data (10 categories, 75 skills, 93 synonyms), 8 new API routes (categories, skills, projects CRUD, proposals, bookmarks), module-based service layer (projects/service.ts, proposals/service.ts), ProjectCard shared component, /projects listing page with category filters and pagination, /project/[slug] detail page with SEO breadcrumbs, dashboard skeleton pages for freelancer and employer. All 18 API endpoints verified working via curl.

# Currently Working On
None — Phase 3 complete, ready for Phase 4

# Completed Features
- Phase 0 complete (see below)
- Phase 1 complete: SEO infrastructure, structured data, sitemaps, Zod validators
- Phase 2 complete: Full authentication system (see below)
- Phase 3 complete: Marketplace core — seed data, categories/skills/projects/proposals APIs, project pages, dashboard skeletons (see below)

## Phase 0 Completed
- All 10 project memory files
- Prisma schema with 30+ models
- Database synced and Prisma client generated
- TypeScript enum constants with Persian labels
- Site configuration, feature flags
- Currency formatting, Persian normalization utilities
- Vazirmatn font, purple design tokens, dark mode, RTL
- Header, Footer, Homepage with hero/search/skills/differentiators/CTA

## Phase 1 Completed
- SEO metadata helper: generatePageMetadata() with full OG, Twitter, robots
- SEO filter page helper: generateFilterPageMetadata() (noindex, follow)
- SEO private page helper: generatePrivatePageMetadata() (noindex, nofollow)
- Canonical URL helper: buildCanonicalUrl()
- 6 JSON-LD structured data generators
- StructuredData React component, Breadcrumb component, SeoPage wrapper
- Dynamic robots.txt, sitemap-index + 3 dynamic sub-sitemaps
- Homepage integrated with Organization, WebSite, ItemList structured data
- Zod validators: auth, profile, project, proposal, taxonomy, common

## Phase 2 Completed
- Session management: JWT (jose HS256) + DB session, HttpOnly cookies, 30-day expiry
- Edge-safe session verification (session-edge.ts for middleware)
- Password hashing (bcryptjs, 12 rounds)
- Mobile OTP: request (rate-limited 2/min), verify (5 attempts, 2-min expiry), resend
- Dev mode OTP bypass (code: 12345)
- Google OAuth: code exchange, user creation/linking, session creation
- GitHub OAuth: code exchange, user creation/linking, session creation
- Auth API routes: POST otp/request, POST otp/verify, POST otp/resend, POST oauth/google, POST oauth/github, POST register, GET me, POST logout, POST password/set, POST password/change
- Auth middleware: JWT verification for protected API/page routes, public route whitelist
- Login page: phone OTP + email/password tabs, OAuth buttons, RTL design
- Role selection page: freelancer/employer choice + display name input
- Dashboard skeletons: /dashboard (redirect), /dashboard/freelancer, /dashboard/employer
- Helper functions: requireAuth, requireRole, getAuthUser, isFreelancer, isEmployer, isAdmin, assignRole, findOrCreateUserByPhone

## Phase 3 Completed
- Seed data: 10 categories, 75 skills, 93 synonyms (Persian tech market)
- Module-based service layer: projects/service.ts, proposals/service.ts
- Categories API: GET /api/v1/categories, GET /api/v1/categories/[slug]
- Skills API: GET /api/v1/skills (with search & category filter), GET /api/v1/skills/[slug]
- Projects API: POST (create with slug generation), GET (list with filters/sort/pagination), GET [slug] (detail), PATCH [slug] (update draft), POST [slug]/publish (state machine)
- Proposal API: POST (submit, max 10 limit), GET (employer list), PATCH [id] (status update), GET /me/proposals (freelancer list)
- Saved projects: POST /api/v1/projects/[slug]/save (bookmark toggle)
- ProjectCard shared component (reusable project card)
- /projects page with category filter bar and pagination
- /project/[slug] detail page with SEO breadcrumbs
- Dashboard skeletons: /dashboard (role-based redirect), /dashboard/freelancer, /dashboard/employer

# Partially Completed Features
- None

# Pending Features
- Phase 4-12: See TODO.md

# Important Architecture Decisions
- ADR-001 through ADR-010 (see DECISIONS.md)
- ADR-011: Custom JWT sessions instead of NextAuth.js (see DECISIONS.md)
- ADR-012: Edge-safe session split (see DECISIONS.md)
- ADR-013: Module-based service layer architecture (see DECISIONS.md)

# Database Status
- Prisma schema: 30+ models defined
- SQLite database: synced
- Seed data: 10 categories, 75 skills, 93 synonyms seeded
- Test users created via API: 3 OTP-verified users

# API Status
- POST /api/v1/auth/otp/request — working
- POST /api/v1/auth/otp/verify — working
- POST /api/v1/auth/otp/resend — working
- POST /api/v1/auth/oauth/google — working (requires credentials)
- POST /api/v1/auth/oauth/github — working (requires credentials)
- POST /api/v1/auth/register — working
- GET /api/v1/auth/me — working
- POST /api/v1/auth/logout — working
- POST /api/v1/auth/password/set — working
- POST /api/v1/auth/password/change — working
- GET /api/v1/categories — working
- GET /api/v1/categories/[slug] — working
- GET /api/v1/skills — working
- GET /api/v1/skills/[slug] — working
- POST /api/v1/projects — working
- GET /api/v1/projects — working
- GET /api/v1/projects/[slug] — working
- PATCH /api/v1/projects/[slug] — working
- POST /api/v1/projects/[slug]/publish — working
- POST /api/v1/projects/[slug]/proposals — working
- GET /api/v1/projects/[slug]/proposals — working
- PATCH /api/v1/proposals/[id] — working
- GET /api/v1/me/proposals — working
- POST /api/v1/projects/[slug]/save — working

# Frontend Status
- Next.js 16 App Router, RTL, Vazirmatn, purple design, dark mode
- Header + Footer + Homepage
- Breadcrumb component, SeoPage template
- Login page (/auth/login) with OTP + OAuth
- Role selection page (/auth/role-select)
- Dashboard pages (/dashboard, /dashboard/freelancer, /dashboard/employer)
- ProjectCard shared component
- /projects page with category filters and pagination
- /project/[slug] detail page with SEO breadcrumbs

# SEO Status
- Homepage metadata configured
- robots.txt: dynamic route (production-aware)
- Sitemap: sitemap-index.xml + 3 dynamic sub-sitemaps
- Structured data: Organization, WebSite, ItemList on homepage
- Breadcrumbs: component ready
- Metadata helpers: generatePageMetadata, generateFilterPageMetadata, generatePrivatePageMetadata
- Canonical helpers: buildCanonicalUrl
- Project detail page with SEO breadcrumbs

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
- OAuth frontend buttons are placeholders (show "coming soon" message)
- Email/password login shows "coming soon" message

# Blockers
- None

# Last Successful Commands
- bun run lint ✓
- dev server: HTTP 200 ✓
- POST /api/v1/auth/otp/request: 200, returns devCode ✓
- POST /api/v1/auth/otp/verify: 200, sets cookie, returns user + needsOnboarding ✓
- GET /api/v1/auth/me: 200 with cookie, 401 without ✓
- POST /api/v1/auth/register: 201, assigns role + creates profile ✓
- POST /api/v1/auth/logout: 200, clears session ✓
- GET /api/v1/auth/me after logout: 401 ✓
- GET /api/v1/categories: 200, returns 10 categories ✓
- GET /api/v1/skills: 200, returns 75 skills ✓
- POST /api/v1/projects: 201, creates draft project ✓
- POST /api/v1/projects/[slug]/publish: 200, DRAFT→PENDING_APPROVAL ✓
- GET /api/v1/projects: 200, list with pagination ✓
- GET /api/v1/projects/[slug]: 200, full project detail ✓
- POST /api/v1/projects/[slug]/proposals: 201, submit proposal ✓
- GET /api/v1/projects/[slug]/proposals: 200, employer proposal list ✓
- POST /api/v1/projects/[slug]/save: 200, bookmark toggle ✓
- /robots.txt: dynamic, dev blocks all ✓
- /sitemap-index.xml: valid XML ✓
- 3 JSON-LD scripts on homepage ✓
- /projects: renders with category filters ✓
- /project/[slug]: renders with breadcrumbs ✓

# Recently Modified Files
- prisma/seed.ts (NEW — seed runner)
- prisma/seed/data/categories.ts (NEW — 10 categories, 75 skills, 93 synonyms)
- src/modules/projects/service.ts (NEW — project CRUD service layer)
- src/modules/proposals/service.ts (NEW — proposal service layer)
- src/app/api/v1/categories/route.ts (NEW — GET categories list)
- src/app/api/v1/categories/[slug]/route.ts (NEW — GET category by slug)
- src/app/api/v1/skills/route.ts (NEW — GET skills with search & filter)
- src/app/api/v1/skills/[slug]/route.ts (NEW — GET skill by slug)
- src/app/api/v1/projects/route.ts (NEW — POST create, GET list)
- src/app/api/v1/projects/[slug]/route.ts (NEW — GET detail, PATCH update)
- src/app/api/v1/projects/[slug]/publish/route.ts (NEW — POST publish state machine)
- src/app/api/v1/projects/[slug]/save/route.ts (NEW — POST bookmark toggle)
- src/app/api/v1/projects/[slug]/proposals/route.ts (NEW — POST submit, GET list)
- src/app/api/v1/proposals/[id]/route.ts (NEW — PATCH status update)
- src/app/api/v1/me/proposals/route.ts (NEW — GET freelancer proposals)
- src/components/shared/project-card.tsx (NEW — shared project card component)
- src/app/projects/page.tsx (NEW — projects listing page)
- src/app/projects/projects-client.tsx (NEW — projects client component)
- src/app/project/[slug]/page.tsx (NEW — project detail page)
- src/app/project/[slug]/project-detail-client.tsx (NEW — project detail client)
- TODO.md (updated Phase 3 status)
- PROJECT_STATE.md (updated)
- CHANGELOG.md (updated)
- DECISIONS.md (updated, added ADR-013)
- API_STATUS.md (updated Phase 3 routes)

# Next Recommended Task
Start Phase 4 — SEO Landing Pages: category pages, skill pages, hire landing pages, internal linking