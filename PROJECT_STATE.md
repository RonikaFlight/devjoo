# Project
DevJoo

# Current Phase
Phase 5 — Trust (READY TO START)

# Last Completed Task
Phase 4 SEO Landing Pages: /categories index, /projects/[slug] category pages, /projects/skills/[slug] skill pages, /hire landing, 15 /hire/[role] role pages, /blog foundation, internal linking on project detail/footer/homepage, updated sitemaps.

# Currently Working On
None — Phase 4 complete, ready for Phase 5

# Completed Features
- Phase 0 complete (see below)
- Phase 1 complete: SEO infrastructure, structured data, sitemaps, Zod validators
- Phase 2 complete: Full authentication system (see below)
- Phase 3 complete: Marketplace core — seed data, categories/skills/projects/proposals APIs, project pages, dashboard skeletons (see below)
- Phase 4 complete: SEO landing pages — category/skill/hire pages, internal linking, blog foundation (see below)

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

## Phase 4 Completed
- /categories index page: grid with icons, skill counts, project counts, SEO breadcrumbs
- /projects/[slug] category pages: projects filtered by category, skill sub-filter, search, pagination, seoTitle/seoDescription metadata
- /projects/skills/[slug] skill pages: projects by skill, related skills, hire CTA, synonyms, generateStaticParams
- /hire landing page: hire-by-skill links, category grid, employer CTA
- /hire/[role] role pages: 15 SEO-optimized pages (react-developer, nextjs-developer, seo-specialist, etc.)
- /blog foundation: empty state with internal links
- Internal linking: project detail → skill/category pages, footer categories + skill pages, homepage skill links
- Sitemap updated: all category, skill, hire, and static pages
- Breadcrumb key fix (unique keys)

# Partially Completed Features
- None

# Pending Features
- Phase 5-12: See TODO.md

# Important Architecture Decisions
- ADR-001 through ADR-010 (see DECISIONS.md)
- ADR-011: Custom JWT sessions instead of NextAuth.js (see DECISIONS.md)
- ADR-012: Edge-safe session split (see DECISIONS.md)
- ADR-013: Module-based service layer architecture (see DECISIONS.md)
- ADR-014: URL structure for SEO landing pages (see DECISIONS.md)

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
- /project/[slug] detail page with SEO breadcrumbs + internal links
- /categories index page with category grid
- /projects/[slug] category project pages with skill filter
- /projects/skills/[slug] skill project pages with related skills
- /hire landing page with hire-by-skill links
- /hire/[role] role-specific hire pages (15 roles)
- /blog foundation page

# SEO Status
- Homepage metadata configured
- robots.txt: dynamic route (production-aware)
- Sitemap: sitemap-index.xml + 3 dynamic sub-sitemaps (updated for Phase 4 pages)
- Structured data: Organization, WebSite, ItemList on homepage
- Breadcrumbs: component ready, all public pages have breadcrumbs
- Metadata helpers: generatePageMetadata, generateFilterPageMetadata, generatePrivatePageMetadata
- Canonical helpers: buildCanonicalUrl
- Project detail page with SEO breadcrumbs + category breadcrumb
- Category pages with seoTitle/seoDescription metadata
- Skill pages with dynamic metadata (title + description from skill name)
- Hire pages with hand-written SEO metadata per role
- Internal linking: project → skills/categories, footer → categories/skills, homepage → skill pages

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
- Project creation page not built (only API exists)
- Proposal pages (freelancer/employer) not built (only APIs exist)
- Authentication tests not written

# Blockers
- None

# Last Successful Commands
- bun run lint ✓
- dev server: HTTP 200 on all new pages ✓
- /categories: 200 ✓
- /projects/web-development: 200 ✓
- /projects/skills/react: 200 ✓
- /hire: 200 ✓
- /hire/react-developer: 200 ✓
- /hire/seo-specialist: 200 ✓
- /blog: 200 ✓
- /sitemap-categories.xml: 200, valid XML ✓

# Recently Modified Files
- src/app/categories/page.tsx (NEW — categories index)
- src/app/projects/[slug]/page.tsx (NEW — category project page)
- src/app/projects/[slug]/category-projects-client.tsx (NEW)
- src/app/projects/skills/[slug]/page.tsx (NEW — skill project page)
- src/app/projects/skills/[slug]/skill-projects-client.tsx (NEW)
- src/app/hire/page.tsx (NEW — hire landing)
- src/app/hire/[role]/page.tsx (NEW — hire role page)
- src/app/hire/[role]/hire-role-client.tsx (NEW)
- src/app/blog/page.tsx (NEW — blog foundation)
- src/components/layout/footer.tsx (UPDATED — categories column + skill links)
- src/components/seo/breadcrumbs.tsx (FIXED — unique keys)
- src/app/page.tsx (UPDATED — skill links to /projects/skills/)
- src/app/project/[slug]/page.tsx (UPDATED — category in breadcrumb)
- src/app/project/[slug]/project-detail-client.tsx (UPDATED — skill/category internal links)
- src/app/sitemap-categories.xml/route.ts (UPDATED — skill URLs + hire pages)
- TODO.md (UPDATED — Phase 3 + 4 marked complete)
- PROJECT_STATE.md (UPDATED)
- CHANGELOG.md (UPDATED — v0.4.0)

# Next Recommended Task
Start Phase 5 — Trust: Client Score (employer metrics), verification systems, portfolio, reviews, reputation score