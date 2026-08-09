# DevJoo — Changelog

## [0.9.0] — 2026-08-09

### Added
- **Proposal Analytics**:
  - Win rate (accepted / decided), status distribution (5 statuses)
  - Success by category (win rate + avg price per category)
  - Monthly trend (proposals, accepted, win rate per month)
  - Proposal velocity (this week, this month, last month, this year)
  - Average + median proposal price calculation
  - Dual-mode: freelancer (sent) or employer (received) based on user role
- **Project Analytics**:
  - Status distribution with percentages
  - Time-to-hire calculation (publish → first accepted proposal)
  - Category trends (projects, avg proposals, avg quality score per category)
  - Monthly breakdown (created, published, completed, avg proposals)
  - Average project quality score and proposal count
- **Employer Metrics Dashboard**:
  - Hiring funnel: projects → with proposals → shortlisted → hired → completed
  - Spend analytics by category and by month
  - Response metrics: average/median response time in hours
  - Response time buckets: under 24h, under 48h, over 48h
  - Key ratios: response rate, hire rate, completion rate
- **Price Radar** (public endpoint):
  - Market rates by category with percentile breakdowns (P25, P75, P90)
  - Market rates by skill (top 50 skills)
  - Freelancer hourly rate distribution by experience level
  - Proposal price vs project budget comparison (under/within/over budget counts)
- **Zod Validators**: analytics.ts (date range, price radar filters)
- **4 API Endpoints**:
  - GET /api/v1/me/analytics/proposals
  - GET /api/v1/me/analytics/projects
  - GET /api/v1/me/analytics/employer
  - GET /api/v1/analytics/price-radar

### Decisions
- ADR-019: On-demand analytics computation (no materialized views, compute at query time)

---

## [0.8.0] — 2026-08-09

### Added
- **AI Provider Abstraction**:
  - `AIProvider` interface for provider-agnostic AI integration
  - `OpenAIProvider` implementation supporting OpenAI and compatible APIs (Ollama, vLLM, etc.)
  - `getAIProvider()` factory with env-based config (AI_API_KEY, AI_BASE_URL, AI_MODEL)
  - `parseAIJSON<T>()` — robust JSON parser handling markdown-wrapped responses
  - `AIError` class with typed error codes (CONFIG_MISSING, PROVIDER_ERROR, PARSE_ERROR, etc.)
- **AI Project Builder**:
  - Takes employer brief (Persian/English) → generates structured project draft
  - Output: Persian title, 3+ paragraph description, skill slugs, budget (IRR), duration, experience level
  - Fetches all active skills from DB for context-aware suggestions
  - Validates generated skill slugs against DB, validates budget fields per type
  - POST /api/v1/ai/build-project (employer-only, feature-flag + AI config gated)
- **AI Proposal Assistant**:
  - Takes project + freelancer profile → generates personalized proposal
  - Output: Persian cover letter (2-4 paragraphs), suggested price, duration, 3-5 key points
  - Builds rich context: freelancer skills, portfolio, ratings, availability + project details, employer info
  - Security: freelancer can only generate proposals for themselves
  - POST /api/v1/ai/generate-proposal (auth required, feature-flag + AI config gated)
- **Zod Validators**: ai.ts (buildProjectSchema, generateProposalSchema)
- **Environment Config**: AI_API_KEY, AI_BASE_URL, AI_MODEL, AI_MAX_TOKENS, AI_TEMPERATURE, FEATURE_AI_PROJECT_BUILDER_ENABLED, FEATURE_AI_PROPOSAL_ASSISTANT_ENABLED

### Decisions
- ADR-018: Provider-agnostic AI with structured output parsing (transient results, no DB persistence)

---

## [0.7.0] — 2026-08-09

### Added
- **Messaging System**:
  - Prisma models: Conversation, ConversationMember, Message
  - Messaging service: findOrCreateConversation, listConversations (with unread count + last message), getConversation, sendMessage, listMessages (auto mark-read), getUnreadMessageCount
  - Conversation types: DIRECT, PROJECT, GROUP
  - Message types: TEXT, SYSTEM, FILE, PROPOSAL_REFERENCE, PROJECT_REFERENCE
  - GET/POST /api/v1/conversations
  - GET /api/v1/conversations/[id]
  - GET/POST /api/v1/conversations/[id]/messages
  - GET /api/v1/me/messages/unread
- **Notification System**:
  - Notification service: create, createBatch, list, markRead (single/all), getUnreadCount, getPreferences, initializeDefaults, updatePreferences (batch upsert)
  - 12 notification types: PROJECT_PUBLISHED, PROPOSAL_RECEIVED, PROPOSAL_STATUS_CHANGED, INVITATION_RECEIVED, INVITATION_RESPONDED, REVIEW_RECEIVED, VERIFICATION_STATUS_CHANGED, MESSAGE_RECEIVED, PROJECT_STATUS_CHANGED, PAYMENT_RECEIVED, MILESTONE_COMPLETED, SYSTEM
  - 4 notification channels: IN_APP, EMAIL, SMS, PUSH
  - Preference-aware: checks NotificationPreference before creating notifications
  - GET/PATCH /api/v1/me/notifications
  - GET /api/v1/me/notifications/unread
  - GET/PUT /api/v1/me/notifications/preferences
