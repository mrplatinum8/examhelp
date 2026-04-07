import React, { useMemo } from 'react';
import { CalendarCheck, BookOpen, AlertTriangle } from 'lucide-react';
import { SUBJECT_COLORS, daysUntil, getSubjectHex, getEarliestExamDate } from '../lib/helpers';
import { useData } from '../contexts/DataContext';

export default function RevisionScheduleView() {
  const { subjects, exams } = useData();
  const schedule = useMemo(() => {
    const today = new Date(new Date().toDateString());
    
    // Collect subjects with exam dates (from exam_timetable) and unchecked topics
    const examSubjects = subjects
      .map(s => {
        const examDate = getEarliestExamDate(s.id, exams);
        if (!examDate) return null;
        const dl = daysUntil(examDate) + 1; // Map back to actual calendar days available for scheduling
        if (dl <= 0) return null;
        const unchecked = (s.topics || []).filter(t => !t.done);
        return { ...s, _examDate: examDate, unchecked, daysLeft: dl };
      })
      .filter(s => s && s.unchecked.length > 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    if (examSubjects.length === 0) return [];

    // Find the last exam date to determine schedule range
    const maxDays = Math.max(...examSubjects.map(s => s.daysLeft));
    const totalDays = Math.min(maxDays, 60); // cap at 60 days

    // Build day-by-day plan
    const plan = [];
    // For each subject, distribute unchecked topics evenly across remaining days before its exam
    const topicQueues = {};
    examSubjects.forEach(s => {
      topicQueues[s.id] = [...s.unchecked];
    });

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      const dayItems = [];

      examSubjects.forEach(s => {
        if (d > s.daysLeft) return; // past this subject's exam
        const queue = topicQueues[s.id];
        if (!queue || queue.length === 0) return;

        const remainingDays = s.daysLeft - d + 1;
        const topicsPerDay = Math.ceil(queue.length / remainingDays);
        
        for (let t = 0; t < topicsPerDay && queue.length > 0; t++) {
          dayItems.push({
            subject: s,
            topic: queue.shift(),
          });
        }
      });

      if (dayItems.length > 0) {
        plan.push({ date: dateStr, dayLabel, items: dayItems, dayNumber: d });
      }
    }

    return plan;
  }, [subjects, exams]);

  const completedAll = subjects
    .filter(s => getEarliestExamDate(s.id, exams) && daysUntil(getEarliestExamDate(s.id, exams)) >= -1)
    .every(s => (s.topics || []).every(t => t.done));

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          <span className="gradient-text">Revision</span> <span className="text-white">Schedule</span>
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm mt-1.5">
          Auto-generated based on your exam dates and remaining topics.
        </p>
      </div>

      {completedAll && schedule.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-lg font-bold text-white mb-1">All topics covered!</h3>
          <p className="text-gray-500 text-sm">You've checked off every topic. Keep revising and stay confident!</p>
        </div>
      )}

      {!completedAll && schedule.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No exams scheduled</h3>
          <p className="text-gray-500 text-sm">Set exam dates on your subjects in the Calendar tab to generate a revision plan.</p>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {schedule.map((day, idx) => (
          <div key={day.date} className="relative">
            {/* Timeline line */}
            {idx < schedule.length - 1 && (
              <div className="absolute left-[19px] top-10 bottom-0 w-px bg-white/[0.06]" />
            )}

            <div className="flex gap-4">
              {/* Day marker */}
              <div className="shrink-0 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                  day.dayNumber <= 3 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  day.dayNumber <= 7 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' :
                  'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                }`}>
                  D{day.dayNumber}
                </div>
              </div>

              {/* Day content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 mb-2">{day.dayLabel}</p>
                <div className="space-y-2">
                  {day.items.map((item, i) => {
                    const c = SUBJECT_COLORS[item.subject.color] || SUBJECT_COLORS.blue;
                    return (
                      <div key={`${item.subject.id}-${i}`}
                        className="glass rounded-xl px-4 py-3 flex items-center gap-3 group hover:border-violet-500/20 transition-all"
                        style={{ borderLeft: `3px solid`, borderLeftColor: getSubjectHex(item.subject.color) }}>
                        <BookOpen className={`w-3.5 h-3.5 shrink-0 ${c.text}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{item.topic.label}</p>
                          <p className={`text-[10px] font-bold ${c.text}`}>{item.subject.short_name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
