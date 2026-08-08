# DevJoo — Changelog

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