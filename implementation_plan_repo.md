# ReposIT — Wesleyan University Philippines IT Research Repository

## Overview

A full-stack **academic research repository** web application for the **Wesleyan University – Philippines IT Department**. Built with the same architecture as the PODCAST project (React 19 + Vite + Tailwind CSS + Express + Prisma/SQLite), using the **Wesleyan BSIT Digital Repository** design from Stitch.

The design aesthetic is **Academic Minimalism with Glassmorphism** — a light-mode, blue-centric palette inspired by the Stitch prototype.

---

## Design System (from Stitch MCP)

| Token | Value |
|---|---|
| **Primary Color** | `#004ac6` |
| **Primary Container (Active)** | `#2563eb` |
| **Secondary** | `#4059aa` |
| **Background** | `#faf8ff` |
| **Surface** | `#faf8ff` |
| **Font** | Inter (all weights) |
| **Roundness** | 8–12px (rounded-lg) |
| **Glassmorphism** | `rgba(255,255,255,0.4)` + `backdrop-blur(12px)` |
| **Icons** | Google Material Symbols Outlined |
| **Mode** | Light only |

---

## Open Questions

> [!IMPORTANT]
> **Q1: Project location** — Should the new app be created in `D:\ReposIT` or a subdirectory like `D:\ReposIT\repos-it`?

> [!IMPORTANT]
> **Q2: Auth scope** — Should the app have a full login/register system (students, faculty, admin), or just an admin-protected portal?

> [!IMPORTANT]
> **Q3: File uploads** — Do capstone papers need actual PDF file upload support, or just metadata + external links?

> [!IMPORTANT]
> **Q4: Backend or frontend-only?** — Should this be a full-stack app with Express + SQLite (like PODCAST), or a pure frontend SPA with mock data for now?

---

## Proposed Architecture

```
ReposIT (React + Vite SPA)
├── Public Routes
│   ├── /                    → Home (Hero + Stats + Faculty Grid + Featured Papers)
│   ├── /browse              → Browse Repository (Search + Filters + List)
│   ├── /research/:id        → Research Paper Detail
│   ├── /faculty             → Faculty Directory
│   ├── /faculty/:id         → Faculty Profile + their papers
│   └── /auth                → Login / Register
│
├── Student Routes (protected)
│   ├── /dashboard           → My submissions, drafts
│   ├── /submit              → Submit new research paper
│   └── /profile             → Edit profile
│
└── Admin/Faculty Routes (protected, role-based)
    ├── /admin               → Admin Dashboard (stats, activity)
    ├── /admin/papers        → Manage all papers (approve/reject)
    ├── /admin/faculty       → Manage faculty accounts
    ├── /admin/students      → Manage student accounts
    ├── /admin/categories    → Manage research categories
    └── /admin/analytics     → Submission trends, views
```

## Backend API (Express + Prisma/SQLite)

### Models
| Model | Fields |
|---|---|
| **ResearchPaper** | `title`, `abstract`, `authors`, `keywords`, `year`, `category`, `status` (pending/approved/archived), `pdfUrl`, `views`, `citations` |
| **Faculty** | `name`, `email`, `department`, `specialization`, `bio`, `papers` |
| **Student** | `name`, `email`, `studentId`, `year`, `section` |
| **Category** | `name`, `slug`, `description`, `color` |
| **AdminUser** | `email`, `password`, `name`, `role` (admin/faculty) |
| **Activity** | `type`, `user`, `detail`, `timestamp` |

---

## Proposed Changes

### [NEW] `D:\ReposIT\` — Root project

#### [NEW] `package.json`
Standard Vite + React 19 + Tailwind CSS 4 + Framer Motion dependencies, matching PODCAST patterns.

#### [NEW] `index.html`
Entry HTML with Inter font, Material Symbols, SEO meta tags for Wesleyan University IT Research Repository.

#### [NEW] `vite.config.js`
Vite config with React plugin, proxy to backend at port 3002.

---

### [NEW] `src/` — Frontend

#### [NEW] `src/styles/design-system.css`
All CSS custom properties from the Stitch design system:
- Blue palette tokens
- Glass card utilities (`.glass-card`, `.luminous-shadow`, `.glow-orb`)
- Typography scale matching Stitch

#### [NEW] `src/styles/animations.css`
Float animation, hover lift, page transitions.

#### [NEW] `src/App.jsx`
Router with all routes, `AuthProvider`, `ToastProvider`, lazy-loaded pages.

#### [NEW] `src/pages/HomePage.jsx`
Hero section (glassmorphism card + glow orbs), stats strip (4 metrics), Faculty list column, Featured papers bento grid. Matches Stitch home screen exactly.

#### [NEW] `src/pages/BrowsePage.jsx`
Search bar (glass style), filter chips (year/category/status), research paper list cards with status badges.

#### [NEW] `src/pages/ResearchDetailPage.jsx`
Full paper view: title, authors, abstract, keywords, PDF viewer link, citation count, related papers.

#### [NEW] `src/pages/FacultyPage.jsx`
Faculty directory with profile cards.

#### [NEW] `src/pages/AuthPage.jsx`
Glassmorphism login/register form with role selector.

#### [NEW] `src/pages/user/SubmitResearch.jsx`
Multi-step submission form: paper metadata → authors → upload PDF → review & submit.

#### [NEW] `src/pages/user/StudentDashboard.jsx`
Submitted papers status, drafts.

#### [NEW] `src/pages/admin/AdminDashboard.jsx`
KPI cards, recent activity, submission pipeline.

#### [NEW] `src/pages/admin/AdminPapers.jsx`
Full CRUD table — approve/reject submissions, edit metadata.

#### [NEW] `src/pages/admin/AdminAnalytics.jsx`
Charts: submissions per year, views trend, categories breakdown.

#### [NEW] `src/components/layout/Navbar.jsx`
Glass navbar with ReposIT logo, nav links, notifications icon, profile avatar.

#### [NEW] `src/components/layout/AdminLayout.jsx`
280px sidebar (Notion-style) + main content area.

#### [NEW] `src/components/ui/GlassCard.jsx`
Reusable glassmorphism card component.

#### [NEW] `src/components/ui/ResearchCard.jsx`
Research paper card with title, abstract excerpt, author avatars, status badge, view button.

#### [NEW] `src/components/SearchBar.jsx`
Glass-styled search bar with icon.

#### [NEW] `src/services/api.js` + `src/services/data.js`
Axios instance + all data service functions (mirroring PODCAST patterns).

#### [NEW] `src/contexts/AuthContext.jsx`
JWT-based auth context.

---

### [NEW] `server/` — Backend (Express + Prisma)

#### [NEW] `server/index.js`
Express server on port 3002, with all API routes registered.

#### [NEW] `server/prisma/schema.prisma`
Prisma schema with all models listed above.

#### [NEW] `server/prisma/seed.js`
Seed data: sample categories, faculty accounts, research papers, admin user.

#### [NEW] `server/routes/` 
Papers, faculty, students, categories, auth, analytics, admin routes.

---

## Verification Plan

### Manual Verification
1. Start backend: `cd server && node index.js`
2. Start frontend: `npm run dev`
3. Visit `http://localhost:5173` — confirm home page renders with glass cards, blue palette, glow orbs
4. Browse `/browse` — confirm search + filter works
5. Login as admin → confirm `/admin` dashboard loads
6. Submit a paper as a student → confirm it appears in admin queue
