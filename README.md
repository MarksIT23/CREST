# CREST — Capstone Research Electronic Storage and Tracking

**CREST** is the official capstone research repository of the **College of Engineering and Computer Technology (CECT), Wesleyan University Philippines**. Students submit capstones for faculty review; faculty approve accounts and papers; admins run the archive — and everyone can browse, cite, and save published research across **BSIT**, **BSCpE**, and **BSECE**.

> Client: React 19 + Vite + Tailwind CSS 4 · Server: Express + Prisma (SQLite) · Auth: JWT + bcrypt

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [NPM Scripts](#npm-scripts)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Auth & Roles](#auth--roles)
- [Key Behaviors & Design Notes](#key-behaviors--design-notes)
- [Configuration](#configuration)
- [Lint & Build](#lint--build)
- [Troubleshooting](#troubleshooting)

---

## Features

### Public discovery (no login required)

- **Home page** — hero, discipline collection browser, how-it-works, programs, archive story, get-started CTA
- **Browse repository** (`/browse`) — full-text search plus filters for program, category/track, year and status; **adviser filter** and **sorting** (newest, oldest, most viewed, most cited, title A–Z) applied client-side before pagination
- **Research detail page** (`/research/:id`) — abstract, metadata, related papers, view counting
  - **Citation picker** — one-click APA, MLA, IEEE, and BibTeX output with copy-to-clipboard and `.bib` / `.txt` download
  - **Manuscript preview** — collapsed viewer card that loads the PDF on demand (iframe with loading and error states, open-in-new-tab and download actions)
- **Faculty directory** (`/faculty`, `/faculty/:id`) — searchable index with department/program filters plus rich profile pages (hero masthead, advised-paper list, skeleton loaders, graceful missing-profile state)
- **About page** — system pipeline, programs, and college chapters

### Student portal (`/dashboard`, `/submit`, `/profile`)

- **Dashboard** — time-aware greeting, submission status line, stat cards (Approved / Pending / Drafts / Saved), submissions feed with views and citations, drafts rail, reading-list teaser, quick actions (New Submission, Browse)
- **Multi-step submission wizard** — details → authors → files/review, with PDF upload (multer), draft autosave to the server, and review summary
  - **Thesis number is required** (e.g. `WU-CECT-IT-2025-001`); **research adviser is picked from the live faculty directory** (or "To be assigned")
- **Saved papers (bookmarks)** — account-scoped reading list persisted in `localStorage` (`crest_saved_<userId>`); guests are redirected to `/auth` when they try to save; legacy `crest_saved` key is adopted once and removed
- **Profile page** — ink identity header (monogram, live name, role/program/year chips) with sliding-pill tabs: **Profile** (edit name, program, year, section), **Library** (saved papers with dead-entry pruning), **Security** (change password)

### Faculty portal (`/portal`)

- Dashboard, paper review queue, **student account approvals** (approve / reject-deactivate / reinstate) through a shared `ConfirmDialog` instead of `window.confirm`, analytics

### Admin console (`/admin`)

- Dashboard, paper moderation (approve / reject / archive with reviewer notes), faculty management, student management (approve / reject / reinstate / remove), category management, analytics and activity feed

---

## Tech Stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Client     | React 19, React Router 7, Vite 8, Tailwind CSS 4 (`@tailwindcss/vite`)      |
| Motion/UI  | Framer Motion, Lucide React, Material Symbols Outlined                     |
| Fonts      | Fraunces (display serif), Karla (body), IBM Plex Mono (catalog data)       |
| HTTP       | Axios with `crest_user` Bearer-token interceptor                           |
| Server     | Express 4, Prisma 6 (SQLite), bcryptjs, jsonwebtoken, multer, cors         |
| Tooling    | Oxlint, concurrently (runs client + server together)                       |

---

## Project Structure

```
ReposIT-testing/
├── README.md
├── index.html                  # Fonts, meta, title, favicon, #root
├── vite.config.js              # React + Tailwind plugins; /api + /uploads proxy → :3002
├── package.json                # Client scripts: dev, dev:client, dev:server, build, lint, preview
│
├── public/
│   └── videos/                 # Landing-page media
│
├── src/
│   ├── main.jsx                # React entry
│   ├── App.jsx                 # Router, lazy pages, ProtectedRoute, layouts, 404
│   ├── assets/
│   ├── components/
│   │   ├── layout/             # Navbar, Footer, AdminLayout, FacultyLayout
│   │   ├── ui/                 # CiteDialog, ConfirmDialog, SaveButton, ResearchCard,
│   │   │                       # StatusBadge, GlassCard, CursorGlow
│   │   └── SearchBar.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx     # Session in localStorage (crest_user), login/register/logout
│   ├── hooks/
│   │   ├── useSavedPapers.js   # Account-scoped bookmark store + cross-tab sync
│   │   └── useDragScroll.js
│   ├── pages/
│   │   ├── HomePage.jsx BrowsePage.jsx ResearchDetailPage.jsx
│   │   ├── FacultyPage.jsx FacultyDetailPage.jsx AboutPage.jsx AuthPage.jsx
│   │   ├── user/               # StudentDashboard, SubmitResearch, ProfilePage
│   │   ├── admin/              # AdminDashboard, AdminPapers, AdminFaculty,
│   │   │                       # AdminStudents, AdminCategories, AdminAnalytics
│   │   └── faculty/            # FacultyStudents (approvals)
│   ├── services/
│   │   └── data.js             # Axios data layer — the only module that talks to /api
│   ├── styles/
│   │   └── design-system.css   # Ink-editorial theme: display serif, mono eyebrows, pills
│   └── utils/
│       └── citations.js        # Pure APA / MLA / IEEE / BibTeX formatters
│
├── server/
│   ├── index.js                # Express app: CORS, JSON, /uploads static, route mounts, :3002
│   ├── package.json            # Server scripts: dev/start, db:push, db:seed, db:studio
│   ├── middleware/optionalAuth.js
│   ├── routes/                 # auth, papers, categories, faculty, students,
│   │                           # upload, drafts, analytics (+ .bak reference copies)
│   ├── prisma/
│   │   ├── schema.prisma       # SQLite models (see Data Model)
│   │   ├── dev.db              # Local SQLite database (git-tracked dev copy)
│   │   ├── seed.js / seed-mock.js
│   │   └── inspect.js
│   └── uploads/papers/         # Uploaded PDFs, served at /uploads
│
└── thoughts/shared/            # Design docs and plans (not runtime code)
```

> Files ending in `.bak` (e.g. `AuthPage.jsx.bak`, `papers.js.bak`) are inactive reference copies kept alongside the live files — the bundler and server ignore them.

---

## Getting Started

### Prerequisites

- **Node.js 20+** and npm
- No database server needed — SQLite runs from a file

### 1. Install dependencies

```bash
# Client (repo root)
npm install

# Server
cd server
npm install
```

### 2. Set up the database (first run)

```bash
cd server
npm run db:push    # create SQLite tables from prisma/schema.prisma
npm run db:seed    # load seed data (users, papers, faculty, categories)
```

### 3. Run the app

```bash
# From the repo root — starts Vite (:5173) + Express (:3002) together
npm run dev
```

Or run each side separately:

```bash
npm run dev:client   # Vite only → http://localhost:5173
npm run dev:server   # Express only → http://localhost:3002 (run from root; or `npm run dev` inside server/)
```

Open **http://localhost:5173**. The dev server proxies `/api` and `/uploads` to the Express backend, so login, uploads, and PDF preview all work without CORS configuration.

### Seeded accounts

Seed data includes demo accounts across the three roles — check `server/prisma/seed.js` for the exact emails/passwords. Registration is open, but **new student/faculty accounts stay pending until an admin or faculty member approves them**.

---

## NPM Scripts

**Client (repo root):**

| Script         | What it does                                  |
| -------------- | --------------------------------------------- |
| `npm run dev`  | Vite + Express together via `concurrently`    |
| `npm run dev:client` | Vite dev server only (`:5173`)            |
| `npm run dev:server` | Express API only (`:3002`)              |
| `npm run build` | Production build to `dist/`                  |
| `npm run lint` | `oxlint` over the client                     |
| `npm run preview` | Preview the production build locally       |

**Server (`server/`):**

| Script              | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev` / `npm start` | Start the Express API (`:3002`) |
| `npm run db:push`   | Sync Prisma schema to SQLite (`dev.db`)   |
| `npm run db:seed`   | Seed demo data                             |
| `npm run db:studio` | Open Prisma Studio DB browser              |

---

## API Reference

Base URL in dev: `http://localhost:3002` (proxied as `/api` by Vite). Authenticated routes accept `Authorization: Bearer <token>`.

| Method | Endpoint                        | Description                                              |
| ------ | ------------------------------- | -------------------------------------------------------- |
| GET    | `/api/health`                   | Health check (institution, department, programs)         |
| POST   | `/api/auth/register`            | Register (student/faculty → pending approval)            |
| POST   | `/api/auth/login`               | Login, returns user + JWT                                |
| PATCH  | `/api/auth/profile`             | Update own profile                                       |
| GET    | `/api/papers`                   | List papers (`search, program, category, year, status, author`) |
| GET    | `/api/papers/:id`               | Paper detail (increments views)                          |
| POST   | `/api/papers`                   | Submit a paper                                           |
| PATCH  | `/api/papers/:id`               | Edit a paper                                             |
| PATCH  | `/api/papers/:id/status`        | Approve / reject (`status, reviewer, note`)              |
| PATCH  | `/api/papers/:id/archive`       | Archive a paper                                          |
| POST   | `/api/upload/pdf`               | Upload manuscript PDF (multipart `file`) → `{ fileUrl }` |
| GET/POST/DELETE | `/api/categories` / `:id` | Manage research tracks                            |
| GET/POST/PATCH/DELETE | `/api/faculty` / `:id` | Manage faculty directory entries            |
| GET    | `/api/faculty/accounts`         | Faculty account registrations                            |
| PATCH  | `/api/faculty/accounts/:id/status` | Approve / reject faculty accounts                  |
| GET/POST/DELETE | `/api/students` / `:id` | Manage students                                   |
| PATCH  | `/api/students/:id/status`      | Approve / reject / reinstate student accounts            |
| GET    | `/api/analytics`                | Totals (papers, approval rate, …)                        |
| GET    | `/api/analytics/activities`     | Recent activity feed (`?limit=`)                         |
| GET/POST/DELETE | `/api/drafts` / `:id`  | Save and resume submission drafts (`?email=`)            |

Uploaded PDFs are served statically at `/uploads/papers/<filename>` and referenced by papers as `pdfUrl`.

---

## Data Model

Prisma models in `server/prisma/schema.prisma` (SQLite):

- **`User`** — accounts with `role` (`student` | `faculty` | `admin`), program, year/section, student ID, account status (`pending` | `active` | `rejected`), bcrypt password hash
- **`ResearchPaper`** — title, thesis number, program, abstract, category/track, year, keywords, adviser, `sourceUrl`, `pdfUrl`, authors, `status` (`pending` | `approved` | `rejected` | `archived`), views, citations, reviewer + note
- **`Faculty`** — directory profiles (name, department, initials, bio) plus faculty account status
- **`Category`** — research tracks, optionally scoped per program
- **`Activity`** — human-readable feed entries for submissions, approvals, registrations
- **`Draft`** — in-progress submissions keyed by author email

---

## Auth & Roles

- Session persists in `localStorage` as `crest_user` (user + JWT); the Axios interceptor in `src/services/data.js` attaches the token automatically
- `ProtectedRoute` in `src/App.jsx` guards `/dashboard` (student), `/submit` (student + faculty), `/profile` (all roles), `/portal/*` (faculty), `/admin/*` (admin), redirecting guests to `/auth` and wrong-role users to their home
- New registrations receive **no token** until approved (`pending` flow in `AuthContext.register`)
- JWT is signed with `JWT_SECRET` (falls back to a dev default — set a real secret in production)

---

## Key Behaviors & Design Notes

- **Zero-backend bookmarks** — the reading list is a deliberate localStorage-only feature (`useSavedPapers`), keyed per account so shared devices never leak saves across users
- **PDF preview needs the `/uploads` proxy** — `vite.config.js` forwards both `/api` and `/uploads` to `:3002`; without it the SPA fallback serves `index.html` instead of the PDF
- **Citations are pure functions** — `src/utils/citations.js` has no React in it (author parsing, initials, `et al.` rules, BibTeX keys), so the formatters are trivially unit-testable
- **`window.confirm` is banned in approval flows** — destructive account actions go through the shared `ConfirmDialog` with tone, icon, detail line, and busy state
- **Design language** — "ink editorial": Fraunces display serif + mono eyebrow labels, dark ink panels, pill buttons, spring motion; shared in `src/styles/design-system.css`
- **Design docs live in `thoughts/shared/`** (e.g. discovery-batch and faculty-revamp designs) — read them before changing those flows

---

## Configuration

| Variable     | Default | Where                  | Purpose                        |
| ------------ | ------- | ---------------------- | ------------------------------ |
| `PORT`       | `3002`  | `server/index.js`      | Express listen port            |
| `JWT_SECRET` | dev fallback | `server/routes/auth.js`, `server/middleware/optionalAuth.js` | Token signing (override in prod) |
| DB URL       | `file:./dev.db` | `server/prisma/schema.prisma` | SQLite location |

No `.env` file is required for local development — every setting has a working default.

---

## Lint & Build

```bash
npm run lint    # oxlint — must show no new warnings
npm run build   # vite build — must succeed before pushing
```

Known pre-existing warnings (do not introduce new ones): unused `created` in `server/routes/auth.js`, unused `categoryList` in `AdminPapers.jsx`, unused param `o` in `HomePage.jsx`.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| PDF preview shows the app instead of the document | Restart `npm run dev` — the `/uploads` proxy only applies on Vite startup |
| API calls 404 / network error in dev | Make sure the Express server is running (`npm run dev` from root starts both) |
| Login works but saves disappear after switching accounts | Expected — saves are namespaced per account (`crest_saved_<userId>`) |
| Fresh clone shows no data | Run `npm run db:push` then `npm run db:seed` inside `server/` |
| Port `3002` already in use | Set `PORT` env var before starting the server |
| Newly registered user can't sign in | Accounts start `pending` — approve them via Admin → Students or Faculty Portal → Students |
