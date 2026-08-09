# Project
DevJoo

# Current Phase
Phase 8 — AI (READY TO START)

# Last Completed Task
Phase 7 Communication: Messaging (conversations + messages REST API, 6 endpoints), Notification system (12 types, 4 channels, preferences), Event dispatcher (8 dispatchers integrated into proposals/invitations/reviews/messages/project publish), SSE real-time stream, Email/SMS in-process job queues, ADR-017

# Currently Working On
None — Phase 7 complete, ready for Phase 8

# Completed Features
- Phase 0 complete (see below)
- Phase 1 complete: SEO infrastructure, structured data, sitemaps, Zod validators
- Phase 2 complete: Full authentication system (see below)
- Phase 3 complete: Marketplace core — seed data, categories/skills/projects/proposals APIs, project pages, dashboard skeletons (see below)
- Phase 4 complete: SEO landing pages — category/skill/hire pages, internal linking, blog foundation (see below)
- Phase 5 complete: Trust — portfolio, reviews, verification, client score, reputation (see below)
- Phase 6 complete: Smart features — match engine, smart feed, invitations, availability, quality score, duplicate detection, hiring probability (see below)
- Phase 7 complete: Communication — messaging, notifications, dispatcher, SSE stream, job queues (see below)

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

## Phase 5 Completed
- Portfolio service: CRUD (max 20 items), reorder, ownership checks
- Portfolio API: GET/POST /api/v1/portfolio, PATCH/DELETE /api/v1/portfolio/[id], POST /api/v1/portfolio/reorder
- Portfolio frontend: /dashboard/freelancer/portfolio with create/edit/delete dialog, image preview, empty state, grid layout
- Review service: create (employer↔freelancer for completed projects), list received, stats (distribution + category averages)
- Reviews API: GET/POST /api/v1/reviews, GET /api/v1/reviews/stats
- Verification service: request (freelancer/employer), list, summary badges, admin status update
- Verification API: GET/POST /api/v1/verification
- Client Score: getClientScore (employer metrics), computeClientScore (0-100 weighted), refreshEmployerMetrics
- Freelancer Reputation: getFreelancerReputation, computeReputationScore (0-100 weighted), refreshFreelancerMetrics
- Reputation API: GET /api/v1/reputation?type=client|freelancer
- Zod validators: portfolio.ts, review.ts, verification.ts
- New enums: VERIFICATION_TYPE_LABELS, VERIFICATION_STATUS_LABELS, COMPANY_SIZE, PROFICIENCY_LEVEL, REVIEW_CATEGORIES
- ADR-015: On-read reputation computation

## Phase 6 Completed
- Match Engine: 5-signal scoring (skill overlap 40, budget fit 20, availability 15, experience 10, reputation 15)
- Match API: GET /api/v1/projects/[slug]/matches (employer reverse hiring)
- computeAndStoreMatches() for persisting MatchScore records
- Smart Feed: personalized project ranking with skill overlap + quality + recency, excludes already-proposed
- Feed API: GET /api/v1/feed (freelancer-only, supports all project filters)
- Project Invitations: create (employer), respond (freelancer), list project, list freelancer, duplicate prevention
- Invitation API: GET/POST /api/v1/projects/[slug]/invitations, GET/PATCH /api/v1/me/invitations
- Availability System: GET/PATCH /api/v1/me/availability (freelancer-only)
- Project Quality Score: computeProjectQualityScore() (description, skills, budget, category, deadline, title), auto-computed on publish
- Duplicate Detection: detectDuplicateProject() (bigram similarity, Persian-normalized, 7-day window)
- Hiring Probability: estimateHiringProbability() (match 35, competition 20, reputation 20, portfolio 10, verifications 5, client 10)
- Zod validators: invitation.ts, availability.ts
- INVITATION_STATUS_LABELS: Persian labels
- ADR-016: On-demand match computation

## Phase 7 Completed
- Messaging: Conversation, ConversationMember, Message Prisma models
- Messaging service: findOrCreateConversation, listConversations (unread count + last message), getConversation, sendMessage, listMessages (auto mark-read), getUnreadMessageCount
- Messaging API: GET/POST /api/v1/conversations, GET /api/v1/conversations/[id], GET/POST /api/v1/conversations/[id]/messages, GET /api/v1/me/messages/unread
- Notification service: create, createBatch, list, markRead (single/all), getUnreadCount, getPreferences, initializeDefaults, updatePreferences (batch upsert)
- Notification API: GET/PATCH /api/v1/me/notifications, GET /api/v1/me/notifications/unread, GET/PUT /api/v1/me/notifications/preferences
- SSE endpoint: GET /api/v1/me/notifications/stream (3s polling, real-time notification push)
- Notification dispatcher: 8 event handlers (project published, proposal received/status, invitation received/responded, review received, message received, project status changed)
- Dispatcher integrated into: projects/service.ts, proposals/service.ts, invitations/service.ts, reviews/service.ts, messaging/service.ts
- Instant project alerts: on publish, notifies freelancers with matching skills
- Email job queue: in-process enqueueEmail/processEmailQueue (console log in dev)
- SMS job queue: in-process enqueueSms/processSmsQueue (console log in dev)
- New enums: CONVERSATION_TYPE, MESSAGE_TYPE, NOTIFICATION_TYPE, NOTIFICATION_CHANNEL + Persian labels
- Zod validators: conversation.ts, message.ts, notification.ts
- ADR-017: Event-driven notification dispatch

# Partially Completed Features
- None

# Pending Features
- Phase 8-12: See TODO.md