- **Notification Dispatcher** (event-driven, non-blocking):
  - dispatchProjectPublished: notifies freelancers with matching skills
  - dispatchProposalReceived: notifies employer
  - dispatchProposalStatusChanged: notifies freelancer
  - dispatchInvitationReceived: notifies freelancer
  - dispatchInvitationResponded: notifies employer
  - dispatchReviewReceived: notifies reviewee
  - dispatchMessageReceived: notifies other conversation members
  - dispatchProjectStatusChanged: notifies all proposaled freelancers
- **Instant Project Alerts**: integrated into project publish flow
- **Email Job Queue**: in-process queue with enqueueEmail/processEmailQueue (console log in dev)
- **SMS Job Queue**: in-process queue with enqueueSms/processSmsQueue (console log in dev)
- **SSE Endpoint**: GET /api/v1/me/notifications/stream for real-time notification push (3s polling)
- **New Enums**: CONVERSATION_TYPE, MESSAGE_TYPE, NOTIFICATION_TYPE, NOTIFICATION_CHANNEL + Persian labels
- **Zod Validators**: conversation.ts, message.ts, notification.ts

### Decisions
- ADR-017: Event-driven notification dispatch (non-blocking, centralized dispatcher, in-process queues)

### Changed
- Project publish now dispatches notifications to matching freelancers
- Proposal submit/status change now dispatches notifications
- Invitation create/respond now dispatches notifications
- Review create now dispatches notifications
- Message send now dispatches notifications to other members

---

## [0.6.0] — 2026-08-09

### Added
- **Match Engine**:
  - Multi-signal scoring: skill overlap (0-40), budget fit (0-20), availability fit (0-15), experience fit (0-10), reputation bonus (0-15)
  - Skill overlap considers proficiency level weights (BEGINNER: 0.6 → EXPERT: 1.0)
  - Budget fit compares freelancer hourly rate against project budget range
  - `getProjectMatches()`: top N matches for employer reverse hiring
  - `computeAndStoreMatches()`: persist MatchScore records after publish
  - `getFreelancerMatchScores()`: retrieve stored matches for freelancer feed
- **Smart Feed**:
  - Personalized project ranking for freelancers based on skill overlap + quality score + recency
  - Excludes already-proposed projects
  - Quick inline scoring for feed ranking (no per-item DB calls)
  - Urgent projects get a small boost
  - GET /api/v1/feed (freelancer-only, uses project filters)
- **Project Invitations**:
  - Invitation service: create (employer→freelancer), respond (accept/decline), list project, list freelancer
  - Duplicate prevention: checks existing invitations and proposals
  - Zod validators: invitationCreateSchema, invitationRespondSchema, invitationFiltersSchema
  - GET/POST /api/v1/projects/[slug]/invitations (employer)
  - GET/PATCH /api/v1/me/invitations (freelancer)
- **Availability System**:
  - GET/PATCH /api/v1/me/availability (freelancer-only)
  - Update availability status (AVAILABLE/LIMITED/BUSY/UNAVAILABLE), hours per week, available date
  - Availability affects match engine scoring
- **Project Quality Score**:
  - `computeProjectQualityScore()`: 0-100 based on description length, skills count, budget, category, experience level, deadline, duration, title quality
  - Auto-computed and stored when project is published (integrated into transitionProjectStatus)
  - Used by smart feed for ranking
- **Duplicate Project Detection**:
  - `detectDuplicateProject()`: bigram-based string similarity on title + description
  - Checks employer's recent projects (7 days) for 85%+ title or combined title+description similarity
  - Persian-normalized comparison via normalizePersian()
- **Hiring Probability**:
  - `estimateHiringProbability()`: 0-100 based on match score (35), competition factor (20), freelancer reputation (20), portfolio (10), verifications (5), client score (10)
- **INVITATION_STATUS_LABELS**: Persian labels for invitation statuses

### Decisions
- ADR-016: Match Engine is on-demand computation (no pre-computed scores at scale)

### Changed
- Project publish now auto-computes and stores qualityScore on the Project model
- Project service imports quality scoring from matching module

---

## [0.5.0] — 2026-08-09

### Added
- **Portfolio System**:
  - Zod validators: portfolioCreateSchema, portfolioUpdateSchema, portfolioReorderSchema
  - Portfolio service: CRUD, reorder, max 20 items per freelancer
  - Portfolio API: GET/POST /api/v1/portfolio, PATCH/DELETE /api/v1/portfolio/[id], POST /api/v1/portfolio/reorder
  - Portfolio frontend: /dashboard/freelancer/portfolio with create/edit/delete dialog, image preview, empty state
