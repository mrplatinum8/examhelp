import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BookOpen, Home, Clock, Calendar as CalendarIcon, Layers, BarChart2, Activity, LogOut, Zap } from 'lucide-react';
import { supabase } from './lib/supabase';
import { computeStreak, computeHeatmap, SUBJECTS_SEED } from './lib/helpers';
import AuthGate from './components/AuthGate';
import DashboardView from './views/Dashboard';
import SubjectsView from './views/Subjects';
import PomodoroView from './views/Pomodoro';
import CalendarView from './views/Calendar';
import FlashcardsView from './views/Flashcards';
import AnalyticsView from './views/Analytics';
import HeatmapView from './views/Heatmap';

const TABS = ['Dashboard', 'Subjects', 'Pomodoro', 'Calendar', 'Flashcards', 'Analytics', 'Heatmap'];
const TAB_ICONS = { Dashboard: Home, Subjects: BookOpen, Pomodoro: Clock, Calendar: CalendarIcon, Flashcards: Layers, Analytics: BarChart2, Heatmap: Activity };
const VIEWS = { Dashboard: DashboardView, Subjects: SubjectsView, Pomodoro: PomodoroView, Calendar: CalendarView, Flashcards: FlashcardsView, Analytics: AnalyticsView, Heatmap: HeatmapView };

