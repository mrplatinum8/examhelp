import React, { useState } from 'react';
import { CheckCircle, CalendarIcon, ChevronDown, ChevronUp, Clock, Layers } from 'lucide-react';
import { SUBJECT_COLORS, daysUntil } from '../lib/helpers';

export default function SubjectsView({ subjects, cards, onToggleTopic }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-3xl font-black mb-1"><span className="gradient-text">Subjects</span></h1>
      <p className="text-gray-600 text-sm mb-6">Track progress per subject and manage your topics checklist.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {subjects.map(sub => {
          const c = SUBJECT_COLORS[sub.color] || SUBJECT_COLORS.blue;
          const isExpanded = expandedId === sub.id;
          const cardCount = cards.filter(cd => cd.subject_id === sub.id).length;
          const days = daysUntil(sub.exam_date);
          const doneCount = sub.topics?.filter(t => t.done).length || 0;

          return (
            <div key={sub.id} className={`glass card-hover rounded-2xl transition-all duration-300 overflow-hidden ${isExpanded ? 'col-span-1 md:col-span-2 xl:col-span-3' : ''}`}
              style={{ border: `1px solid ${isExpanded ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
              <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : sub.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-black text-white ${c.bg}`}>{sub.short_name}</span>
                      {sub.exam_date && (
                        <span className={`text-xs font-semibold flex items-center gap-1 ${days !== null && days <= 7 ? 'text-red-400' : 'text-gray-600'}`}>
                          <CalendarIcon className="w-3 h-3" />
                          {days !== null && days >= 0 ? `${days}d` : 'passed'}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-[15px] leading-snug">{sub.name}</h3>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{sub.pomodoroCount} sessions</span>
                      <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{cardCount} cards</span>
                    </div>
                  </div>

                  {/* Progress Ring */}
                  <div className="relative w-14 h-14 shrink-0">
                    <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                      <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
                      <circle cx="28" cy="28" r="22" stroke="url(#subGrad)" strokeWidth="4" fill="transparent"
                        strokeDasharray="138.2" strokeDashoffset={138.2 - (138.2 * sub.progress) / 100}
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                      <defs>
                        <linearGradient id="subGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white">{sub.progress}%</span>
                  </div>
                </div>

                {/* Mini bar */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full progress-gradient transition-all duration-700" style={{ width: `${sub.progress}%` }} />
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-violet-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />}
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="border-t border-white/[0.05] p-5 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Topics Checklist</h4>
                    <div className="space-y-2.5">
                      {sub.topics?.map(topic => (
                        <div key={topic.id} className="flex items-center gap-3 cursor-pointer group" onClick={e => { e.stopPropagation(); onToggleTopic(topic.id, topic.done); }}>
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-200 ${topic.done ? 'btn-gradient border-transparent' : 'border-white/10 group-hover:border-violet-500/50'}`}>
                            {topic.done && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm transition-colors ${topic.done ? 'text-gray-700 line-through' : 'text-gray-300 group-hover:text-white'}`}>{topic.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Stats</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: <Clock className="w-5 h-5" />, val: sub.pomodoroCount, label: 'Pomodoros' },
                        { icon: <Layers className="w-5 h-5" />, val: cardCount, label: 'Flashcards' },
                      ].map((s, i) => (
                        <div key={i} className="rounded-xl p-4 text-center" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}>
                          <div className="text-violet-400 flex justify-center mb-2">{s.icon}</div>
                          <p className="text-2xl font-black text-white mb-0.5">{s.val}</p>
                          <p className="text-xs text-gray-600">{s.label}</p>
                        </div>
                      ))}
                      <div className="col-span-2 rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p className="text-xs text-gray-600 mb-1">Topics Complete</p>
                        <p className="text-xl font-black text-white">{doneCount}<span className="text-gray-700 font-light"> / {sub.topics?.length || 0}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
