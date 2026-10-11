import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { supabase } from './lib/supabase';
import AuthGate from './components/AuthGate';
import Layout from './components/Layout';
import StealthEditor from './components/StealthEditor';
import { DataProvider } from './contexts/DataContext';

// Lazy-load views for code splitting
const DashboardView = lazy(() => import('./views/Dashboard'));
const BacklogBusterView = lazy(() => import('./views/BacklogBuster'));
const HabitMatrixView = lazy(() => import('./views/HabitMatrix'));
const MasterCampaignsView = lazy(() => import('./views/MasterCampaigns'));
const StealthWorkdayView = lazy(() => import('./views/StealthWorkday'));
const SubjectsView = lazy(() => import('./views/Subjects'));
const PomodoroView = lazy(() => import('./views/Pomodoro'));
const CalendarView = lazy(() => import('./views/Calendar'));
const FlashcardsView = lazy(() => import('./views/Flashcards'));
const AnalyticsView = lazy(() => import('./views/Analytics'));
const HeatmapView = lazy(() => import('./views/Heatmap'));
const RevisionScheduleView = lazy(() => import('./views/RevisionSchedule'));
const DailyScheduleView = lazy(() => import('./views/DailySchedule'));
const ExamTimetableView = lazy(() => import('./views/ExamTimetable'));
const StudyGuideView = lazy(() => import('./views/StudyGuide'));

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stealthActive, setStealthActive] = useState(false);

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

  // Global hotkey for Stealth Mode toggle (Alt + S)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setStealthActive((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
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
    <>
      {stealthActive && (
        <StealthEditor onExit={() => setStealthActive(false)} />
      )}

      <DataProvider session={session}>
        <Routes>
          <Route element={<Layout onActivateStealth={() => setStealthActive(true)} />}>
            <Route index element={<DashboardView onActivateStealth={() => setStealthActive(true)} />} />
            <Route path="backlog" element={<BacklogBusterView />} />
            <Route path="habits" element={<HabitMatrixView />} />
            <Route path="campaigns" element={<MasterCampaignsView />} />
            <Route path="stealth" element={<StealthWorkdayView onActivateStealth={() => setStealthActive(true)} />} />
            <Route path="subjects" element={<SubjectsView />} />
            <Route path="pomodoro" element={<PomodoroView />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="flashcards" element={<FlashcardsView />} />
            <Route path="revision" element={<RevisionScheduleView />} />
            <Route path="schedule" element={<DailyScheduleView />} />
            <Route path="exams" element={<ExamTimetableView />} />
            <Route path="analytics" element={<AnalyticsView />} />
            <Route path="heatmap" element={<HeatmapView />} />
            <Route path="study-guide" element={<StudyGuideView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </DataProvider>
    </>
  );
}
