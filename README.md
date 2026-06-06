# CreatorHub — YouTube Creator Assistant

> **Tech stack:** Angular 21 (standalone + signals) · Tailwind CSS 4 · Express 5 · Prisma 7 · SQLite · Vitest

A full-stack web app for YouTube creators to **capture, organize, and track video ideas** through an Idea Vault and Kanban Board pipeline.

---

## Quick start

```bash
# 1. Install dependencies (both packages)
cd backend  && npm install
cd ../frontend && npm install

# 2. Set up the database
cd ../backend
cp .env.example .env   # edit PORT / CORS_ORIGIN if needed
npm run db:push        # creates/updates SQLite tables
npm run db:generate    # generates the Prisma client
npm run db:seed        # (optional) populates 12 sample video ideas

# 3. Start both servers (requires two terminals, or use root script)
# Terminal 1 — Backend API
npm run dev

# Terminal 2 — Frontend dev server
cd ../frontend && npm start
```

Open `http://localhost:4200` — the API runs on `http://localhost:3000`.

---

## Project structure

```
YoutubeCreatorAssistant/
├── backend/                     # Express REST API
│   ├── server.ts                # App entry: routes, validation, Prisma
│   ├── server.spec.ts           # Vitest + Supertest integration tests
│   ├── prisma/
│   │   ├── schema.prisma        # Idea model (SQLite)
│   │   ├── generated/           # Generated Prisma client (v7)
│   │   └── migrations/          # Migration history
│   ├── prisma.config.ts         # Prisma config (CLI + client)
│   ├── .env.example             # Required env vars
│   └── package.json
│
├── frontend/                    # Angular 21 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.ts / app.html            # Shell with sidebar + router
│   │   │   ├── idea-vault.component.ts      # Idea grid + create/edit modal
│   │   │   ├── kanban-board.component.ts    # Kanban columns by status
│   │   │   ├── idea.service.ts             # HTTP client for /api/ideas
│   │   │   ├── toast.service.ts + component # Global toast notifications
│   │   │   ├── confirm.service.ts + dialog  # Delete confirmation dialog
│   │   │   └── *.spec.ts                    # Vitest tests
│   │   ├── environments/         # API URL config
│   │   └── styles.css            # Tailwind import
│   └── angular.json
│
├── scripts/dev.js               # Runs backend + frontend concurrently
├── package.json                 # Root workspace scripts
└── docs/PROJECT_EVALUATION.md   # Architecture & code quality analysis
```

---

## Available scripts

### Backend (`backend/`)
| Script | Purpose |
|---|---|
| `npm run dev` | Start API with hot-reload (tsx watch) |
| `npm start` | Start API without watch |
| `npm test` | Run Vitest test suite |
| `npm run db:push` | Push Prisma schema → SQLite |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed the database with 12 sample video ideas |

### Frontend (`frontend/`)
| Script | Purpose |
|---|---|
| `npm start` | Angular dev server (port 4200) |
| `npm test` | Run Vitest tests via Angular CLI |
| `npm run build` | Production build |

### Root
| Script | Purpose |
|---|---|
| `npm run dev` | Start both servers (requires `scripts/dev.js`) |
| `npm test` | Run all tests (backend + frontend) |

---

## Domain model

```prisma
model Idea {
  id          String   @id @default(uuid())
  title       String
  description String?
  status      String   @default("RESEARCHING")  // RESEARCHING | PLANNING | IN_PROGRESS | COMPLETED
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## API reference

| Method | Endpoint | Description |
|---|---|---|
| `GET`    | `/api/ideas`  | List all ideas (newest first) |
| `POST`   | `/api/ideas`  | Create idea (title required, 400 on validation error) |
| `PUT`    | `/api/ideas/:id` | Update any field(s) of an idea |
| `DELETE` | `/api/ideas/:id` | Permanently delete an idea |
| `GET`    | `/health`     | Health check |

Validation: title max 200 chars, description max 5000 chars, status must be one of the four enumerated values.

---

## Testing

```bash
# All tests
npm test

# Per-package
cd backend   && npm test    # 10 tests (API endpoints)
cd frontend  && npm test    # 35 tests (shell, vault, kanban, service)
```

---

## Features implemented

- **Idea Vault** — card grid with create/edit/delete, status dropdown, inline edit
- **Kanban Board** — four status columns with drag-select cards
- **Validation** — title required (max 200), description max 5000, enforced client + server
- **Loading states** — skeleton cards during API fetch
- **Error handling** — toast notifications, retry on failure, optimistic rollback
- **Confirmation dialogs** — destructive actions require confirmation
- **Configurable** — PORT, CORS_ORIGIN, API_URL via env files
- **Router** — `/ideas` and `/kanban` routes with sidebar navigation
- **Full test coverage** — 45 tests across both packages

---

## Environment variables

| Variable | Default | Backend |
|---|---|---|
| `PORT` | `3000` | Express listen port |
| `CORS_ORIGIN` | `http://localhost:4200` | Allowed CORS origin |
| `DATABASE_URL` | `file:./dev.db` | SQLite file path |

See `backend/.env.example` for a template.
