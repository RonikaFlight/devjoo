# DevJoo — API Status

## Authentication
[x] POST /api/v1/auth/otp/request — request OTP code (rate-limited)
[x] POST /api/v1/auth/otp/verify — verify OTP, create session
[x] POST /api/v1/auth/otp/resend — resend OTP code
[x] POST /api/v1/auth/oauth/google — Google OAuth code exchange
[x] POST /api/v1/auth/oauth/github — GitHub OAuth code exchange
[x] POST /api/v1/auth/register — complete onboarding (displayName + role)
[x] GET  /api/v1/auth/me — get current user info
[x] POST /api/v1/auth/logout — destroy session
[x] POST /api/v1/auth/password/set — set password (OTP/OAuth users)
[x] POST /api/v1/auth/password/change — change password (requires current)
[ ] POST /api/v1/auth/logout-all — destroy all sessions

## Projects
[x] POST   /api/v1/projects — create project (auto slug, draft)
[x] GET    /api/v1/projects — list projects (filters, sort, pagination)
[x] GET    /api/v1/projects/[slug] — project detail
[x] PATCH  /api/v1/projects/[slug] — update draft project
[x] POST   /api/v1/projects/[slug]/publish — publish via state machine
[ ] PATCH  /api/v1/projects/[slug]/pause — pause project
[ ] GET    /api/v1/projects/[slug]/similar — similar projects
[ ] DELETE /api/v1/projects/[slug] — delete project

## Proposals
[x] POST   /api/v1/projects/[slug]/proposals — submit proposal (max 10)
[x] GET    /api/v1/projects/[slug]/proposals — employer proposal list
[x] GET    /api/v1/me/proposals — freelancer proposal list
[x] PATCH  /api/v1/proposals/[id] — update proposal status
[ ] POST   /api/v1/proposals/[id]/withdraw — withdraw proposal

## Profiles
[ ] GET    /api/v1/profiles/:username
[ ] PATCH  /api/v1/me/profile
[ ] GET    /api/v1/me/freelancer-profile
[ ] PATCH  /api/v1/me/freelancer-profile
[ ] GET    /api/v1/me/employer-profile
[ ] PATCH  /api/v1/me/employer-profile

## Skills
[x] GET    /api/v1/skills — list skills (search & category filter)
[x] GET    /api/v1/skills/[slug] — skill detail
[ ] POST   /api/v1/me/skills
[ ] DELETE /api/v1/me/skills/:id

## Categories
[x] GET    /api/v1/categories — list categories
[x] GET    /api/v1/categories/[slug] — category detail

## Search
[ ] GET    /api/v1/search?q=&category=&skills=&...

## Saved Projects
[x] POST   /api/v1/projects/[slug]/save — bookmark toggle
[ ] DELETE /api/v1/projects/[slug]/save — remove bookmark
[ ] GET    /api/v1/me/saved-projects — list saved projects

## Invitations
[ ] POST   /api/v1/projects/:id/invitations
[ ] GET    /api/v1/me/invitations
[ ] PATCH  /api/v1/invitations/:id/respond

## Notifications
[ ] GET    /api/v1/notifications
[ ] PATCH  /api/v1/notifications/:id/read
[ ] PATCH  /api/v1/notifications/read-all
[ ] GET    /api/v1/notifications/preferences
[ ] PATCH  /api/v1/notifications/preferences

## Reviews
[ ] POST   /api/v1/projects/:id/reviews
[ ] GET    /api/v1/profiles/:username/reviews
