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

## Reviews
[x] POST   /api/v1/reviews — submit review (employer↔freelancer)
[x] GET    /api/v1/reviews?profileId=xxx — list received reviews
[x] GET    /api/v1/reviews/stats?profileId=xxx — review statistics

## Portfolio
[x] GET    /api/v1/portfolio — list freelancer portfolio items
[x] POST   /api/v1/portfolio — create portfolio item (max 20)
[x] PATCH  /api/v1/portfolio/[id] — update portfolio item
[x] DELETE /api/v1/portfolio/[id] — delete portfolio item
[x] POST   /api/v1/portfolio/reorder — reorder portfolio items

## Verification
[x] GET    /api/v1/verification — list user verifications + summary
[x] POST   /api/v1/verification — request verification

## Reputation
[x] GET    /api/v1/reputation?userId=xxx&type=client — employer client score
[x] GET    /api/v1/reputation?userId=xxx&type=freelancer — freelancer reputation score

## Smart Feed
[x] GET    /api/v1/feed — personalized project feed (freelancer)

## Match Engine
[x] GET    /api/v1/projects/[slug]/matches — top freelancer matches (employer)

## Invitations
[x] POST   /api/v1/projects/[slug]/invitations — invite freelancer (employer)
[x] GET    /api/v1/projects/[slug]/invitations — list project invitations (employer)
[x] GET    /api/v1/me/invitations — list received invitations (freelancer)
[x] PATCH  /api/v1/me/invitations — respond to invitation (freelancer)

## Availability
[x] GET    /api/v1/me/availability — get freelancer availability
[x] PATCH  /api/v1/me/availability — update freelancer availability

## Notifications
[x] GET    /api/v1/me/notifications — list user notifications (filters: isRead, type, pagination)
[x] PATCH  /api/v1/me/notifications — mark notifications read (single IDs or all)
[x] GET    /api/v1/me/notifications/unread — unread notification count
[x] GET    /api/v1/me/notifications/preferences — get notification preferences
[x] PUT    /api/v1/me/notifications/preferences — update notification preferences (batch)
[x] GET    /api/v1/me/notifications/stream — SSE real-time notification stream

## Messaging
[x] GET    /api/v1/conversations — list user conversations (with unread count + last message)
[x] POST   /api/v1/conversations — create or find conversation (direct or project)
[x] GET    /api/v1/conversations/[id] — conversation details
[x] GET    /api/v1/conversations/[id]/messages — list messages (auto mark-read)
[x] POST   /api/v1/conversations/[id]/messages — send message
[x] GET    /api/v1/me/messages/unread — total unread message count
