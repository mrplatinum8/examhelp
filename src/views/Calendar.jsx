import React, { useState } from 'react';
import { X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { SUBJECT_COLORS } from '../lib/helpers';
import { useData } from '../contexts/DataContext';

export default function CalendarView() {
  const { subjects, sessions, studyLogs, onAddStudyLog, onUpdateExamDate } = useData();
  const realToday = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modal, setModal] = useState(null);
  const [modalTab, setModalTab] = useState('session');
  const [selSubject, setSelSubject] = useState('');
  const [duration, setDuration] = useState(60);
  const [saving, setSaving] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const pad = n => String(n).padStart(2, '0');

  const studiedDates = new Set([...sessions.map(s => s.started_at?.split('T')[0]), ...studyLogs.map(l => l.date)]);
  const examMap = {};
  subjects.forEach(s => { if (s.exam_date) examMap[s.exam_date] = s; });

  const openModal = (d) => {
    setModal({ day: d, dateStr: `${year}-${pad(month + 1)}-${pad(d)}` });
    setModalTab('session'); setSelSubject(subjects[0]?.id || ''); setDuration(60);
  };
  const handleSave = async () => {
    if (!selSubject) return;
    setSaving(true);
    if (modalTab === 'session') await onAddStudyLog(selSubject, modal.dateStr, duration);
    else await onUpdateExamDate(selSubject, modal.dateStr);
    setSaving(false); setModal(null);
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-3 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl font-black w-40 sm:w-48"><span className="gradient-text">{currentDate.toLocaleDateString('en-US', { month: 'long' })}</span> <span className="text-white">{year}</span></h1>
            <div className="flex gap-1">
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 sm:p-1.5 rounded-lg glass hover:bg-white/10 transition-colors text-white"><ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /></button>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 sm:p-1.5 rounded-lg glass hover:bg-white/10 transition-colors text-white"><ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /></button>
            </div>
          </div>
          <p className="text-gray-600 text-[10px] sm:text-sm mt-1 sm:mt-1.5">Click any day to log a session or set an exam date.</p>
        </div>
        <div className="flex gap-4 text-xs text-gray-500 font-semibold">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-500" /> Exam</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Studied</span>
        </div>
      </div>

      <div className="glass rounded-2xl sm:rounded-3xl p-3 sm:p-6 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2 sm:mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[9px] sm:text-[11px] font-bold text-gray-700 py-1 sm:py-2 tracking-widest uppercase">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`b${i}`} className="aspect-square" />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
            const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
            const exam = examMap[dateStr];
            const studied = studiedDates.has(dateStr);
            const isToday = year === realToday.getFullYear() && month === realToday.getMonth() && d === realToday.getDate();
            const ec = exam ? SUBJECT_COLORS[exam.color] : null;

            return (
              <div key={d} onClick={() => openModal(d)}
                className="aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-95 relative"
                style={{
                  background: isToday ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.15))' : studied ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
                  border: isToday ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.04)',
                  boxShadow: isToday ? '0 0 15px rgba(124,58,237,0.2)' : 'none',
                }}>
                <span className={`text-[10px] sm:text-sm font-bold ${isToday ? 'text-violet-300' : 'text-gray-400'}`}>{d}</span>
                <div className="flex gap-0.5 sm:gap-1 mt-px sm:mt-0.5">
                  {studied && <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400" />}
                  {exam && <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${ec?.bg || 'bg-violet-500'}`} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exam Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {subjects.filter(s => s.exam_date).map(s => {
          const c = SUBJECT_COLORS[s.color] || SUBJECT_COLORS.blue;
          return (
            <div key={s.id} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className={`w-2 h-2 rounded-full ${c.bg}`} /> {s.short_name}: {new Date(s.exam_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl w-full max-w-sm p-6 shadow-2xl" style={{ background: 'rgba(15,15,40,0.95)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-white font-bold">{new Date(modal.dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</h3>
                <p className="text-gray-600 text-xs mt-0.5">What do you want to record?</p>
              </div>
              <button onClick={() => setModal(null)}><X className="text-gray-600 hover:text-white w-5 h-5" /></button>
            </div>
            <div className="flex gap-2 mb-5">
              {[['session', '📚 Log Session'], ['exam', '📌 Set Exam']].map(([val, label]) => (
                <button key={val} onClick={() => setModalTab(val)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${modalTab === val ? 'btn-gradient text-white' : 'text-gray-500 hover:text-white'}`}
                  style={modalTab !== val ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } : {}}>{label}</button>
              ))}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 font-bold uppercase mb-1.5 block">Subject</label>
                <select value={selSubject} onChange={e => setSelSubject(e.target.value)}
                  className="w-full text-white text-sm p-2.5 rounded-xl outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {subjects.map(s => <option key={s.id} value={s.id} style={{ background: '#0f0f2a' }}>{s.name}</option>)}
                </select>
              </div>
              {modalTab === 'session' && (
                <div>
                  <label className="text-xs text-gray-600 font-bold uppercase mb-1.5 block">Duration (minutes)</label>
                  <input type="number" min="5" max="480" value={duration} onChange={e => setDuration(Number(e.target.value))}
                    className="w-full text-white text-sm p-2.5 rounded-xl outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
              )}
            </div>
            <button onClick={handleSave} disabled={saving || !selSubject}
              className="mt-5 w-full btn-gradient disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" />{modalTab === 'session' ? 'Log Session' : 'Set Exam Date'}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
