# ExamFocus — Project Overview

> **One-liner:** A React + Supabase PWA that helps students track exam prep through subjects, Pomodoro sessions, flashcards (spaced-repetition), schedules, and analytics — all behind email/password auth with per-user row-level security.

---

## Tech Stack

| Layer         | Tech                                                                 |
|---------------|----------------------------------------------------------------------|
| Framework     | **React 19** (Vite 7, JSX)                                          |
| Routing       | `react-router-dom` v7 — `BrowserRouter` + `<Routes>`                |
| Styling       | **Tailwind CSS v4** (via `@tailwindcss/vite` plugin) + custom CSS   |
| Backend/DB    | **Supabase** (Postgres) — client in `src/lib/supabase.js`           |
| Auth          | Supabase Auth (email + password, signup/signin)                     |
| Icons         | `lucide-react`                                                       |
| Charts        | `recharts` (used in Analytics)                                       |
| PWA           | `vite-plugin-pwa` — service worker, offline caching, installable    |
| Error handling| `react-error-boundary`                                               |
| Fonts         | Google Fonts — **Inter**                                             |

### Environment Variables (`.env.local`)
```
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

### Scripts
```
npm run dev      # Vite dev server
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

---

## File Map

```
examhelp/
├── index.html                    # Entry HTML, mounts #root
├── vite.config.js                # Vite + React + TailwindCSS + PWA config
├── package.json
├── .env.local                    # Supabase URL + anon key
│
├── supabase/
│   └── schema.sql                # Full DB schema (7 tables + RLS policies)
│
├── src/
│   ├── main.jsx                  # ReactDOM render, BrowserRouter, ErrorBoundary
│   ├── App.jsx                   # Auth check → AuthGate or DataProvider+Routes
│   ├── index.css                 # Global styles: glass, gradients, glows, heatmap
│   ├── App.css                   # Minimal app-level styles
│   │
│   ├── lib/
│   │   ├── supabase.js           # Supabase client singleton (createClient)
│   │   └── helpers.js            # SUBJECT_COLORS map, SUBJECTS_SEED[], computeStreak,
│   │                             #   computeHeatmap, daysUntil
│   │
│   ├── contexts/
│   │   └── DataContext.jsx       # Central state: loads all data, exposes CRUD callbacks,
│   │                             #   auto-seeds subjects on first login, toast system
│   │
│   ├── components/
│   │   ├── AuthGate.jsx          # Login/Signup UI (email+password, tab toggle)
│   │   └── Layout.jsx            # Sidebar nav + mobile header + <Outlet/> for routes
│   │
│   └── views/                    # One file per route/page
│       ├── Dashboard.jsx         # / — greeting, stats (streak/pomodoros/focus time),
│       │                         #   subject progress bars, daily mission, upcoming exams
│       ├── Subjects.jsx          # /subjects — expandable cards per subject with topic
│       │                         #   checklist (toggle done), progress ring, stats
│       ├── Pomodoro.jsx          # /pomodoro — 25/5/15 timer with SVG ring, subject
│       │                         #   selector, auto-skip, session dots, playlist links
│       ├── Calendar.jsx          # /calendar — monthly calendar view of study activity
│       ├── Flashcards.jsx        # /flashcards — spaced-repetition (SM-2 variant), 3D
│       │                         #   flip card, filter by subject, Hard/Medium/Easy rating,
│       │                         #   keyboard shortcuts (Space/1/2/3), add card modal
│       ├── RevisionSchedule.jsx  # /revision — revision schedule planner
│       ├── DailySchedule.jsx     # /schedule — weekly recurring time slot management
│       ├── ExamTimetable.jsx     # /exams — CRUD for exam events (date/time/venue)
│       ├── Analytics.jsx         # /analytics — charts (recharts) for study data
│       └── Heatmap.jsx           # /heatmap — GitHub-style contribution heatmap
│
├── seed_flashcards.cjs           # Node script: seeds flashcards into Supabase
├── seed_schedule.cjs             # Node script: seeds daily schedule data
├── capture_all_screens.cjs       # Playwright helper: screenshots all routes
└── public/                       # Static assets (PWA icons, etc.)
```

---

## Database Schema (`supabase/schema.sql`)

7 tables, all with `user_id` FK to `auth.users` and **RLS enabled** (each user sees only their own rows).

| Table               | Key Columns                                                      | Purpose                          |
|---------------------|------------------------------------------------------------------|----------------------------------|
| `subjects`          | `name`, `short_name`, `color`, `exam_date`                       | Academic subjects                |
| `topics`            | `subject_id`, `label`, `done`, `position`                        | Per-subject checklist items      |
| `pomodoro_sessions` | `subject_id`, `duration_minutes`, `started_at`                   | Completed pomodoro records       |
| `flashcards`        | `subject_id`, `question`, `answer`, `interval_days`, `ease_factor`, `next_review` | Spaced-repetition cards |
| `study_logs`        | `subject_id`, `date`, `duration_minutes`, `notes`                | Manual study log entries         |
| `daily_schedule`    | `day_of_week` (0–6), `start_time`, `end_time`, `title`, `subject_id` | Recurring weekly time blocks |
| `exam_timetable`    | `subject_id`, `exam_date`, `start_time`, `end_time`, `venue`, `notes` | Exam events             |

