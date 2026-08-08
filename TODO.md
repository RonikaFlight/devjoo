# DevJoo — Project Checklist

## Phase 0 — Foundation

### Documentation
- [x] AGENTS.md
- [x] PROJECT_STATE.md
- [x] TODO.md
- [ ] SEO_PLAN.md
- [ ] ARCHITECTURE.md
- [ ] DATABASE.md
- [ ] DESIGN_SYSTEM.md
- [ ] API_STATUS.md
- [ ] CHANGELOG.md
- [ ] DECISIONS.md

### Infrastructure
- [x] Project directory structure
- [ ] Prisma schema — User, Role, Session, OAuth, Profile entities
- [ ] Prisma schema — Category, Skill, UserSkill entities
- [ ] Prisma schema — Project, Proposal, MatchScore entities
- [ ] Prisma schema — remaining entities (notifications, messaging, etc.)
- [ ] Prisma migration applied
- [ ] .env.example created
- [ ] Environment validation utility
- [ ] Shared types package
- [ ] Shared config (site config, feature flags)
- [ ] Shared utilities (currency formatting, Persian normalization)
- [ ] Zod validators for core entities

### Design System & RTL
- [ ] Vazirmatn font self-hosted and configured
- [ ] RTL layout (html lang="fa" dir="rtl")
- [ ] Purple design tokens in Tailwind
- [ ] Dark mode configuration
- [ ] Global CSS with design tokens
- [ ] Layout component (Header, Footer)
- [ ] RTL-aware component patterns

### Verification
- [ ] `bun run lint` passes
- [ ] `bun run build` passes (or dev server starts)
- [ ] DevJoo branding visible on homepage

---

## Phase 1 — Design System + SEO Foundation

- [ ] Header component (logo, nav, auth actions)
- [ ] Footer component
- [ ] Metadata architecture (helpers for title, description, canonical, OG)
- [ ] robots.txt (production-aware)
- [ ] Sitemap architecture
- [ ] Canonical URL helpers
- [ ] Structured data helpers (JSON-LD)
- [ ] Breadcrumb component with structured data
- [ ] SEO page template

---

## Phase 2 — Authentication

- [ ] User database models
- [ ] Session management (HttpOnly cookies)
- [ ] Mobile OTP backend
- [ ] Mobile OTP frontend
- [ ] OTP rate limiting
- [ ] Google OAuth backend
- [ ] Google OAuth frontend
- [ ] GitHub OAuth backend
- [ ] GitHub OAuth frontend
- [ ] Role selection flow
- [ ] Progressive onboarding
- [ ] Auth API routes
- [ ] Auth middleware
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
