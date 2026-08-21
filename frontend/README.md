# Pyramid — Frontend

The web client for the Pyramid task manager: a workspace with **Projects**, a **Tasks** board (kanban) and grouped list, a rich **task detail** view, and **Settings** for profile and theming. Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui** (Radix primitives), and **TanStack Query**.

## Table of contents

- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Environment variables](#environment-variables)
- [Local setup](#local-setup)
- [Architecture](#architecture)
- [Theming (light/dark + accent)](#theming-lightdark--accent)
- [Design notes](#design-notes)
- [Deployment (Vercel)](#deployment-vercel)

## Tech stack

| Concern            | Choice                                                        |
| ------------------ | ------------------------------------------------------------- |
| Framework          | Next.js 14.2 (App Router, RSC + client components)            |
| Language           | TypeScript 5.5                                                |
| Styling            | Tailwind CSS 3.4 + `tailwindcss-animate`                      |
| Components         | shadcn/ui on Radix (zinc base), `class-variance-authority`    |
| Server state       | TanStack Query 5                                              |
| HTTP               | Axios (single instance with auth + 401 interceptors)          |
| Light/Dark theming | `next-themes` (`class` strategy)                              |
| Accent theming     | custom `ColorProvider` (`data-accent` attribute)              |
| Drag & drop        | `@dnd-kit` (board reordering)                                 |
| Dates              | `react-day-picker` + `date-fns`                               |
| Icons              | `lucide-react`                                                |
| Toasts             | `sonner`                                                      |

## Requirements

- **Node.js 18+**
- The [Pyramid API](../backend/README.md) running and reachable (locally on `http://localhost:4000/api` by default).

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable              | Required | Default                     | Description                                        |
| --------------------- | :------: | --------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` |    no    | `http://localhost:4000/api` | Base URL of the API, **including** the `/api` path. |

Because it's prefixed `NEXT_PUBLIC_`, this value is inlined into the browser bundle at build time — set it before building for production.

## Local setup

```bash
cd frontend
cp .env.example .env.local     # point NEXT_PUBLIC_API_URL at your API
npm install
npm run dev                    # → http://localhost:3000
```

Scripts: `npm run dev` (dev server), `npm run build` (production build), `npm run start` (serve the build), `npm run lint` (Next/ESLint).

Open the app and click **Continue as guest** — the API provisions a private, pre-seeded workspace, so you land on populated boards immediately.

## Architecture

Routing uses the App Router with **route groups** that share layouts without adding URL segments:

```
src/
├── app/
│   ├── layout.tsx              # Root: fonts, providers, pre-paint accent script
│   ├── page.tsx                # Entry redirect
│   ├── login/                  # Guest login screen
│   ├── (app)/                  # Main shell (sidebar + framed content panel)
│   │   ├── layout.tsx
│   │   ├── tasks/              #   /tasks, /tasks/[id]
│   │   └── projects/           #   /projects, /projects/[id]
│   └── (settings)/             # Settings shell (sub-sidebar)
│       └── settings/           #   /settings, /profile, /theme, /color
├── components/
│   ├── ui/                     # shadcn/ui primitives (button, dialog, select…)
│   ├── layout/                 # App shell, sidebar, page header
│   ├── providers/              # Theme, Color (accent), Query providers
│   ├── auth/                   # Route guard
│   ├── tasks/                  # Board, list, cards, task detail + panels
│   ├── projects/               # Project list (table) + detail
│   ├── settings/               # Profile / Theme / Color settings
│   └── brand/                  # Logo
├── hooks/                      # TanStack Query hooks (use-tasks, use-projects…)
├── lib/                        # api client, auth-storage, query-keys, format, utils
└── types/                      # Shared TypeScript models
```

Key decisions:

- **Server state lives in TanStack Query, not React state.** Each domain has a hooks module (`use-tasks`, `use-projects`, `use-comments`, `use-team`, `use-auth`) that wraps the typed API functions in `lib/api.ts`. Query keys are centralized in `lib/query-keys.ts` so mutations can invalidate precisely. Components stay declarative — they read a query and fire a mutation; caching, refetching, and loading states are handled for them.
- **One axios instance.** `lib/api.ts` creates a single client whose `baseURL` already includes `/api`. A request interceptor attaches the JWT from `localStorage`; a response interceptor catches `401`s, clears the token, and redirects to `/login` (guarding against a redirect loop). This keeps auth concerns out of every call site.
- **Auth is a JWT in localStorage.** `lib/auth-storage.ts` is the single source of truth for the token key, guarded for SSR. `AuthGuard` gates the authenticated shell.
- **Reusable primitives + composed features.** `components/ui` holds unstyled-logic Radix wrappers (the reusability layer). Feature folders compose them — e.g. the task pickers in `tasks/task-inputs.tsx` (`StatusSelect`, `PrioritySelect`, `DueDatePicker`, `MemberMultiSelect`) are shared by the board card, the list row, the create dialog, and the task detail panel, so one control behaves identically everywhere.
- **A framed-shell layout.** The `(app)` group renders a gray canvas + sidebar + a rounded white content panel. Pages render a `PageHeader` (title/actions/breadcrumb) over a scrollable body, giving every screen a consistent frame.
- **Responsiveness.** The sidebar collapses into a slide-in sheet on small screens (toggled from the header). The task detail's right-hand Details/Updates column drops below the main content on narrow viewports and becomes sticky beside it on wide ones (`lg:` breakpoints). The board scrolls horizontally across its status columns, while the list and project tables progressively hide secondary columns on smaller screens (`hidden sm:/md:/lg:table-cell`) so the primary column always stays readable instead of the layout breaking.

## Theming (light/dark + accent)

Theming has **two independent axes**, both persisted to `localStorage` and re-applied before first paint so a refresh never flashes the wrong colors:

1. **Light / Dark** — handled by `next-themes` with the `class` strategy (toggles `.dark` on `<html>`). Default is **Light**; "System" is available. next-themes injects its own pre-paint script.
2. **Accent ("Color Mode")** — a custom `ColorProvider` that sets `data-accent="…"` on `<html>`. `globals.css` maps each accent to only the `--primary`, `--primary-foreground`, and `--ring` tokens, so the accent recolors primary buttons, active nav, focus rings, checkboxes, the calendar selection, and the watcher tint — **without** touching the neutral surface palette. An inline pre-paint script (`accentPrePaintScript`, rendered in `<head>` by the root layout) applies the saved accent before React hydrates.

Available accents are `black` (default), `blue`, `amber`, `pink`, `rose`, and `emerald`. **Status and priority colors are deliberately fixed/semantic** (e.g. urgent is always red) — they're meaning, not decoration, so the accent never overrides them.

`suppressHydrationWarning` is set on `<html>` because both scripts mutate its attributes before hydration; this is expected and safe.

## Design notes

The brief treats design fidelity as the primary criterion, so the UI tracks the Figma closely. A handful of **intentional, documented deviations** were made — each for a defensible reason (correctness, honesty about what's actually wired up, or a small product-thinking improvement):

1. **Default accent is Black.** The Figma hero screens lean on a colored accent, but Black is the neutral, professional default. All accents remain user-selectable and persist across refresh.
2. **Auth: Guest Login is fully working; Google sign-in is a visual stub.** The brief requires a working guest login. The Google button is shown for fidelity but is not wired to an OAuth provider.
3. **Projects screen action is labeled "Add Project."** The Figma Projects screen reuses an "Add Task" label (an apparent mislabel); it's implemented as "Add Project" for correctness.
4. **Task detail: the thread section is labeled "Comments."** Figma shows a second "Subtasks" heading above the discussion thread (an apparent mislabel); it's implemented as "Comments," which is semantically correct.
5. **The task-detail lock icon is a visual affordance only.** The update API (`UpdateTaskInput`) doesn't accept a `locked` field, so the header lock toggles local UI state and does not persist. It's kept for fidelity and as a clear talking point.
6. **Comment threading is not persisted.** The comments API stores a flat list. Both composers (the "Leave a reply…" box shown once a thread exists, and the bottom "Add a comment…" box) post top-level comments; the reply box is a second entry point, not a nested thread.
7. **The composer's attach (paperclip) icon is decorative.** There's no file-upload backend, so the paperclip is a non-interactive glyph (`aria-hidden`); the send button is functional.
8. **The watchers eye + count is read-only.** It's accent-tinted and opens a popover listing watchers, but toggling watch state isn't wired to the backend.
9. **The Details panel's + and gear are real controls.** Rather than dead buttons, "+" adds a hidden optional row (Teams / Reporter / Created) and the gear toggles each row's visibility; the choice persists to `localStorage` (`pyramid.task.details`).

## Deployment (Vercel)

1. Push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new).
2. Set the project **Root Directory** to `frontend`. Vercel auto-detects Next.js (build `next build`, no extra config needed).
3. Add the environment variable **`NEXT_PUBLIC_API_URL`** = your deployed API base URL, e.g. `https://<service>.onrender.com/api`.
4. Deploy. Vercel gives you a URL like `https://pyramid.vercel.app`.
5. Back on the API, set `CORS_ORIGIN` to this Vercel URL and redeploy so the browser is allowed to call it.

> If guest login fails in production with a network/CORS error, it's almost always the two URLs not matching: confirm `NEXT_PUBLIC_API_URL` points at `…/api` and that the API's `CORS_ORIGIN` lists the exact frontend origin.
