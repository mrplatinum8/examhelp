import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, AlertTriangle, PlaySquare, ChevronDown, ChevronUp, Layers, Trophy, Check, ArrowRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { SUBJECT_COLORS, daysUntil } from '../lib/helpers';

const BACKLOG_CODES = ['ADE', 'CD', 'WT', 'SE', 'DV', 'BMFA'];

export default function BacklogBusterView() {
  const { subjects, onToggleTopic, exams } = useData();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  // Filter for the 6 target backlog subjects or any active university subjects
  const backlogSubjects = subjects.filter((s) => BACKLOG_CODES.includes(s.short_name));
  const activeBacklogs = backlogSubjects.filter((s) => !s.completed);
  const clearedBacklogs = backlogSubjects.filter((s) => s.completed);

  // Overall statistics
  const totalTopics = backlogSubjects.reduce((acc, s) => acc + (s.topics?.length || 0), 0);
  const clearedTopics = backlogSubjects.reduce(
    (acc, s) => acc + (s.topics?.filter((t) => t.done).length || 0),
    0
  );
  const overallPercent = totalTopics ? Math.round((clearedTopics / totalTopics) * 100) : 0;

  const handleLaunchBlitz = (subjectId) => {
    navigate('/pomodoro', { state: { presetMinutes: 45, presetName: 'Backlog Blitz (45m)', subjectId } });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
              LIFE OS PRIME ACCELERATOR
            </span>
            <span className="text-xs font-mono text-gray-500">6 University Subjects</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>📚 Backlog Buster (6 Subjects)</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Zero-excuses syllabus destruction engine for ADE, CD, WT, SE, DV, and BMFA.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/pomodoro', { state: { presetMinutes: 45, presetName: 'Backlog Blitz (45m)' } })}
          className="btn-gradient text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-violet-500/20"
        >
          <PlaySquare className="w-4 h-4" /> Launch Backlog Blitz (45m)
        </button>
      </div>

      {/* High-Level Clearance Telemetry HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-transparent">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Remaining Backlogs</p>
          <p className="text-3xl font-black text-rose-400 mt-1 font-mono">{activeBacklogs.length} <span className="text-sm font-normal text-gray-500">/ 6</span></p>
        </div>

        <div className="glass rounded-2xl p-4 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cleared / Passed</p>
          <p className="text-3xl font-black text-emerald-400 mt-1 font-mono">{clearedBacklogs.length} <span className="text-sm font-normal text-gray-500">/ 6</span></p>
        </div>

        <div className="glass rounded-2xl p-4 border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Topics Mastered</p>
          <p className="text-3xl font-black text-violet-400 mt-1 font-mono">{clearedTopics} <span className="text-sm font-normal text-gray-500">/ {totalTopics}</span></p>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-transparent">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Clearance Velocity</p>
          <p className="text-3xl font-black text-cyan-400 mt-1 font-mono">{overallPercent}%</p>
        </div>
      </div>

      {/* 6 Subjects Detailed Checklist Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" /> Syllabus Master Checklists
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {backlogSubjects.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const c = SUBJECT_COLORS[sub.color] || SUBJECT_COLORS.blue;
            const exam = exams.find((e) => e.subject_id === sub.id);
            const daysLeft = exam ? daysUntil(exam.exam_date) : null;
            const topicsDone = sub.topics?.filter((t) => t.done).length || 0;
            const topicsTotal = sub.topics?.length || 0;
            const pct = topicsTotal ? Math.round((topicsDone / topicsTotal) * 100) : 0;

            return (
              <div
                key={sub.id}
                className={`glass rounded-2xl p-5 border transition-all ${
                  sub.completed
                    ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                    : 'border-white/10 hover:border-violet-500/30'
                }`}
              >
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black text-white ${c.bg}`}>
                      {sub.short_name}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">{sub.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        {exam?.exam_date ? `Exam: ${exam.exam_date}` : 'Upcoming clearance sprint'}
                      </p>
                    </div>
                  </div>

                  {daysLeft !== null && !sub.completed && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        daysLeft <= 14
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                          : 'bg-white/[0.05] text-gray-400'
                      }`}
                    >
                      {daysLeft}d left
                    </span>
                  )}
                  {sub.completed && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      PASSED
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-400">{topicsDone}/{topicsTotal} Topics Cleared</span>
                    <span className={`font-bold ${sub.completed ? 'text-emerald-400' : 'text-violet-400'}`}>{pct}%</span>
                  </div>
                  <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${
                        sub.completed ? 'bg-emerald-500' : 'progress-gradient'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Granular Topics Checklist */}
                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                  {(isExpanded ? sub.topics : sub.topics?.slice(0, 3))?.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => onToggleTopic(topic.id, topic.done)}
                      className="flex items-center gap-2.5 cursor-pointer group py-1"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          topic.done
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-white/20 group-hover:border-violet-400'
                        }`}
                      >
                        {topic.done && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-xs flex-1 transition-colors ${
                          topic.done ? 'line-through text-gray-500' : 'text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {topic.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Expand & Launch Blitz controls */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  {sub.topics && sub.topics.length > 3 ? (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                      className="text-gray-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      {isExpanded ? (
                        <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>+{sub.topics.length - 3} more topics <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  ) : <div />}

                  <button
                    onClick={() => handleLaunchBlitz(sub.id)}
                    className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 bg-violet-500/10 hover:bg-violet-500/20 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Blitz 45m <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
