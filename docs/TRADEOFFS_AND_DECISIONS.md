# PathConnect - Trade-offs and Decisions

This document captures the key architectural and technical decisions made during development, the alternatives considered, why each decision was made, and what was traded away.

---

## 1. Monorepo (Turborepo) vs Separate Repositories

**Decision**: Single monorepo with Turborepo orchestration.

**Alternatives considered**:
- Separate repos for `api`, `web`, `shared`, `ui`
- Nx monorepo (alternative to Turbo)

**Why**:
- Shared code (`@path-connect/shared`) is used by both frontend and backend — Zod validators, TypeScript types, enums. In separate repos, this would require publishing to npm and managing versions.
- Atomic commits: when a validation schema changes, the shared package, API, and frontend all update in one commit. Separate repos would require 3 coordinated PRs.
- Turbo over Nx: lighter weight, zero-config for npm workspaces, faster for small teams.

**What we traded away**:
- Deployment complexity. Vercel and Render both need explicit config to build the correct workspace from the monorepo root. This has already caused build failures (commits `272f2de`, `930d562` fixing Render builds).
- Repository size grows faster. Every dependency for every package is in one `node_modules`.

---

## 2. Dify Cloud (External LLM Orchestration) vs LangChain/Direct API

**Decision**: Dify Cloud as the AI orchestration layer for all 4 AI features.

**Alternatives considered**:
- LangChain.js embedded in the Express API
- Direct OpenAI/Anthropic API calls with custom prompt management
- Self-hosted Dify instance

**Why**:
- Dify provides a visual workflow builder — prompt engineering happens in Dify's UI, not in code. Changes to prompts don't require API redeployment.
- Dify handles RAG, model selection, and retry logic internally.
- Faster iteration: non-engineers can adjust AI behavior through the Dify dashboard.
- 4 separate Dify apps allow different models/settings per feature.

**What we traded away**:
- **Vendor lock-in**: All AI logic lives in Dify. Switching to LangChain would require rewriting all 4 workflows.
- **Latency**: Every AI call goes over the network to `api.dify.ai`, then Dify calls the LLM. Two network hops vs one if calling OpenAI directly.
- **Limited control**: Can't implement streaming responses (currently blocking mode only). Can't fine-tune retry/fallback logic beyond what Dify exposes.
- **Output inconsistency**: Dify sometimes wraps JSON in markdown code fences. We have to strip these in `parseWorkflowJson()`.

---

## 3. Firebase Authentication vs Custom Auth / NextAuth

**Decision**: Firebase Authentication (client-side) for login + JWT tokens.

**Alternatives considered**:
- NextAuth.js (server-side sessions)
- Custom JWT auth with bcrypt + refresh tokens
- Supabase Auth (built into our DB provider)

**Why**:
- Firebase provides Email/Password + Google OAuth out of the box with zero backend auth code.
- Auto-refreshing JWT tokens — no refresh token management needed.
- Firebase Admin SDK server-side for secure token verification.
- Scalable: stateless JWTs, no session store.

**What we traded away**:
- **Vendor lock-in**: Auth is tightly coupled to Firebase. Migration would require re-authenticating all users.
- **Supabase Auth was free and already available**: We're paying for two Google services (Firebase for auth, Supabase for DB) when Supabase has built-in auth. This was a pragmatic choice — Firebase was already set up.
- **No server-side session control**: Can't force-logout users or revoke tokens instantly (Firebase tokens are valid until expiry, typically 1 hour).

---

## 4. Supabase PostgreSQL vs Firebase Firestore / Self-hosted Postgres

**Decision**: Supabase-hosted PostgreSQL with Prisma ORM.

**Alternatives considered**:
- Firebase Firestore (NoSQL, pairs with Firebase Auth)
- Self-hosted PostgreSQL on Render/Railway
- PlanetScale (MySQL)

**Why**:
- Relational data model (users, matches, sessions, goals) maps naturally to SQL. The data has many relationships and constraints (unique matches, foreign keys).
- Prisma ORM provides type-safe queries, migrations, and seeding.
- Supabase free tier is sufficient for MVP.
- Connection pooling via Supabase pooler handles concurrent connections.

**What we traded away**:
- **Supabase pauses on inactivity** (free tier). The database goes to sleep after 1 week of inactivity and must be manually unpaused. This is a production risk.
- **Two auth systems**: Using Supabase for DB but Firebase for auth means we don't get Supabase's built-in Row Level Security tied to auth. Our API enforces authorization manually in services.
- **Direct connection issues**: The Supabase direct URL (`db.*.supabase.co:5432`) is unreliable. We use the pooler URL for everything, including migrations (non-standard).

---

## 5. Redis Caching — Graceful Degradation vs Hard Dependency

**Decision**: Redis is optional. The app works without it.

**Alternatives considered**:
- Redis as a hard dependency (fail if unavailable)
- In-memory caching (Map/LRU in Node.js process)
- No caching at all

**Why**:
- For a portfolio/MVP project, adding a hard Redis dependency increases infrastructure cost and complexity.
- The graceful degradation pattern (`try/catch` around all Redis operations) means the app runs fine without Redis — just slightly slower.
- On the free tier, Redis hosting (Upstash) has limited commands. If it goes down, the app shouldn't break.

