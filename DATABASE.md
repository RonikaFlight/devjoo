# DevJoo — Database Design

## ORM
- **Prisma ORM** (latest stable)
- **Dev**: SQLite
- **Production**: PostgreSQL

## Design Principles
- UUID identifiers (cuid() in SQLite, uuid in PostgreSQL)
- Timestamps: `createdAt`, `updatedAt` on all entities
- Soft deletes (`deletedAt`) only where business-required
- Money stored as integers in IRR (Rial), never floating point
- Proper indexes based on query patterns

## Entities

### Core Auth
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| User | Base user | id, email, phone, passwordHash, createdAt |
| Role | Available roles | id, name (FREELANCER, EMPLOYER, ADMIN, MODERATOR) |
| UserRole | User-role mapping | userId, roleId |
| Session | Auth sessions | id, userId, token, expiresAt, ip, userAgent |
| OAuthAccount | OAuth links | id, userId, provider, providerAccountId |
| OtpRequest | OTP verification | id, phone, codeHash, expiresAt, attempts |

### Profiles
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| Profile | Base profile | id, userId, displayName, bio, avatarUrl, createdAt |
| FreelancerProfile | Freelancer details | id, profileId, headline, hourlyRateRial, availability, experienceLevel, selfDeclaredLevel, calculatedLevel |
| EmployerProfile | Employer details | id, profileId, companyName, companySize, industry, websiteUrl |

### Taxonomy
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| Category | Skill categories | id, name, slug, parentId, description, seoTitle, seoDescription |
| Skill | Available skills | id, name, slug, categoryId, icon |
| SkillSynonym | Search aliases | id, skillId, name, normalized |
| UserSkill | User's skills | id, userId, skillId, proficiencyLevel, isVerified, verifiedAt |
| SkillVerification | Verification records | id, userSkillId, source, evidence, verifiedAt |

### Projects
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| Project | Main project | id, employerId, title, slug, description, categoryId, budgetType, budgetMinRial, budgetMaxRial, status, proposalLimit, currentProposalCount, deadline, experienceLevel, workType, city |
| ProjectSkill | Project skills | id, projectId, skillId |
| ProjectStatusEvent | Status history | id, projectId, status, actorId, metadata |
| SavedProject | Bookmarks | id, userId, projectId |

### Proposals
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| Proposal | Freelancer proposal | id, projectId, freelancerId, priceRial, estimatedDuration, coverLetter, status |
| ProposalStatusEvent | Status history | id, proposalId, status, actorId |

### Matching
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| MatchScore | Match results | id, projectId, freelancerId, score, breakdownJson |

### Portfolios & Verification
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| PortfolioItem | Work samples | id, freelancerId, title, description, imageUrl, projectUrl, order |
| GithubConnection | GitHub links | id, userId, githubId, username, accessToken (enc) |
| GithubRepository | Repos | id, connectionId, name, description, language, stars, url |
| EmployerVerification | Employer verification | id, employerId, type, status, verifiedAt |
| FreelancerVerification | Freelancer verification | id, freelancerId, type, status, verifiedAt |

### Reviews & Reputation
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| Review | User reviews | id, projectId, reviewerId, revieweeId, rating, categoriesJson, comment, isHidden |
| ReputationScore | Computed reputation | id, userId, score, signalsJson |

### Communication
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| Conversation | Conversations | id, type, createdAt |
| ConversationMember | Members | id, conversationId, userId, lastReadAt |
| Message | Messages | id, conversationId, senderId, content, type, readAt |

### Notifications
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| Notification | Notifications | id, userId, type, title, body, dataJson, isRead |
| NotificationPreference | User prefs | id, userId, type, channel, enabled |

### Services
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| ServiceListing | Predefined services | id, freelancerId, title, slug, description, priceRial, deliveryDays, revisions |
| ServiceOrder | Service orders | id, serviceId, employerId, status, priceRial |

### Teams
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| Team | Freelancer teams | id, name, slug, description, leaderId |
| TeamMember | Team members | id, teamId, userId, role |

### Contracts & Payments
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| Contract | Contracts | id, projectId, freelancerId, employerId, status, amountRial |
| Milestone | Milestones | id, contractId, title, amountRial, status, dueDate |
| Payment | Payments | id, contractId, amountRial, status, provider |
| PaymentTransaction | Transactions | id, paymentId, provider, externalId, status |

### Analytics
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| ProjectView | View tracking | id, projectId, userId (nullable), ip, userAgent |
| ProfileView | View tracking | id, profileId, userId (nullable), ip, userAgent |
| ProposalAnalytics | Proposal stats | id, proposalId, viewedAt, shortlistedAt |

### Admin & Audit
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| Report | User reports | id, reporterId, targetType, targetId, reason, description, status |
| ModerationAction | Mod actions | id, reportId, moderatorId, action, note |
| AuditLog | Audit trail | id, actorId, action, resourceType, resourceId, metadataJson |

### Content
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| BlogPost | Blog articles | id, title, slug, excerpt, body, coverUrl, categoryId, authorId, publishedAt |
| BlogCategory | Blog categories | id, name, slug |
| SeoLandingPage | Custom SEO pages | id, path, title, body, seoMetadataJson |
| Redirect | URL redirects | id, fromPath, toPath, type (301/302) |

## Key Indexes
- Projects: status, categoryId, createdAt, slug
- Proposals: projectId, freelancerId, status
- Skills: slug, name
- Categories: slug, parentId
- Users: email, phone
- Notifications: userId, isRead

## Money Handling
- All monetary values stored as integers in IRR (Rial)
- Field naming: `budgetMinRial`, `budgetMaxRial`, `priceRial`, `amountRial`
- Frontend displays تومان (divide by 10) when appropriate
- Centralized currency formatting utility

## Deletion Strategy
- Soft delete (deletedAt) for: Users, Projects, Profiles
- Hard delete for: Sessions, OtpRequests, Notifications (old)
- Cascade rules in Prisma schema