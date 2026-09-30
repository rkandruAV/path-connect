# PathConnect - Technical Design Document

## 1. Architecture Overview

PathConnect uses a **layered client-server architecture** organized as a Turborepo monorepo.

```
                    ┌─────────────┐
                    │   Firebase   │
                    │  Auth (JWT)  │
                    └──────┬──────┘
                           │ ID Token
┌──────────────────────────┼──────────────────────────┐
│                          │                          │
│  ┌───────────┐    ┌──────┴──────┐    ┌───────────┐ │
│  │  Vercel   │    │   Render    │    │ Supabase  │ │
│  │           │───▶│             │───▶│           │ │
│  │  Next.js  │    │  Express.js │    │ PostgreSQL│ │
│  │ Frontend  │    │   API       │    │           │ │
│  └───────────┘    └──────┬──────┘    └───────────┘ │
│                          │                          │
│                    ┌─────┴─────┐                    │
│                    │           │                    │
│              ┌─────┴──┐  ┌────┴────┐               │
│              │ Dify   │  │  Redis  │               │
│              │ Cloud  │  │ (cache) │               │
│              │ (AI)   │  │         │               │
│              └────────┘  └─────────┘               │
└─────────────────────────────────────────────────────┘
```

## 2. Monorepo Structure

```
path-connect/
├── apps/
│   ├── api/              # Express.js backend
│   │   ├── src/
│   │   │   ├── controllers/   # Request handlers (thin, delegate to services)
│   │   │   ├── services/      # Business logic layer
│   │   │   ├── middleware/     # authenticate, validate, errorHandler
│   │   │   ├── lib/           # External clients (prisma, redis, firebase, dify, sentry)
│   │   │   ├── routes/        # Route definitions + OpenAPI annotations
│   │   │   ├── validators/    # Zod schemas (re-export from shared)
│   │   │   ├── utils/         # Error classes, pagination helpers
│   │   │   ├── swagger.ts     # OpenAPI spec configuration
│   │   │   └── index.ts       # Server entry point
│   │   └── prisma/
│   │       ├── schema.prisma  # Data model
│   │       ├── seed.ts        # Test data seeding
│   │       └── migrations/    # SQL migrations
│   └── web/              # Next.js 15 frontend (App Router)
│       └── src/
│           ├── app/           # Pages (dashboard, chat, mentors, sessions, etc.)
│           ├── components/    # React components
│           ├── hooks/         # React Query hooks
│           ├── services/      # API client wrappers (Axios)
│           ├── stores/        # Zustand auth store
│           └── lib/           # Firebase client, Axios instance
├── packages/
│   ├── shared/           # Shared types, enums, Zod validators
│   └── ui/               # Shared React component library
├── turbo.json            # Build orchestration
├── render.yaml           # API deployment config
└── vercel.json           # Frontend deployment config
```

**Turborepo** manages the build dependency graph: `shared` builds first, then `api` and `web` build in parallel. Tests depend on build completing first.

## 3. Data Model

### Entity Relationship Diagram

```
User ──────────────── MentorProfile (1:1, optional)
 │
 ├── Match (as mentee) ── Match (as mentor)
 │                            │
 │                        Session
 │                         │  │  │
 │              SessionSummary │  SessionNote (per user)
 │                        ActionItem
 │
 ├── NinetyDayPlan ── Goal
 │
 ├── Milestone
 │
 └── SoundingBoard ── SoundingBoardMember
```

### Key Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| User | All platform users | firebaseUid, email, role (MENTOR/MENTEE/ADMIN), weekStreak |
| MentorProfile | Mentor-specific data (1:1 with User) | expertise[], industry, yearsExperience, availability[], isActive |
| Match | Mentor-mentee pairing | menteeId, mentorId, score, reason, status |
| Session | Mentoring sessions | matchId, scheduledAt, duration, type, status, meetingLink |
| SessionSummary | AI-generated summaries (1:1 with Session) | conversationSummary, keyTopics[], keyInsights[] |
| ActionItem | Tasks from sessions | sessionId, assigneeId, description, dueDate, status |
| SessionNote | Private per-user notes | sessionId, userId, content (unique per session+user) |
| NinetyDayPlan | Goal framework | userId, title, startDate, status |
| Goal | 30/60/90-day goals | planId, userId, title, period, status, isAiSuggested |
| Milestone | Achievement tracking | userId, title, achievedAt |

### Database
- **PostgreSQL 16** hosted on **Supabase** (free tier)
- **Prisma ORM** for type-safe queries, migrations, and seeding
- Connection pooling via Supabase pooler (port 6543 for transactions, port 5432 for queries)
- CUID primary keys on all tables

## 4. API Design

