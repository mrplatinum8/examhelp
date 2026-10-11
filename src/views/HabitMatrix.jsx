import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle, Shield, Award, Calendar, Zap, Sparkles, TrendingUp } from 'lucide-react';
import { CORE_DISCIPLINES, lifeOsStorage } from '../lib/lifeOsStorage';
import { useData } from '../contexts/DataContext';

export default function HabitMatrixView() {
  const [habitsData, setHabitsData] = useState(() => lifeOsStorage.getHabits());
  const { showToast } = useData();

  // Generate the last 7 dates (oldest to today)
  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggle = (dateStr, disciplineId) => {
    const updated = lifeOsStorage.toggleHabit(dateStr, disciplineId);
    setHabitsData({ ...updated });
    const isNowDone = updated[dateStr]?.[disciplineId];
    if (isNowDone) {
      showToast(`Discipline logged! Keep momentum alive ⚡`);
    }
  };

  // Streaks for each discipline
  const streaks = CORE_DISCIPLINES.reduce((acc, disc) => {
    acc[disc.id] = lifeOsStorage.calculateHabitStreak(disc.id);
    return acc;
  }, {});

  const totalCompletionsToday = CORE_DISCIPLINES.filter(
    (d) => habitsData[todayStr]?.[d.id]
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
              LIFE OS PRIME MODULE
            </span>
            <span className="text-xs font-mono text-gray-500">5-Pillar Discipline</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>⚡ Habit Harmony Matrix</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Unforgiving daily execution engine tracking GATE 2027, Backlogs, Jobs, Masters & Physical Energy.
          </p>
        </div>

        {/* Quick summary cards */}
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2.5 rounded-2xl border border-violet-500/20 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Today's Execution</p>
            <p className="text-2xl font-black text-violet-400">
              {totalCompletionsToday} <span className="text-xs font-normal text-gray-500">/ 5</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 7-Day Matrix Table */}
      <div className="glass rounded-2xl p-5 border border-white/5 overflow-x-auto">
        <div className="min-w-[620px]">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 pb-3 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider items-center">
            <div className="col-span-5 flex items-center gap-2">Core Discipline</div>
            <div className="col-span-1 text-center">Streak</div>
            <div className="col-span-6 grid grid-cols-7 gap-1 text-center">
              {last7Dates.map((dateStr) => {
                const isToday = dateStr === todayStr;
                const dateObj = new Date(dateStr);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                const dayNum = dateObj.getDate();
                return (
                  <div
                    key={dateStr}
                    className={`py-1 rounded text-center transition-all ${
                      isToday ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 font-black' : 'text-gray-500'
                    }`}
                  >
                    <div className="text-[10px]">{dayName}</div>
                    <div className="text-xs">{dayNum}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/5">
            {CORE_DISCIPLINES.map((disc) => {
              const streak = streaks[disc.id] || 0;
              const isDoneToday = Boolean(habitsData[todayStr]?.[disc.id]);

              return (
                <div
                  key={disc.id}
                  className="grid grid-cols-12 gap-2 py-4 items-center hover:bg-white/[0.02] transition-colors rounded-xl px-1"
                >
                  {/* Discipline Name & Desc */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-xl shrink-0 shadow-inner">
                      {disc.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        {disc.name}
                        {isDoneToday && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                            ACTIVE
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{disc.desc}</p>
                    </div>
                  </div>

                  {/* Real-time streak */}
                  <div className="col-span-1 text-center">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      <Flame className="w-3 h-3 text-orange-400 fill-orange-400/20" />
                      {streak}d
                    </span>
                  </div>

                  {/* 7-Day Completion Grid */}
                  <div className="col-span-6 grid grid-cols-7 gap-1 items-center justify-items-center">
                    {last7Dates.map((dateStr) => {
                      const isDone = Boolean(habitsData[dateStr]?.[disc.id]);
                      const isToday = dateStr === todayStr;

                      return (
                        <button
                          key={dateStr}
                          onClick={() => handleToggle(dateStr, disc.id)}
                          title={`${disc.name} on ${dateStr}: ${isDone ? 'Done' : 'Incomplete'}`}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20 scale-100 hover:scale-110'
                              : isToday
                              ? 'bg-white/[0.05] border border-violet-500/40 text-gray-500 hover:border-violet-400 hover:text-white'
                              : 'bg-white/[0.02] border border-white/5 text-transparent hover:border-white/20 hover:text-gray-500'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle className="w-4 h-4 text-black stroke-[2.5]" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Discipline Deep-Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" /> The 6-Month Compounding Rule
            </div>
            <h3 className="text-white font-black text-base mb-1">Consistency Beats Intensity</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Hitting all 5 core disciplines for 180 consecutive days guarantees clearing all 6 backlogs, securing top 1% GATE CS standing, and landing software engineering offers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
            <span>Overall Discipline Score</span>
            <span className="font-mono font-bold text-white">
              {Math.round(
                (Object.values(habitsData).reduce(
                  (acc, d) => acc + Object.values(d).filter(Boolean).length,
                  0
                ) /
                  (last7Dates.length * 5)) *
                  100
              )}
              % Weekly Velocity
            </span>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4" /> Streak Defense
            </div>
            <h3 className="text-white font-black text-base mb-1">Never Miss Twice</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              If an intense workday cuts into your study hours, complete the 45m Backlog Blitz or 10 flashcards to preserve your discipline record before sleep.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
            <span>Max Active Streak</span>
            <span className="font-mono font-bold text-orange-400">
              {Math.max(...Object.values(streaks), 0)} Days
            </span>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-4 h-4" /> Offline-First Resilience
            </div>
            <h3 className="text-white font-black text-base mb-1">Local & Cloud Synced</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Every toggle persists immediately to offline local memory with seamless state synchronization. You can log your habits without internet connection.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
            <span>Sync Status</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Synced Local
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
