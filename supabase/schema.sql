-- ============================================================
-- ExamFocus - Supabase Schema  (safe to re-run)
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. SUBJECTS
create table if not exists subjects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null default auth.uid(),
  name        text not null,
  short_name  text not null,
  color       text not null default 'blue',
  exam_date   date,
  created_at  timestamptz default now()
);

-- 2. TOPICS
create table if not exists topics (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null default auth.uid(),
  subject_id  uuid references subjects on delete cascade not null,
  label       text not null,
  done        boolean default false,
  position    int default 0,
  created_at  timestamptz default now()
);

-- 3. POMODORO SESSIONS
create table if not exists pomodoro_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users on delete cascade not null default auth.uid(),
  subject_id       uuid references subjects on delete cascade not null,
  duration_minutes int default 25,
  started_at       timestamptz default now()
);

-- 4. FLASHCARDS
create table if not exists flashcards (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade not null default auth.uid(),
  subject_id    uuid references subjects on delete cascade not null,
  question      text not null,
  answer        text not null,
  interval_days int default 1,
  ease_factor   real default 2.5,
  next_review   date default current_date,
  created_at    timestamptz default now()
);

-- 5. STUDY LOGS
create table if not exists study_logs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users on delete cascade not null default auth.uid(),
  subject_id       uuid references subjects on delete cascade,
  date             date not null,
  duration_minutes int default 60,
  notes            text,
  created_at       timestamptz default now()
);

-- 6. DAILY SCHEDULE (recurring weekly time slots)
create table if not exists daily_schedule (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null default auth.uid(),
  day_of_week int not null check (day_of_week between 0 and 6),  -- 0=Sun, 1=Mon … 6=Sat
  start_time  text not null,   -- "09:00"
  end_time    text not null,   -- "10:30"
  title       text not null,
  subject_id  uuid references subjects on delete set null,
  color       text default 'violet',
  created_at  timestamptz default now()
);

-- 7. EXAM TIMETABLE (detailed exam events)
create table if not exists exam_timetable (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null default auth.uid(),
  subject_id  uuid references subjects on delete cascade not null,
  exam_date   date not null,
  start_time  text,            -- "10:00"
  end_time    text,            -- "13:00"
  venue       text,
  notes       text,
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table subjects          enable row level security;
alter table topics             enable row level security;
alter table pomodoro_sessions  enable row level security;
alter table flashcards         enable row level security;
alter table study_logs         enable row level security;
alter table daily_schedule     enable row level security;
alter table exam_timetable     enable row level security;

-- Drop existing policies first so re-running this file is safe
drop policy if exists "own subjects"  on subjects;
drop policy if exists "own topics"    on topics;
drop policy if exists "own sessions"  on pomodoro_sessions;
drop policy if exists "own cards"     on flashcards;
drop policy if exists "own logs"      on study_logs;
drop policy if exists "own schedule"  on daily_schedule;
drop policy if exists "own exams"     on exam_timetable;

create policy "own subjects"  on subjects          for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own topics"    on topics            for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sessions"  on pomodoro_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cards"     on flashcards        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own logs"      on study_logs        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own schedule"  on daily_schedule    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own exams"     on exam_timetable    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

