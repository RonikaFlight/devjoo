# DevJoo — Changelog

## [0.2.0] — 2026-08-09

### Added
- **Zod Validators**: Complete validation schemas for auth, profile, project, proposal, taxonomy, common
- **Session Management**: JWT (HS256 via jose) + DB session storage, 30-day expiry, HttpOnly cookies
- **Edge-safe Session**: Split session-edge.ts (jose only) for middleware, session.ts (jose + Prisma) for API routes
- **Password Hashing**: bcryptjs with 12 salt rounds, hash/verify helpers
- **Mobile OTP**: Request (rate-limited 2/min per phone), verify (5 max attempts, 2-min expiry), resend
- **Dev Mode OTP**: Code 12345 bypasses real OTP, returned in API response
- **Google OAuth**: Code exchange, user find-or-create, OAuth account linking, session creation
- **GitHub OAuth**: Code exchange, user find-or-create, OAuth account linking, session creation
- **Auth API Routes**: 10 endpoints (otp/request, otp/verify, otp/resend, oauth/google, oauth/github, register, me, logout, password/set, password/change)
- **Auth Middleware**: JWT verification for protected routes, public route whitelist, page redirect for unauthenticated users
- **Auth Helpers**: requireAuth, requireRole, getAuthUser, isFreelancer, isEmployer, isAdmin, assignRole, findOrCreateUserByPhone, isOnboardingComplete
- **Login Page**: /auth/login with phone OTP + email/password tabs, Google/GitHub OAuth buttons, RTL Persian UI
- **Role Selection Page**: /auth/role-select with freelancer/employer cards + display name input
- **Dashboard Skeletons**: /dashboard (role-based redirect), /dashboard/freelancer, /dashboard/employer
- **Environment Config**: AUTH_SECRET generation, .env.example updated

### Decisions
- ADR-011: Custom JWT sessions over NextAuth.js
- ADR-012: Edge/Node session split for middleware compatibility

---

## [0.1.0] — 2026-08-09

### Added
- **SEO Infrastructure**: Metadata helpers (generatePageMetadata, generateFilterPageMetadata, generatePrivatePageMetadata)
- **Canonical URL helpers**: buildCanonicalUrl(), getSiteUrl()
- **JSON-LD Structured Data**: 6 generators (BreadcrumbList, Organization, WebSite, ProfilePage, Article, FAQPage, ItemList)
- **StructuredData component**: Server-side `<script type="application/ld+json">` renderer
- **Breadcrumb component**: Visual breadcrumbs with BreadcrumbList JSON-LD, RTL-aware chevron icons
- **SeoPage wrapper**: Combines structured data + breadcrumbs
- **Dynamic robots.txt**: Blocks private areas in production, blocks all in dev
- **Sitemap architecture**: sitemap-index.xml + 3 dynamic sub-sitemaps (projects, categories, blog)
- **Homepage structured data**: Organization, WebSite, ItemList (popular skills)

### Changed
- Removed static robots.txt in favor of dynamic route
- Updated TODO.md to reflect Phase 0 completion and Phase 1 progress

---

## [0.0.1] — 2026-08-09

### Added
- Project initialized with Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui
- Prisma ORM configured with SQLite
- Project directory structure created
- Project memory files created (AGENTS.md, PROJECT_STATE.md, TODO.md, SEO_PLAN.md, ARCHITECTURE.md, DATABASE.md, DESIGN_SYSTEM.md, API_STATUS.md, CHANGELOG.md, DECISIONS.md)