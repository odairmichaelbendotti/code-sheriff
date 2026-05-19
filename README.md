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

- 🔐 **GitHub OAuth integration** — authenticates with your account and automatically lists all your open Pull Requests
- 👁️ **Visual diff viewer** — shows added and removed lines per file with syntax highlighting, with expand/collapse all
- ⚡ **Real-time AI analysis** — findings stream live to the screen as Claude processes the code, no waiting for a final blob of text
- 🔍 **Three analysis dimensions** — security vulnerabilities, performance bottlenecks, and code quality issues in a single agent call
- ⚖️ **Verdict system** — `Blocked`, `Review needed`, or `Looks good` based on critical issues and warnings found
- 📂 **Grouped report** — findings organized by file, filterable by dimension (security / performance / quality)
- 🧹 **Smart deduplication** — double deduplication by exact file/line/severity and by semantic message similarity, keeping the report clean and actionable
- 🕓 **Analysis history** — every run is saved to your account so you can revisit past reports at any time

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, React Router, Tailwind CSS v4, Zustand |
| Backend | Node.js, Express |
| AI | Anthropic SDK — `claude-sonnet-4-6` |
| GitHub integration | Octokit (`@octokit/rest`) |
| Auth | Better Auth + GitHub OAuth App |
| Database | Supabase (PostgreSQL) + Prisma ORM |

## How It Works

```
🔐 1. Login with GitHub OAuth
        ↓
📋 2. CodeSheriff lists all your open Pull Requests
        ↓
📁 3. Select a PR → backend fetches changed files via Octokit
        ↓
👁️ 4. Visual diff is displayed per file (accordion)
        ↓
▶️  5. Click "Run AI Analysis"
        ↓
🤖 6. Backend filters code files, fetches full content, builds prompt
        ↓
🔍 7. Single call to Claude (claude-sonnet-4-6) — security + performance + quality
        ↓
⚡ 8. Findings stream live via SSE as Claude responds
        ↓
📊 9. Final report: grouped by file, filterable by agent, with verdict
```

## Getting Started

### Prerequisites

- Node.js 18+
- A GitHub OAuth App ([create one here](https://github.com/settings/developers)) with scopes: `read:user`, `user:email`, `repo`
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
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_secret_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
DATABASE_URL=your_supabase_connection_string
ANTHROPIC_API_KEY=your_anthropic_api_key
```

**Frontend** — create `front-end/.env`:

```env
VITE_SERVER_URL=http://localhost:3000
```

### 3. Install dependencies

```bash
# Backend
cd back-end && npm install

# Frontend
cd ../front-end && npm install
```

### 4. Run database migrations

```bash
cd back-end
npx prisma migrate deploy
```

### 5. Start the servers

```bash
# Backend (port 3000)
cd back-end && npm run dev

# Frontend (port 5173)
cd front-end && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and log in with your GitHub account.

---

<div align="center">
  <sub>Built by <a href="https://github.com/odairmichaelbendotti">@odairmichaelbendotti</a></sub>
</div>
