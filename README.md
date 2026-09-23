# ReposIT — Wesleyan University Philippines CECT Research Repository (CREST)

[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud_PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

An academic research repository and digital archive designed for the **Wesleyan University Philippines – College of Engineering and Computer Technology (CECT)**, covering BS Information Technology (BSIT), BS Computer Engineering (BSCpE), and BS Electronics Engineering (BSECE).

The design follows **Academic Minimalism with Glassmorphism** — a clean, light-mode, blue-centric interface inspired by Stitch design tokens.

---

## 🚀 Architecture Overview

ReposIT CREST is structured as a cloud-native Single-Page Application (SPA) communicating directly with **Supabase Cloud**:

- **Database (PostgreSQL):** Stores profiles, research records, categories/tracks, faculty directories, activity logs, and drafts.
- **Search (GIN FTS):** Full-Text Search generated column on research titles and abstracts.
- **Authentication (Supabase Auth):** Role-based access control (Student, Faculty, Admin) synced with `public.profiles`.
- **File Storage (Supabase Storage):** Secure `capstones` bucket for academic PDF manuscripts.
- **Zero-Egress Media (Frontend CDN):** High-definition background videos are served directly from `/public/videos/` with immutable caching headers via `vercel.json`, bypassing database egress costs.

---

## 🛠️ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm or pnpm

### 2. Environment Setup
Create a `.env` file in the root directory (copied from `.env.example`):
```env
VITE_SUPABASE_URL=https://unaxchblqookqxmlxmyk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Install & Run
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev:client
```
The app will be accessible at `http://localhost:5173`.

### 4. Verify Supabase Cloud Integration
Run the automated verification script:
```bash
node scripts/verify-supabase.js
```

---

## 👥 Seed Accounts (for Testing & Review)

All test accounts use the password: `password123`

| Role | Email | Permissions / View |
|---|---|---|
| **Admin** | `admin@wesleyan.edu.ph` | Full admin console (`/admin`), paper approval/rejection, user & track management, system analytics |
| **Faculty** | `maria.reyes@wesleyan.edu.ph` | Faculty portal (`/portal`), advisee management, profile customization |
| **Faculty** | `aris.mendoza@wesleyan.edu.ph` | Faculty portal, advisee management |
| **Faculty** | `sofia.delgado@wesleyan.edu.ph` | Faculty portal, advisee management |
| **Student** | `alice.bautista@wesleyan.edu.ph` | Student dashboard (`/dashboard`), submit capstone (`/submit`), draft saving |
| **Student** | `joshua.ramos@wesleyan.edu.ph` | Student dashboard, research submission |
| **Student** | `miguel.torres@wesleyan.edu.ph` | Student dashboard, research submission |

---

## 📂 Project Structure

```
ReposIT-testing/
├── docs/
│   ├── database_cloud_infrastructure.md  # Complete DDL, RLS, & Infra specification
│   └── plans/                            # Feature & architectural design docs
├── public/
│   └── videos/                           # Hero background video assets (Zero-Egress CDN)
├── scripts/
│   ├── migrate-to-supabase.js            # One-time SQLite -> Supabase migration script
│   └── verify-supabase.js                # Integration validation script
├── src/
│   ├── components/
│   │   ├── admin/                        # Admin dialogs and review components
│   │   ├── layout/                       # Navbar, Footer, AdminLayout, FacultyLayout
│   │   └── ui/                           # GlassCard, ResearchCard, StatusBadge, etc.
│   ├── contexts/
│   │   └── AuthContext.jsx               # Supabase Auth session & profile state
│   ├── pages/
│   │   ├── admin/                        # Admin dashboard, papers, faculty, categories, analytics
│   │   ├── faculty/                      # Faculty portal and advisee views
│   │   ├── user/                         # Student dashboard, submission form, profile
│   │   ├── AuthPage.jsx                  # Sign in / Register modal & page
│   │   ├── BrowsePage.jsx                # Search, filtering, and catalog
│   │   ├── FacultyPage.jsx               # Faculty directory
│   │   ├── HomePage.jsx                  # Hero showcase, video loop, statistics, Bento grid
│   │   └── ResearchDetailPage.jsx        # Manuscript metadata, PDF view, citation tracking
│   └── services/
│       ├── data.js                       # PostgREST data layer functions
│       └── supabase.js                   # Initialized Supabase client
├── implementation_plan_repo.md           # Live progress & implementation plan
├── vercel.json                           # SPA rewrites & static asset caching headers
└── vite.config.js                        # Vite config
```

---

## 🌿 Git Workflow

- **`testing` branch:** Active development and migration branch. Every change is committed and pushed directly to `origin/testing` for easy rollbacks and continuous deployment.
- **`main` branch:** Protected production branch (untouched during migration testing).
