# Dify — AI Engine Setup

Dify runs as a separate Docker Compose stack because it has 11+ containers (api, web, worker, postgres, redis, weaviate, nginx, sandbox, etc.).

## Quick Start

```bash
# 1. Clone Dify into this directory
git clone --branch "$(curl -s https://api.github.com/repos/langgenius/dify/releases/latest | jq -r .tag_name)" https://github.com/langgenius/dify.git dify-source

# 2. Navigate to Docker directory and configure
cd dify-source/docker
cp .env.example .env

# 3. Start Dify
docker compose up -d

# 4. Access Dify dashboard
# Open http://localhost/install in your browser
# Create your admin account
```

## After Setup

1. Go to **http://localhost** → Dify Dashboard
2. Go to **Settings → Model Provider** → Add your LLM (OpenAI, Anthropic, etc.)
3. Create the following apps (see Phase 2 in docs/PLAN.md):
   - **Mentor Matcher** (Workflow)
   - **Session Summarizer** (Workflow)
   - **Learning Path Generator** (Workflow)
   - **AI Mentor Chatbot** (Chatflow)
4. Copy the API keys from each app → add to your root `.env` as `DIFY_API_KEY`

## Ports

| Service | Port | URL |
|---------|------|-----|
| Dify Web UI | 80 | http://localhost |
| Dify API | 3080 (internal) | http://localhost:3080/v1 |

## Integration with PathConnect

The PathConnect API connects to Dify via the `DIFY_BASE_URL` and `DIFY_API_KEY` env vars.
Dify runs on its own network but is accessible from PathConnect containers via `host.docker.internal:3080`.

## Data Persistence

Dify stores data in `dify-source/docker/volumes/`. This directory is git-ignored.
