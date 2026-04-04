import React, { useState, useMemo } from 'react';
import { Plus, X, Trash2, Edit3, Clock } from 'lucide-react';
import { SUBJECT_COLORS, formatTime12, getSubjectHex } from '../lib/helpers';
import { useData } from '../contexts/DataContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


export default function DailyScheduleView() {
  const { subjects, schedule, onAddSlot, onUpdateSlot, onDeleteSlot } = useData();
  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(today);
  const [showModal, setShowModal] = useState(false);
  const [editSlot, setEditSlot] = useState(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formStart, setFormStart] = useState('09:00');
  const [formEnd, setFormEnd] = useState('10:00');
  const [formSubject, setFormSubject] = useState('');
  const [formColor, setFormColor] = useState('violet');
  const [saving, setSaving] = useState(false);

  const daySlots = useMemo(() => {
    return (schedule || [])
      .filter(s => s.day_of_week === selectedDay)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [schedule, selectedDay]);

  const openAdd = () => {
    setEditSlot(null);
    setFormTitle('');
    setFormStart('09:00');
    setFormEnd('10:00');
    setFormSubject('');
    setFormColor('violet');
    setShowModal(true);
  };

  const openEdit = (slot) => {
    setEditSlot(slot);
    setFormTitle(slot.title);
    setFormStart(slot.start_time);
    setFormEnd(slot.end_time);
    setFormSubject(slot.subject_id || '');
    setFormColor(slot.color || 'violet');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formStart || !formEnd) return;
    setSaving(true);
    const data = {
      day_of_week: selectedDay,
      title: formTitle.trim(),
      start_time: formStart,
      end_time: formEnd,
      subject_id: formSubject || null,
      color: formColor,
    };
    if (editSlot) {
      await onUpdateSlot(editSlot.id, data);
    } else {
      await onAddSlot(data);
    }
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this time slot?')) return;
    await onDeleteSlot(id);
  };

  // When a subject is picked, auto-fill the color
  const handleSubjectChange = (subId) => {
    setFormSubject(subId);
    if (subId) {
      const sub = subjects.find(s => s.id === subId);
      if (sub) setFormColor(sub.color);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            <span className="gradient-text">Daily</span> <span className="text-white">Schedule</span>
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1.5">
            Your recurring weekly timetable. Tap a day to view slots.
          </p>
        </div>
        <button onClick={openAdd}
          className="btn-gradient text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add Slot
        </button>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar">
        {DAYS.map((day, i) => (
          <button key={i} onClick={() => setSelectedDay(i)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedDay === i
                ? 'btn-gradient text-white'
                : i === today
                  ? 'text-violet-400 bg-violet-500/10 border border-violet-500/20'
                  : 'text-gray-500 hover:text-white'
            }`}
            style={selectedDay !== i ? { background: 'rgba(255,255,255,0.03)' } : {}}>
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{SHORT_DAYS[i]}</span>
            {i === today && selectedDay !== i && <span className="ml-1 text-[8px] opacity-60">today</span>}
          </button>
        ))}
      </div>

      {/* Day Label */}
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
        {DAYS[selectedDay]}{selectedDay === today ? ' — Today' : ''}
      </p>

      {/* Slots */}
      {daySlots.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <Clock className="w-8 h-8 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No slots for {DAYS[selectedDay]}.</p>
          <button onClick={openAdd} className="text-violet-400 text-xs font-bold mt-2 hover:text-violet-300">+ Add one</button>
        </div>
      )}

      <div className="space-y-3">
        {daySlots.map(slot => {
          const sub = subjects.find(s => s.id === slot.subject_id);
          const c = SUBJECT_COLORS[slot.color] || SUBJECT_COLORS[sub?.color] || SUBJECT_COLORS.violet || SUBJECT_COLORS.blue;
          return (
            <div key={slot.id}
              className="glass rounded-2xl px-5 py-4 flex items-center gap-4 group hover:border-violet-500/20 transition-all"
              style={{ borderLeft: '4px solid', borderLeftColor: getSubjectHex(slot.color || sub?.color) }}>
              {/* Time */}
              <div className="shrink-0 text-center min-w-[70px]">
                <p className="text-xs font-bold text-white">{formatTime12(slot.start_time)}</p>
                <p className="text-[10px] text-gray-600">to</p>
                <p className="text-xs font-bold text-gray-400">{formatTime12(slot.end_time)}</p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{slot.title}</p>
                {sub && <p className={`text-[10px] font-bold ${c.text}`}>{sub.short_name} — {sub.name}</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(slot)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-600 hover:text-white transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(slot.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
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
            <h3 className="text-lg font-bold text-white mb-4">{editSlot ? 'Edit Slot' : 'Add Slot'}</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Title</label>
                <input value={formTitle} onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. ODE Class, Study Session"
                  className="w-full px-4 py-3 text-white placeholder-gray-700 text-sm rounded-xl outline-none"
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
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Subject (optional)</label>
                <select value={formSubject} onChange={e => handleSubjectChange(e.target.value)}
                  className="w-full px-4 py-3 text-white text-sm rounded-xl outline-none appearance-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <option value="">None</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.short_name} — {s.name}</option>)}
                </select>
              </div>

              <button onClick={handleSave} disabled={saving || !formTitle.trim()}
                className="w-full btn-gradient disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all">
                {saving ? 'Saving…' : editSlot ? 'Update Slot' : 'Add Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