**What we traded away**:
- **Silent failures**: Redis errors are swallowed. If Redis is misconfigured, it's hard to notice — the app just runs slower without any error signal.
- **No in-memory fallback**: When Redis is down, every request hits the database. A local LRU cache could serve as a middle ground but adds memory management complexity.

---

## 6. Blocking AI Responses vs Streaming

**Decision**: All Dify calls use blocking (synchronous) response mode.

**Alternatives considered**:
- Server-Sent Events (SSE) for streaming AI responses
- WebSocket streaming via Socket.io (infrastructure already in place)

**Why**:
- Simpler implementation: request in, response out. No streaming state management.
- Structured JSON output (workflows) doesn't benefit from streaming — you need the complete JSON before you can parse it.
- The AI advisor chat could benefit from streaming, but Dify's chat API in blocking mode is simpler to implement and debug.

**What we traded away**:
- **Poor UX for long AI responses**: Mentor matching and session summarization can take 10-30 seconds. The user sees a loading spinner with no feedback until the full response arrives.
- **60-second timeout risk**: If Dify is slow, the request may timeout. Streaming would deliver partial results and keep the connection alive.
- **Socket.io is unused**: The infrastructure for real-time communication is set up but not utilized for AI responses.

---

## 7. Render (Free Tier) vs Other Hosting

**Decision**: Render free tier for API hosting.

**Alternatives considered**:
- GCP Cloud Run (initially planned per README)
- Railway
- Fly.io
- Vercel Serverless Functions (co-located with frontend)

**Why**:
- Free tier with zero configuration for Node.js apps.
- Git-based auto-deployment (push to main = deploy).
- Simple monorepo support with custom build commands.

**What we traded away**:
- **Cold starts**: Render free tier spins down after 15 minutes of inactivity. First request after idle takes 30-50 seconds.
- **Limited compute**: Free tier has limited RAM and CPU. AI-heavy requests under load could fail.
- **Build issues**: Monorepo builds on Render have been problematic — required Dockerfile rename and build command fixes.
- **No auto-scaling**: Single instance. Under load, all requests queue behind each other.

---

## 8. Session Notes Model — Private Upsert vs Shared Comments

**Decision**: One private note per user per session (upsert).

**Alternatives considered**:
- Shared comment thread (like Google Docs comments)
- Multiple notes per user (append-only)
- Collaborative real-time notes (CRDT)

**Why**:
- Mentoring notes are personal reflections — they shouldn't be visible to the other party.
- Upsert keeps the model simple: unique constraint on (sessionId, userId).
- No threading, no versioning, no real-time sync — minimal complexity.

**What we traded away**:
- **No note history**: Editing overwrites the previous note. There's no version tracking.
- **No collaboration**: Mentor and mentee can't share notes or collaborate on action items in the notes (action items come from AI summarization instead).
- **Single note limit**: If a user wants to separate "during session" notes from "post session" reflections, they can't — it's one text field.

---

## 9. AI Action Items — Replace on Re-summarize vs Append

**Decision**: Delete all previous AI-generated action items and create new ones when re-summarizing.

**Alternatives considered**:
- Append new action items alongside old ones
- Mark old items as "superseded" (soft delete)
- Diff and merge old + new items

**Why**:
- Session summary quality may improve as the user adds more detailed notes. Re-summarizing should give fresh, better results.
- Simpler implementation: transactional delete + create inside `prisma.$transaction`.
- No need for audit trail at MVP stage.

**What we traded away**:
- **Completed items are lost**: If a user marks an action item as "COMPLETED" and then re-summarizes, the completion status is lost.
- **No history**: Can't see how the AI's analysis evolved over time.

---

## 10. Learning Path — Not Persisted vs Saved to Database

**Decision**: Learning path results are cached in Redis (12hr TTL) but NOT saved to the database.

**Alternatives considered**:
- Persist to Goal table with `isAiSuggested: true`
- Persist to a separate LearningPath table
- Let the user explicitly "save" selected goals

**Why**:
- The learning path is a suggestion, not a commitment. The user should review and selectively adopt goals.
- Redis caching (12hr) avoids repeat Dify calls while keeping the data ephemeral.
- The user can manually create goals from the suggestions using the Goal creation endpoint.

**What we traded away**:
- **Every cache miss calls Dify**: Without Redis, every learning path view makes a Dify API call. This costs money (Dify credits) and takes 10-20 seconds.
- **No progress tracking on suggested goals**: Until the user manually creates a goal, the suggestion exists only in cache/UI.

---

## 11. Shared Zod Validators vs Separate Frontend/Backend Validation

**Decision**: Single set of Zod schemas in `@path-connect/shared`, used by both sides.

**Alternatives considered**:
- Duplicate schemas in frontend and backend (independent)
- Backend-only validation (trust the frontend)
- JSON Schema (language-agnostic)

