# DevJoo — API Status

## Authentication
[ ] POST /api/v1/auth/send-otp
[ ] POST /api/v1/auth/verify-otp
[ ] GET  /api/v1/auth/google
[ ] GET  /api/v1/auth/google/callback
[ ] GET  /api/v1/auth/github
[ ] GET  /api/v1/auth/github/callback
[ ] POST /api/v1/auth/logout
[ ] POST /api/v1/auth/logout-all
[ ] GET  /api/v1/auth/me
[ ] POST /api/v1/auth/select-role

## Projects
[ ] GET    /api/v1/projects
[ ] GET    /api/v1/projects/:id
[ ] POST   /api/v1/projects
[ ] PATCH  /api/v1/projects/:id
[ ] DELETE /api/v1/projects/:id
[ ] POST   /api/v1/projects/:id/publish
[ ] POST   /api/v1/projects/:id/pause
[ ] GET    /api/v1/projects/:id/similar

## Proposals
[ ] POST   /api/v1/projects/:id/proposals
[ ] GET    /api/v1/projects/:id/proposals (employer)
[ ] GET    /api/v1/me/proposals (freelancer)
[ ] PATCH  /api/v1/proposals/:id/status (employer)
[ ] POST   /api/v1/proposals/:id/withdraw (freelancer)

## Profiles
[ ] GET    /api/v1/profiles/:username
[ ] PATCH  /api/v1/me/profile
[ ] GET    /api/v1/me/freelancer-profile
[ ] PATCH  /api/v1/me/freelancer-profile
[ ] GET    /api/v1/me/employer-profile
[ ] PATCH  /api/v1/me/employer-profile

## Skills
[ ] GET    /api/v1/skills
[ ] GET    /api/v1/skills/:slug
[ ] POST   /api/v1/me/skills
[ ] DELETE /api/v1/me/skills/:id

## Categories
[ ] GET    /api/v1/categories
[ ] GET    /api/v1/categories/:slug

## Search
[ ] GET    /api/v1/search?q=&category=&skills=&...

## Saved Projects
[ ] POST   /api/v1/projects/:id/save
[ ] DELETE /api/v1/projects/:id/save
[ ] GET    /api/v1/me/saved-projects

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
