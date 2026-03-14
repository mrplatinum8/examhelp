# ⚡ ExamFocus — Study Tracker

> A personal exam preparation and study tracking Progressive Web App (PWA) built with React, Vite, TailwindCSS v4, and Supabase.

---

## 📖 Overview

**ExamFocus** is a dark-themed, glassmorphism-styled study companion designed to help students track their exam preparation progress. It combines Pomodoro-style focus sessions, spaced-repetition flashcards, a smart revision schedule, a daily class timetable, a detailed exam timetable, and study analytics — all synced to a per-user Supabase backend with Row Level Security.

The app auto-seeds subjects and topics on first login so it's ready to use immediately with zero manual setup.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Dashboard** | Greeting, today's Pomodoro count & focus time, study streak, subject progress bars, and upcoming exam countdown with traffic-light urgency indicators (🔴 Critical / 🟡 Soon / 🟢 Safe) |
| **Subjects** | View all subjects with topic checklists; mark topics done to track progress |
| **Pomodoro Timer** | 25-minute focus sessions linked to a subject; sessions are recorded and feed into streak & heatmap calculations |
| **Calendar** | Visual study log calendar; log ad-hoc study sessions by subject, date, and duration |
| **Flashcards** | Add/review flashcards with a built-in spaced-repetition algorithm (SM-2 style — Easy/Medium/Hard ratings adjust interval and ease factor); keyboard shortcut support (Space to flip, 1/2/3 to rate) |
| **Revision Schedule** | Auto-generated day-by-day study plan that distributes unchecked topics across remaining days before each exam, prioritizing nearest deadlines |
| **Daily Schedule** | Recurring weekly class timetable with day tabs (Mon–Sun); add, edit, and delete time-blocked slots linked to subjects |
| **Exam Timetable** | Detailed exam event cards showing date, time, venue, and notes with traffic-light urgency; full CRUD support |
| **Analytics** | Charts (via Recharts) showing Pomodoro counts per subject and study time distribution |
| **Heatmap** | GitHub-style contribution heatmap of daily study activity |
| **PWA / Offline** | Installable as a standalone app; service worker caches assets and Google Fonts for offline access |

---

## 🗂️ Project Structure

```
examhelp/
├── public/                  # Static assets (PWA icons)
├── src/
│   ├── components/
│   │   └── AuthGate.jsx     # Login / Sign-up screen
│   ├── lib/
│   │   ├── supabase.js      # Supabase client initialisation
│   │   └── helpers.js       # Utility functions (streak, heatmap, daysUntil) + SUBJECTS_SEED data
│   ├── views/
│   │   ├── Dashboard.jsx    # Overview / home screen
│   │   ├── Subjects.jsx     # Subject & topic management
│   │   ├── Pomodoro.jsx     # Pomodoro timer
│   │   ├── Calendar.jsx     # Study log calendar
│   │   ├── Flashcards.jsx   # Spaced-repetition flashcard review
│   │   ├── RevisionSchedule.jsx  # Smart revision planner
│   │   ├── DailySchedule.jsx    # Recurring weekly timetable
│   │   ├── ExamTimetable.jsx    # Detailed exam events
│   │   ├── Analytics.jsx    # Charts & stats
│   │   └── Heatmap.jsx      # Activity heatmap
│   ├── App.jsx              # Root component — auth, data loading, navigation, toast system
│   ├── App.css              # Component-level styles
│   ├── index.css            # Global design tokens, glass/gradient utilities
│   └── main.jsx             # React entry point with ErrorBoundary
├── supabase/
│   └── schema.sql           # Database schema + RLS policies (safe to re-run)
├── seed_flashcards.cjs      # Node script to bulk-insert flashcards via Supabase API
├── seed_schedule.cjs        # Node script to seed daily schedule + exam timetable
├── vite.config.js           # Vite + TailwindCSS v4 + PWA configuration
├── .env.local               # Environment variables (not committed)
└── package.json
```

---

## 🛢️ Database Schema (Supabase)

All tables are user-scoped via `user_id` with Row Level Security enabled.

| Table | Key Columns |
|---|---|
| `subjects` | `id`, `user_id`, `name`, `short_name`, `color`, `exam_date` |
| `topics` | `id`, `user_id`, `subject_id`, `label`, `done`, `position` |
| `pomodoro_sessions` | `id`, `user_id`, `subject_id`, `duration_minutes`, `started_at` |
| `flashcards` | `id`, `user_id`, `subject_id`, `question`, `answer`, `interval_days`, `ease_factor`, `next_review` |
| `study_logs` | `id`, `user_id`, `subject_id`, `date`, `duration_minutes`, `notes` |
| `daily_schedule` | `id`, `user_id`, `day_of_week`, `start_time`, `end_time`, `title`, `subject_id`, `color` |
| `exam_timetable` | `id`, `user_id`, `subject_id`, `exam_date`, `start_time`, `end_time`, `venue`, `notes` |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Supabase](https://supabase.com/) project

### 1. Clone & Install

```bash
git clone https://github.com/mrplatinum8/examhelp.git
cd examhelp
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New Query**, paste and run `supabase/schema.sql`
3. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**

### 3. Configure Environment

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

On first login, the app **automatically seeds** all 8 subjects with their topics — no manual data entry required.

### 5. Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables
4. Deploy — the app will be live with full PWA support

---

## 🎓 Pre-seeded Subjects

The app ships with the following subjects pre-configured (edit in `src/lib/helpers.js`):

| Short Name | Subject | Exam Date |
|---|---|---|
| ODE | Ordinary Differential Equations | — |
| NTPD | Numerical Techniques & Probability Distributions | Apr 20, 2026 |
| ADE | Analog & Digital Electronics | Jun 4, 2026 |
| SE | Software Engineering | Apr 24, 2026 |
| WT | Web Technologies | Apr 21, 2026 |
| CD | Compiler Design | Apr 23, 2026 |
| DV | Data Visualization | Apr 29, 2026 |
| BMFA | Business Mgmt & Financial Analysis | May 4, 2026 |

---

## ⌨️ Keyboard Shortcuts

In the **Flashcards** view:

| Key | Action |
|---|---|
| `Space` | Flip card |
| `1` | Rate as **Hard** |
| `2` | Rate as **Medium** |
| `3` | Rate as **Easy** |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/) |
| Styling | [TailwindCSS v4](https://tailwindcss.com/) (Vite plugin) |
| Backend / Auth / DB | [Supabase](https://supabase.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Icons | [Lucide React](https://lucide.dev/) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) + Workbox |
| Error Handling | [react-error-boundary](https://github.com/bvaughn/react-error-boundary) |
| Testing | [Playwright](https://playwright.dev/) |

---

## 📦 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # ESLint
```

---

## 📱 PWA Installation

ExamFocus is installable as a standalone app on desktop and mobile:

- **Desktop (Chrome/Edge):** Click the install icon (⊕) in the address bar
- **Android:** Tap **Add to Home Screen** from the browser menu
- **iOS (Safari):** Tap **Share → Add to Home Screen**

The service worker caches all app assets and Google Fonts, enabling offline reading of your notes and flashcards.

---

## 🔐 Security

- All database access goes through Supabase's [Row Level Security](https://supabase.com/docs/guides/database/row-level-security) — users can only read and write their own data
- Auth is handled entirely by Supabase Auth (email + password)
- The `VITE_SUPABASE_ANON_KEY` is a *public* key safe to expose in the browser; the RLS policies enforce data isolation

---

## 📄 License

Private project. All rights reserved.
