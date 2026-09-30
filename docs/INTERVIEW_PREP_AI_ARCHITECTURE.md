# PathConnect - AI Product Architecture Interview Prep

## Project Overview

PathConnect is an AI-powered mentorship platform that connects mentees with mentors using intelligent matching, automated session summaries, and personalized learning paths. Built as a Turborepo monorepo with Next.js 15 frontend, Express.js backend, PostgreSQL (Supabase), Firebase auth, and Dify as the LLM orchestration layer.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                      │
│  React Query (server state) + Zustand (auth) + useState (UI) │
│  difyService.ts / sessionService.ts → axios + Firebase JWT    │
└───────────────────────────┬──────────────────────────────────┘
                            │ REST API (Bearer token)
┌───────────────────────────▼──────────────────────────────────┐
│                    BACKEND (Express.js)                        │
│  authenticate.ts → validate.ts → controller → service         │
│                          │                    │                │
│                     Dify Client           Prisma ORM           │
└──────────────────────────┼────────────────────┼──────────────┘
                           │                    │
               ┌───────────▼────────┐  ┌───────▼────────┐
               │   Dify Cloud API   │  │  PostgreSQL     │
               │  (LLM Workflows)   │  │  (Supabase)     │
               └────────────────────┘  └─────────────────┘
```

### Layer Breakdown

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | Next.js 15 (App Router), Tailwind CSS, React Query, Zustand | UI, state management, API calls |
| Auth | Firebase Authentication (Email + Google OAuth) | Identity verification, JWT tokens |
| Backend | Express.js, Zod validation | Request handling, business logic |
| ORM | Prisma | Data access, migrations, type-safe queries |
| Database | PostgreSQL (Supabase) | Persistent storage |
| AI Engine | Dify Cloud (Workflows + Chatflows) | LLM orchestration, structured output |
| Automation | n8n (planned) | Google Calendar, Slack, email notifications |
| Infra | Docker Compose (dev), Vercel + GCP Cloud Run (prod) | Hosting |

---

## 4 AI Workflows

### 1. Mentor Matcher (Dify Workflow)

- **Input:** Mentee profile (goals, position) + all active mentor profiles serialized from DB
- **LLM task:** Rank mentors by fit, return `{id, score, reason}`
- **Post-processing:** Resolves hallucinated IDs via multi-strategy matching (exact ID → name lookup → fuzzy first-name match in reason text), deduplicates, creates `Match` records in PostgreSQL
- **Key file:** `apps/api/src/services/ai.service.ts` — `matchMentors()`

### 2. Session Summarizer (Dify Workflow)

- **Input:** Aggregated session notes + session context (participants, date, type)
- **LLM task:** Extract summary, topics, action items (with assignee), insights
- **Post-processing:** Transactional upsert of `SessionSummary` + `ActionItem` records. Results are **persisted to DB** — subsequent views read from DB, not Dify.
- **Key file:** `apps/api/src/services/ai.service.ts` — `summarizeSession()`

### 3. Learning Path Generator (Dify Workflow)

- **Input:** User context (position, target role, existing goals, milestones, recent session insights)
- **LLM task:** Generate 30/60/90-day goals
- **Post-processing:** Returns structured goals array but **does NOT persist to DB**. Every call to this endpoint triggers a fresh Dify call.
- **Key file:** `apps/api/src/services/ai.service.ts` — `generateLearningPath()`

### 4. AI Career Advisor (Dify Chatflow)

- **Input:** Natural language message + optional `conversationId`
- **LLM task:** Conversational career guidance. Dify manages conversation history server-side.
- **Key file:** `apps/api/src/services/ai.service.ts` — `chatWithAdvisor()`

---

## Key Request Flow: Mentor Matching

```
1. User fills form on /mentors page (targetRole, currentPosition, goals)
2. Frontend: difyService.matchMentors(data) → POST /api/v1/ai/match-mentors
3. Axios interceptor attaches Firebase JWT as Bearer token
4. Backend: authenticate.ts verifies JWT, maps Firebase UID → DB user
5. Backend: validate.ts runs Zod schema on request body
6. ai.service.ts: Fetch ALL active mentors from PostgreSQL
7. ai.service.ts: Serialize mentee profile + mentor list as JSON strings
8. dify.ts: POST to Dify /workflows/run (blocking mode, 60s timeout)
9. Dify LLM analyzes and returns ranked mentors as JSON in markdown fences
10. parseWorkflowJson(): Strip markdown fences, parse JSON
11. resolveMentorId(): Handle hallucinated IDs via 3-tier resolution
12. Create/update Match records in PostgreSQL
13. Return matches to frontend → React Query invalidates cache → UI updates
```

---

## Structured JSON Output Parsing

Dify's LLM nodes return JSON wrapped in markdown code fences:

```
\`\`\`json
{ "mentors": [{"id": "usr-123", "score": 95, "reason": "..."}] }
\`\`\`
```