# Important Architecture Decisions
- ADR-001 through ADR-011 (see DECISIONS.md)
- ADR-012: Edge-safe session split (see DECISIONS.md)
- ADR-013: Module-based service layer architecture (see DECISIONS.md)
- ADR-014: URL structure for SEO landing pages (see DECISIONS.md)
- ADR-015: On-read reputation computation (see DECISIONS.md)
- ADR-016: On-demand match computation (see DECISIONS.md)
- ADR-017: Event-driven notification dispatch (see DECISIONS.md)

# Database Status
- Prisma schema: 33 models defined (added Conversation, ConversationMember, Message)
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
- POST /api/v1/projects/[slug]/publish — working (auto-computes qualityScore + dispatches notifications)
- POST /api/v1/projects/[slug]/proposals — working (dispatches notification to employer)
- GET /api/v1/projects/[slug]/proposals — working
- PATCH /api/v1/proposals/[id] — working (dispatches notification to freelancer)
- GET /api/v1/me/proposals — working
- POST /api/v1/projects/[slug]/save — working
- GET /api/v1/reviews — working (dispatches notification to reviewee)
- POST /api/v1/reviews — working
- GET /api/v1/reviews/stats — working
- GET /api/v1/portfolio — working (auth required)
- POST /api/v1/portfolio — working (auth required)
- PATCH /api/v1/portfolio/[id] — working (auth required)
- DELETE /api/v1/portfolio/[id] — working (auth required)
- POST /api/v1/portfolio/reorder — working (auth required)
- GET /api/v1/verification — working (auth required)
- POST /api/v1/verification — working (auth required)
- GET /api/v1/reputation — working
- GET /api/v1/feed — working (auth required, freelancer only)
- GET /api/v1/projects/[slug]/matches — working (auth required, employer only)
- POST /api/v1/projects/[slug]/invitations — working (auth required, employer only, dispatches notification)
- GET /api/v1/projects/[slug]/invitations — working (auth required, employer only)
- GET /api/v1/me/invitations — working (auth required)
- PATCH /api/v1/me/invitations — working (auth required, dispatches notification)
- GET /api/v1/me/availability — working (auth required, freelancer only)
- PATCH /api/v1/me/availability — working (auth required, freelancer only)
- GET /api/v1/conversations — working (auth required)
- POST /api/v1/conversations — working (auth required)
- GET /api/v1/conversations/[id] — working (auth required)
- GET /api/v1/conversations/[id]/messages — working (auth required)
- POST /api/v1/conversations/[id]/messages — working (auth required, dispatches notification)
- GET /api/v1/me/messages/unread — working (auth required)
- GET /api/v1/me/notifications — working (auth required)
- PATCH /api/v1/me/notifications — working (auth required)
- GET /api/v1/me/notifications/unread — working (auth required)
- GET /api/v1/me/notifications/preferences — working (auth required)
- PUT /api/v1/me/notifications/preferences — working (auth required)
- GET /api/v1/me/notifications/stream — working (auth required, SSE)

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
- /dashboard/freelancer/portfolio — portfolio management page

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
- Implemented (Phase 6): on-demand match scoring, smart feed, hiring probability

# Notification Status
- Implemented (Phase 7): 12 types, 4 channels, preference-aware, SSE stream, event dispatcher

# Messaging Status
- Implemented (Phase 7): REST-based, conversations + messages, auto mark-read

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
- Reputation scores computed on-read (see ADR-015 — acceptable for now)
- Match scores computed on-demand (see ADR-016 — acceptable for now)
- Notification SSE uses polling (3s) — adequate for dev, needs Redis Pub/Sub for production (see ADR-017)
- Email/SMS queues are in-memory — lost on server restart (acceptable until production)

# Blockers
- None

# Last Successful Commands
- bun run lint ✓
- npx prisma db push ✓
- npx prisma generate ✓

# Recently Modified Files
- prisma/schema.prisma (UPDATED — added Conversation, ConversationMember, Message models)
- src/types/enums.ts (UPDATED — communication + notification enums + labels)
- src/lib/validators/conversation.ts (NEW)
- src/lib/validators/message.ts (NEW)
- src/lib/validators/notification.ts (NEW)
- src/lib/validators/index.ts (UPDATED)
- src/modules/messaging/service.ts (NEW)
- src/modules/notifications/service.ts (NEW)
- src/modules/notifications/dispatcher.ts (NEW)
- src/modules/projects/service.ts (UPDATED — dispatch on publish/status change)
- src/modules/proposals/service.ts (UPDATED — dispatch on submit/status change)
- src/modules/invitations/service.ts (UPDATED — dispatch on create/respond)
- src/modules/reviews/service.ts (UPDATED — dispatch on create)
- src/app/api/v1/conversations/route.ts (NEW)
- src/app/api/v1/conversations/[id]/route.ts (NEW)
- src/app/api/v1/conversations/[id]/messages/route.ts (NEW)
- src/app/api/v1/me/messages/unread/route.ts (NEW)
- src/app/api/v1/me/notifications/route.ts (NEW)
- src/app/api/v1/me/notifications/unread/route.ts (NEW)
- src/app/api/v1/me/notifications/preferences/route.ts (NEW)
- src/app/api/v1/me/notifications/stream/route.ts (NEW)
- TODO.md (UPDATED — Phase 7 marked complete)
- CHANGELOG.md (UPDATED — v0.7.0)
- DECISIONS.md (UPDATED — ADR-017)
- API_STATUS.md (UPDATED — 12 new endpoints)

# Next Recommended Task
Start Phase 8 — AI: AI Provider abstraction, AI Project Builder, AI Proposal Assistant
