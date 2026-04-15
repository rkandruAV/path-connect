# PathConnect — Implementation Plan

## Overview

PathConnect is an AI-powered mentorship platform that connects mentees with mentors using intelligent matching algorithms. Built with Next.js 15 (App Router), Firebase, Node.js, PostgreSQL, Dify AI, and n8n automation.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Next.js    │────▶│  Node.js API│────▶│    Dify     │
│  (Frontend) │     │  (Backend)  │     │  (AI Engine) │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                    │
                    ┌──────┴──────┐      ┌──────┴──────┐
                    │  PostgreSQL │      │ Knowledge   │
                    │  (App Data) │      │ Bases (RAG) │
                    └─────────────┘      └─────────────┘
                           │                    │
                    ┌──────┴──────┐      ┌──────┴──────┐
                    │  Firebase   │      │    n8n      │
                    │ Auth/RT/FCM │      │ (Workflows) │
                    └─────────────┘      └─────────────┘
```

## Docker Services

| Service  | Image                | Port | Purpose                            |
|----------|----------------------|------|------------------------------------|
| web      | node:20-alpine       | 3000 | Next.js frontend                   |
| api      | node:20-alpine       | 4000 | Node.js backend                    |
| postgres | postgres:16-alpine   | 5432 | App database                       |
| dify     | langgenius/dify      | 3080 | AI engine (RAG, matching, chatbot) |
| n8n      | n8nio/n8n            | 5678 | Workflow automation                |
| redis    | redis:7-alpine       | 6379 | Cache + Dify dependency            |

---

## Phases

### Phase 0: Repo + Docker — Working local dev environment
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

### Phase 1: DB schema + API core + Firebase Auth
- [ ] Prisma schema (Users, Mentors, Mentees, Matches, Sessions, Messages)
- [ ] Database migrations
- [ ] Seed data
- [ ] Firebase Admin SDK integration in API
- [ ] Auth middleware (verify Firebase ID tokens)
- [ ] Core API routes: /api/v1/users, /mentors, /sessions, /matches
- [ ] Input validation (zod)
- [ ] Error handling middleware
- [ ] Socket.io setup for real-time features

### Phase 2: Dify setup + Knowledge Bases + AI apps
- [ ] Dify Knowledge Bases setup:
  - Mentor Knowledge Base (bios, expertise, availability)
  - Session Knowledge Base (notes, summaries, action items)
  - Learning Resources KB (articles, courses)
  - User Progress KB (goals, milestones)
- [ ] Dify Apps:
  - Mentor Matcher (Workflow): mentee profile → RAG search → ranked matches
  - Session Summarizer (Workflow): transcript → summary + action items
  - Learning Path Generator (Workflow): progress → personalized next steps
  - AI Mentor Chatbot (Chatflow): context-aware guidance
- [ ] API ↔ Dify integration (/v1/chat-messages, /v1/workflows/run)

### Phase 3: n8n workflows + Dify sync
- [ ] Profile created/updated → n8n → updates Dify Knowledge Base
- [ ] Session completed → n8n → pushes notes to Dify Session KB
- [ ] Weekly → n8n → refreshes progress data in Dify
- [ ] Notification workflows (email, push)

### Phase 4: Figma export + React frontend
- [ ] Export Figma designs (PNG @2x, SVG icons, CSS tokens)
- [ ] Convert design tokens to Tailwind config
- [ ] Build all page components:
  - LoginPage, RegisterPage
  - DashboardPage
  - MentorsPage (listing + profiles)
  - SessionsPage (booking + management)
  - ChatPage (AI chatbot interface)
  - LearningPathPage
  - ProfilePage
- [ ] Build feature components (auth, dashboard, mentors, sessions, chat, learning)
- [ ] Responsive design + accessibility

### Phase 5: GCP deployment
- [ ] GCP project setup
- [ ] Cloud Run or GKE for containers
- [ ] Cloud SQL for PostgreSQL
- [ ] Cloud Storage for assets
- [ ] CI/CD with GitHub Actions
- [ ] Domain + SSL setup
- [ ] Monitoring + logging

---

## Execution Order

| Order | Phase | Key Deliverable |
|-------|-------|-----------------|
| 1     | Phase 0 | Working local dev environment |
| 2     | Phase 1 | Backend foundation |
| 3     | Phase 2 | AI mentor matching working |
| 4     | Phase 3 | Automation running |
| 5     | Phase 4 | Full UI |
| 6     | Phase 5 | Production ready |
