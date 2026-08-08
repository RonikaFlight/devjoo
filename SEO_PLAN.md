# DevJoo — SEO Plan

## SEO Goals
- Rank organically for Persian freelance & tech project keywords
- Drive organic traffic from Google Iran
- Build topical authority in Persian tech freelancing niche
- Achieve Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1

## Primary Keyword Clusters

### Freelance General
| Keyword | Target Page | Priority |
|---------|-----------|----------|
| پروژه فریلنسری | / | High |
| پروژه فریلنسری برنامه نویسی | /projects | High |
| پروژه برنامه نویسی | /projects | High |
| گرفتن پروژه برنامه نویسی | / (freelancer CTA) | High |
| پروژه دورکاری | /projects | High |
| کار فریلنسری | /projects | Medium |
| سایت فریلنسری | / (brand) | High |
| فریلنسر برنامه نویس | /freelancers | High |

### Development Keywords
| Keyword | Target Page | Priority |
|---------|-----------|----------|
| پروژه طراحی سایت | /projects/frontend | High |
| پروژه فرانت اند | /projects/frontend | High |
| پروژه frontend | /projects/frontend | High |
| پروژه react | /projects/react | High |
| پروژه React | /projects/react | High |
| پروژه next js | /projects/nextjs | High |
| پروژه Next.js | /projects/nextjs | High |
| پروژه جاوا اسکریپت | /projects/javascript | Medium |
| پروژه TypeScript | /projects/typescript | Medium |
| پروژه Node.js | /projects/nodejs | Medium |
| پروژه Python | /projects/python | Medium |
| پروژه Laravel | /projects/laravel | Medium |
| پروژه وردپرس | /projects/wordpress | High |

### Design Keywords
| Keyword | Target Page | Priority |
|---------|-----------|----------|
| پروژه UI UX | /projects/ui-ux | High |
| پروژه طراحی رابط کاربری | /projects/ui-ux | High |
| پروژه طراحی وب | /projects/frontend | Medium |

### SEO Keywords
| Keyword | Target Page | Priority |
|---------|-----------|----------|
| پروژه سئو | /projects/seo | High |
| استخدام متخصص سئو | /hire/seo-specialist | High |

### Hiring Keywords
| Keyword | Target Page | Priority |
|---------|-----------|----------|
| استخدام فریلنسر | /hire | High |
| استخدام برنامه نویس | /hire | High |
| استخدام برنامه نویس فرانت اند | /hire/frontend-developer | High |
| استخدام برنامه نویس React | /hire/react-developer | High |
| استخدام برنامه نویس Next.js | /hire/nextjs-developer | High |
| استخدام برنامه نویس دورکار | /hire | Medium |
| استخدام طراح UI UX | /hire/ui-ux-designer | High |
| استخدام متخصص سئو | /hire/seo-specialist | High |

## Page Architecture

### Indexable Pages
- `/` — Homepage
- `/projects` — All projects
- `/projects/[category]` — Category projects (e.g., /projects/frontend)
- `/projects/[skill]` — Skill projects (e.g., /projects/react)
- `/project/[slug]-[shortId]` — Project detail
- `/hire` — Hire landing
- `/hire/[role]` — Hire specific role (e.g., /hire/react-developer)
- `/freelancers` — Freelancer directory
- `/freelancers/[username]` — Freelancer profile
- `/services` — Service marketplace
- `/services/[slug]-[shortId]` — Service detail
- `/blog` — Blog index
- `/blog/[slug]` — Blog post

### Noindex Pages
- `/dashboard/*`
- `/settings/*`
- `/messages/*`
- `/admin/*`
- `/auth/*`
- `/api/*`
- All pages with filter/sort parameters (use noindex,follow)

## Indexing Rules
- Only intentional keyword-targeted pages get indexed
- Filter combinations: noindex,follow
- Closed projects: keep page with "بسته شده" + related projects
- Spam/illegal/duplicate pages: 404 or 410
- No thin-content index pollution

## Canonical Rules
- All canonical URLs use production site URL from env config
- Exclude tracking parameters
- Avoid duplicate filtered versions
- Never canonicalize unrelated pages to homepage
- Stable canonicals (don't change when title edits)

## Structured Data
- **Organization** — homepage
- **WebSite** — homepage
- **BreadcrumbList** — all public pages
- **ProfilePage** — freelancer profiles
- **Article** — blog posts
- **FAQPage** — where genuinely eligible
- **Service** — service listings
- **ItemList** — project/freelancer listings
- **JobPosting** — ONLY when genuinely applicable
- NO fake AggregateRating, Review, or Salary data

## Sitemap Strategy
- Dynamic sitemap generation
- Sitemap index with separate sitemaps:
  - sitemap-projects.xml
  - sitemap-skills.xml
  - sitemap-categories.xml
  - sitemap-freelancers.xml
  - sitemap-services.xml
  - sitemap-blog.xml
- Only canonical indexable URLs
- lastmod reflects real content changes

## Internal Linking Strategy
- Project pages → related skills, category, similar projects
- Skill pages → related skills, freelancers, projects, hire pages
- Category pages → subcategories, skills, projects
- Hire pages → skill pages, freelancer profiles
- Blog posts → relevant project/skill pages
- Footer → main categories, popular skills
- No spammy footer link farms

## Blog Strategy
- SEO-focused articles targeting long-tail keywords
- Topics: how-to guides, pricing info, comparison articles
- Examples:
  - چگونه پروژه برنامه نویسی بگیریم؟
  - چگونه فریلنسر React استخدام کنیم؟
  - قیمت پروژه React چقدر است؟
  - تفاوت React و Next.js برای پروژه
- No mass-generated low-quality AI articles
- Admin-managed content

## Performance
- Server Components for SEO pages
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies
- Optimized font loading (Vazirmatn self-hosted)
- Minimal JavaScript on public pages

## Current SEO Tasks
- [ ] Metadata architecture helpers
- [ ] robots.txt (production-aware)
- [ ] Sitemap generation
- [ ] Canonical URL helpers
- [ ] Structured data helpers
- [ ] Breadcrumb component
- [ ] Homepage SEO metadata
- [ ] Category page SEO
- [ ] Skill page SEO

## Completed SEO Tasks
- (none yet)

## SEO Technical Debt
- (none yet)