The `parseWorkflowJson()` function handles this:
1. Finds the first string value in the workflow output object
2. Strips markdown fences with regex
3. Parses as JSON
4. Throws `AppError` if parsing fails

This is a common real-world challenge with LLM outputs — models often wrap structured data in markdown formatting.

---

## Hallucination Mitigation (Mentor Matching)

The LLM sometimes returns mentor names instead of database IDs. The `resolveMentorId()` function uses a 3-tier strategy:

1. **Exact ID match** — Check if returned ID exists in valid mentor set
2. **Name-based lookup** — If LLM included a `name` field, look up by name
3. **Fuzzy first-name match** — Extract first names from reason text and match against mentor names

Results are also deduplicated (keeps highest-scored per mentor).

**Interview talking point:** This is a practical pattern for any system where LLMs reference real entities — you can't trust LLM-generated IDs to be accurate.

---

## React State Management

The app uses three layers of state, each with a distinct responsibility:

### Layer 1: React Query (Server State)

All data fetched from the API — sessions, mentors, matches, goals, user profile. Configured with `staleTime: 5 minutes` and `retry: 1`. Mutations automatically invalidate related caches.

```
useGoals()        → GET /goals         → cache key: ['goals']
useSessions()     → GET /sessions      → cache key: ['sessions']
useCurrentUser()  → GET /users/me      → cache key: ['user']
useMatchMentors() → POST /ai/match     → invalidates ['matches']
```

### Layer 2: Zustand (Auth State Only)

A single global store at `apps/web/src/stores/authStore.ts` that subscribes to Firebase's `onAuthStateChanged`. Stores the Firebase user object, loading flag, and initialized flag. Nothing else uses Zustand — no app data, no UI state.

### Layer 3: Local useState (UI State)

Form inputs, chat messages, wizard steps — all local to components. No form validation library (no react-hook-form, no formik).

### What's NOT used

- No React Context anywhere in the codebase
- No Redux, Recoil, or Jotai

### Interview answer

> "We use React Query for all server state with automatic cache invalidation on mutations. Auth state lives in a single Zustand store subscribed to Firebase's onAuthStateChanged. UI state like form inputs and chat messages is local useState. This separation keeps things simple — server data is always in sync via React Query, auth is global via Zustand, and transient UI state stays local."

---

## Input Validation

### Backend: Zod on every endpoint

The `validate()` middleware at `apps/api/src/middleware/validate.ts` runs Zod schemas against `req.body`, `req.query`, and `req.params`. If validation fails, it returns a 400 with field-specific error details:

```json
{
  "message": "Validation failed",
  "details": [
    { "field": "message", "message": "String must contain at least 1 character(s)" }
  ]
}
```

All 19 protected endpoints have validation. Examples:
- Session notes: `z.string().min(1).max(10000)`
- Chat message: `z.string().min(1).max(2000)`
- Session duration: `z.number().int().min(15).max(180)`
- Pagination: `z.coerce.number().int().min(1).max(50)`

### Frontend: No validation library

Only HTML5 `required` attributes and occasional manual checks like `if (password.length < 6)`. No Zod, no react-hook-form.

### Schemas are NOT shared

Zod validators live only in `apps/api/src/validators/`. The `@path-connect/shared` package has TypeScript types but no Zod schemas. This means validation rules are duplicated.

### Interview answer

> "Backend validation uses Zod with a generic middleware that validates body, query, and params against schemas. Every endpoint has a schema. The gap is the frontend — there's no client-side validation, so users submit bad data and get a 400 back. The fix is to extract Zod schemas into the shared package so both frontend and backend use the same validation rules, giving users instant feedback."