**Why**:
- Single source of truth prevents drift. When `maxLength` changes, both frontend character counters and backend validation update simultaneously.
- Zod works natively in both Node.js (backend) and browser (frontend).
- TypeScript type inference from Zod (`z.infer<typeof schema>`) provides compile-time safety.

**What we traded away**:
- **Bundle size**: The frontend now ships Zod to the browser. It's ~13KB gzipped — acceptable but not free.
- **Shared package build dependency**: Frontend and backend builds depend on `@path-connect/shared` building first. This has caused import resolution issues (`.js` vs `.ts` extensions depending on module resolution strategy).

---

## 12. Mentor ID Hallucination Handling — Multi-tier Fallback vs Strict Validation

**Decision**: 3-tier fallback (exact ID -> name lookup -> fuzzy first-name match) for resolving mentor IDs from LLM output.

**Alternatives considered**:
- Strict validation: reject any response with invalid IDs
- Pass mentor IDs as structured enum to the LLM (constrain output)
- Return raw LLM text without ID resolution

**Why**:
- LLMs frequently hallucinate IDs, especially with UUID-style identifiers. Strict validation would reject most responses.
- Dify workflows don't support constrained output (enum of valid IDs).
- Fuzzy matching by name recovers most hallucinated responses — the LLM usually gets the name right even when the ID is wrong.

**What we traded away**:
- **False matches possible**: Fuzzy first-name matching could match the wrong mentor if two mentors share a first name. This is a known risk mitigated by the mentor pool being small.
- **Complexity**: The 3-tier resolution adds code complexity in `ai.service.ts` that wouldn't exist if the LLM reliably returned valid IDs.

---

## 13. Express.js vs Fastify / Hono / tRPC

**Decision**: Express.js for the API framework.

**Alternatives considered**:
- Fastify (faster, schema-based validation)
- Hono (lightweight, edge-ready)
- tRPC (type-safe API layer, no REST)

**Why**:
- Express is the most widely understood Node.js framework. For a portfolio project, it demonstrates standard patterns that interviewers recognize.
- Massive ecosystem: every middleware (rate-limit, helmet, morgan, swagger) has Express support.
- Simple mental model: middleware chain is easy to reason about and debug.

**What we traded away**:
- **Performance**: Express is slower than Fastify (2-3x in benchmarks). For this project's scale, it doesn't matter.
- **Type safety**: tRPC would provide end-to-end type safety between frontend and backend. We achieve partial type safety through shared types and Zod schemas, but the API boundary is still loosely typed.
- **No edge deployment**: Express requires a Node.js runtime. Hono/Fastify could run on edge (Cloudflare Workers, Vercel Edge Functions).

---

## 14. React Query + Zustand vs Redux / React Context

**Decision**: React Query for server state, Zustand for auth state only, useState for UI state.

**Alternatives considered**:
- Redux Toolkit (single global store)
- React Context + useReducer
- Jotai/Recoil (atomic state)

**Why**:
- React Query handles 90% of the state in this app — it's all server data (mentors, sessions, matches, goals). React Query provides caching, refetching, loading/error states, and mutation invalidation out of the box.
- Zustand is minimal (~1KB). The only client-side state that persists across pages is the authenticated user. A full Redux setup would be overkill.
- No React Context used. Context re-renders all consumers on any change — React Query and Zustand don't have this problem.

**What we traded away**:
- **No unified devtools**: Redux DevTools shows all state in one place. With React Query + Zustand, you need separate devtools for each.
- **Learning curve for new developers**: Three state management approaches in one app requires understanding when to use which.

---

## Summary Table

| # | Decision | Chose | Over | Key Reason |
|---|----------|-------|------|------------|
| 1 | Monorepo | Turborepo | Separate repos | Shared code, atomic commits |
| 2 | AI orchestration | Dify Cloud | LangChain, direct API | Visual workflow builder, no-code prompt changes |
| 3 | Auth | Firebase | NextAuth, custom JWT | Zero-config OAuth, auto-refresh tokens |
| 4 | Database | Supabase Postgres | Firestore, self-hosted | Relational model, Prisma ORM, free tier |
| 5 | Caching | Redis (optional) | Hard dependency, in-memory | App works without it, graceful degradation |
| 6 | AI responses | Blocking | Streaming (SSE/WS) | Simpler implementation, JSON parsing needs full response |
| 7 | API hosting | Render free | GCP Cloud Run, Railway | Free, git auto-deploy |
| 8 | Session notes | Private upsert | Shared comments, threading | Personal reflections, simple model |
| 9 | Action items | Replace on re-summarize | Append, soft delete | Fresh results, no audit trail needed at MVP |
| 10 | Learning path | Cache only (not persisted) | Save to DB | Suggestions are ephemeral, user adopts manually |
| 11 | Validation | Shared Zod schemas | Separate per side | Single source of truth, type inference |
| 12 | LLM hallucinations | 3-tier fallback | Strict reject | LLMs hallucinate IDs; names are usually correct |
| 13 | API framework | Express.js | Fastify, tRPC, Hono | Industry standard, portfolio-friendly, ecosystem |
| 14 | State management | React Query + Zustand | Redux, Context | Right tool per state type, minimal boilerplate |
