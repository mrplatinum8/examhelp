import React, { useState, useMemo } from 'react';
import { CheckCircle, CalendarIcon, ChevronDown, ChevronUp, Clock, Layers, Plus, Trash2, X } from 'lucide-react';
import { SUBJECT_COLORS, daysUntil, getEarliestExamDate } from '../lib/helpers';
import { useData } from '../contexts/DataContext';

export default function SubjectsView() {
  const { subjects, cards, exams, onToggleTopic, onAddSubject, onDeleteSubject, onAddTopic, onDeleteTopic } = useData();
  const [expandedId, setExpandedId] = useState(null);
  const [topicInput, setTopicInput] = useState({});
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const [newColor, setNewColor] = useState('blue');
  const [loading, setLoading] = useState(false);

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => {
      const dateA = getEarliestExamDate(a.id, exams);
      const dateB = getEarliestExamDate(b.id, exams);
      let daysA = daysUntil(dateA);
      let daysB = daysUntil(dateB);

      if (daysA === null) daysA = Infinity;
      if (daysB === null) daysB = Infinity;

      if (daysA !== daysB) {
        return daysA - daysB;
      }
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [subjects, exams]);

  const handleAdd = async () => {
    if (!newName.trim() || !newShortName.trim()) return;
    setLoading(true);
    await onAddSubject({ name: newName, short_name: newShortName, color: newColor });
    setLoading(false);
    setShowAddForm(false);
    setNewName('');
    setNewShortName('');
    setNewColor('blue');
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this subject? All associated data will be deleted. This cannot be undone.')) {
      await onDeleteSubject(id);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black mb-1"><span className="gradient-text">Subjects</span></h1>
          <p className="text-gray-600 text-sm">Track progress per subject and manage your topics checklist.</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="flex items-center justify-center gap-2 btn-gradient px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-violet-500/20 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {subjects.length === 0 && (
        <div className="col-span-full border border-dashed border-gray-600/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <Layers className="w-12 h-12 text-gray-500 mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">No subjects yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-4">You haven't added any subjects to your study plan. Add your first subject to get started.</p>
          <button onClick={() => setShowAddForm(true)} className="btn-gradient px-6 py-2 rounded-xl text-white font-bold text-sm shadow-lg">
            Add Subject
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Layers className="w-5 h-5 text-violet-400" /> New Subject</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-white transition-colors p-1" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
                        <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subject Name</label>
                <input type="text" placeholder="e.g. Software Engineering" value={newName} onChange={e => setNewName(e.target.value)} autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Short Name</label>
                  <input type="text" placeholder="e.g. SE" value={newShortName} onChange={e => setNewShortName(e.target.value)} maxLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Color</label>
                  <select value={newColor} onChange={e => setNewColor(e.target.value)} 
                    className="w-full text-white text-sm px-4 py-2.5 rounded-xl outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {Object.keys(SUBJECT_COLORS).map(color => (
                        <option key={color} value={color} style={{ background: '#0f0f2a' }}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button onClick={handleAdd} disabled={loading || !newName.trim() || !newShortName.trim()}
                className="w-full mt-2 btn-gradient py-3 rounded-xl text-white font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Subject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sortedSubjects.map(sub => {
          const c = SUBJECT_COLORS[sub.color] || SUBJECT_COLORS.blue;
          const isExpanded = expandedId === sub.id;
          const cardCount = cards.filter(cd => cd.subject_id === sub.id).length;
          const examDate = getEarliestExamDate(sub.id, exams);
          const days = daysUntil(examDate);
          const doneCount = sub.topics?.filter(t => t.done).length || 0;

          return (
            <div key={sub.id} className={`glass card-hover rounded-2xl transition-all duration-300 overflow-hidden ${isExpanded ? 'col-span-1 md:col-span-2 xl:col-span-3' : ''}`}
              style={{ border: `1px solid ${isExpanded ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
              <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : sub.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-black text-white ${c.bg}`}>{sub.short_name}</span>
                      {examDate && (
                        <span className={`text-xs font-semibold flex items-center gap-1 ${days !== null && days <= 7 && days >= -1 ? 'text-red-400' : 'text-gray-600'}`}>
                          <CalendarIcon className="w-3 h-3" />
                          {days !== null && days >= -1 ? (days === -1 ? 'Today' : `${days}d`) : 'passed'}
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
                      <circle cx="28" cy="28" r="22" stroke={`url(#subGrad-${sub.id})`} strokeWidth="4" fill="transparent"
                        strokeDasharray="138.2" strokeDashoffset={138.2 - (138.2 * sub.progress) / 100}
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                      <defs>
                        <linearGradient id={`subGrad-${sub.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
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
                <div className="border-t border-white/5 p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-in slide-in-from-top-2 duration-200">
                  <div className="min-w-0 overflow-hidden">
                    <h4 className="text-[10px] md:text-xs font-bold text-gray-600 uppercase tracking-widest mb-3 md:mb-4">Topics Checklist</h4>
                    <div className="space-y-2.5">
                      {sub.topics?.map(topic => (
                        <div key={topic.id} className="flex items-start gap-2 md:gap-3 cursor-pointer group" onClick={e => { e.stopPropagation(); onToggleTopic(topic.id, topic.done); }}>
                          <div className={`mt-0.5 w-4 h-4 md:w-5 md:h-5 rounded-md md:rounded-lg border flex items-center justify-center shrink-0 transition-all duration-200 ${topic.done ? 'btn-gradient border-transparent' : 'border-white/10 group-hover:border-violet-500/50'}`}>
                            {topic.done && <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />}
                          </div>
                          <span className={`text-xs md:text-sm flex-1 leading-snug transition-colors ${topic.done ? 'text-gray-700 line-through' : 'text-gray-300 group-hover:text-white'}`}>{topic.label}</span>
                          <button onClick={(e) => { e.stopPropagation(); onDeleteTopic(topic.id); }} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 p-1" aria-label="Delete Topic"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5" onClick={e => e.stopPropagation()}>
                        <input type="text" placeholder="Add a new topic..." value={topicInput[sub.id] || ''} 
                          onChange={e => setTopicInput({...topicInput, [sub.id]: e.target.value})}
                          onKeyDown={async e => {
                             if (e.key === 'Enter' && topicInput[sub.id]?.trim()) {
                               await onAddTopic(sub.id, topicInput[sub.id].trim());
                               setTopicInput({...topicInput, [sub.id]: ''});
                             }
                          }}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
                        />
                        <button onClick={async () => {
                           if (topicInput[sub.id]?.trim()) {
                             await onAddTopic(sub.id, topicInput[sub.id].trim());
                             setTopicInput({...topicInput, [sub.id]: ''});
                           }
                        }} className="btn-gradient text-white p-1.5 rounded-lg shadow disabled:opacity-50" disabled={!topicInput[sub.id]?.trim()}>
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] md:text-xs font-bold text-gray-600 uppercase tracking-widest mb-3 md:mb-4 mt-2 md:mt-0">Stats</h4>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      {[
                        { icon: <Clock className="w-4 h-4 md:w-5 md:h-5" />, val: sub.pomodoroCount, label: 'Pomodoros' },
                        { icon: <Layers className="w-4 h-4 md:w-5 md:h-5" />, val: cardCount, label: 'Flashcards' },
                      ].map((s, i) => (
                        <div key={i} className="rounded-xl p-3 md:p-4 text-center" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}>
                          <div className="text-violet-400 flex justify-center mb-1.5 md:mb-2">{s.icon}</div>
                          <p className="text-xl md:text-2xl font-black text-white mb-0.5">{s.val}</p>
                          <p className="text-[10px] md:text-xs text-gray-600">{s.label}</p>
                        </div>
                      ))}
                      <div className="col-span-2 rounded-xl p-3 md:p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p className="text-[10px] md:text-xs text-gray-600 mb-1">Topics Complete</p>
                        <p className="text-lg md:text-xl font-black text-white">{doneCount}<span className="text-gray-700 font-light"> / {sub.topics?.length || 0}</span></p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/[0.05] flex justify-end">
                      <button onClick={(e) => handleDelete(sub.id, e)} className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete Subject
                      </button>
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
