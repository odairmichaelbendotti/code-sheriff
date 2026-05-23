<div align="center">

# CodeSheriff

**AI agent that connects to your GitHub, lists all open Pull Requests, and delivers a real-time report of security vulnerabilities, performance bottlenecks, and technical debt before they reach production.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-D97757?style=flat&logo=anthropic&logoColor=white)

</div>

---

## Overview

Manual code reviews are slow, inconsistent, and often miss subtle bugs. CodeSheriff solves this by putting an AI agent to work the moment you're ready to merge — no CI pipeline configuration, no GitHub App installation, no setup friction.

Log in with your GitHub account, pick one of your open Pull Requests, inspect the visual diff, and hit **Run AI Analysis**. Within seconds, findings start streaming to your screen live — each one with the exact line of code, severity level, a human-readable explanation, a fix suggestion, and a before/after diff.

## Features

- → **GitHub OAuth integration** — authenticates with your account and automatically lists all your open Pull Requests
- → **Public and private repositories** — works with any repo you have access to, using your GitHub token
- → **Visual diff viewer** — shows added and removed lines per file with syntax highlighting, with expand/collapse all
- → **Real-time AI analysis** — findings stream live to the screen as Claude processes the code, no waiting for a final blob of text
- → **Three analysis dimensions** — security vulnerabilities, performance bottlenecks, and code quality issues in a single agent call
- → **Smart file filtering** — only real code files are sent to the AI; documentation, lockfiles, images, and other non-code files are automatically excluded
- → **Verdict system** — `Blocked`, `Review needed`, or `Looks good` based on critical issues and warnings found
- → **Grouped report** — findings organized by file, filterable by dimension (security / performance / quality)
- → **Smart deduplication** — double deduplication by exact file/line/severity and by semantic message similarity, keeping the report clean and actionable
- → **Analysis history** — every run is saved to your account so you can revisit past reports at any time

## Tech Stack

| Layer              | Technologies                                  |
| ------------------ | --------------------------------------------- |
| Frontend           | React, React Router, Tailwind CSS v4, Zustand |
| Backend            | Node.js, Express                              |
| AI                 | Anthropic SDK — `claude-sonnet-4-6`           |
| GitHub integration | Octokit (`@octokit/rest`)                     |
| Auth               | Better Auth + GitHub OAuth App                |
| Database           | Supabase (PostgreSQL) + Prisma ORM            |

## How It Works

```
→ 1. Login with GitHub OAuth
        ↓
→ 2. CodeSheriff lists all your open Pull Requests
        ↓
→ 3. Select a PR — backend fetches changed files via Octokit
        ↓
→ 4. Visual diff is displayed per file (accordion)
        ↓
→ 5. Click "Run AI Analysis"
        ↓
→ 6. Backend filters code files, fetches full content, builds prompt
        ↓
→ 7. Single call to Claude (claude-sonnet-4-6) — security + performance + quality
        ↓
→ 8. Findings stream live via SSE as Claude responds
        ↓
→ 9. Final report: grouped by file, filterable by agent, with verdict
```

## Getting Started

### Prerequisites

- Node.js 22+
- A [GitHub OAuth App](https://github.com/settings/developers) — when creating it, set the **Authorization callback URL** to `http://localhost:4000/api/auth/callback/github`. No scope configuration is needed; GitHub grants the necessary permissions automatically based on what the app requests at login.
- A Supabase project
- An Anthropic API key

### 1. Clone the repository

```bash
git clone https://github.com/odairmichaelbendotti/code-sheriff.git
cd code-sheriff
```

### 2. Configure environment variables

**Backend** — create `back-end/.env`:

```env
BETTER_AUTH_URL=http://localhost:4000
BETTER_AUTH_SECRET=your_secret_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
DATABASE_URL=your_supabase_connection_string
ANTHROPIC_API_KEY=your_anthropic_api_key
```

**Frontend** — create `front-end/.env`:

```env
VITE_SERVER_URL=http://localhost:4000
```

### 3. Install dependencies

From the root of the project — installs dependencies for both frontend and backend:

```bash
npm install
```

### 4. Sync the database schema

```bash
cd back-end
npx prisma db push
npx prisma generate
cd ..
```

### 5. Start the servers

> **Note:** The default ports are `5173` (frontend) and `4000` (backend). The examples in this documentation, including environment variables and the OAuth callback URL, use these ports. You can change them freely — just remember that the backend logs the frontend URL as `http://localhost:5173` by default, so if you change the frontend port you can override it via the `FRONTEND_PORT` environment variable in `back-end/.env`.

From the root, start both servers with a single command:

```bash
npm run dev
```

Or start them individually:

```bash
npm run dev:frontend   # React app at http://localhost:5173
npm run dev:backend    # Express API at http://localhost:4000
```

Open [http://localhost:5173](http://localhost:5173) and log in with your GitHub account.

## API Documentation

With the backend running, the interactive API reference is available at:

```
http://localhost:4000/api/docs
```

It is powered by [Swagger UI](https://swagger.io/tools/swagger-ui/) and documents all available endpoints with their request bodies, parameters, and response schemas.

| URL                                   | Description                 |
| ------------------------------------- | --------------------------- |
| `http://localhost:4000/api/docs`      | Interactive Swagger UI      |
| `http://localhost:4000/api/docs/spec` | Raw OpenAPI 3.0 spec (JSON) |

### Documented endpoints

| Method   | Path                       | Description                                   |
| -------- | -------------------------- | --------------------------------------------- |
| `GET`    | `/api/pulls`               | List open PRs for the authenticated user      |
| `POST`   | `/api/analyze/preview`     | Fetch changed files from a GitHub PR          |
| `POST`   | `/api/analyze/run`         | Run AI analysis and stream findings via SSE   |
| `GET`    | `/api/analyze/history`     | List past analyses for the authenticated user |
| `DELETE` | `/api/analyze/history/:id` | Delete an analysis by ID                      |

### Authentication in Swagger

All `/api/analyze/*` and `/api/pulls` routes require an active session. Authentication is cookie-based (GitHub OAuth), so to test protected endpoints directly from Swagger UI:

1. Log in through the frontend at [http://localhost:5173](http://localhost:5173).
2. Your browser session cookie is automatically sent — open Swagger UI in the **same browser**.
3. Requests made from the Swagger UI will include the session cookie and be treated as authenticated.

---

<div align="center">
  <sub>Built by <a href="https://github.com/odairmichaelbendotti">@odairmichaelbendotti</a></sub>
</div>