---

## Why difyService.ts Exists (Frontend API Client Pattern)

`difyService.ts` is a thin API client layer on the frontend. Instead of every React component writing raw axios calls, you centralize them in one place. Benefits:

- Single place to update if an endpoint URL changes
- Type safety on inputs/outputs
- Components stay clean — they only call hooks like `useMatchMentors()`

The naming is slightly misleading — it doesn't talk to Dify directly, it talks to the Express backend. It's a standard frontend pattern for API abstraction.

---

## What is Axios

Axios is an HTTP client library for JavaScript (similar to `fetch()` but with more features). In this project:

- **Frontend:** Making API calls from React to the Express backend, with an interceptor that automatically attaches the Firebase JWT to every request
- **Backend:** Making API calls from Express to Dify's cloud API

Key advantages over `fetch()`: built-in timeout handling, request/response interceptors, automatic JSON parsing.

---

## Firebase as Auth-Only

Firebase is used **only for authentication**, not as a database or backend:

- **Frontend:** Firebase SDK handles login (email + Google OAuth), gives you a JWT token
- **Backend:** `firebase-admin` SDK verifies that token is legitimate

All app data (users, matches, sessions) lives in PostgreSQL via Supabase. Firebase just answers: "Is this person who they claim to be?"

---

## Why authenticate.ts is Needed Beyond Firebase JWT

Firebase JWT only proves identity ("this token belongs to UID `abc123`"). The middleware does more:

1. **Verifies the JWT** — calls `firebaseAuth.verifyIdToken(token)`
2. **Maps Firebase UID to DB user** — looks up `User` by `firebaseUid` in PostgreSQL
3. **Auto-creates new users** — if first-time login, creates a `User` record
4. **Attaches full user object to `req.user`** — so controllers have access to role, profile, etc.
5. **Dev bypass** — skips Firebase entirely in local development

Without this middleware, controllers would only have a Firebase UID string — they wouldn't know the user's role, name, or anything from the database.

---

## Architecture Pattern

It's a **layered client-server architecture** with a **service layer pattern**, not strict MVC:

```
Frontend (Next.js)
├── Pages/Components     ← View layer
├── Hooks (React Query)  ← State management
├── Services             ← API client
│
Backend (Express)
├── Routes               ← URL mapping + validation
├── Controllers          ← Request/response handling (thin)
├── Services             ← Business logic + AI orchestration
├── Lib                  ← External clients (Dify, Firebase, Prisma)
├── Middleware            ← Cross-cutting concerns (auth, errors)
```

### Interview answer

> "It follows a layered client-server architecture with a service layer pattern on the backend, where controllers are thin and business logic is encapsulated in service modules."

---

## Session Notes Capture

Session notes are **manually entered by users**:

1. User navigates to session detail page (`/sessions/[id]`)
2. `PersonalNotes` component shows a textarea
3. User types reflections, clicks "Save Note"
4. `POST /sessions/:id/notes` → upserts one note per user per session (unique constraint on `sessionId + userId`)
5. Authorization check: only the mentee or mentor in that session can save notes

There is no automatic capture — no call recording transcription, no n8n automation. The AI summarizer reads these notes when the user clicks "Generate Summary", and throws an error if `session.notes.length === 0`.

---

## Data Persistence: What's Saved vs. What's Ephemeral

| Feature | Persisted to DB? | Subsequent views read from... | Dify called again? |
|---------|-------------------|-------------------------------|---------------------|
| **Session Summary** | Yes — `SessionSummary` table via upsert | Database (GET `/sessions/:id` includes `summary: true`) | No |
| **Action Items** | Yes — `ActionItem` table via transaction | Database (included in session detail) | No |
| **Learning Path** | No — returned but not saved | Must call `/ai/learning-path` again | Yes, every time |
| **Mentor Matches** | Yes — `Match` table with score + reason | Database (GET `/matches`) | No |
| **Chat Messages** | No — Dify manages conversation history | Dify (via `conversationId`) | Yes, every time |
| **Session Notes** | Yes — `SessionNote` table | Database (included in session detail) | N/A (not AI) |
| **Goals** | Yes — `Goal` table (user-created) | Database (GET `/goals`) | N/A (not AI) |

