# DevJoo — Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ (production) / SQLite (development)
- A reverse proxy (Nginx/Caddy) with SSL termination
- Domain: devjoo.ir

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|--------|
| `DATABASE_URL` | Yes | Prisma database connection | `postgresql://user:pass@host:5432/devjoo` |
| `AUTH_SECRET` | Yes | JWT signing secret (32+ char random) | Generate with `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public site URL | `https://devjoo.ir` |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID | |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret | |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID | |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret | |
| `AI_API_KEY` | No | OpenAI or compatible API key | |
| `AI_BASE_URL` | No | Custom AI API base URL | `https://api.openai.com/v1` |
| `AI_MODEL` | No | AI model name | `gpt-4o-mini` |
| `LOG_LEVEL` | No | Minimum log level (debug/info/warn) | `info` |
| `FEATURE_AI_PROJECT_BUILDER_ENABLED` | No | Enable AI project builder | `true` |
| `FEATURE_AI_PROPOSAL_ASSISTANT_ENABLED` | No | Enable AI proposal assistant | `true` |
| `FEATURE_PAYMENTS_ENABLED` | No | Enable payment features | `true` |
| `FEATURE_TEAM_MODE_ENABLED` | No | Enable team mode | `true` |
| `FEATURE_MESSAGING_ENABLED` | No | Enable messaging | `true` |
| `PAYMENT_PROVIDER` | No | Payment provider name | `INTERNAL` (dev) / `ZARINPAL` / `IDPAY` |

## Database Setup (Production)

### PostgreSQL

```bash
# Switch from SQLite to PostgreSQL
# 1. Update DATABASE_URL in .env
DATABASE_URL=postgresql://devjoo:password@localhost:5432/devjoo

# 2. Generate Prisma client with PostgreSQL adapter
npm run db:generate

# 3. Run migrations
npm run db:migrate

# 4. Seed initial data
npx prisma db seed
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name description

# Apply migrations in production
npx prisma migrate deploy

# Reset database (DESTRUCTIVE)
npx prisma migrate reset
```

## Build & Run

### Development

```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

### Production Build

```bash
npm install
npm run db:generate
npm run build
npm run start
```

### Docker

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run db:generate \
    && npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone .
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://devjoo:password@db:5432/devjoo
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXT_PUBLIC_SITE_URL=https://devjoo.ir
      - NODE_ENV=production
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: devjoo
      POSTGRES_USER: devjoo
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U devjoo']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name devjoo.ir www.devjoo.ir;
    return 301 https://devjoo.ir$request_uri;
}

server {
    listen 443 ssl http2;
    server_name devjoo.ir www.devjoo.ir;

    ssl_certificate /etc/letsencrypt/live/devjoo.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/devjoo.ir/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring

### Health Check

The app exposes no dedicated health endpoint yet. Monitor:
- HTTP 200 on `GET /`
- HTTP 200 on `GET /api/v1/categories`

### Log Format

All logs are JSON-structured:

```json
{
  "timestamp": "2026-08-09T12:00:00.000Z",
  "level": "info",
  "message": "User logged in",
  "requestId": "a1b2c3d4_e5f6a7b8c9d0e1f2",
  "userId": "...",
  "path": "/api/v1/auth/otp/verify",
  "method": "POST"
}
```

### Recommended Monitoring Stack

- **Metrics**: Prometheus + Grafana
- **Logs**: Loki or ELK stack
- **Alerts**: Alertmanager (on 5xx rate > 1%, response time p99 > 3s)
- **Uptime**: UptimeRobot or BetterUptime

## First Admin User

Create the first admin user via database:

```sql
-- 1. Create ADMIN role
INSERT INTO "Role" ("id", "name", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'ADMIN', NOW(), NOW());

-- 2. Assign ADMIN role to your user
INSERT INTO "UserRole" ("userId", "roleId", "createdAt")
VALUES ('YOUR_USER_ID', (SELECT id FROM "Role" WHERE name = 'ADMIN'), NOW());
```

## Security Checklist

- [ ] `AUTH_SECRET` is a strong random value (32+ chars)
- [ ] `DATABASE_URL` uses SSL in production
- [ ] HTTPS is enforced (HSTS headers are set)
- [ ] `NODE_ENV=production` is set
- [ ] Google/GitHub OAuth credentials are configured
- [ ] `AI_API_KEY` is set if AI features are enabled
- [ ] Firewall allows only ports 80/443
- [ ] Database is not publicly accessible
- [ ] Log level is set to `info` or higher
- [ ] Rate limiting is active (built-in, per-route presets)
