# PathConnect - Product Requirements Document

## 1. Product Overview

PathConnect is an AI-powered mentorship platform that connects mentees with mentors through intelligent matching, automates session documentation, and generates personalized career development plans. The platform bridges the gap between career seekers and experienced professionals using AI to optimize the mentoring relationship.

## 2. Problem Statement

Career professionals seeking mentorship face three core challenges:
- **Finding the right mentor** is manual, time-consuming, and often based on surface-level criteria
- **Tracking progress** across mentoring sessions is inconsistent — insights are lost, action items are forgotten
- **Structuring a development plan** requires self-awareness and experience that early-career professionals often lack

## 3. Target Users

### Mentees (Primary)
- Early to mid-career professionals looking to grow into new roles
- Career changers who need guidance navigating transitions
- Individuals who want structured, measurable career development

### Mentors
- Experienced professionals willing to share expertise
- Industry leaders who want to give back
- Professionals building a coaching practice

## 4. Core Features

### 4.1 AI Mentor Matching
- Mentees provide their current position, target role, and career goals
- AI analyzes the mentee profile against the full mentor pool (expertise, industry, experience, bio)
- Returns ranked list of recommended mentors with match score (0-100) and reasoning
- Mentees send match requests; mentors accept or decline
- Prevents duplicate active matches with the same mentor

### 4.2 Session Management
- Create sessions from active mentor-mentee matches
- Session types: Video, Audio, In-Person
- Duration: 15-180 minutes
- Meeting link integration (external provider — Zoom, Google Meet)
- Session lifecycle: Scheduled -> Completed / Cancelled

### 4.3 AI Session Summarization
- After a session, either participant can trigger an AI summary
- Requires session notes as input (personal reflections captured during/after session)
- Generates: conversation summary, key topics, key insights
- Auto-creates action items assigned to mentee or mentor with optional due dates
- Summary is persisted — subsequent views read from database, not AI

### 4.4 Personal Session Notes
- Each participant has private notes per session (not shared with the other party)
- Upsert model — one note per user per session, editable
- Maximum 10,000 characters

### 4.5 AI Learning Path Generator
- Generates a personalized 90-day learning path based on:
  - Current position and target role
  - Existing goals and milestones
  - Recent session insights
- Outputs 30-day, 60-day, and 90-day goals
- Results cached for 12 hours per user (not persisted to database)

### 4.6 AI Career Advisor Chat
- Multi-turn conversational AI for career questions
- Topics: career goals, interview prep, skill development
- Conversation state managed by Dify (conversationId)
- Maximum 2,000 characters per message

### 4.7 Goal Tracking
- Create goals linked to 30-day, 60-day, or 90-day periods
- Optional linkage to a 90-day plan
- Goals can be AI-suggested (from learning path) or manually created
- Status tracking: Pending -> On Track -> Achieved / Needs Update
- Milestone tracking with achievement timestamps

### 4.8 User Profiles & Onboarding
- Firebase authentication (Email/Password + Google OAuth)
- Auto-create user on first login
- Mentee profile: display name, current position, target role, bio
- Mentor profile: expertise areas (1-20), industry, years of experience, availability, bio
- Week streak for engagement tracking

## 5. Feature Priority (Phased Rollout)

### Phase 1 — MVP (Current)
| Feature | Status |
|---------|--------|
| User auth (Firebase) | Built |
| User profiles + onboarding | Built |
| Mentor discovery (browse + filter) | Built |
| AI mentor matching | Built |
| Match request flow (request/accept/decline) | Built |
| Session creation + listing | Built |
| Session detail view (summary, action items, notes) | Built |
| AI session summarization | Built |
| Personal session notes | Built |
| AI learning path generation | Built |
| AI career advisor chat | Built |
| Goal creation + tracking | Built |
| Dashboard overview | Built |

### Phase 2 — Planned
| Feature | Status |
|---------|--------|
| 90-day plan management | Data model ready, no UI |
| Google Calendar integration (via n8n) | Not started |
| Sounding board (peer support network) | Data model ready, no API |
| Email/Slack notifications (via n8n) | Not started |

### Phase 3 — Future
| Feature | Status |
|---------|--------|
| Become a Mentor flow | Not started |
| Mentor match management view | Not started |
| Admin dashboard | Not started |
| Real-time notifications (Socket.io) | Infrastructure ready |

## 6. Non-Functional Requirements

### Performance
- API response time: < 500ms for CRUD, < 60s for AI workflows
- Pagination: max 50 items per page on all list endpoints
- Redis caching for frequently accessed data (mentor list, learning paths)

### Security
- All endpoints require Firebase JWT authentication (except health check)
- Input validation on every endpoint (Zod schemas, shared frontend/backend)
- Rate limiting: 100 req/15min general, 20 req/15min for AI endpoints
- CORS origin whitelist
- Security headers via Helmet

### Reliability
- Graceful degradation: app works without Redis (cache miss fallback)
- Graceful degradation: Sentry disabled without DSN
- Health check endpoint with database and Redis connectivity status
- Structured error logging with Sentry integration for 5xx errors

### Scalability
- Stateless API (JWT auth, no server-side sessions)
- Connection pooling for PostgreSQL (Supabase pooler)
- Cacheable mentor list and learning paths via Redis
- Docker-based deployment for horizontal scaling

## 7. Success Metrics (Proposed)

| Metric | Target |
|--------|--------|
| Mentor match acceptance rate | > 50% |
| Session completion rate | > 80% |
| AI summary generation per session | > 60% |
| Goal achievement rate (90-day) | > 40% |
| Weekly active users (week streak) | Increasing trend |
| AI advisor chat engagement | > 3 messages per conversation |

## 8. Out of Scope (Current)

- Payment/subscription system
- Video conferencing (relies on external links)
- Mobile native app (responsive web only)
- Content/course library
- Group mentoring sessions
- Mentor ratings/reviews
