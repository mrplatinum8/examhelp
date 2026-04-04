import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { supabase } from './lib/supabase';
import AuthGate from './components/AuthGate';
import Layout from './components/Layout';
import { DataProvider } from './contexts/DataContext';

// Lazy-load views for code splitting
const DashboardView = lazy(() => import('./views/Dashboard'));
const SubjectsView = lazy(() => import('./views/Subjects'));
const PomodoroView = lazy(() => import('./views/Pomodoro'));
const CalendarView = lazy(() => import('./views/Calendar'));
const FlashcardsView = lazy(() => import('./views/Flashcards'));
const AnalyticsView = lazy(() => import('./views/Analytics'));
const HeatmapView = lazy(() => import('./views/Heatmap'));
const RevisionScheduleView = lazy(() => import('./views/RevisionSchedule'));
const DailyScheduleView = lazy(() => import('./views/DailySchedule'));
const ExamTimetableView = lazy(() => import('./views/ExamTimetable'));

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setAuthLoading(false), 10000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setAuthLoading(false);
        clearTimeout(timeout);
      })
      .catch(() => {
        setAuthLoading(false);
        clearTimeout(timeout);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  if (authLoading) return (
    <div className="min-h-screen bg-[#07071a] mesh-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-2xl btn-gradient flex items-center justify-center glow-violet">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!session) return <AuthGate />;

  return (
    <DataProvider session={session}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardView />} />
          <Route path="subjects" element={<SubjectsView />} />
          <Route path="pomodoro" element={<PomodoroView />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="flashcards" element={<FlashcardsView />} />
          <Route path="revision" element={<RevisionScheduleView />} />
          <Route path="schedule" element={<DailyScheduleView />} />
          <Route path="exams" element={<ExamTimetableView />} />
          <Route path="analytics" element={<AnalyticsView />} />
          <Route path="heatmap" element={<HeatmapView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DataProvider>
  );
}
