# DevJoo — Project Checklist

## Phase 0 — Foundation ✓

- [x] AGENTS.md
- [x] PROJECT_STATE.md
- [x] TODO.md
- [x] SEO_PLAN.md
- [x] ARCHITECTURE.md
- [x] DATABASE.md
- [x] DESIGN_SYSTEM.md
- [x] API_STATUS.md
- [x] CHANGELOG.md
- [x] DECISIONS.md
- [x] Project directory structure
- [x] Prisma schema — User, Role, Session, OAuth, Profile entities
- [x] Prisma schema — Category, Skill, UserSkill entities
- [x] Prisma schema — Project, Proposal, MatchScore entities
- [x] Prisma schema — remaining entities (notifications, messaging, etc.)
- [x] Prisma database synced
- [x] .env.example created
- [x] Shared config (site config, feature flags)
- [x] Shared utilities (currency formatting, Persian normalization)
- [x] TypeScript enum constants
- [x] Vazirmatn font self-hosted and configured
- [x] RTL layout (html lang="fa" dir="rtl")
- [x] Purple design tokens in Tailwind
- [x] Dark mode configuration
- [x] Global CSS with design tokens
- [x] Layout components (Header, Footer)
- [x] `bun run lint` passes
- [x] Dev server starts and renders
- [x] DevJoo branding visible on homepage
- [x] Browser verification passed

---

## Phase 1 — Design System + SEO Foundation ✓

- [x] Header component (logo, nav, auth actions)
- [x] Footer component
- [x] Metadata architecture (helpers for title, description, canonical, OG)
- [x] robots.txt (production-aware)
- [x] Sitemap architecture (sitemap-index + projects, categories, blog)
- [x] Canonical URL helpers
- [x] Structured data helpers (JSON-LD)
- [x] Breadcrumb component with structured data
- [x] SEO page template
- [x] Homepage structured data (Organization, WebSite, ItemList)
- [x] Zod validators for core entities

---

## Phase 2 — Authentication ✓

- [x] User database models (Phase 0)
- [x] Session management (HttpOnly cookies, JWT via jose)
- [x] Mobile OTP backend (request, verify, resend)
- [x] Mobile OTP frontend (login page with phone/email tabs)
- [x] OTP rate limiting (2 per minute, 5 attempts per code)
- [x] Google OAuth backend (code exchange + user creation)
- [x] Google OAuth frontend (button placeholder on login page)
- [x] GitHub OAuth backend (code exchange + user creation)
- [x] GitHub OAuth frontend (button placeholder on login page)
- [x] Role selection flow (/auth/role-select)
- [x] Progressive onboarding (register endpoint)
- [x] Auth API routes (otp, oauth, register, me, logout, password)
- [x] Auth middleware (JWT verification, route protection)
- [ ] Authentication tests

---

## Phase 3 — Marketplace Core

### Categories & Skills
- [ ] Categories CRUD API
- [ ] Skills CRUD API
- [ ] Category seed data
- [ ] Skill seed data (with synonyms)
- [ ] Skill synonym system

### Projects
- [ ] Project creation API
- [ ] Project listing API (with filters)
- [ ] Project detail API
- [ ] Project state machine
- [ ] Project save/bookmark API
- [ ] Project creation page
- [ ] Project listing page (/projects)
- [ ] Project detail page (/project/[slug])
- [ ] Project card component
- [ ] Project filters (category, skills, budget, etc.)
- [ ] Project search

### Proposals
- [ ] Proposal submission API
- [ ] Proposal listing (employer) API
- [ ] Proposal status workflow
- [ ] Proposal limit enforcement (max 10 qualified)
- [ ] Proposal page (freelancer)
- [ ] Proposal page (employer)

### Dashboards
- [ ] Freelancer dashboard skeleton
- [ ] Employer dashboard skeleton

---

## Phase 4 — SEO Landing Pages

- [ ] Category pages (/projects/[category])
- [ ] Skill pages (/projects/[skill])
- [ ] Hire landing pages (/hire/[skill]-developer)
- [ ] Internal linking implementation
- [ ] Breadcrumbs on all public pages
- [ ] Blog foundation

---

## Phase 5 — Trust

- [ ] Client Score (employer metrics)
- [ ] Employer verification system
- [ ] Freelancer verification system
- [ ] GitHub OAuth integration
- [ ] Portfolio system
- [ ] Review system
- [ ] Reputation score

---

## Phase 6 — Smart Features

- [ ] DevJoo Match engine
- [ ] Smart Feed (personalized)
- [ ] Reverse Hiring (employer invites)
- [ ] Project invitations
- [ ] Availability system
- [ ] Project Quality Score
- [ ] Duplicate project detection
- [ ] Hiring probability

---

## Phase 7 — Communication

- [ ] Messaging system (WebSocket)
- [ ] Notification system
- [ ] Instant project alerts
- [ ] Email job queue
- [ ] SMS job queue

---

## Phase 8 — AI

- [ ] AI Provider abstraction
- [ ] AI Project Builder
- [ ] AI Proposal Assistant

---

## Phase 9 — Analytics

- [ ] Proposal analytics
- [ ] Project analytics
- [ ] Employer metrics dashboard
- [ ] Price Radar

---

## Phase 10 — Advanced Marketplace

- [ ] Service marketplace
- [ ] Team mode
- [ ] Paid trial
- [ ] Milestones
- [ ] Contracts
- [ ] Payment abstraction

---

## Phase 11 — Admin

- [ ] Admin dashboard
- [ ] User management
- [ ] Project moderation
- [ ] Skill management
- [ ] Category management
- [ ] SEO control panel
- [ ] Content management
- [ ] Feature flag configuration

---

## Phase 12 — Production Hardening

- [ ] Security audit
- [ ] SEO audit
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Test suite
- [ ] CI pipeline
- [ ] Logging & monitoring
- [ ] Deployment documentation
