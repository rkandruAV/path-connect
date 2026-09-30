# PathConnect

AI-powered mentorship platform that connects mentees with mentors using intelligent matching, automated session summaries, and personalized learning paths.

## Features

- **AI Mentor Matching** — Dify-powered workflows match mentees with the right mentors based on career goals, skills, and experience
- **Session Summaries** — AI-generated conversation summaries, action items, and key insights after each session
- **AI Career Advisor** — Multi-turn chatbot for career guidance, interview prep, and skill development
- **90-Day Learning Paths** — AI-generated personalized goals with 30/60/90 day milestones
- **Progress Tracking** — Goal status tracking, week streaks, and milestone achievements
- **Session Notes** — Private per-user notes for each mentoring session
- **Sounding Board** — Peer support network for async feedback (data model ready)

## Architecture

```
                    ┌─────────────┐
                    │   Firebase   │
                    │  Auth (JWT)  │
                    └──────┬──────┘
                           │
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

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), Tailwind CSS, React Query, Zustand |
| Validation | Zod (shared schemas between frontend and backend) |
| Auth | Firebase Authentication (Email + Google OAuth) |
| Backend | Node.js 20, Express, Prisma ORM |
| Database | PostgreSQL 16 (Supabase) |
| Caching | Redis (optional, graceful degradation) |
| AI Engine | Dify Cloud (4 workflow/chat apps, structured JSON output) |
| API Docs | Swagger/OpenAPI (`/api/docs`) |
| Error Tracking | Sentry (optional) |
| Hosting | Vercel (frontend), Render (API) |
| Build | Turborepo (monorepo orchestration) |

## Project Structure

```
path-connect/
├── apps/
│   ├── web/              # Next.js 15 frontend
│   └── api/              # Express + Prisma backend
│       ├── src/
│       │   ├── controllers/   # Request handlers
│       │   ├── services/      # Business logic
│       │   ├── middleware/    # Auth, validation, error handling
│       │   ├── lib/           # Redis, Prisma, Firebase, Dify, Sentry
│       │   ├── routes/        # API routes + OpenAPI annotations
│       │   └── validators/    # Zod schemas
│       └── prisma/
│           ├── schema.prisma  # Data model
│           └── migrations/    # SQL migrations
├── packages/
│   ├── shared/           # Shared types, enums, Zod validators
│   └── ui/               # Shared React components
├── docs/
│   ├── PRD.md            # Product requirements
│   ├── TECHNICAL_DESIGN.md    # Technical design
│   └── TRADEOFFS_AND_DECISIONS.md  # Architecture decisions
└── docker-compose.yml    # Local dev (Postgres, Redis, n8n)
```

## API

15 REST endpoints across 6 resource domains. Full interactive documentation available at `/api/docs` when the API is running.

| Domain | Endpoints | Description |
|--------|-----------|-------------|
| Health | 1 | Service + dependency status |
| Users | 3 | Profile create/read/update |
| Mentors | 2 | List and get mentor profiles |
| Matches | 3 | Create/list/update mentor-mentee matches |
| Sessions | 4 | Create/list sessions, get details, upsert notes |
| Goals | 3 | Create/list/update goals |
| AI | 4 | Mentor matching, chat, learning path, session summary |

## Getting Started

### Prerequisites

- Node.js >= 20
- Docker Desktop (for local Postgres + Redis)
- Firebase project (free tier)
- Supabase account (free tier)
- Dify Cloud account (free tier)

### Setup

```bash
# Clone
git clone https://github.com/rkandruAV/path-connect.git
cd path-connect

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Start infrastructure (PostgreSQL, Redis, n8n)
docker compose up -d

# Run database migrations
npm run db:migrate

# Seed test data
npm run db:seed

# Start development servers (frontend + API)
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Console -> Project Settings |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Console -> Service Accounts |
| `DATABASE_URL` | Supabase -> Settings -> Database -> Connection string |
| `DIFY_MENTOR_MATCHER_KEY` | Dify Cloud -> Mentor Matcher app -> API Keys |
| `DIFY_SESSION_SUMMARIZER_KEY` | Dify Cloud -> Session Summarizer app -> API Keys |
| `DIFY_LEARNING_PATH_KEY` | Dify Cloud -> Learning Path app -> API Keys |
| `DIFY_AI_ADVISOR_KEY` | Dify Cloud -> AI Advisor app -> API Keys |
| `REDIS_URL` | Optional — app works without Redis |
| `SENTRY_DSN` | Optional — Sentry project DSN |

## Development

```bash
# Start frontend (Next.js on port 3000)
npm run dev --workspace=apps/web

# Start backend (Express on port 4000)
npm run dev --workspace=apps/api

# Run all tests (41 tests)
npm test

# Build all packages
npm run build

# Database operations
npm run db:migrate    # Run Prisma migrations
npm run db:seed       # Seed database
npm run db:studio     # Open Prisma Studio

# Docker
npm run docker:dev    # Start dev environment
npm run docker:down   # Stop containers
npm run docker:prod   # Start production build
```

## Roadmap

- [x] **Phase 0** — Project scaffolding, monorepo setup, Docker, database schema
- [x] **MVP1** — AI mentor matching, session management, session summaries, learning paths, AI advisor chat, goal tracking (5 screens)
- [x] **Production Hardening** — Rate limiting, Redis caching, shared validation, Swagger docs, Sentry, test suite (41 tests)
- [ ] **MVP2** — 90-day plan management, Google Calendar scheduling (n8n), sounding board (3 screens)
- [ ] **MVP3** — Become a mentor flow, mentor match management, notifications (3 screens)

## Documentation

- [Product Requirements (PRD)](docs/PRD.md)
- [Technical Design](docs/TECHNICAL_DESIGN.md)
- [Trade-offs and Decisions](docs/TRADEOFFS_AND_DECISIONS.md)

## License

Copyright (c) 2025 Rani Kandru. All rights reserved. See [LICENSE](LICENSE).
