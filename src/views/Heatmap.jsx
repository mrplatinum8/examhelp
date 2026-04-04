import React from 'react';
import { useData } from '../contexts/DataContext';

const getHeatClass = (n) => {
  if (!n) return 'heatmap-0';
  if (n <= 2) return 'heatmap-1';
  if (n <= 5) return 'heatmap-2';
  return 'heatmap-3';
};

export default function HeatmapView() {
  const { heatmapData } = useData();
  const today = new Date();
  const WEEKS = 15;
  const TOTAL = WEEKS * 7;

  const dates = Array.from({ length: TOTAL }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (TOTAL - 1 - i));
    return d.toISOString().split('T')[0];
  });

  const totalSessions = dates.reduce((a, d) => a + (heatmapData[d] || 0), 0);
  const activeDays = dates.filter(d => (heatmapData[d] || 0) > 0).length;
  const maxDay = Math.max(0, ...dates.map(d => heatmapData[d] || 0));

  const monthLabels = [];
  for (let w = 0; w < WEEKS; w++) {
    const d = new Date(dates[w * 7]);
    const mn = d.toLocaleDateString('en-US', { month: 'short' });
    const prev = w > 0 ? new Date(dates[(w - 1) * 7]).toLocaleDateString('en-US', { month: 'short' }) : '';
    monthLabels.push(mn !== prev ? mn : '');
  }

  return (
    <div className="animate-in fade-in duration-300 max-w-5xl mx-auto">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black"><span className="gradient-text">Study Heatmap</span></h1>
          <p className="text-gray-600 text-sm mt-1">{WEEKS}-week activity grid — every dot is a session.</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: 'Total Sessions', value: totalSessions, color: 'gradient-text' },
            { label: 'Active Days', value: activeDays, color: 'text-emerald-400' },
            { label: 'Best Day', value: maxDay, color: 'text-violet-400' },
          ].map((s, i) => (
            <div key={i} className="glass rounded-xl px-4 py-2.5 text-center" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-700 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl p-6 md:p-8 overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex gap-1 mb-1.5 ml-7">
            {monthLabels.map((m, i) => (
              <div key={i} className="w-4 text-[10px] text-gray-700 font-bold tracking-wide">{m}</div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="w-5 h-4 text-[10px] text-gray-700 font-bold flex items-center justify-end pr-1">
                  {i % 2 === 1 ? d : ''}
                </div>
              ))}
            </div>

            {/* Grid */}
            {Array.from({ length: WEEKS }).map((_, w) => (
              <div key={w} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dow) => {
                  const idx = w * 7 + dow;
                  if (idx >= TOTAL) return null;
                  const d = dates[idx];
                  const count = heatmapData[d] || 0;
                  const isToday = d === today.toISOString().split('T')[0];
                  const label = new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <div key={dow} title={`${label}: ${count} session${count !== 1 ? 's' : ''}`}
                      className={`w-4 h-4 rounded-sm border cursor-help transition-all hover:scale-125 hover:z-10 ${getHeatClass(count)} ${isToday ? 'ring-2 ring-violet-400 ring-offset-1 ring-offset-[#07071a]' : ''}`} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-6 text-xs text-gray-700 font-semibold">
          <span>Less</span>
          {['heatmap-0', 'heatmap-1', 'heatmap-2', 'heatmap-3'].map((cls, i) => (
            <div key={i} className={`w-3.5 h-3.5 rounded-sm border ${cls}`} />
          ))}
          <span>More</span>
          <span className="ml-4 text-gray-800">· Ring = today</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-700">
        {[['No sessions', 'heatmap-0'], ['1–2 sessions', 'heatmap-1'], ['3–5 sessions', 'heatmap-2'], ['6+ sessions', 'heatmap-3']].map(([label, cls]) => (
          <span key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm border ${cls}`} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}
