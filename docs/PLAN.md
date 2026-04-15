# PathConnect — Implementation Plan

## Overview

PathConnect is an AI-powered mentorship platform that connects mentees with mentors using intelligent matching algorithms. Built with Next.js 15 (App Router), Firebase, Node.js, PostgreSQL, Dify AI, and n8n automation.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Next.js    │────▶│  Node.js API│────▶│    Dify     │
│  (Frontend) │     │  (Backend)  │     │ (AI Mentor) │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                    │
                    ┌──────┴──────┐      ┌──────┴──────┐
                    │  PostgreSQL │      │ Knowledge   │
                    │  (App Data) │      │ Bases (RAG) │
                    └─────────────┘      └─────────────┘
                           │                    │
                    ┌──────┴──────┐      ┌──────┴──────┐
                    │  Firebase   │      │    n8n      │
                    │ Auth/RT/FCM │      │ (Scheduling │
                    └─────────────┘      │  & Tasks)   │
                                         └─────────────┘
```

## Service Responsibilities

### Dify — AI Mentor Engine (NOT chatbot)
Powers all AI intelligence. Uses Knowledge (RAG) to store and retrieve context.

| Dify Component | Purpose | Data Stored |
|----------------|---------|-------------|
| **Mentor KB** | Mentor bios, expertise, industry, availability | Mentor profiles, specializations |
| **Session Notes KB** | Session notes, summaries, action items | What was discussed, advice given |
| **Progress Logs KB** | User milestones, goals, skills mastered | 30/60/90 day progress, completion status |
| **Mentor Matcher** (Workflow) | Takes mentee profile → RAG search Mentor KB → returns ranked JSON matches with scores | — |
| **Session Summarizer** (Workflow) | Takes session transcript → generates summary + action items + key insights as JSON | — |
| **Learning Path Generator** (Workflow) | Analyzes Progress KB → suggests personalized goals as JSON (checkboxes, progress bars) | — |
| **AI Mentor Advisor** (Workflow) | Context-aware advice using all KBs — remembers past sessions, knows your progress | — |

All Dify workflows output **structured JSON** so the frontend can render:
- Progress bars (e.g., `{"progress": 60, "goals_completed": 6, "goals_total": 12}`)
- Skills mastered checklists (e.g., `{"skills": [{"name": "Resume optimization", "mastered": true}]}`)
- Ranked matches (e.g., `{"mentors": [{"id": "...", "score": 92, "reason": "..."}]}`)

### n8n — Business Logic & Scheduling (NOT AI)
Manages scheduling, notifications, and data sync. Handles "business-ready" operations.

| n8n Workflow | Trigger | Actions |
|-------------|---------|---------|
| **Schedule Meeting** | User requests session | Google Calendar → find available slots → create event → Slack notify mentor |
| **Session Complete Sync** | Session ends | Push notes + summary to Dify Session Notes KB |
| **Profile Sync** | User creates/updates profile | Sync mentor bio to Dify Mentor KB |
| **Progress Sync** | Goal completed / milestone achieved | Update Dify Progress Logs KB |
| **Session Reminder** | Cron (1 hour before) | Email + push notification to both parties |
| **Weekly Digest** | Cron (weekly) | Email summary of progress, upcoming sessions |
| **Mentor Notification** | Mentee matched | Slack/email notify mentor of new match |

## Docker Services

| Service  | Image              | Port | Purpose                                |
|----------|--------------------|------|----------------------------------------|
| web      | node:20-alpine     | 3000 | Next.js frontend                       |
| api      | node:20-alpine     | 4000 | Node.js backend                        |
| postgres | postgres:16-alpine | 5432 | App database                           |
| dify     | langgenius/dify    | 3080 | AI Mentor engine (RAG, matching, JSON) |
| n8n      | n8nio/n8n          | 5678 | Scheduling, tasks, data sync           |
| redis    | redis:7-alpine     | 6379 | Cache + Dify dependency                |

---

## Figma Screens → Feature Mapping

| Screen | Dify Integration | n8n Integration |
|--------|-----------------|-----------------|
| **Homepage/Dashboard** | Displays AI-generated stats | — |
| **Find Mentor** | Dify Mentor Matcher → JSON ranked matches | Profile sync to Mentor KB |
| **Session Summary** | Dify Session Summarizer → JSON summary, action items, insights | Session notes → Dify KB |
| **Progress Tracking** | Dify Progress KB → JSON progress bars, milestones | Goal completion sync |
| **90-Day Plan** | Dify Learning Path Generator → JSON goals with checkboxes | — |
| **Sounding Board** | Dify AI Mentor Advisor for async Q&A | Notification workflows |
| **Mentorship Loop** | Dify Mentor Matcher (reverse) → match mentees | Milestone sync |
| **Schedule A Session** | — | Google Calendar + Slack notification |

---

## MVP Phases

### Phase 0: Repo + Docker — COMPLETE
- [x] Monorepo structure (Turborepo + npm workspaces)
- [x] Web app scaffolding (Next.js 15 App Router, TypeScript, Tailwind)
- [x] Firebase Auth integration + Zustand store
- [x] App Router structure with route groups and layouts
- [x] API client/service layer (axios, dify, mentor, session services)
- [x] Root npm scripts (dev, build, lint, test, docker:*, db:*)
- [x] .env.example with all required env vars
- [x] Bootstrap apps/api (Express server + Prisma)
- [x] Bootstrap packages/shared and packages/ui
- [x] Dockerfiles for web and api
- [x] docker-compose.yml with all 6 services
- [x] Dify docker config
- [x] docker-compose.prod.yml

---

### MVP1: Core Mentorship Flow
**Goal:** User signs up, gets AI-matched with a mentor, attends sessions, reviews AI summaries.

#### Phase 1: Database + API + Auth
- [ ] Prisma schema: Users, MentorProfiles, Matches, Sessions, ActionItems, Goals, SessionNotes
- [ ] Database migrations + seed data
- [ ] Firebase Admin SDK middleware (verify ID tokens)
- [ ] API routes: POST/GET /users, /mentors, /sessions, /matches, /goals
- [ ] Input validation (zod)
- [ ] Error handling middleware

#### Phase 2: Dify AI Setup (Mentor Engine)
- [ ] Deploy Dify (docker-compose)
- [ ] Create Knowledge Bases:
  - Mentor KB (bios, expertise, availability)
  - Session Notes KB (summaries, action items)
  - Progress Logs KB (goals, milestones, skills)
- [ ] Build Dify Workflows (all output structured JSON):
  - **Mentor Matcher**: mentee profile → RAG search Mentor KB → `{mentors: [{id, score, reason}]}`
  - **Session Summarizer**: transcript → `{summary, topics: [], action_items: [], insights: []}`
  - **Learning Path Generator**: progress → `{goals: [{title, suggested: true, period: "30-day"}]}`
  - **AI Mentor Advisor**: all KBs → context-aware `{advice, references: []}`
- [ ] API ↔ Dify integration endpoints

#### Phase 3: n8n Workflows (Scheduling & Sync)
- [ ] Profile created/updated → sync to Dify Mentor KB
- [ ] Session completed → push notes to Dify Session Notes KB
- [ ] Goal completed → update Dify Progress Logs KB
- [ ] Schedule meeting → Google Calendar (find slots) → Slack notify mentor

#### Phase 4a: Frontend — MVP1 Screens
- [ ] **Login/Register** — Firebase Auth forms (email + Google OAuth)
- [ ] **Homepage/Dashboard** — Stats, upcoming session, progress bar, quick actions
- [ ] **Find Mentor** — Career goal form → AI matching results (from Dify JSON)
- [ ] **Session Summary** — AI summary, topics, action items, insights, personal notes
- [ ] **Progress Tracking** — 30/60/90 milestones, progress bars, relationship stats

---

### MVP2: Planning & Engagement
**Goal:** AI-generated 90-day plans, session scheduling UI, peer support network.

#### Phase 4b: Frontend — MVP2 Screens
- [ ] **90-Day Plan** — AI-suggested goals (from Dify JSON), custom goals, save & track
- [ ] **Schedule A Session** — Calendar picker, time slots, confirm (triggers n8n)
- [ ] **Sounding Board** — Inner circle, invite by email, async Q&A, recent discussions

#### Phase 5: n8n Workflows — MVP2
- [ ] Session reminder (1 hour before) → email + push
- [ ] Weekly progress digest → email
- [ ] Sounding Board notification → email when peer responds

---

### MVP3: Mentorship Loop & Growth
**Goal:** Users become mentors, pay it forward, community impact tracking.

#### Phase 4c: Frontend — MVP3 Screens
- [ ] **Mentorship Loop** — Milestones, check-ins, goal revision, become a mentor, mentee matching
- [ ] **Profile Page** — Edit profile, expertise, availability, mentoring preferences
- [ ] **Notifications** — In-app notification center

#### Phase 6: n8n Workflows — MVP3
- [ ] Milestone achieved → congratulations email
- [ ] Mentee matched → notify both parties (Slack + email)
- [ ] Monthly impact report → email

---

### Phase 7: Production Deployment
- [ ] GCP / Vercel deployment
- [ ] Cloud SQL for PostgreSQL
- [ ] CI/CD with GitHub Actions
- [ ] Domain + SSL
- [ ] Monitoring + logging

---

## Execution Order

| Order | What | Key Deliverable |
|-------|------|-----------------|
| 1 | Phase 0 | Working local dev environment |
| 2 | Phase 1 | Database + API + Auth |
| 3 | Phase 2 | Dify AI Mentor engine with RAG |
| 4 | Phase 3 | n8n scheduling + data sync |
| 5 | Phase 4a | MVP1 frontend (5 screens) |
| — | **MVP1 RELEASE** | — |
| 6 | Phase 4b | MVP2 frontend (3 screens) |
| 7 | Phase 5 | MVP2 n8n workflows |
| — | **MVP2 RELEASE** | — |
| 8 | Phase 4c | MVP3 frontend (3 screens) |
| 9 | Phase 6 | MVP3 n8n workflows |
| — | **MVP3 RELEASE** | — |
| 10 | Phase 7 | Production deployment |

## Missing Screens (need design)
- **Login/Register** — not in Figma, will build based on brand colors
- **Schedule A Session form** — Figma shows session detail but not scheduling UI
- **AI Chat/Advisor** — optional standalone screen for Dify AI Mentor Advisor
