import React, { useState } from 'react';
import { Plus, X, Trash2, Edit3, MapPin, Clock, FileText, GraduationCap } from 'lucide-react';
import { SUBJECT_COLORS, daysUntil, formatTime12 } from '../lib/helpers';
import { useData } from '../contexts/DataContext';


export default function ExamTimetableView() {
  const { subjects, exams, onAddExam, onUpdateExam, onDeleteExam } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editExam, setEditExam] = useState(null);

  // Form state
  const [formSubject, setFormSubject] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const sorted = [...(exams || [])]
    .map(e => ({ ...e, _days: daysUntil(e.exam_date) }))
    .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));

  const openAdd = () => {
    setEditExam(null);
    setFormSubject(subjects[0]?.id || '');
    setFormDate('');
    setFormStart('');
    setFormEnd('');
    setFormVenue('');
    setFormNotes('');
    setShowModal(true);
  };

  const openEdit = (exam) => {
    setEditExam(exam);
    setFormSubject(exam.subject_id);
    setFormDate(exam.exam_date);
    setFormStart(exam.start_time || '');
    setFormEnd(exam.end_time || '');
    setFormVenue(exam.venue || '');
    setFormNotes(exam.notes || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formSubject || !formDate) return;
    setSaving(true);
    const data = {
      subject_id: formSubject,
      exam_date: formDate,
      start_time: formStart || null,
      end_time: formEnd || null,
      venue: formVenue.trim() || null,
      notes: formNotes.trim() || null,
    };
    if (editExam) {
      await onUpdateExam(editExam.id, data);
    } else {
      await onAddExam(data);
    }
    setSaving(false);
    setShowModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            <span className="gradient-text">Exam</span> <span className="text-white">Timetable</span>
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1.5">
            All your exam dates, times, and venues in one place.
          </p>
        </div>
        <button onClick={openAdd}
          className="btn-gradient text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add Exam
        </button>
      </div>

      {/* Empty State */}
      {sorted.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <GraduationCap className="w-8 h-8 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No exams added yet.</p>
          <button onClick={openAdd} className="text-violet-400 text-xs font-bold mt-2 hover:text-violet-300">+ Add your first exam</button>
        </div>
      )}

      {/* Exam Cards */}
      <div className="space-y-4">
        {sorted.map(exam => {
          const sub = subjects.find(s => s.id === exam.subject_id);
          const c = SUBJECT_COLORS[sub?.color] || SUBJECT_COLORS.blue;
          const days = exam._days;
          const isPast = days !== null && days < -1;
          const urgency = isPast ? 'past' : days <= 7 ? 'critical' : days <= 29 ? 'warning' : 'safe';
          const urgencyColor = urgency === 'past' ? 'text-gray-600' : urgency === 'critical' ? 'text-red-400' : urgency === 'warning' ? 'text-amber-400' : 'text-emerald-400';
          const urgencyBg = urgency === 'past' ? 'rgba(255,255,255,0.02)' : urgency === 'critical' ? 'rgba(239,68,68,0.06)' : urgency === 'warning' ? 'rgba(245,158,11,0.04)' : 'rgba(16,185,129,0.04)';
          const urgencyBorder = urgency === 'past' ? '1px solid rgba(255,255,255,0.05)' : urgency === 'critical' ? '1px solid rgba(239,68,68,0.2)' : urgency === 'warning' ? '1px solid rgba(245,158,11,0.15)' : '1px solid rgba(255,255,255,0.06)';

          return (
            <div key={exam.id}
              className={`rounded-2xl px-5 py-5 group transition-all ${isPast ? 'opacity-50' : ''} ${urgency === 'critical' ? 'animate-pulse' : ''}`}
              style={{ background: urgencyBg, border: urgencyBorder, boxShadow: urgency === 'critical' ? '0 0 20px rgba(239,68,68,0.1)' : 'none' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Subject */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                    <h3 className={`text-base font-black ${c.text}`}>{sub?.short_name || 'Unknown'}</h3>
                    <span className="text-gray-600 text-xs truncate">{sub?.name}</span>
                  </div>

                  {/* Date */}
                  <p className="text-sm font-bold text-white mb-1.5">
                    {new Date(exam.exam_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>

                  {/* Details row */}
                  <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
                    {(exam.start_time || exam.end_time) && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime12(exam.start_time)} – {formatTime12(exam.end_time)}</span>
                    )}
                    {exam.venue && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{exam.venue}</span>
                    )}
                    {exam.notes && (
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{exam.notes}</span>
                    )}
                  </div>
                </div>

                {/* Countdown + Actions */}
                <div className="text-right shrink-0">
                  {!isPast && days !== null && (
                    <>
                      {days === -1 ? (
                        <p className={`text-xl font-black mt-2 ${urgencyColor}`}>Today</p>
                      ) : (
                        <>
                          <p className={`text-3xl font-black ${urgencyColor}`}>{days}</p>
                          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">days left</p>
                        </>
                      )}
                    </>
                  )}
                  {isPast && <p className="text-xs text-gray-600 font-bold">Completed</p>}

                  <div className="flex gap-1 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(exam)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-white transition-colors">
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button onClick={() => { if (window.confirm('Delete this exam?')) onDeleteExam(exam.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)' }}>
          <div className="glass rounded-3xl p-6 w-full max-w-md relative" style={{ border: '1px solid rgba(139,92,246,0.15)' }}>
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-600 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">{editExam ? 'Edit Exam' : 'Add Exam'}</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Subject</label>
                <select value={formSubject} onChange={e => setFormSubject(e.target.value)}
                  className="w-full px-4 py-3 text-white text-sm rounded-xl outline-none appearance-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <option value="">{subjects.length === 0 ? 'No subjects created' : 'Select subject'}</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.short_name} — {s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Exam Date</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                  className="w-full px-4 py-3 text-white text-sm rounded-xl outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Start Time</label>
                  <input type="time" value={formStart} onChange={e => setFormStart(e.target.value)}
                    className="w-full px-4 py-3 text-white text-sm rounded-xl outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">End Time</label>
                  <input type="time" value={formEnd} onChange={e => setFormEnd(e.target.value)}
                    className="w-full px-4 py-3 text-white text-sm rounded-xl outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Venue</label>
                <input value={formVenue} onChange={e => setFormVenue(e.target.value)}
                  placeholder="e.g. Hall A, Room 201"
                  className="w-full px-4 py-3 text-white placeholder-gray-700 text-sm rounded-xl outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Notes</label>
                <input value={formNotes} onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Bring calculator, 3hr paper"
                  className="w-full px-4 py-3 text-white placeholder-gray-700 text-sm rounded-xl outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>

              <button onClick={handleSave} disabled={saving || !formSubject || !formDate}
                className="w-full btn-gradient disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all">
                {saving ? 'Saving…' : editExam ? 'Update Exam' : 'Add Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
