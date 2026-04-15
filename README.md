# PathConnect

AI-powered mentorship platform that connects mentees with mentors using intelligent matching, automated session summaries, and personalized learning paths.

## Features

- **AI Mentor Matching** — Dify-powered RAG matches mentees with the right mentors based on career goals, skills, and experience
- **Session Summaries** — AI-generated conversation summaries, action items, and key insights after each session
- **90-Day Action Plans** — Personalized AI-suggested goals with 30/60/90 day milestones
- **Progress Tracking** — Visual progress bars, skills mastered checklists, and milestone tracking
- **Sounding Board** — Private peer support network for async feedback and discussions
- **Mentorship Loop** — Complete the cycle by becoming a mentor and matching with mentees
- **Smart Scheduling** — Automated session scheduling via Google Calendar with Slack notifications

## Architecture

```
Vercel (Frontend)          Backend Services
┌──────────┐     ┌──────────────────────────────────┐
│ Next.js  │────▶│  Node.js API (Express + Prisma)  │
│ Frontend │     │           │                       │
└──────────┘     │     ┌─────┴──────┐                │
                 │     │ PostgreSQL │ (Supabase)     │
                 │     └────────────┘                │
                 │                                    │
                 │  ┌────────────┐  ┌─────────────┐  │
                 │  │ Dify Cloud │  │ n8n         │  │
                 │  │ (AI Mentor)│  │ (Scheduling)│  │
                 │  └────────────┘  └─────────────┘  │
                 └──────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), Tailwind CSS, TypeScript |
| Auth | Firebase Authentication (Email + Google OAuth) |
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL (Supabase) |
| AI Engine | Dify (Knowledge Bases + Workflows, structured JSON output) |
| Automation | n8n (Google Calendar, Slack, email notifications) |
| Hosting | Vercel (frontend), GCP Cloud Run (API) |

### Service Responsibilities

**Dify — AI Mentor Engine (not chatbot)**
- Knowledge Bases (RAG): Mentor bios, session notes, progress logs
- Remembers past sessions and provides context-aware advice
- All workflows output structured JSON for frontend rendering
- Workflows: Mentor Matcher, Session Summarizer, Learning Path Generator, AI Mentor Advisor

**n8n — Business Logic & Scheduling (not AI)**
- Schedule meetings via Google Calendar
- Slack notifications to mentors
- Sync session notes and progress to Dify Knowledge Bases
- Reminders, weekly digests, notifications

## Project Structure

```
path-connect/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   └── api/          # Express + Prisma backend
├── packages/
│   ├── shared/       # Shared TypeScript types
│   └── ui/           # Shared React components
├── dify/             # Dify AI engine setup
├── n8n-workflows/    # n8n workflow definitions
├── docs/
│   └── PLAN.md       # Full implementation plan
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js >= 20
- Docker Desktop
- Firebase project (free)
- Supabase account (free)

### Setup

```bash
# Clone
git clone https://github.com/rkandruAV/path-connect.git
cd path-connect

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Firebase and Supabase credentials

# Start all services (PostgreSQL, Redis, n8n)
docker compose up --build

# Or run the frontend only
npm run dev --workspace=apps/web
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Console → Project Settings |
| `DATABASE_URL` | Supabase → Settings → Database → Connection string |
| `DIFY_API_KEY` | Dify Cloud → API Keys |

## Development

```bash
# Start frontend (Next.js on port 3000)
npm run dev --workspace=apps/web

# Start backend (Express on port 4000)
npm run dev --workspace=apps/api

# Start all Docker services
docker compose up --build

# Database operations
npm run db:migrate    # Run Prisma migrations
npm run db:seed       # Seed database
npm run db:studio     # Open Prisma Studio
```

## Roadmap

- [x] **Phase 0** — Project scaffolding, Docker, Next.js migration
- [ ] **MVP1** — AI mentor matching, session summaries, progress tracking (5 screens)
- [ ] **MVP2** — 90-day plans, scheduling, sounding board (3 screens)
- [ ] **MVP3** — Mentorship loop, profiles, notifications (3 screens)

See [docs/PLAN.md](docs/PLAN.md) for the full implementation plan.

## License

Private — All rights reserved.