### 15 REST Endpoints

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| GET | /health | No | General | Service + dependency health |
| POST | /users | Yes | General | Create/update user profile |
| GET | /users/me | Yes | General | Get current user |
| PATCH | /users/me | Yes | General | Update current user |
| GET | /mentors | Yes | General | List mentors (paginated, filterable) |
| GET | /mentors/:id | Yes | General | Get mentor by ID |
| POST | /matches | Yes | General | Create match request |
| GET | /matches | Yes | General | List user's matches |
| PATCH | /matches/:id | Yes | General | Accept/decline/complete match |
| POST | /sessions | Yes | General | Create session |
| GET | /sessions | Yes | General | List user's sessions |
| GET | /sessions/:id | Yes | General | Get session detail |
| POST | /sessions/:id/notes | Yes | General | Upsert personal notes |
| POST | /goals | Yes | General | Create goal |
| GET | /goals | Yes | General | List user's goals |
| PATCH | /goals/:id | Yes | General | Update goal |
| POST | /ai/match-mentors | Yes | AI (20/15min) | AI mentor matching |
| POST | /ai/chat | Yes | AI (20/15min) | AI career advisor |
| GET | /ai/learning-path | Yes | AI (20/15min) | Generate learning path |
| POST | /ai/sessions/:id/summarize | Yes | AI (20/15min) | Summarize session |

### Request/Response Pattern

All endpoints follow a consistent format:

```json
// Success (single resource)
{ "data": {...}, "message": "Resource created" }

// Success (paginated list)
{ "data": [...], "total": 100, "page": 1, "limit": 20 }

// Error
{ "data": null, "message": "Error description", "errors": [{"field": "email", "message": "Invalid"}] }
```

### API Documentation
- Swagger UI served at `/api/docs`
- OpenAPI 3.0.3 JSON spec at `/api/docs.json`
- JSDoc annotations on every route file

## 5. Request Processing Pipeline

```
Request
  │
  ▼
Helmet (security headers)
  │
  ▼
CORS (origin validation)
  │
  ▼
Morgan (request logging)
  │
  ▼
express.json (body parsing)
  │
  ▼
Rate Limiter (100/15min general, 20/15min AI)
  │
  ▼
Route Match
  │
  ▼
authenticate middleware
  │  - Extract Bearer token from Authorization header
  │  - Verify with Firebase Admin SDK
  │  - Auto-create user in DB if new
  │  - Attach req.user (id, email, role)
  │  - Dev mode: bypass via x-dev-user-id header
  │
  ▼
validate middleware
  │  - Parse body/query/params against Zod schemas
  │  - Return 400 with field-level errors on failure
  │  - Attach validated data to req.body/query/params
  │
  ▼
Controller (thin layer)
  │  - Extract params from req
  │  - Call service method
  │  - Return response with status code
  │
  ▼
Service (business logic)
  │  - Validate business rules
  │  - Execute DB operations (Prisma)
  │  - Call external services (Dify, Redis)
  │  - Return typed result
  │
  ▼
Response
  │
  ▼
errorHandler middleware (catches thrown errors)
  │  - AppError: return statusCode + message + details
  │  - Unhandled: log, report to Sentry, return 500
```

## 6. Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  Browser │         │ Firebase │         │  API     │         │ Database │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │  Login (email/Google)  │                 │                    │
     │───────────────────────▶│                 │                    │
     │   Firebase ID Token    │                 │                    │
     │◀───────────────────────│                 │                    │
     │                        │                 │                    │
     │  API request + Bearer token              │                    │
     │─────────────────────────────────────────▶│                    │
     │                        │   verifyIdToken │                    │
     │                        │◀────────────────│                    │
     │                        │   decoded token │                    │
     │                        │────────────────▶│                    │
     │                        │                 │  findUnique(uid)   │
     │                        │                 │───────────────────▶│
     │                        │                 │   user or null     │
     │                        │                 │◀───────────────────│
     │                        │                 │                    │
     │                        │                 │ (auto-create if    │
     │                        │                 │  user not found)   │
     │                        │                 │───────────────────▶│
     │                        │                 │                    │
     │  Response with data    │                 │                    │
     │◀─────────────────────────────────────────│                    │
