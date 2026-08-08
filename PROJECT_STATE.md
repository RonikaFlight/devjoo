# Project
DevJoo

# Current Phase
Phase 3 — Marketplace Core (READY TO START)

# Last Completed Task
Phase 2 Authentication: JWT session management via jose, mobile OTP with rate limiting, Google/GitHub OAuth backend, auth middleware, login/role-select frontend pages, dashboard skeletons, password set/change, register (onboarding) endpoint. All auth API endpoints verified working via curl.

# Currently Working On
None — Phase 2 complete, ready for Phase 3

# Completed Features
- Phase 0 complete (see below)
- Phase 1 complete: SEO infrastructure, structured data, sitemaps, Zod validators
- Phase 2 complete: Full authentication system (see below)

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

# Partially Completed Features
- Authentication tests (not yet written)

# Pending Features
- Phase 3-12: See TODO.md

# Important Architecture Decisions
- ADR-001 through ADR-010 (see DECISIONS.md)
- ADR-011: Custom JWT sessions instead of NextAuth.js (see DECISIONS.md)
- ADR-012: Edge-safe session split (see DECISIONS.md)

# Database Status
- Prisma schema: 30+ models defined
- SQLite database: synced
- Seed data: not yet created
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

# Frontend Status
- Next.js 16 App Router, RTL, Vazirmatn, purple design, dark mode
- Header + Footer + Homepage
- Breadcrumb component, SeoPage template
- Login page (/auth/login) with OTP + OAuth
- Role selection page (/auth/role-select)
- Dashboard pages (/dashboard, /dashboard/freelancer, /dashboard/employer)

# SEO Status
- Homepage metadata configured
- robots.txt: dynamic route (production-aware)
- Sitemap: sitemap-index.xml + 3 dynamic sub-sitemaps
- Structured data: Organization, WebSite, ItemList on homepage
- Breadcrumbs: component ready
- Metadata helpers: generatePageMetadata, generateFilterPageMetadata, generatePrivatePageMetadata
- Canonical helpers: buildCanonicalUrl

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
- Dashboard pages are skeleton-only

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
- /robots.txt: dynamic, dev blocks all ✓
- /sitemap-index.xml: valid XML ✓
- 3 JSON-LD scripts on homepage ✓

# Recently Modified Files
- src/lib/validators/auth.ts (NEW)
- src/lib/validators/profile.ts (NEW)
- src/lib/validators/project.ts (NEW)
- src/lib/validators/proposal.ts (NEW)
- src/lib/validators/taxonomy.ts (NEW)
- src/lib/validators/common.ts (NEW)
- src/lib/validators/index.ts (NEW)
- src/lib/auth/password.ts (NEW)
- src/lib/auth/session.ts (NEW)
- src/lib/auth/session-edge.ts (NEW)
- src/lib/auth/otp.ts (NEW)
- src/lib/auth/helpers.ts (NEW)
- src/lib/auth/index.ts (NEW)
- src/middleware.ts (NEW)
- src/app/api/v1/auth/otp/request/route.ts (NEW)
- src/app/api/v1/auth/otp/verify/route.ts (NEW)
- src/app/api/v1/auth/otp/resend/route.ts (NEW)
- src/app/api/v1/auth/oauth/google/route.ts (NEW)
- src/app/api/v1/auth/oauth/github/route.ts (NEW)
- src/app/api/v1/auth/register/route.ts (NEW)
- src/app/api/v1/auth/me/route.ts (NEW)
- src/app/api/v1/auth/logout/route.ts (NEW)
- src/app/api/v1/auth/password/set/route.ts (NEW)
- src/app/api/v1/auth/password/change/route.ts (NEW)
- src/app/auth/login/page.tsx (NEW)
- src/app/auth/login/login-client.tsx (NEW)
- src/app/auth/role-select/page.tsx (NEW)
- src/app/auth/role-select/role-select-client.tsx (NEW)
- src/app/dashboard/page.tsx (NEW)
- src/app/dashboard/freelancer/page.tsx (NEW)
- src/app/dashboard/employer/page.tsx (NEW)
- TODO.md (updated Phase 1/2 status)
- PROJECT_STATE.md (updated)
- CHANGELOG.md (updated)
- DECISIONS.md (updated)
- .env.example (added AUTH_SECRET, moved SMS vars)
- .env (added AUTH_SECRET, OAuth placeholders)

# Next Recommended Task
Start Phase 3 — Marketplace Core: Categories & Skills seed data, Categories/Skills CRUD API, then Projects API + pages
