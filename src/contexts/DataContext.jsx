import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { computeStreak, computeHeatmap, SUBJECTS_SEED } from '../lib/helpers';

const DataContext = createContext(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function DataProvider({ session, children }) {
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [cards, setCards] = useState([]);
  const [studyLogs, setStudyLogs] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [examTimetable, setExamTimetable] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const seedingRef = useRef(false);
  const loadedForRef = useRef(null);
  const toastTimerRef = useRef(null);

  const uid = session?.user?.id;

  const showToast = useCallback((msg, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type, id: Date.now() });
    const duration = type === 'error' ? 6000 : 3000;
    toastTimerRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  }, []);

  // ───── Loaders ─────
  const loadSubjects = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('subjects').select('*, topics(*)').order('name');
      if (error) {
        console.error('[loadSubjects] select error:', error);
        showToast('DB error: ' + error.message, 'error');
        setSubjects([]); return;
      }
      if (data) {
        setSubjects(data.map(s => ({
          ...s,
          progress: s.topics?.length ? Math.round(s.topics.filter(t => t.done).length / s.topics.length * 100) : 0,
        })));
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.error('[loadSubjects] error:', err);
      showToast('Unexpected error: ' + err.message, 'error');
      setSubjects([]);
    }
  }, [showToast, uid]);

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

  const loadSchedule = useCallback(async () => {
    try {
      const { data } = await supabase.from('daily_schedule').select('*').order('start_time');
      setSchedule(data || []);
    } catch { setSchedule([]); }
  }, []);

  const loadExamTimetable = useCallback(async () => {
    try {
      const { data } = await supabase.from('exam_timetable').select('*').order('exam_date');
      setExamTimetable(data || []);
    } catch { setExamTimetable([]); }
  }, []);

  // ───── Initial data load ─────
  useEffect(() => {
    if (!uid) return;
    if (loadedForRef.current === uid) return;
    loadedForRef.current = uid;
    setDataLoading(true);
    const timeout = setTimeout(() => setDataLoading(false), 15000);
    Promise.all([loadSubjects(), loadSessions(), loadCards(), loadStudyLogs(), loadSchedule(), loadExamTimetable()])
      .finally(() => { setDataLoading(false); clearTimeout(timeout); });
    return () => clearTimeout(timeout);
  }, [session]);

  // ───── Derived data ─────
  const subjectsWithCounts = useMemo(() => {
    const counts = {};
    sessions.forEach(s => { counts[s.subject_id] = (counts[s.subject_id] || 0) + 1; });
    return subjects.map(s => ({ ...s, pomodoroCount: counts[s.id] || 0 }));
  }, [subjects, sessions]);

  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const heatmapData = useMemo(() => computeHeatmap(sessions, studyLogs), [sessions, studyLogs]);

  // ───── CRUD callbacks (with error handling & user_id) ─────
  const onAddSubject = useCallback(async (data) => {
    const { error } = await supabase.from('subjects').insert({ user_id: uid, ...data });
    if (error) { showToast('Failed to add subject: ' + error.message, 'error'); return; }
    await loadSubjects(); showToast('Subject created! 📚');
  }, [loadSubjects, showToast, uid]);

  const onDeleteSubject = useCallback(async (subjectId) => {
    const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
    if (error) { showToast('Failed to delete subject: ' + error.message, 'error'); return; }
    await loadSubjects(); showToast('Subject deleted.');
  }, [loadSubjects, showToast]);

  const onAddTopic = useCallback(async (subjectId, label) => {
    const { error } = await supabase.from('topics').insert({ user_id: uid, subject_id: subjectId, label, done: false });
    if (error) { showToast('Failed to add topic: ' + error.message, 'error'); return; }
    await loadSubjects();
  }, [loadSubjects, showToast, uid]);

  const onDeleteTopic = useCallback(async (topicId) => {
    const { error } = await supabase.from('topics').delete().eq('id', topicId);
    if (error) { showToast('Failed to delete topic: ' + error.message, 'error'); return; }
    await loadSubjects();
  }, [loadSubjects, showToast]);

  const onToggleTopic = useCallback(async (topicId, currentDone) => {
    const { error } = await supabase.from('topics').update({ done: !currentDone }).eq('id', topicId);
    if (error) { showToast('Failed to toggle topic: ' + error.message, 'error'); return; }
    await loadSubjects();
  }, [loadSubjects, showToast]);

  const onAddSession = useCallback(async (subjectId) => {
    const { error } = await supabase.from('pomodoro_sessions').insert({ user_id: uid, subject_id: subjectId, duration_minutes: 25 });
    if (error) { showToast('Failed to save session: ' + error.message, 'error'); return; }
    await loadSessions(); showToast('Session recorded! 🎯');
  }, [loadSessions, showToast, uid]);

  const onAddCard = useCallback(async (subjectId, question, answer) => {
    const { error } = await supabase.from('flashcards').insert({ user_id: uid, subject_id: subjectId, question, answer });
    if (error) { showToast('Failed to add card: ' + error.message, 'error'); return; }
    await loadCards(); showToast('Flashcard added! 🃏');
  }, [loadCards, showToast, uid]);

  const onRateCard = useCallback(async (card, difficulty) => {
    let { interval_days: iv, ease_factor: ef } = card;
    if (difficulty === 'Easy')   { ef = Math.min(ef + 0.1, 4.0); iv = Math.max(Math.round(iv * ef), 2); }
    else if (difficulty === 'Medium') { iv = Math.max(Math.round(iv * 1.5), 1); }
    else                         { ef = Math.max(ef - 0.2, 1.3); iv = 1; }
    const next = new Date(); next.setDate(next.getDate() + iv);
    const { error } = await supabase.from('flashcards').update({ interval_days: iv, ease_factor: ef, next_review: next.toISOString().split('T')[0] }).eq('id', card.id);
    if (error) { showToast('Failed to rate card: ' + error.message, 'error'); return; }
    await loadCards();
  }, [loadCards, showToast]);

  const onDeleteCard = useCallback(async (cardId) => {
    const { error } = await supabase.from('flashcards').delete().eq('id', cardId);
    if (error) { showToast('Failed to delete card: ' + error.message, 'error'); return; }
    await loadCards(); showToast('Card deleted.');
  }, [loadCards, showToast]);

  const onAddStudyLog = useCallback(async (subjectId, date, durationMinutes) => {
    const { error } = await supabase.from('study_logs').insert({ user_id: uid, subject_id: subjectId, date, duration_minutes: durationMinutes });
    if (error) { showToast('Failed to log session: ' + error.message, 'error'); return; }
    await loadStudyLogs(); showToast('Session logged! 📅');
  }, [loadStudyLogs, showToast, uid]);

  const onUpdateExamDate = useCallback(async (subjectId, date) => {
    // exam_timetable is the single source of truth — insert a new exam entry
    const { error } = await supabase.from('exam_timetable').insert({ user_id: uid, subject_id: subjectId, exam_date: date });
    if (error) { showToast('Failed to set exam date: ' + error.message, 'error'); return; }
    await loadExamTimetable(); showToast('Exam date set! 📌');
  }, [loadExamTimetable, showToast, uid]);

  // Schedule CRUD
  const onAddSlot = useCallback(async (data) => {
    const { error } = await supabase.from('daily_schedule').insert({ user_id: uid, ...data });
    if (error) { showToast('Failed to add slot: ' + error.message, 'error'); return; }
    await loadSchedule(); showToast('Slot added! 📅');
  }, [loadSchedule, showToast, uid]);

  const onUpdateSlot = useCallback(async (id, data) => {
    const { error } = await supabase.from('daily_schedule').update(data).eq('id', id);
    if (error) { showToast('Failed to update slot: ' + error.message, 'error'); return; }
    await loadSchedule(); showToast('Slot updated!');
  }, [loadSchedule, showToast]);

  const onDeleteSlot = useCallback(async (id) => {
    const { error } = await supabase.from('daily_schedule').delete().eq('id', id);
    if (error) { showToast('Failed to delete slot: ' + error.message, 'error'); return; }
    await loadSchedule(); showToast('Slot deleted.');
  }, [loadSchedule, showToast]);

  // Exam Timetable CRUD
  const onAddExam = useCallback(async (data) => {
    const { error } = await supabase.from('exam_timetable').insert({ user_id: uid, ...data });
    if (error) { showToast('Failed to add exam: ' + error.message, 'error'); return; }
    await loadExamTimetable(); showToast('Exam added! 🎓');
  }, [loadExamTimetable, showToast, uid]);

  const onUpdateExam = useCallback(async (id, data) => {
    const { error } = await supabase.from('exam_timetable').update(data).eq('id', id);
    if (error) { showToast('Failed to update exam: ' + error.message, 'error'); return; }
    await loadExamTimetable(); showToast('Exam updated!');
  }, [loadExamTimetable, showToast]);

  const onDeleteExam = useCallback(async (id) => {
    const { error } = await supabase.from('exam_timetable').delete().eq('id', id);
    if (error) { showToast('Failed to delete exam: ' + error.message, 'error'); return; }
    await loadExamTimetable(); showToast('Exam deleted.');
  }, [loadExamTimetable, showToast]);

  // ───── Sign Out ─────
  const handleSignOut = useCallback(async () => {
    loadedForRef.current = null;
    seedingRef.current = false;
    setSubjects([]); setSessions([]); setCards([]); setStudyLogs([]); setSchedule([]); setExamTimetable([]);
    supabase.auth.signOut().catch(() => {});
  }, []);

  const value = {
    // State
    subjects: subjectsWithCounts, sessions, cards, studyLogs, streak, heatmapData,
    schedule, exams: examTimetable,
    dataLoading, toast,
    // Actions
    showToast, dismissToast, onAddSubject, onDeleteSubject, onAddTopic, onDeleteTopic, onToggleTopic, onAddSession, onAddCard, onRateCard,
    onDeleteCard, onAddStudyLog, onUpdateExamDate,
    onAddSlot, onUpdateSlot, onDeleteSlot,
    onAddExam, onUpdateExam, onDeleteExam,
    handleSignOut,
    // Session
    session,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