```

- **Frontend**: Zustand store manages Firebase auth state via `onAuthStateChanged`
- **Axios interceptor**: Automatically attaches `Authorization: Bearer <token>` to every API request
- **401 handling**: Axios response interceptor redirects to `/login` on 401
- **Dev bypass**: Set `DEV_BYPASS_AUTH=true` + send `x-dev-user-id` header

## 7. AI Integration (Dify Cloud)

### Architecture

PathConnect uses **Dify Cloud** as an external LLM orchestration layer. Dify is NOT embedded — it runs as a SaaS at `api.dify.ai`. The API communicates with 4 separate Dify applications:

```
┌─────────────────────────────────────────────────┐
│  PathConnect API (ai.service.ts)                │
│                                                  │
│  ┌────────────────┐  ┌────────────────────────┐ │
│  │ dify.ts client │  │ ai.service.ts          │ │
│  │                │  │                        │ │
│  │ runWorkflow()  │  │ matchMentors()         │ │
│  │ sendChat()     │  │ summarizeSession()     │ │
│  │                │  │ generateLearningPath() │ │
│  └───────┬────────┘  │ chatWithAdvisor()      │ │
│          │           └────────────────────────┘ │
└──────────┼──────────────────────────────────────┘
           │ HTTPS (Axios, 60s timeout)
           ▼
┌──────────────────┐
│   Dify Cloud     │
│   api.dify.ai    │
│                  │
│ App 1: Mentor Matcher     (workflow → structured JSON)
│ App 2: Session Summarizer (workflow → structured JSON)
│ App 3: Learning Path Gen  (workflow → structured JSON)
│ App 4: AI Career Advisor  (chatbot → conversational)
└──────────────────┘
```

### Workflow vs Chat

- **Workflows** (Apps 1-3): Receive structured inputs, return structured JSON. The API parses the JSON to extract data (mentors, summaries, goals). Output may be wrapped in markdown code fences — the parser strips these.
- **Chat** (App 4): Standard chatbot with multi-turn conversation. `conversationId` is managed by Dify and stored on the frontend for session continuity.

### LLM Hallucination Handling (Mentor Matching)

The mentor matcher workflow can return invalid mentor IDs. The service handles this with a 3-tier resolution:

```
1. Exact ID match    → mentor ID is in the active mentor set
2. Name lookup       → mentor display name matches (case-insensitive)
3. Fuzzy first-name  → first name appears in the AI's "reason" text
4. Unresolvable      → skip this mentor (silently drop)
```

### Data Persistence per AI Feature

| Feature | Calls Dify | Persisted to DB | Redis Cache |
|---------|-----------|----------------|-------------|
| Mentor Matching | Every request | Yes (Match records) | Mentor list cached 1hr |
| Session Summary | First time only | Yes (SessionSummary + ActionItems) | No |
| Learning Path | Every request | No | Yes (12hr per user) |
| AI Chat | Every message | No (Dify manages state) | No |

## 8. Caching Strategy (Redis)

### Implementation

```typescript
// lib/redis.ts — graceful degradation pattern
async function cached<T>(key: string, ttl: number, compute: () => Promise<T>): Promise<T> {
  try { const hit = await redis.get(key); if (hit) return JSON.parse(hit); } catch {}
  const value = await compute();
  try { await redis.setex(key, ttl, JSON.stringify(value)); } catch {}
  return value;
}
```

### Cached Data

| Key Pattern | TTL | Data | Invalidation |
|-------------|-----|------|-------------|
| `mentors:active` | 1 hour | All active mentor profiles with user data | On mentor profile create/update |
| `learning-path:{userId}` | 12 hours | AI-generated learning path goals | TTL expiry only |

### Design Principles
- **Optional**: App works without Redis — all cache operations wrapped in try/catch
- **Non-critical in health check**: Redis unreachable doesn't set status to "degraded"
- **Explicit invalidation**: Mentor cache invalidated when any mentor profile changes

## 9. State Management (Frontend)

```
┌─────────────────────────────────────────────────────┐
│  Frontend State Architecture                        │
│                                                     │
│  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │  Zustand Store   │  │  React Query            │  │
│  │  (Auth only)     │  │  (Server state)         │  │
│  │                  │  │                         │  │
│  │  user            │  │  useQuery(mentors)      │  │
│  │  loading         │  │  useQuery(sessions)     │  │
│  │  initialized     │  │  useQuery(matches)      │  │
│  │  initialize()    │  │  useQuery(goals)        │  │
│  └─────────────────┘  │  useMutation(chat)      │  │
│                        │  useMutation(notes)     │  │
│  ┌─────────────────┐  └─────────────────────────┘  │
│  │  React useState  │                               │
│  │  (UI state)      │  No React Context used.       │
│  │                  │  No Redux.                    │
│  │  form inputs     │                               │
│  │  modals          │                               │
│  │  field errors    │                               │
│  └─────────────────┘                                │
└─────────────────────────────────────────────────────┘
```

## 10. Validation Architecture

### Shared Schemas (`@path-connect/shared`)

Zod schemas defined once, used by both frontend and backend:

```
packages/shared/src/validators.ts
    │
    ├──▶ apps/api/src/validators/ai.validator.ts (re-exports)
    │       └──▶ validate middleware (server-side enforcement)
    │
    └──▶ apps/web/src/components/ (client-side validation)
            ├── MentorDiscoveryForm.tsx (matchMentorsSchema)
            ├── chat/page.tsx (chatMessageSchema)
            └── PersonalNotes.tsx (sessionNotesSchema)