- **Review System**:
  - Zod validators: reviewCreateSchema, reviewFiltersSchema, reviewReplySchema
  - Review service: create (employer↔freelancer), list received, review stats with category averages and rating distribution
  - Reviews API: GET/POST /api/v1/reviews, GET /api/v1/reviews/stats
- **Verification System**:
  - Zod validators: verificationRequestSchema, verificationUpdateSchema
  - Verification service: request (freelancer/employer), list, summary, admin update status
  - Verification API: GET/POST /api/v1/verification
- **Client Score (Employer Metrics)**:
  - getClientScore: totalPosted, totalHired, hireRate, responseRate, averageResponseTimeHours, totalSpentRial, verifications
  - computeClientScore: 0-100 numeric score (weighted: hire rate, rating, reviews, spend, verifications, response rate)
  - refreshEmployerMetrics: updates EmployerProfile counters after project status changes
- **Freelancer Reputation**:
  - getFreelancerReputation: totalCompletedProjects, totalHires, averageRating, responseRate, verifications, repeatHireRate
  - computeReputationScore: 0-100 numeric score (weighted: rating, completion, reviews, verifications, repeat hire, response rate)
  - refreshFreelancerMetrics: updates FreelancerProfile counters
- **New Enums & Labels**: VERIFICATION_TYPE_LABELS, VERIFICATION_STATUS_LABELS, COMPANY_SIZE, COMPANY_SIZE_LABELS, PROFICIENCY_LEVEL, PROFICIENCY_LEVEL_LABELS, REVIEW_CATEGORIES
- **Dashboard Update**: Freelancer dashboard now links to portfolio page

### Decisions
- ADR-015: On-read reputation computation (no cached scores table — compute on demand, can add caching layer later)

---

## [0.4.0] — 2026-08-09

### Added
- **Categories Index Page**: /categories — grid of 10 categories with icons, skill counts, project counts, SEO breadcrumbs, internal linking
- **Category Project Pages**: /projects/[slug] — projects filtered by category, skill sub-filter bar, search, pagination, SEO metadata from seoTitle/seoDescription
- **Skill Project Pages**: /projects/skills/[slug] — projects filtered by skill name, related skills section, hire CTA, synonym display, generateStaticParams for all 75 skills
- **Hire Landing Page**: /hire — categorized hire links, popular hire links by skill, category grid, employer CTA
- **Hire Role Pages**: /hire/[role] — 15 SEO-optimized role-specific pages (react-developer, nextjs-developer, seo-specialist, ui-ux-designer, etc.) with how-it-works, benefits, related skills
- **Blog Foundation**: /blog — empty state with internal linking to projects and categories
- **Internal Linking**:
  - Project detail: skills link to /projects/skills/[slug], category link to /projects/[slug]
  - Project detail: breadcrumbs include category when available
  - Footer: skill links to /projects/skills/[slug], added categories column
  - Homepage: popular skills link to /projects/skills/[slug] (was /projects/[slug])
- **Sitemap**: Updated sitemap-categories.xml with /categories, /hire, all /projects/skills/*, all /hire/* pages
- **Breadcrumb Fix**: Unique keys for breadcrumb items (fixed React key warning)

### Changed
- Homepage popular skills now link to /projects/skills/[slug] instead of /projects/[slug]
- Footer popular skills now link to skill pages with "پروژه‌های" prefix
- Fixed sitemap skill URLs from /projects/[slug] to /projects/skills/[slug]

---

## [0.3.0] — 2026-08-09

### Added
- **Seed Data**: 10 categories, 75 skills, 93 synonyms (Persian tech market)
- **Categories API**: GET /api/v1/categories (list), GET /api/v1/categories/[slug] (detail)
- **Skills API**: GET /api/v1/skills (with search & category filter), GET /api/v1/skills/[slug] (detail)
- **Project API**:
  - POST /api/v1/projects — create project with auto slug generation
  - GET /api/v1/projects — list with filters, sort, pagination
  - GET /api/v1/projects/[slug] — project detail
  - PATCH /api/v1/projects/[slug] — update draft project
  - POST /api/v1/projects/[slug]/publish — publish via state machine (DRAFT → PENDING_APPROVAL)
- **Proposal API**:
  - POST /api/v1/projects/[slug]/proposals — submit proposal (max 10 per project)
  - GET /api/v1/projects/[slug]/proposals — employer proposal list
  - PATCH /api/v1/proposals/[id] — proposal status update
  - GET /api/v1/me/proposals — freelancer proposal list
- **Saved Projects**: POST /api/v1/projects/[slug]/save — bookmark toggle
- **Frontend**:
  - ProjectCard shared component (reusable project card with RTL design)
  - /projects page with category filter bar and pagination
  - /project/[slug] detail page with SEO breadcrumbs
- **Dashboard Skeletons**: /dashboard (role-based redirect), /dashboard/freelancer, /dashboard/employer
- **Module Service Layer**: projects/service.ts, proposals/service.ts

### Decisions
- ADR-013: Module-based service layer architecture

---

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