---

## RAG (Retrieval-Augmented Generation)

### Current state: No RAG

The mentor matcher loads **every active mentor** from PostgreSQL, serializes them all into a JSON string, and sends the entire list to the LLM. This works for 20 mentors but breaks at scale — the LLM's context window can't fit thousands of profiles.

### What RAG would look like

```
Mentee says "I want to become a PM in fintech"
    ↓
Vector DB (Weaviate/Dify KB) does semantic search on mentor profiles
    ↓
Returns top 10-20 mentors whose profiles are semantically similar
    ↓
LLM reasons over just 10-20 mentors → ranks them
```

This moves from O(n) LLM context to O(1).

### Where RAG applies in PathConnect

| Feature | Current approach | With RAG |
|---------|-----------------|----------|
| Mentor matching | All mentors serialized → LLM | Semantic search → top 20 → LLM |
| AI Advisor chat | No user history context | Retrieve relevant past sessions/goals from vector DB |
| Learning path | Fetches last 20 goals from SQL | Semantic search for similar career paths across all users |

### Interview answer

> "We started with a brute-force approach — sending all mentor profiles to the LLM. This worked for our MVP but wouldn't scale. The next step is RAG: sync mentor profiles into a vector knowledge base, use semantic search to pre-filter the top candidates, then let the LLM do fine-grained ranking on a small set. This moves from O(n) LLM context to O(1)."

---

## Scaling Considerations

### Current Bottlenecks

**a) Blocking AI calls**

Every Dify call uses `response_mode: 'blocking'` with a 60-second timeout. Express is single-threaded (no cluster mode). If 10 users hit "Match Mentors" simultaneously, later users are queued in the TCP stack.

**b) No caching**

Redis is running in Docker and `ioredis` is in `package.json`, but it's **never imported or used anywhere in the code**. Every request queries the database fresh.

**c) No retry logic**

If Dify returns a 429 (rate limit) or 503, the request fails immediately. No retry, no exponential backoff, no fallback. Frontend has no retry logic either.

**d) N+1 query pattern**

After Dify returns matched mentors, the code does one DB query per match result via `Promise.all()` with individual `findUnique` + conditional `create` calls.

### Where Redis actually helps (corrected)

| Use Case | Avoids Dify call? | Avoids DB call? | Real value |
|----------|-------------------|-----------------|------------|
| Session summary cache | No — DB already persists it | Yes — skip Prisma query | Minor speedup |
| Learning path cache | **Yes** — results aren't persisted | Yes | **Significant** — saves 15-20s Dify call on revisit |
| Mentor list cache | No — Dify needs fresh data anyway | Yes — skip `findMany(all mentors)` | Moderate |
| Rate limiting | Indirectly — prevents excessive calls | N/A | **Important** — protects Dify API quota |
| Auth token cache | N/A | Yes — skip `verifyIdToken()` + user lookup | Moderate — saves ~50ms/request |
| Chat conversation cache | No — Dify manages history | Yes (for display) | Minor — enables faster message rendering |

### Production architecture (what to build next)

```
Current (synchronous, blocking):
  User → Express → DB → Dify (60s block) → DB → Response

Production (async, streamed):
  User → Express → Validate → BullMQ job → Return jobId (instant)
                                    ↓
                              Worker process
                                    ↓
                              Dify (streaming via SSE) → Redis cache
                                    ↓
                              WebSocket/SSE → User sees tokens as they arrive
```

### Interview answer

> "The current architecture is synchronous and blocking — fine for MVP, but I'd redesign for production in three layers. First, add rate limiting and cache the mentor list in Redis. Second, move AI calls to a job queue (BullMQ) so the API returns a job ID immediately and workers process Dify calls in the background. Third, for chat, switch from blocking to streaming via Server-Sent Events so users see tokens as they arrive instead of waiting 30 seconds."

---

## Architecture Tradeoffs

### Tradeoffs already made