```

### Validation Layers

| Layer | What | How |
|-------|------|-----|
| HTML | maxLength attributes | Browser-enforced character limits |
| React | Zod safeParse on submit | Prevents invalid API calls |
| Express | validate middleware | Returns 400 with field errors |
| Prisma | Schema constraints | Database-level enforcement |

## 11. Error Handling

### Error Class Hierarchy

```typescript
class AppError extends Error {
  statusCode: number
  details?: { field: string; message: string }[]
}

class NotFoundError extends AppError     // 404
class ForbiddenError extends AppError    // 403
class ValidationError extends AppError   // 400 (with field details)
```

### Error Flow

```
Service throws AppError
  │
  ▼
Controller catches (next(error))
  │
  ▼
errorHandler middleware
  │
  ├── AppError (expected):
  │   ├── statusCode >= 500: log + Sentry.captureException
  │   └── Return { data: null, message, errors? }
  │
  └── Unhandled Error:
      ├── Always log + Sentry.captureException
      └── Return 500 { data: null, message: "Internal server error" }
```

### Sentry Configuration
- Initialized before all other imports (early instrumentation)
- Strips `Authorization` and `Cookie` headers from error reports
- Traces: 20% sample rate in production, 100% in development
- Gracefully disabled when `SENTRY_DSN` is not set

## 12. Deployment Architecture

```
┌──────────────────────────────────────────────────┐
│  Production Deployment                           │
│                                                  │
│  ┌────────────┐         ┌────────────────────┐   │
│  │  Vercel    │         │     Render         │   │
│  │            │  HTTPS  │                    │   │
│  │  Next.js   │────────▶│  Express API       │   │
│  │  Frontend  │         │  (Node.js 20)      │   │
│  │            │         │                    │   │
│  └────────────┘         └─────────┬──────────┘   │
│                                   │              │
│                         ┌─────────┼─────────┐    │
│                         │         │         │    │
│                    ┌────┴───┐ ┌───┴────┐ ┌──┴──┐ │
│                    │Supabase│ │ Dify   │ │Redis│ │
│                    │Postgres│ │ Cloud  │ │(opt)│ │
│                    └────────┘ └────────┘ └─────┘ │
└──────────────────────────────────────────────────┘
```

| Component | Host | Plan | Auto-deploy |
|-----------|------|------|-------------|
| Frontend | Vercel | Free | Yes (push to main) |
| API | Render | Free | Yes (push to main) |
| Database | Supabase | Free | N/A |
| AI | Dify Cloud | Free tier | N/A |
| Redis | Optional (Upstash) | Free | N/A |
| Auth | Firebase | Free | N/A |
| Error Tracking | Sentry | Free (5K errors/mo) | N/A |

### Build Commands
- **Vercel**: `npx turbo run build --filter=@path-connect/web`
- **Render**: `npm install && npm run build --workspace=apps/api` -> `node apps/api/dist/index.js`

### Local Development
- `docker-compose.yml` runs Postgres, Redis, n8n locally
- `npm run dev` starts both frontend (3000) and API (4000) via Turbo

## 13. Security Measures

| Measure | Implementation |
|---------|---------------|
| Authentication | Firebase JWT verification on every request |
| Authorization | Role-based (MENTOR/MENTEE), ownership checks in services |
| Input Validation | Zod schemas on all endpoints (body, query, params) |
| SQL Injection | Prisma ORM (parameterized queries) |
| XSS | React auto-escaping, Helmet security headers |
| Rate Limiting | express-rate-limit (100 general, 20 AI per 15min) |
| CORS | Origin whitelist (configurable) |
| Sensitive Data | Sentry strips auth headers; .env not committed |
| HTTPS | Enforced by Vercel and Render in production |

## 14. Testing

### Test Suite (41 tests, Vitest)

| File | Tests | Coverage |
|------|-------|----------|
| authenticate.test.ts | 8 | Auth middleware: valid/invalid tokens, auto-create, dev bypass |
| validate.test.ts | 9 | Zod validation: valid/invalid body, query, params |
| errorHandler.test.ts | 5 | Error types: AppError, NotFound, Forbidden, validation, unhandled |
| dify.test.ts | 9 | Dify client: workflow success/failure, rate limit, chat |
| redis.test.ts | 8 | Cache: miss/hit, TTL, graceful degradation, invalidation |
| health.test.ts | 2 | Health check: DB up (200), DB down (503) |

### Running Tests
```bash
npx turbo test                    # All tests
npx turbo test --filter=@path-connect/api  # API tests only
```
