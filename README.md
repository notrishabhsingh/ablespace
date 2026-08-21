# Pyramid — Task Management System

A full-stack task management application built for the Full Stack Developer technical assessment.
Implements a Figma-based design with a Kanban board, list views, task details with subtasks & comments, projects, guest authentication, and a dual-axis theming system (light/dark × 6 accent colors) that persists across refreshes.

## Tech Stack

| Layer      | Technology                                                        |
| ---------- | ----------------------------------------------------------------- |
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui       |
| Data layer | TanStack Query, Axios                                             |
| Drag & drop| dnd-kit                                                           |
| Backend    | NestJS 10, TypeScript                                             |
| Database   | MongoDB + Mongoose                                                |
| Auth       | JWT (guest login)                                                |

## Repository Structure

```
pyramid-task-manager/
├── backend/          # NestJS REST API (MongoDB/Mongoose)
├── frontend/         # Next.js App Router client
└── README.md         # You are here
```

Each app has its own README with detailed setup and architecture notes:
- [backend/README.md](./backend/README.md)
- [frontend/README.md](./frontend/README.md)

## Quick Start

You need **Node.js 18+** and a **MongoDB** connection string (local `mongod` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

```bash
# 1. Backend
cd backend
cp .env.example .env          # then set MONGODB_URI + JWT_SECRET
npm install
npm run seed                  # optional: load demo data
npm run start:dev             # http://localhost:4000

# 2. Frontend (in a second terminal)
cd frontend
cp .env.example .env.local    # points at http://localhost:4000
npm install
npm run dev                   # http://localhost:3000
```

Open ablespace-gamma.vercel.app, click **Continue as Guest**, and you're in.

## Key Features

- **Guest authentication** — one click creates a scoped guest workspace with a JWT session.
- **Tasks — Board view** — Kanban columns (Backlog / To Do / Doing / Completed / On Hold) with drag-and-drop reordering and status changes.
- **Tasks — List view** — grouped by status with configurable columns (Fields menu), search, and filters.
- **Task detail** — description, properties, labels, subtasks, activity feed, comments, and a details panel with status/priority/date pickers.
- **Projects** — project list and per-project task views.
- **Settings / Profile** — editable profile plus theme controls.
- **Theming** — independent **Light/Dark** mode and **accent color** (Amber, Blue, Pink, Rose, Emerald, Black). Both persist across refreshes via `localStorage`.
- **Responsive** — adapts across desktop, tablet, and mobile.

## Deployment

**Following it step by step?** Use the ordered runbook with a verification checkpoint after each stage: [DEPLOYMENT.md](./DEPLOYMENT.md).

The two apps deploy independently against a shared MongoDB Atlas database:

| Piece    | Host                | Root directory | Notes                                          |
| -------- | ------------------- | -------------- | ---------------------------------------------- |
| Database | MongoDB Atlas       | —              | Free tier; allow network access from the API.  |
| Backend  | Render (Web Service)| `backend`      | Build `npm install && npm run build`, start `npm run start:prod`. |
| Frontend | Vercel              | `frontend`     | Auto-detected Next.js build.                   |

The two environment variables that tie it together:

- **API** — set `MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGIN` (= the deployed frontend URL).
- **Frontend** — set `NEXT_PUBLIC_API_URL` (= the deployed API URL, including `/api`).

A common first-deploy failure is these last two not matching — the browser calls the API from the frontend's origin, so `CORS_ORIGIN` must list that exact origin and `NEXT_PUBLIC_API_URL` must end in `/api`.

Full, step-by-step instructions live in each app's README:
- Backend + database → [backend/README.md#deployment-render--mongodb-atlas](./backend/README.md#deployment-render--mongodb-atlas)
- Frontend → [frontend/README.md#deployment-vercel](./frontend/README.md#deployment-vercel)

> **Live URL:** _add the deployed frontend URL here once the app is live._

## Notes on the Assessment

- Intentional deviations from the Figma design are documented in [frontend/README.md](./frontend/README.md#design-notes).
- Commits are made in small, meaningful chunks that map to feature phases (see git history).
