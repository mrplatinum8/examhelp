import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  CheckCircle,
  GraduationCap,
  ArrowRight,
  Clock,
  TrendingUp,
  PlaySquare,
  CalendarPlus,
  Layers,
  Zap,
  Activity,
  Target,
  Shield,
  EyeOff,
  Check,
  Edit2,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { SUBJECT_COLORS, daysUntil } from '../lib/helpers';
import { useData } from '../contexts/DataContext';
import { lifeOsStorage, CORE_DISCIPLINES } from '../lib/lifeOsStorage';

const GRAD = [
  'progress-gradient',
  'progress-gradient-orange',
  'progress-gradient-green',
  'progress-gradient-pink',
  'progress-gradient',
  'progress-gradient-orange',
  'progress-gradient-green',
  'progress-gradient-pink',
];

export default function DashboardView({ onActivateStealth }) {
  const { subjects, sessions, exams, streak, showToast } = useData();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPomodoros = sessions.filter((s) => s.started_at?.startsWith(todayStr)).length;
  const totalFocusMin = sessions
    .filter((s) => s.started_at?.startsWith(todayStr))
    .reduce((a, s) => a + (s.duration_minutes || 25), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // 1. Top 3 Priorities State
  const [priorities, setPriorities] = useState(() => lifeOsStorage.getPriorities(todayStr));
  const [editingPriorityId, setEditingPriorityId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleTogglePriority = (id) => {
    const updated = priorities.map((p) => (p.id === id ? { ...p, done: !p.done } : p));
    setPriorities(updated);
    lifeOsStorage.savePriorities(updated, todayStr);
    showToast('Non-Negotiable objective updated! 🎯');
  };

  const startEditPriority = (p) => {
    setEditingPriorityId(p.id);
    setEditText(p.text);
  };

  const saveEditPriority = (id) => {
    if (!editText.trim()) return;
    const updated = priorities.map((p) => (p.id === id ? { ...p, text: editText.trim() } : p));
    setPriorities(updated);
    lifeOsStorage.savePriorities(updated, todayStr);
    setEditingPriorityId(null);
    showToast('Priority saved!');
  };

  // 2. 6-Month Countdown Timer
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetIso = lifeOsStorage.getCountdownTarget();
    const targetDate = new Date(targetIso).getTime();

    const updateTicker = () => {
      const now = Date.now();
      const diff = Math.max(0, targetDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. 7-Day Deep Work Velocity
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const daySessions = sessions.filter((s) => s.started_at?.startsWith(dStr));
    const totalMinutes = daySessions.reduce((acc, s) => acc + (s.duration_minutes || 25), 0);
    return {
      date: dStr,
      label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNum: d.getDate(),
      minutes: totalMinutes,
      count: daySessions.length,
      isToday: dStr === todayStr,
    };
  });
  const maxDayMinutes = Math.max(...past7Days.map((d) => d.minutes), 120);

  // 4. Telemetry LEDs calculation
  const habitsData = lifeOsStorage.getHabits();
  const habitsDoneToday = CORE_DISCIPLINES.filter((d) => habitsData[todayStr]?.[d.id]).length;
  const bioLogs = lifeOsStorage.getBioLogs();
  const hasBioLogged = Boolean(bioLogs[todayStr]);
  const campaigns = lifeOsStorage.getCampaigns();
  const totalMilestones = campaigns.reduce((acc, c) => acc + c.milestones.length, 0);
  const doneMilestones = campaigns.reduce(
    (acc, c) => acc + c.milestones.filter((m) => m.done).length,
    0
  );

  // Upcoming exams from exam_timetable
  const upcomingExams = (exams || [])
    .filter((e) => e.exam_date && daysUntil(e.exam_date) >= -1)
    .map((e) => {
      const sub = subjects.find((s) => s.id === e.subject_id);
      return sub ? { ...e, short_name: sub.short_name, color: sub.color, name: sub.name } : null;
    })
    .filter(Boolean);

  const activeSubs = subjects.filter((s) => !s.completed);
  const completedSubs = subjects.filter((s) => s.completed);
  const bestSubject =
    [...activeSubs].sort((a, b) => b.pomodoroCount - a.pomodoroCount)[0] || activeSubs[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── TOP HUD: GREETING & COMMAND ACTIONS ───────────────────────────── */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
              LIFE OS PRIME HUD
            </span>
            <span className="text-xs font-mono text-gray-500">
              6-Month Accelerator Engine
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="gradient-text">{greeting}</span>
            <span className="text-white">.</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => navigate('/pomodoro')}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold btn-gradient text-white flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-violet-500/20"
          >
            <PlaySquare className="w-4 h-4" /> Start Focus
          </button>
          <button
            onClick={() => navigate('/backlog')}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold glass hover:bg-white/[0.08] text-rose-300 hover:text-white transition-colors flex items-center justify-center gap-2 border-rose-500/20"
          >
            <Layers className="w-4 h-4 text-rose-400" /> Backlog Buster
          </button>
          <button
            onClick={() => (onActivateStealth ? onActivateStealth() : navigate('/stealth'))}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold glass hover:bg-white/[0.08] text-amber-300 hover:text-white transition-colors flex items-center justify-center gap-2 border-amber-500/20"
            title="Press Alt+S anywhere"
          >
            <EyeOff className="w-4 h-4 text-amber-400" /> Stealth (Alt+S)
          </button>
        </div>
      </div>

      {/* ── TELEMETRY LEDS & 6-MONTH COUNTDOWN BAR ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Telemetry LEDs status bar */}
        <div className="lg:col-span-7 glass rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-violet-400" /> Telemetry LED Status
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* LED 1: Deep Work */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  totalFocusMin >= 60
                    ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                    : todayPomodoros > 0
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                    : 'bg-gray-600'
                }`}
              />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Deep Work</p>
                <p className="text-xs font-mono font-bold text-white truncate">
                  {totalFocusMin >= 60 ? 'Optimal (60m+)' : `${totalFocusMin}m logged`}
                </p>
              </div>
            </div>

            {/* LED 2: Habits */}
            <div
              onClick={() => navigate('/habits')}
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 cursor-pointer hover:bg-white/[0.04] transition-colors"
            >
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  habitsDoneToday >= 4
                    ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                    : habitsDoneToday >= 1
                    ? 'bg-violet-400 shadow-[0_0_8px_#a78bfa]'
                    : 'bg-gray-600'
                }`}
              />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Habits</p>
                <p className="text-xs font-mono font-bold text-white truncate">
                  {habitsDoneToday}/5 Active
                </p>
              </div>
            </div>

            {/* LED 3: Bio-Telemetry */}
            <div
              onClick={() => navigate('/stealth')}
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 cursor-pointer hover:bg-white/[0.04] transition-colors"
            >
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  hasBioLogged
                    ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                    : 'bg-amber-500/70 shadow-[0_0_6px_#f59e0b]'
                }`}
              />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Bio / Energy</p>
                <p className="text-xs font-mono font-bold text-white truncate">
                  {hasBioLogged ? `${bioLogs[todayStr]?.energyLevel || 8}/10 Logged` : 'Pending Log'}
                </p>
              </div>
            </div>

            {/* LED 4: Milestones */}
            <div
              onClick={() => navigate('/campaigns')}
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 cursor-pointer hover:bg-white/[0.04] transition-colors"
            >
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  doneMilestones > 0
                    ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
                    : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'
                }`}
              />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Milestones</p>
                <p className="text-xs font-mono font-bold text-white truncate">
                  {doneMilestones}/{totalMilestones} Cleared
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 6-Month Accelerator Countdown */}
        <div className="lg:col-span-5 glass rounded-2xl p-4 border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-violet-400" /> 6-Month Accelerator Countdown
            </span>
            <span className="text-[10px] font-mono text-gray-400">Target T-Zero</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center my-1">
            <div className="bg-black/30 rounded-xl p-2 border border-white/5">
              <span className="font-mono text-xl sm:text-2xl font-black text-white">{countdown.days}</span>
              <span className="block text-[9px] text-gray-400 uppercase font-bold">Days</span>
            </div>
            <div className="bg-black/30 rounded-xl p-2 border border-white/5">
              <span className="font-mono text-xl sm:text-2xl font-black text-white">{countdown.hours}</span>
              <span className="block text-[9px] text-gray-400 uppercase font-bold">Hours</span>
            </div>
            <div className="bg-black/30 rounded-xl p-2 border border-white/5">
              <span className="font-mono text-xl sm:text-2xl font-black text-white">{countdown.minutes}</span>
              <span className="block text-[9px] text-gray-400 uppercase font-bold">Mins</span>
            </div>
            <div className="bg-black/30 rounded-xl p-2 border border-white/5">
              <span className="font-mono text-xl sm:text-2xl font-black text-violet-400">{countdown.seconds}</span>
              <span className="block text-[9px] text-gray-400 uppercase font-bold">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7-DAY DEEP WORK VELOCITY BAR CHART & TOP 3 PRIORITIES ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Velocity Chart */}
        <div className="lg:col-span-6 glass rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-400" /> 7-Day Deep Work Velocity
              </h2>
              <p className="text-xs text-gray-500">Daily focus time trends over the last 7 days</p>
            </div>
            <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
              {past7Days.reduce((a, b) => a + b.minutes, 0)}m total
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4 pb-2 border-b border-white/5">
            {past7Days.map((d) => {
              const heightPct = Math.min(100, Math.round((d.minutes / maxDayMinutes) * 100));

              return (
                <div key={d.date} className="flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-violet-300 mb-1">
                    {d.minutes}m
                  </div>

                  <div className="w-full max-w-[28px] bg-white/[0.04] rounded-t-lg h-full flex items-end overflow-hidden p-0.5">
                    <div
                      className={`w-full rounded-t-md transition-all duration-700 ${
                        d.isToday
                          ? 'bg-gradient-to-t from-violet-600 to-cyan-400 shadow-lg shadow-violet-500/30'
                          : d.minutes > 0
                          ? 'bg-gradient-to-t from-violet-800/80 to-blue-500/80'
                          : 'bg-white/5'
                      }`}
                      style={{ height: `${Math.max(8, heightPct)}%` }}
                    />
                  </div>

                  <span
                    className={`text-[10px] font-mono mt-2 font-bold ${
                      d.isToday ? 'text-violet-400 font-black' : 'text-gray-500'
                    }`}
                  >
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 flex justify-between items-center text-xs text-gray-500">
            <span>Streak Velocity: <strong className="text-orange-400 font-mono">{streak} Days</strong></span>
            <button
              onClick={() => navigate('/analytics')}
              className="text-violet-400 hover:text-violet-300 font-semibold"
            >
              Full Analytics →
            </button>
          </div>
        </div>

        {/* Top 3 Daily Priority Non-Negotiables */}
        <div className="lg:col-span-6 glass rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Top 3 Daily Priority Non-Negotiables
              </h2>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                {priorities.filter((p) => p.done).length} / 3 Completed
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Your unforgiving 3 daily must-win objectives. Clear these before sunset.
            </p>

            <div className="space-y-2.5">
              {priorities.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    item.done
                      ? 'bg-emerald-500/[0.05] border-emerald-500/20 text-gray-400'
                      : 'bg-white/[0.02] border-white/5 hover:border-violet-500/30 text-white'
                  }`}
                >
                  <div
                    onClick={() => handleTogglePriority(item.id)}
                    className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        item.done
                          ? 'bg-emerald-500 border-emerald-500 text-black'
                          : 'border-white/20 hover:border-emerald-400'
                      }`}
                    >
                      {item.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    {editingPriorityId === item.id ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditPriority(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="bg-black/50 border border-violet-500/50 rounded px-2 py-1 text-xs text-white w-full outline-none"
                      />
                    ) : (
                      <span
                        className={`text-xs font-medium leading-snug truncate ${
                          item.done ? 'line-through text-gray-500' : 'text-gray-200'
                        }`}
                      >
                        {item.text}
                      </span>
                    )}
                  </div>

                  {editingPriorityId === item.id ? (
                    <button
                      onClick={() => saveEditPriority(item.id)}
                      className="text-xs text-emerald-400 font-bold hover:underline shrink-0"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditPriority(item)}
                      className="text-gray-600 hover:text-gray-300 p-1 shrink-0"
                      title="Edit objective"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
            <span>Execution Rule: <strong className="text-gray-400">Lock down all 3 daily</strong></span>
            <span className="text-emerald-400 font-mono font-bold">No Roll-Overs</span>
          </div>
        </div>
      </div>

      {/* ── SUBJECT PROGRESS & UPCOMING EXAMS ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Progress */}
        <div className="lg:col-span-2 glass rounded-2xl p-4 md:p-6">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-bold text-white">Subject Progress & Backlogs</h2>
            <button
              onClick={() => navigate('/subjects')}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              View all →
            </button>
          </div>
          <div className="space-y-4 md:space-y-5">
            {subjects.length === 0 && (
              <p className="text-gray-500 text-sm italic text-center py-6 border border-dashed border-white/5 rounded-xl">
                No subjects added yet. Go to Subjects to create one.
              </p>
            )}

            {/* Active Subjects */}
            {activeSubs.map((sub, i) => {
              const c = SUBJECT_COLORS[sub.color] || SUBJECT_COLORS.blue;
              return (
                <div key={sub.id}>
                  <div className="flex justify-between text-xs md:text-sm mb-1.5 md:mb-2">
                    <span className="font-semibold text-gray-300 truncate pr-2">
                      {sub.name}{' '}
                      <span className="text-gray-600 text-[10px] md:text-xs ml-0.5 md:ml-1 hidden sm:inline">
                        ({sub.short_name})
                      </span>
                    </span>
                    <span className={`font-bold shrink-0 ${c.text}`}>{sub.progress}%</span>
                  </div>
                  <div className="w-full bg-white/[0.05] rounded-full h-1.5 md:h-2 overflow-hidden">
                    <div
                      className={`h-1.5 md:h-2 rounded-full ${
                        GRAD[i % GRAD.length]
                      } transition-all duration-1000 ease-out`}
                      style={{ width: `${sub.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Completed / Passed Subjects */}
            {completedSubs.length > 0 && (
              <div className="pt-3 mt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Completed Subjects ({completedSubs.length})
                </div>
                <div className="space-y-2.5">
                  {completedSubs.map((sub) => {
                    const c = SUBJECT_COLORS[sub.color] || SUBJECT_COLORS.emerald;
                    return (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white ${c.bg}`}>
                            {sub.short_name}
                          </span>
                          <span className="text-xs font-medium text-gray-400 truncate">{sub.name}</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                          Passed 100%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right col: Daily Mission & Upcoming Exams */}
        <div className="space-y-5">
          {/* Mission */}
          <div
            onClick={() => navigate('/pomodoro')}
            className="glass card-hover rounded-2xl p-5 border border-violet-500/15 cursor-pointer relative overflow-hidden group transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 group-hover:from-violet-500/10 group-hover:to-blue-500/10 transition-all" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg btn-gradient flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                <h2 className="text-sm font-bold text-white">Daily Mission</h2>
              </div>
              {bestSubject ? (
                <>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Focus on{' '}
                    <strong className={SUBJECT_COLORS[bestSubject.color]?.text}>
                      {bestSubject.short_name}
                    </strong>{' '}
                    — aim for <strong className="text-white">4 Pomodoros</strong> today.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-violet-400 font-bold">
                    Start Session <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </>
              ) : (
                <p className="text-gray-600 text-sm">
                  Create a subject and complete a session to unlock your daily mission.
                </p>
              )}
            </div>
          </div>

          {/* Upcoming Exams — Traffic-Light Urgency */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-gray-500" /> Upcoming Exams
            </h2>
            {upcomingExams.length === 0 && (
              <p className="text-gray-600 text-xs text-center py-3">No exams scheduled.</p>
            )}
            <div className="space-y-3">
              {upcomingExams.map((exam) => {
                const c = SUBJECT_COLORS[exam.color] || SUBJECT_COLORS.blue;
                const days = daysUntil(exam.exam_date);
                const urgency = days <= 7 ? 'critical' : days <= 29 ? 'warning' : 'safe';
                const urgencyColor =
                  urgency === 'critical'
                    ? 'text-red-400'
                    : urgency === 'warning'
                    ? 'text-amber-400'
                    : 'text-emerald-400';
                const urgencyBg =
                  urgency === 'critical'
                    ? 'rgba(239,68,68,0.08)'
                    : urgency === 'warning'
                    ? 'rgba(245,158,11,0.06)'
                    : 'rgba(16,185,129,0.05)';
                const urgencyBorder =
                  urgency === 'critical'
                    ? '1px solid rgba(239,68,68,0.25)'
                    : urgency === 'warning'
                    ? '1px solid rgba(245,158,11,0.2)'
                    : '1px solid rgba(255,255,255,0.06)';
                const urgencyLabel =
                  urgency === 'critical' ? '🔴 Critical' : urgency === 'warning' ? '🟡 Soon' : '🟢 Safe';
                return (
                  <div
                    key={exam.id}
                    className={`px-4 py-3 rounded-xl flex justify-between items-center transition-all ${
                      urgency === 'critical' ? 'animate-pulse' : ''
                    }`}
                    style={{
                      background: urgencyBg,
                      border: urgencyBorder,
                      boxShadow: urgency === 'critical' ? '0 0 15px rgba(239,68,68,0.15)' : 'none',
                    }}
                  >
                    <div>
                      <p className={`font-black text-sm ${c.text}`}>{exam.short_name}</p>
                      <p className="text-[11px] text-gray-600">
                        {new Date(exam.exam_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider mt-1 inline-block ${urgencyColor}`}
                      >
                        {urgencyLabel}
                      </span>
                    </div>
                    <div className="text-right">
                      {days === -1 ? (
                        <p className={`text-xl font-black mt-2 ${urgencyColor}`}>Today</p>
                      ) : (
                        <>
                          <p className={`text-2xl font-black ${urgencyColor}`}>{days}</p>
                          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">days</p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