All IDs are UUIDs. All timestamps default to `now()`. `user_id` defaults to `auth.uid()`.

---

## Architecture & Data Flow

```
main.jsx
  └─ BrowserRouter + ErrorBoundary
       └─ App.jsx
            ├─ [no session] → AuthGate (login/signup)
            └─ [session]    → DataProvider (wraps all routes)
                                  └─ Layout (sidebar + <Outlet/>)
                                       └─ Route views (Dashboard, Pomodoro, etc.)
```

### DataContext (the single source of truth)

- **On mount** (per `session.user.id`): loads all 6 tables in parallel via `Promise.all`
- **Auto-seed**: if `subjects` table is empty for user, inserts 8 preconfigured subjects (from `SUBJECTS_SEED` in `helpers.js`) with topics
- **Exposed state**: `subjects` (with computed `progress` and `pomodoroCount`), `sessions`, `cards`, `studyLogs`, `schedule`, `exams`, `streak`, `heatmapData`, `dataLoading`, `toast`
- **Exposed actions** (all do Supabase write → reload relevant table → show toast):
  - `onToggleTopic`, `onAddSession`, `onAddCard`, `onRateCard`, `onDeleteCard`
  - `onAddStudyLog`, `onUpdateExamDate`
  - `onAddSlot`, `onUpdateSlot`, `onDeleteSlot`
  - `onAddExam`, `onUpdateExam`, `onDeleteExam`
  - `handleSignOut`
- All views use `useData()` hook to access state and actions

### Flashcard spaced-repetition algorithm (SM-2 variant)
- **Easy**: `ease_factor += 0.1` (max 4.0), `interval = max(round(interval * ease), 2)`
- **Medium**: `interval = max(round(interval * 1.5), 1)`
- **Hard**: `ease_factor -= 0.2` (min 1.3), `interval = 1`
- `next_review` is set to `today + interval` days

### Pomodoro timer states
```
IDLE → FOCUS (25 min) → [auto-skip on 0] → SHORT (5 min) or LONG (15 min, every 4th) → repeat
```
On skip/complete from FOCUS: records a `pomodoro_session` to DB.

---

## Styling Conventions

- **Dark theme** — base background `#07071a`, text `#f1f1f8`
- Custom CSS classes in `index.css`: `.glass`, `.glass-violet`, `.glass-blue`, `.gradient-text`, `.btn-gradient`, `.glow-*`, `.mesh-bg`, `.nav-active`, `.card-hover`, `.timer-glow`, `.progress-gradient-*`, `.heatmap-*`
- Tailwind utilities used heavily inline via `className`
- Subject colors are mapped via `SUBJECT_COLORS` in `helpers.js` (8 colors: blue, amber, emerald, purple, pink, red, cyan, indigo)

---

## Seed Data

8 subjects pre-seeded on first login (`SUBJECTS_SEED` in `helpers.js`):

| Short Name | Subject                               | Color   | Exam Date   |
|------------|---------------------------------------|---------|-------------|
| ODE        | Ordinary Differential Equations       | blue    | null        |
| NTPD       | Numerical Techniques & Probability    | amber   | 2026-04-20  |
| ADE        | Analog & Digital Electronics          | emerald | null        |
| SE         | Software Engineering                  | purple  | 2026-04-24  |
| WT         | Web Technologies                      | pink    | 2026-04-21  |
| CD         | Compiler Design                       | red     | 2026-04-23  |
| DV         | Data Visualization                    | cyan    | 2026-04-29  |
| BMFA       | Business Mgmt & Financial Analysis    | indigo  | 2026-05-04  |

Each subject comes with 4–5 pre-defined topic labels.

---

## Routes

| Path          | View Component         | Description                                     |
|---------------|------------------------|-------------------------------------------------|
| `/`           | `Dashboard`            | Overview: stats, subject progress, exam countdown|
| `/subjects`   | `Subjects`             | Subject cards with topic checklists              |
| `/pomodoro`   | `Pomodoro`             | Focus timer with SVG ring and session tracking   |
| `/calendar`   | `Calendar`             | Monthly study activity calendar                  |
| `/flashcards` | `Flashcards`           | Spaced-repetition review and card management     |
| `/revision`   | `RevisionSchedule`     | Revision planning                                |
| `/schedule`   | `DailySchedule`        | Weekly recurring schedule manager                |
| `/exams`      | `ExamTimetable`        | Exam event CRUD (date, time, venue)              |
| `/analytics`  | `Analytics`            | Study data charts (recharts)                     |
| `/heatmap`    | `Heatmap`              | GitHub-style activity heatmap                    |
| `*`           | Redirects to `/`       | Catch-all                                        |

---

## Key Design Decisions

1. **Single DataContext**: All state lives in one context provider — simple but means every state change re-renders all consumers. Fine for this app's scale.
2. **No server functions**: All writes go directly from client to Supabase (RLS handles authorization).
3. **Auto-seeding**: On first login, if subjects table is empty, 8 subjects + topics are inserted automatically.
4. **PWA**: Configured for standalone install with offline caching of fonts and static assets.
5. **No server-side rendering**: Pure SPA with Vite.
6. **Exam date syncing**: On each load, exam dates from `SUBJECTS_SEED` are synced to DB (to keep hardcoded schedule current).