| Decision | Tradeoff | Why it was right for MVP |
|----------|----------|--------------------------|
| **Dify over LangChain** | Less control, but faster to build | Visual workflow builder, hosted RAG support, conversation management without writing orchestration code |
| **Blocking over streaming** | Users wait longer, but simpler code | No WebSocket/SSE infrastructure needed, simpler error handling |
| **Firebase auth + Supabase DB** | Two services instead of one | Firebase gives best-in-class auth (Google OAuth), Supabase gives proper PostgreSQL with Prisma |
| **Monorepo (Turborepo)** | More complex setup | `@path-connect/shared` types used by both frontend and backend — single source of truth |
| **All mentors to LLM (no RAG)** | Doesn't scale, but accurate at small scale | LLM sees all options, no risk of semantic search missing a good match |
| **Manual session notes** | Less automated, but more accurate | No call recording/transcription infrastructure needed |
| **No frontend validation** | Bad UX on invalid input | Faster development, validation exists on backend |

### Tradeoffs to discuss changing

**Dify vs. direct OpenAI/Anthropic API:**
> "Dify abstracts the LLM layer — we swap models without code changes, and the workflow builder lets non-engineers iterate on prompts. The tradeoff is we're coupled to Dify's API format and have to parse JSON from markdown code fences. If we needed fine-grained control (function calling, tool use, agent loops), I'd switch to direct API calls or LangChain."

**Synchronous vs. async processing:**
> "We chose synchronous because it's simpler — one request, one response. But at scale, a 60-second blocking call is unacceptable. The tradeoff of async (BullMQ) is complexity: job status tracking, dead-letter queues, pushing results back to the client. Worth it past ~50 concurrent users."

**JSON serialization vs. RAG for mentor matching:**
> "Sending all mentors as JSON is deliberate. It's fully deterministic — the LLM sees every option. With RAG, semantic search might miss an unconventional match. But it breaks past ~100 mentors due to context window limits. The right answer is hybrid: RAG pre-filters to top 50, then LLM reasons over those."

---

## 2-Minute Interview Answer: "Tell me about the AI architecture"

> "PathConnect uses Dify as an LLM orchestration layer with four AI workflows: mentor matching, session summarization, learning path generation, and a career advisor chatbot.
>
> The frontend uses React Query for state management and never calls Dify directly — everything goes through our Express API, which handles authentication, input validation with Zod, and database persistence with Prisma.
>
> The key design challenge is structured output parsing. Dify returns LLM text wrapped in markdown code fences, so we built a parser that strips fences and extracts JSON. For mentor matching specifically, we also handle LLM hallucinations — the model sometimes returns mentor names instead of IDs, so we have a multi-strategy resolution system that tries exact ID match, then name lookup, then fuzzy matching.
>
> Session summaries are persisted to the database after generation, so subsequent views are instant DB reads. Learning path suggestions are ephemeral — not persisted — which is a gap where Redis caching would help avoid repeat Dify calls.
>
> The main tradeoff is we're fully synchronous and blocking. For production, I'd add a job queue for AI calls, streaming for the chat interface, and RAG via vector search to replace the brute-force mentor list serialization."

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `apps/api/src/lib/dify.ts` | Dify API client (runWorkflow, sendChatMessage) |
| `apps/api/src/services/ai.service.ts` | Business logic for all 4 AI workflows |
| `apps/api/src/controllers/ai.controller.ts` | Thin request handlers |
| `apps/api/src/routes/ai.ts` | Route definitions + Zod validation |
| `apps/api/src/middleware/authenticate.ts` | Firebase JWT verification + DB user mapping |
| `apps/api/src/middleware/validate.ts` | Generic Zod validation middleware |
| `apps/api/src/validators/` | All Zod schemas (users, mentors, matches, sessions, goals, ai) |
| `apps/api/prisma/schema.prisma` | Database schema (14 models) |
| `apps/web/src/services/difyService.ts` | Frontend API wrapper for AI endpoints |
| `apps/web/src/hooks/useDify.ts` | React Query mutations for AI features |
| `apps/web/src/stores/authStore.ts` | Zustand store for Firebase auth state |
| `apps/web/src/lib/api.ts` | Axios instance with Firebase JWT interceptor |
| `apps/web/app/(main)/chat/page.tsx` | Chat UI |
| `apps/web/app/(main)/mentors/page.tsx` | Mentor discovery UI |
| `apps/web/app/(main)/sessions/[id]/page.tsx` | Session detail with summary + notes |
| `apps/web/app/(main)/learning-path/page.tsx` | Learning path display |
