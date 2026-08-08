# Project
DevJoo

# Current Phase
Phase 1 — Design System + SEO Foundation (NEARLY COMPLETE)

# Last Completed Task
SEO infrastructure: metadata helpers, robots.txt route, sitemap-index + 3 dynamic sitemaps, JSON-LD structured data helpers (6 types), Breadcrumb component, SEO page template, homepage structured data integration

# Currently Working On
Finalizing Phase 1 (Zod validators remaining)

# Completed Features
- Phase 0 complete (see below)
- SEO metadata helper: generatePageMetadata() with full OG, Twitter, robots
- SEO filter page helper: generateFilterPageMetadata() (noindex, follow)
- SEO private page helper: generatePrivatePageMetadata() (noindex, nofollow)
- Canonical URL helper: buildCanonicalUrl()
- 6 JSON-LD structured data generators: BreadcrumbList, Organization, WebSite, ProfilePage, Article, FAQPage, ItemList
- StructuredData React component (server-side rendering)
- Breadcrumb component with BreadcrumbList JSON-LD, RTL chevron icons
- SeoPage wrapper component
- Dynamic robots.txt (blocks /api/, /dashboard/, /admin/, /auth/, /settings/, /messages/ in production; blocks all in dev)
- Dynamic sitemap-index.xml referencing 3 sub-sitemaps
- Dynamic sitemap-projects.xml (queries published projects)
- Dynamic sitemap-categories.xml (queries categories + skills)
- Dynamic sitemap-blog.xml (queries published posts)
- Homepage integrated with Organization, WebSite, ItemList structured data

## Phase 0 Completed
- All 10 project memory files
- Prisma schema with 30+ models
- Database synced and Prisma client generated
- TypeScript enum constants with Persian labels
- Site configuration, feature flags
- Currency formatting, Persian normalization utilities
- Vazirmatn font, purple design tokens, dark mode, RTL
- Header, Footer, Homepage with hero/search/skills/differentiators/CTA

# Partially Completed Features
- Zod validators for core entities (not yet created)

# Pending Features
- Phase 2: Authentication
- Phase 3-12: See TODO.md

# Important Architecture Decisions
- ADR-001 through ADR-010 (see DECISIONS.md)

# Database Status
- Prisma schema: 30+ models defined
- SQLite database: synced
- Seed data: not yet created

# API Status
- No API routes implemented

# Frontend Status
- Next.js 16 App Router, RTL, Vazirmatn, purple design, dark mode
- Header + Footer + Homepage
- Breadcrumb component, SeoPage template

# SEO Status
- Homepage metadata configured
- robots.txt: dynamic route (production-aware)
- Sitemap: sitemap-index.xml + 3 dynamic sub-sitemaps
- Structured data: Organization, WebSite, ItemList on homepage
- Breadcrumbs: component ready
- Metadata helpers: generatePageMetadata, generateFilterPageMetadata
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
- None

# Blockers
- None

# Last Successful Commands
- bun run lint ✓
- dev server: HTTP 200 ✓
- /robots.txt: dynamic, dev blocks all ✓
- /sitemap-index.xml: valid XML ✓
- /sitemap-projects.xml: valid XML ✓
- /sitemap-categories.xml: valid XML ✓
- /sitemap-blog.xml: valid XML ✓
- 3 JSON-LD scripts on homepage ✓
- browser verification: passed ✓

# Recently Modified Files
- src/lib/seo/metadata.ts (NEW)
- src/lib/seo/canonical.ts (NEW)
- src/lib/seo/structured-data.ts (NEW)
- src/components/seo/structured-data.tsx (NEW)
- src/components/seo/breadcrumbs.tsx (NEW)
- src/components/seo/seo-page.tsx (NEW)
- src/app/robots.txt/route.ts (NEW)
- src/app/sitemap-index.xml/route.ts (NEW)
- src/app/sitemap-projects.xml/route.ts (NEW)
- src/app/sitemap-categories.xml/route.ts (NEW)
- src/app/sitemap-blog.xml/route.ts (NEW)
- src/app/page.tsx (updated with structured data)
- TODO.md (updated Phase 0/1 status)

# Next Recommended Task
Complete Zod validators for core entities, then start Phase 2 (Authentication — Instant Join with OTP, Google OAuth, GitHub OAuth)