# Pyramid API — Backend

A REST API for the Pyramid task manager, built with **NestJS 10**, **Mongoose 8**, and **MongoDB**. It exposes guest authentication, users/teams, projects, tasks (with subtasks, reordering, and an activity trail), and per-task comments.

All routes are served under the `/api` prefix and — except for guest login — protected by a JWT bearer guard.

## Table of contents

- [Architecture](#architecture)
- [Requirements](#requirements)
- [Environment variables](#environment-variables)
- [Local setup](#local-setup)
- [Seeding demo data](#seeding-demo-data)
- [Data model](#data-model)
- [API reference](#api-reference)
- [Deployment (Render + MongoDB Atlas)](#deployment-render--mongodb-atlas)

## Architecture

The app follows NestJS's modular convention — one folder per domain, each with a controller (HTTP), a service (business logic), a Mongoose schema, and DTOs (request validation).

```
src/
├── main.ts                 # Bootstraps Nest, sets /api prefix, CORS, global ValidationPipe
├── app.module.ts           # Root module: config, Mongo connection, feature modules
├── common/
│   ├── decorators/         # @CurrentUser() — pulls userId off the JWT request
│   ├── enums/              # TaskStatus, Priority (shared by tasks & projects)
│   └── guards/             # JwtAuthGuard
├── auth/                   # Guest login + /me, JWT strategy
├── users/                  # Profile + team endpoints
├── projects/              # Project CRUD
├── tasks/                  # Task CRUD, reorder, activity
├── comments/               # Comments nested under a task
├── activity/               # Activity log service (written to by tasks)
└── seed/                   # Standalone demo-data seeder + shared seed service
```

Cross-cutting decisions:

- **Global prefix + validation.** `main.ts` registers `app.setGlobalPrefix('api')` and a global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform` enabled. Every request body is validated against a DTO and stripped of unknown fields, so controllers only ever see clean, typed input.
- **Workspace scoping.** There is no password login. A guest session creates a `User` and a private workspace, and every project/task/comment stores an `ownerId`. All queries filter by the authenticated `userId`, so one guest can never see another's data.
- **Consistent JSON shape.** Each schema's `toJSON` transform exposes `id` (string) and removes `_id`/`__v`. Reference fields (members, reporter, lead, comment author) are populated on read, so the frontend receives nested objects rather than raw ids.
- **Activity as a side effect.** When a task's status, priority, assignees, or due date change, `TasksService` writes an `Activity` record. The feed is therefore an audit trail the client can render without the client having to construct it.

## Requirements

- **Node.js 18+**
- **MongoDB** — a local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

| Variable        | Required | Default                              | Description                                                        |
| --------------- | :------: | ------------------------------------ | ------------------------------------------------------------------ |
| `PORT`          |    no    | `4000`                               | Port the API listens on.                                           |
| `CORS_ORIGIN`   |    no    | (all origins)                        | Comma-separated list of allowed frontend origins.                  |
| `MONGODB_URI`   |  **yes** | `mongodb://127.0.0.1:27017/pyramid`  | MongoDB connection string (local or Atlas).                        |
| `JWT_SECRET`    |  **yes** | —                                    | Secret used to sign session tokens. Use a long random string.      |
| `JWT_EXPIRES_IN`|    no    | `7d`                                 | Token lifetime (any [ms](https://github.com/vercel/ms) string).    |

## Local setup

```bash
cd backend
cp .env.example .env          # set MONGODB_URI and JWT_SECRET
npm install
npm run start:dev             # watch mode → http://localhost:4000/api
```

Useful scripts:

| Script                | What it does                                             |
| --------------------- | -------------------------------------------------------- |
| `npm run start:dev`   | Start in watch mode (development).                       |
| `npm run build`       | Compile TypeScript to `dist/`.                           |
| `npm run start:prod`  | Run the compiled server (`node dist/main`).              |
| `npm run seed`        | Load a persistent demo workspace (see below).            |
| `npm run lint`        | ESLint with `--fix`.                                     |
| `npm run format`      | Prettier over `src/`.                                    |

## Seeding demo data

```bash
npm run seed
```

This creates a stable **"Dexter"** demo workspace (matching the Figma), populated with sample projects, tasks, subtasks, comments, and activity. It's optional: **guests are seeded automatically on login**, so a fresh guest never lands on an empty screen. Seeding is handy when you want a fixed dataset to demo against.

## Data model

| Collection  | Key fields                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| `users`     | `fullName`, `email?`, `username?`, `title?`, `avatarUrl?`, `workspaceName?`, `isGuest`                       |
| `projects`  | `name`, `description`, `status`, `priority`, `leadId?`, `members[]`, `dueDate?`, `labels[]`, `ownerId`       |
| `tasks`     | `title`, `description`, `status`, `priority`, `labels[]`, `members[]`, `reporterId?`, `watchers[]`, `teams[]`, `resources[]`, `startDate?`, `dueDate?`, `projectId?`, `parentTaskId?`, `order`, `ownerId` |
| `comments`  | `taskId`, `authorId`, `body`, `parentId?`                                                                    |
| `activities`| `taskId`, `userId`, `type`, `message`                                                                        |

Enums (`src/common/enums`): **TaskStatus** = `backlog · todo · doing · completed · on_hold`; **Priority** = `no_priority · urgent · high · medium · low`. Both are shared between tasks and projects.

## API reference

Base URL: `http://localhost:4000/api`. All endpoints except `POST /auth/guest` require an `Authorization: Bearer <token>` header.

### Auth

| Method | Path          | Body | Description                                        |
| ------ | ------------- | ---- | -------------------------------------------------- |
| `POST` | `/auth/guest` | —    | Create a guest, seed their workspace, return `{ token, user }`. |
| `GET`  | `/auth/me`    | —    | Return the authenticated user.                     |

### Users

| Method  | Path           | Body            | Description                                    |
| ------- | -------------- | --------------- | ---------------------------------------------- |
| `GET`   | `/users/me`    | —               | Current user's profile.                        |
| `GET`   | `/users/team`  | —               | Assignable teammates (self + seeded members).  |
| `PATCH` | `/users/me`    | `UpdateUserDto` | Update name, title, username, email, etc.      |

### Projects

| Method   | Path            | Body                | Description                     |
| -------- | --------------- | ------------------- | ------------------------------- |
| `POST`   | `/projects`     | `CreateProjectDto`  | Create a project.               |
| `GET`    | `/projects`     | —                   | List the workspace's projects.  |
| `GET`    | `/projects/:id` | —                   | Get one project.                |
| `PATCH`  | `/projects/:id` | `UpdateProjectDto`  | Update a project.               |
| `DELETE` | `/projects/:id` | —                   | Delete a project.               |

### Tasks

| Method   | Path                 | Body / Query        | Description                                                            |
| -------- | -------------------- | ------------------- | --------------------------------------------------------------------- |
| `POST`   | `/tasks`             | `CreateTaskDto`     | Create a task (or subtask via `parentTaskId`).                        |
| `GET`    | `/tasks`             | query params        | List tasks. Filters: `projectId`, `parentTaskId`, `status`, `priority`, `search`. |
| `PATCH`  | `/tasks/reorder`     | `ReorderTasksDto`   | Persist board/list order for a status column.                        |
| `GET`    | `/tasks/:id`         | —                   | Get one task.                                                        |
| `GET`    | `/tasks/:id/activity`| —                   | Activity trail for a task.                                            |
| `PATCH`  | `/tasks/:id`         | `UpdateTaskDto`     | Update any task field.                                                |
| `DELETE` | `/tasks/:id`         | —                   | Delete a task (and its subtasks).                                     |

> `PATCH /tasks/reorder` is declared **before** `/tasks/:id` so "reorder" isn't captured as an `:id` route param.

### Comments (nested under a task)

| Method   | Path                              | Body               | Description                    |
| -------- | --------------------------------- | ------------------ | ------------------------------ |
| `GET`    | `/tasks/:taskId/comments`         | —                  | List a task's comments.        |
| `POST`   | `/tasks/:taskId/comments`         | `CreateCommentDto` | Add a comment.                 |
| `DELETE` | `/tasks/:taskId/comments/:commentId` | —               | Delete a comment (author only).|

### Quick smoke test

```bash
# 1) Get a token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/guest | npx --yes json token)

# 2) Call a protected route
curl -s http://localhost:4000/api/tasks -H "Authorization: Bearer $TOKEN"
```

## Deployment (Render + MongoDB Atlas)

**1. Database — MongoDB Atlas**

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user, and under **Network Access** allow `0.0.0.0/0` (so Render can connect).
3. Copy the connection string, e.g. `mongodb+srv://<user>:<pass>@<cluster>/pyramid?retryWrites=true&w=majority`.

**2. API — Render**

1. New → **Web Service**, connect this repo, set **Root Directory** to `backend`.
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm run start:prod`
4. **Environment variables:**
   - `MONGODB_URI` → your Atlas string
   - `JWT_SECRET` → a long random string
   - `CORS_ORIGIN` → your deployed frontend URL (e.g. `https://pyramid.vercel.app`)
   - `PORT` is provided by Render automatically.
5. Deploy. Your API base URL will be `https://<service>.onrender.com/api`.
6. (Optional) Run `npm run seed` once from the Render shell for a stable demo workspace.

> Free Render services sleep when idle; the first request after a nap can take ~30s to wake. This is expected on the free tier.

Point the frontend's `NEXT_PUBLIC_API_URL` at `https://<service>.onrender.com/api` and redeploy it.
