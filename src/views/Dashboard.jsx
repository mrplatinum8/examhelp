import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, CheckCircle, GraduationCap, ArrowRight, Clock, TrendingUp, PlaySquare, CalendarPlus, Layers } from 'lucide-react';
import { SUBJECT_COLORS, daysUntil } from '../lib/helpers';
import { useData } from '../contexts/DataContext';

const GRAD = ['progress-gradient', 'progress-gradient-orange', 'progress-gradient-green', 'progress-gradient-pink', 'progress-gradient', 'progress-gradient-orange', 'progress-gradient-green', 'progress-gradient-pink'];

export default function DashboardView() {
  const { subjects, sessions, streak } = useData();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPomodoros = sessions.filter(s => s.started_at?.startsWith(todayStr)).length;
  const totalFocusMin = sessions.filter(s => s.started_at?.startsWith(todayStr)).reduce((a, s) => a + (s.duration_minutes || 25), 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const upcomingExams = [...subjects].filter(s => s.exam_date && daysUntil(s.exam_date) >= 0)
    .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));
  const bestSubject = [...subjects].sort((a, b) => b.pomodoroCount - a.pomodoroCount)[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="gradient-text">{greeting}</span>
            <span className="text-white">.</span>
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => navigate('/pomodoro')} className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold btn-gradient text-white flex items-center justify-center gap-2 hover:scale-105 transition-transform">
            <PlaySquare className="w-4 h-4" /> Start Focus
          </button>
          <button onClick={() => navigate('/calendar')} className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold glass hover:bg-white/[0.08] text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2">
            <CalendarPlus className="w-4 h-4" /> Log Study
          </button>
          <button onClick={() => navigate('/flashcards')} className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold glass hover:bg-white/[0.08] text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2">
            <Layers className="w-4 h-4" /> Flashcards
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {[
          { icon: <Flame className="w-5 h-5 md:w-5 md:h-5 text-orange-400" />, label: 'Study Streak', value: `${streak}d`, glow: 'glow-orange', gradient: 'from-orange-500/10 to-red-500/10', border: 'border-orange-500/20' },
          { icon: <CheckCircle className="w-5 h-5 md:w-5 md:h-5 text-emerald-400" />, label: 'Pomodoros', value: todayPomodoros, glow: '', gradient: 'from-emerald-500/10 to-cyan-500/10', border: 'border-emerald-500/20' },
          { icon: <Clock className="w-5 h-5 md:w-5 md:h-5 text-violet-400" />, label: 'Focus Time', value: `${totalFocusMin}m`, glow: '', gradient: 'from-violet-500/10 to-blue-500/10', border: 'border-violet-500/20' },
        ].map((stat, i) => (
          <div key={i} className={`glass card-hover rounded-2xl p-4 md:p-5 border bg-gradient-to-br ${stat.gradient} ${stat.border}`}>
            <div className="flex items-center gap-2 md:gap-2.5 mb-2 md:mb-3">{stat.icon}<span className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</span></div>
            <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Progress */}
        <div className="lg:col-span-2 glass rounded-2xl p-4 md:p-6">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-bold text-white">Subject Progress</h2>
            <button onClick={() => navigate('/subjects')} className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">View all →</button>
          </div>
          <div className="space-y-4 md:space-y-5">
            {subjects.length === 0 && <p className="text-gray-600 text-sm text-center py-6">Subjects loading…</p>}
            {subjects.map((sub, i) => {
              const c = SUBJECT_COLORS[sub.color] || SUBJECT_COLORS.blue;
              return (
                <div key={sub.id}>
                  <div className="flex justify-between text-xs md:text-sm mb-1.5 md:mb-2">
                    <span className="font-semibold text-gray-300 truncate pr-2">{sub.name} <span className="text-gray-600 text-[10px] md:text-xs ml-0.5 md:ml-1 hidden sm:inline">({sub.short_name})</span></span>
                    <span className={`font-bold shrink-0 ${c.text}`}>{sub.progress}%</span>
                  </div>
                  <div className="w-full bg-white/[0.05] rounded-full h-1.5 md:h-2 overflow-hidden">
                    <div className={`h-1.5 md:h-2 rounded-full ${GRAD[i % GRAD.length]} transition-all duration-1000 ease-out`} style={{ width: `${sub.progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-5">
          {/* Mission */}
          <div onClick={() => navigate('/pomodoro')}
            className="glass card-hover rounded-2xl p-5 border border-violet-500/15 cursor-pointer relative overflow-hidden group transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 group-hover:from-violet-500/10 group-hover:to-blue-500/10 transition-all" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg btn-gradient flex items-center justify-center"><TrendingUp className="w-3 h-3 text-white" /></div>
                <h2 className="text-sm font-bold text-white">Daily Mission</h2>
              </div>
              {bestSubject ? (
                <>
                  <p className="text-gray-400 text-sm leading-relaxed">Focus on <strong className={SUBJECT_COLORS[bestSubject.color]?.text}>{bestSubject.short_name}</strong> — aim for <strong className="text-white">4 Pomodoros</strong> today.</p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-violet-400 font-bold">
                    Start Session <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </>
              ) : (
                <p className="text-gray-600 text-sm">Complete your first Pomodoro to unlock your mission!</p>
              )}
            </div>
          </div>

          {/* Upcoming Exams — Traffic-Light Urgency */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-gray-500" /> Upcoming Exams
            </h2>
            {upcomingExams.length === 0 && <p className="text-gray-600 text-xs text-center py-3">No exams scheduled.</p>}
            <div className="space-y-3">
              {upcomingExams.map(exam => {
                const c = SUBJECT_COLORS[exam.color] || SUBJECT_COLORS.blue;
                const days = daysUntil(exam.exam_date);
                const urgency = days <= 7 ? 'critical' : days <= 29 ? 'warning' : 'safe';
                const urgencyColor = urgency === 'critical' ? 'text-red-400' : urgency === 'warning' ? 'text-amber-400' : 'text-emerald-400';
                const urgencyBg = urgency === 'critical' ? 'rgba(239,68,68,0.08)' : urgency === 'warning' ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.05)';
                const urgencyBorder = urgency === 'critical' ? '1px solid rgba(239,68,68,0.25)' : urgency === 'warning' ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.06)';
                const urgencyLabel = urgency === 'critical' ? '🔴 Critical' : urgency === 'warning' ? '🟡 Soon' : '🟢 Safe';
                return (
                  <div key={exam.id} className={`px-4 py-3 rounded-xl flex justify-between items-center transition-all ${urgency === 'critical' ? 'animate-pulse' : ''}`}
                    style={{ background: urgencyBg, border: urgencyBorder, boxShadow: urgency === 'critical' ? '0 0 15px rgba(239,68,68,0.15)' : 'none' }}>
                    <div>
                      <p className={`font-black text-sm ${c.text}`}>{exam.short_name}</p>
                      <p className="text-[11px] text-gray-600">{new Date(exam.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 inline-block ${urgencyColor}`}>{urgencyLabel}</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black ${urgencyColor}`}>{days}</p>
                      <p className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">days</p>
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
