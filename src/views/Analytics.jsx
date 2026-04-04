import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Flame, Clock, Target, TrendingUp, Download } from 'lucide-react';
import { SUBJECT_COLORS } from '../lib/helpers';
import { useData } from '../contexts/DataContext';

const Tip = ({ active, payload, label }) => active && payload?.length ? (
  <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(15,15,40,0.95)', border: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(12px)' }}>
    <p className="text-gray-400">{label}</p>
    <p className="text-white font-bold">{payload[0].value} sessions</p>
  </div>
) : null;

export default function AnalyticsView() {
  const { subjects, sessions, streak } = useData();
  const weekData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split('T')[0];
    return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), sessions: sessions.filter(s => s.started_at?.startsWith(ds)).length };
  }), [sessions]);

  const radarData = useMemo(() => subjects.map(s => ({
    subject: s.short_name, sessions: s.pomodoroCount,
  })), [subjects]);

  const totalSessions = sessions.length;
  const totalMin = sessions.reduce((a, s) => a + (s.duration_minutes || 25), 0);
  const thisWeekMin = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    return sessions.filter(s => new Date(s.started_at) >= cutoff).reduce((a, s) => a + (s.duration_minutes || 25), 0);
  }, [sessions]);
  const weekSessions = weekData.reduce((a, d) => a + d.sessions, 0);
  const bestSubject = [...subjects].sort((a, b) => b.pomodoroCount - a.pomodoroCount)[0];

  const stats = [
    { icon: <Target className="w-5 h-5 text-violet-400" />, label: 'Total Sessions', value: totalSessions, sub: 'all time', from: 'from-violet-500/10', border: 'rgba(139,92,246,0.15)' },
    { icon: <Clock className="w-5 h-5 text-blue-400" />, label: 'Focus Time', value: `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`, sub: 'all time', from: 'from-blue-500/10', border: 'rgba(59,130,246,0.15)' },
    { icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, label: 'Best Subject', value: bestSubject?.short_name || '—', sub: `${bestSubject?.pomodoroCount || 0} sessions`, from: 'from-emerald-500/10', border: 'rgba(16,185,129,0.15)' },
    { icon: <Flame className="w-5 h-5 text-orange-400" />, label: 'Streak', value: `${streak}d`, sub: 'consecutive days', from: 'from-orange-500/10', border: 'rgba(249,115,22,0.15)' },
  ];

  const exportCSV = () => {
    if (!sessions.length) { alert('No session data to export.'); return; }
    const headers = ['Date', 'Time', 'Subject', 'Duration (mins)'];
    const rows = sessions.map(s => {
      const sub = subjects.find(x => x.id === s.subject_id);
      const [d, t] = s.started_at.split('T');
      return [d, t.split('.')[0], sub ? sub.name : 'Unknown', s.duration_minutes];
    });
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `examfocus_sessions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black"><span className="gradient-text">Analytics</span></h1>
          <p className="text-gray-600 text-sm mt-1">Your study performance at a glance.</p>
        </div>
        <button onClick={exportCSV} className="px-4 py-2 rounded-xl text-xs font-bold glass hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors flex items-center gap-2">
          <Download className="w-3.5 h-3.5" /> Export Data
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`glass card-hover rounded-2xl p-5 bg-gradient-to-br ${s.from} to-transparent`} style={{ border: `1px solid ${s.border}` }}>
            <div className="flex items-center gap-2 mb-3">{s.icon}<span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{s.label}</span></div>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-gray-700 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'This Week', value: weekSessions + ' sessions' },
          { label: 'Avg Daily', value: (weekSessions / 7).toFixed(1) },
          { label: 'Week Focus', value: `${Math.floor(thisWeekMin / 60)}h ${thisWeekMin % 60}m` },
        ].map((item, i) => (
          <div key={i} className="glass rounded-2xl p-4 text-center">
            <p className="text-xl font-black gradient-text">{item.value}</p>
            <p className="text-xs text-gray-600 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-6 h-72 flex flex-col">
          <h3 className="text-white font-bold text-sm mb-4">Sessions This Week</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} barSize={22}>
                <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<Tip />} cursor={{ fill: 'rgba(139,92,246,0.05)' }} />
                <Bar dataKey="sessions" radius={[5, 5, 0, 0]}
                  fill="url(#barGrad)" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 h-72 flex flex-col">
          <h3 className="text-white font-bold text-sm mb-1">Focus Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 10 }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar dataKey="sessions" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-bold text-sm mb-5">Sessions Per Subject</h3>
        <div className="space-y-3">
          {[...subjects].sort((a, b) => b.pomodoroCount - a.pomodoroCount).map(s => {
            const c = SUBJECT_COLORS[s.color] || SUBJECT_COLORS.blue;
            const max = Math.max(1, ...subjects.map(x => x.pomodoroCount));
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span className={`text-xs font-bold w-12 shrink-0 ${c.text}`}>{s.short_name}</span>
                <div className="flex-1 bg-white/[0.04] rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full progress-gradient transition-all duration-700" style={{ width: `${Math.round((s.pomodoroCount / max) * 100)}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-16 text-right">{s.pomodoroCount}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