async function seedUser() {
  for (let i = 0; i < SUBJECTS_SEED.length; i++) {
    const sub = SUBJECTS_SEED[i];
    const { data: newSub } = await supabase.from('subjects')
      .insert({ name: sub.name, short_name: sub.short_name, color: sub.color, exam_date: sub.exam_date })
      .select().single();
    if (newSub) {
      await supabase.from('topics').insert(
        sub.topics.map((label, pos) => ({ subject_id: newSub.id, label, done: false, position: pos }))
      );
    }
  }
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [cards, setCards] = useState([]);
  const [studyLogs, setStudyLogs] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Prevent race conditions: track seeding lock and which user we last loaded for
  const seedingRef = useRef(false);
  const loadedForRef = useRef(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    // Timeout safety net — if getSession hangs, show auth screen after 10s
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

  const loadSubjects = useCallback(async () => {
    // Seeding lock — prevents concurrent seeds from multiple rapid useEffect calls
    if (seedingRef.current) return;
    try {
      const { data, error } = await supabase.from('subjects').select('*, topics(*)').order('name');
      if (error) {
        console.error('[loadSubjects] select error:', error);
        showToast('DB error: ' + error.message, 'error');
        setSubjects([]); return;
      }
      if (data?.length) {
        // Auto-sync wrong dates in the background AND immediate state so you don't have to run SQL!
        const syncedData = data.map(dbSub => {
          const seedMatch = SUBJECTS_SEED.find(s => s.short_name === dbSub.short_name);
          if (seedMatch && dbSub.exam_date !== seedMatch.exam_date) {
            supabase.from('subjects').update({ exam_date: seedMatch.exam_date }).eq('id', dbSub.id).then();
            return { ...dbSub, exam_date: seedMatch.exam_date };
          }
          return dbSub;
        });

        setSubjects(syncedData.map(s => ({
          ...s,
          progress: s.topics?.length ? Math.round(s.topics.filter(t => t.done).length / s.topics.length * 100) : 0,
        })));
      } else {
        // Empty — acquire lock and seed once
        seedingRef.current = true;
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const userId = user?.id;
          if (!userId) { showToast('Not authenticated — cannot seed data', 'error'); return; }

          for (const sub of SUBJECTS_SEED) {
            const { data: newSub, error: subErr } = await supabase.from('subjects')
              .insert({ user_id: userId, name: sub.name, short_name: sub.short_name, color: sub.color, exam_date: sub.exam_date })
              .select().single();
            if (subErr) { console.error('[seed] subject insert failed:', subErr); showToast('Seed failed: ' + subErr.message, 'error'); return; }
            if (newSub) {
              const { error: topicErr } = await supabase.from('topics').insert(
                sub.topics.map((label, pos) => ({ user_id: userId, subject_id: newSub.id, label, done: false, position: pos }))
              );
              if (topicErr) console.error('[seed] topic insert failed:', topicErr);
            }
          }
          const { data: seeded } = await supabase.from('subjects').select('*, topics(*)').order('name');
          if (seeded?.length) {
            setSubjects(seeded.map(s => ({
              ...s,
              progress: s.topics?.length ? Math.round(s.topics.filter(t => t.done).length / s.topics.length * 100) : 0,
            })));
            showToast('✅ Subjects set up successfully!');
          } else {
            showToast('⚠️ Seeding failed silently. Check F12 → Console.', 'error');
          }
        } finally {
          seedingRef.current = false;
        }
      }
    } catch (err) {
      console.error('[loadSubjects] error:', err);
      showToast('Unexpected error: ' + err.message, 'error');
      setSubjects([]);
      seedingRef.current = false;
    }
  }, [showToast, seedingRef]);
  const loadSessions = useCallback(async () => {
    try {
      const { data } = await supabase.from('pomodoro_sessions').select('*').order('started_at', { ascending: false });
      setSessions(data || []);
    } catch { setSessions([]); }
  }, []);
  const loadCards = useCallback(async () => {
    try {
      const { data } = await supabase.from('flashcards').select('*').order('next_review');
      setCards(data || []);
    } catch { setCards([]); }
  }, []);
  const loadStudyLogs = useCallback(async () => {
    try {
      const { data } = await supabase.from('study_logs').select('*');
      setStudyLogs(data || []);
    } catch { setStudyLogs([]); }
  }, []);

  const handleSignOut = useCallback(async () => {
    loadedForRef.current = null;
    seedingRef.current = false;
    setSession(null);
    setSubjects([]); setSessions([]); setCards([]); setStudyLogs([]);
    supabase.auth.signOut().catch(() => {});
  }, []);

  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) return;
    // Guard: only reload if user changed (session object ref changes multiple times during auth)
    if (loadedForRef.current === uid) return;
    loadedForRef.current = uid;
    setDataLoading(true);
    const timeout = setTimeout(() => setDataLoading(false), 15000);
    Promise.all([loadSubjects(), loadSessions(), loadCards(), loadStudyLogs()])
      .finally(() => { setDataLoading(false); clearTimeout(timeout); });
    return () => clearTimeout(timeout);
  }, [session]);

  const subjectsWithCounts = useMemo(() => {
    const counts = {};
    sessions.forEach(s => { counts[s.subject_id] = (counts[s.subject_id] || 0) + 1; });
    return subjects.map(s => ({ ...s, pomodoroCount: counts[s.id] || 0 }));
  }, [subjects, sessions]);

  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const heatmapData = useMemo(() => computeHeatmap(sessions, studyLogs), [sessions, studyLogs]);

  const onToggleTopic = useCallback(async (topicId, currentDone) => {
    await supabase.from('topics').update({ done: !currentDone }).eq('id', topicId);
    await loadSubjects();
  }, [loadSubjects]);
  const onAddSession = useCallback(async (subjectId) => {
    await supabase.from('pomodoro_sessions').insert({ subject_id: subjectId, duration_minutes: 25 });
    await loadSessions(); showToast('Session recorded! 🎯');
  }, [loadSessions, showToast]);
  const onAddCard = useCallback(async (subjectId, question, answer) => {
    await supabase.from('flashcards').insert({ subject_id: subjectId, question, answer });
    await loadCards(); showToast('Flashcard added! 🃏');
  }, [loadCards, showToast]);
  const onRateCard = useCallback(async (card, difficulty) => {
    let { interval_days: iv, ease_factor: ef } = card;
    if (difficulty === 'Easy')   { ef = Math.min(ef + 0.1, 4.0); iv = Math.max(Math.round(iv * ef), 2); }
    else if (difficulty === 'Medium') { iv = Math.max(Math.round(iv * 1.5), 1); }
    else                         { ef = Math.max(ef - 0.2, 1.3); iv = 1; }
    const next = new Date(); next.setDate(next.getDate() + iv);
    await supabase.from('flashcards').update({ interval_days: iv, ease_factor: ef, next_review: next.toISOString().split('T')[0] }).eq('id', card.id);
    await loadCards();
  }, [loadCards]);
  const onDeleteCard = useCallback(async (cardId) => {
    await supabase.from('flashcards').delete().eq('id', cardId);
    await loadCards(); showToast('Card deleted.');
  }, [loadCards, showToast]);
  const onAddStudyLog = useCallback(async (subjectId, date, durationMinutes) => {
    await supabase.from('study_logs').insert({ subject_id: subjectId, date, duration_minutes: durationMinutes });
    await loadStudyLogs(); showToast('Session logged! 📅');
  }, [loadStudyLogs, showToast]);
  const onUpdateExamDate = useCallback(async (subjectId, date) => {
    await supabase.from('subjects').update({ exam_date: date }).eq('id', subjectId);
    await loadSubjects(); showToast('Exam date updated! 📌');
  }, [loadSubjects, showToast]);

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

  const ActiveView = VIEWS[activeTab] || DashboardView;
  const viewProps = {
    subjects: subjectsWithCounts, sessions, cards, studyLogs, streak, heatmapData,
    setActiveTab, showToast, onToggleTopic, onAddSession, onAddCard, onRateCard,
    onDeleteCard, onAddStudyLog, onUpdateExamDate,
  };

  return (
    <div className="min-h-screen flex bg-[#07071a] mesh-bg font-sans">
      {/* Toast */}
      {toast && (
        <div key={toast.id} className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl animate-in fade-in slide-in-from-top-3 duration-300 ${toast.type === 'error' ? 'glass-violet border-red-500/30 text-red-300' : 'glass border-violet-500/20 text-white'}`}
          style={{ backdropFilter: 'blur(12px)' }}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-56'} shrink-0 fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300`}
        style={{ background: 'linear-gradient(180deg, rgba(124,58,237,0.07) 0%, rgba(7,7,26,0.5) 100%)', borderRight: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
        
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 shrink-0 border-b border-white/[0.05]">
          <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center shrink-0 glow-violet">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-sm font-bold tracking-tight">
              <span className="gradient-text">Exam</span>
              <span className="text-gray-400 font-light">Focus</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar">
          {TABS.map(tab => {
            const Icon = TAB_ICONS[tab];
            const isActive = activeTab === tab;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive ? 'nav-active' : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'}`}>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-400' : 'text-gray-600 group-hover:text-gray-400'} transition-colors`} />
                {!sidebarCollapsed && <span>{tab}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-4 space-y-1 border-t border-white/[0.05] pt-3">
          <button onClick={() => setSidebarCollapsed(p => !p)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-300 hover:bg-white/[0.04] transition-colors">
            {sidebarCollapsed ? '→' : '← Collapse'}
          </button>
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors">
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!sidebarCollapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-56'} min-h-screen overflow-y-auto scrollbar transition-all duration-300`}>
        {dataLoading ? (
          <div className="flex items-center justify-center h-screen gap-3 text-gray-600">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading your data…</span>
          </div>
        ) : (
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <ActiveView {...viewProps} />
          </div>
        )}
      </main>
    </div>
  );
}
