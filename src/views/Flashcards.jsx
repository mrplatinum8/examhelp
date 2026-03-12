import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, X, Trash2, Sparkles } from 'lucide-react';
import { SUBJECT_COLORS } from '../lib/helpers';

export default function FlashcardsView({ subjects, cards, onAddCard, onRateCard, onDeleteCard }) {
  const [filterSub, setFilterSub] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newSub, setNewSub] = useState('');
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const filtered = useMemo(() => {
    let arr = filterSub === 'all' ? [...cards] : cards.filter(c => c.subject_id === filterSub);
    if (!showAll) arr = arr.filter(c => (c.next_review || today) <= today);
    return arr;
  }, [cards, filterSub, showAll, today]);

  const curCard = filtered[cardIdx % Math.max(filtered.length, 1)];
  const curSub = subjects.find(s => s.id === curCard?.subject_id);
  const c = SUBJECT_COLORS[curSub?.color] || SUBJECT_COLORS.blue;
  const dueCount = cards.filter(c => (c.next_review || today) <= today).length;

  const next = async (difficulty) => {
    if (!curCard) return;
    setIsFlipped(false);
    await onRateCard(curCard, difficulty);
    setTimeout(() => setCardIdx(p => p + 1), 350);
  };

  // Keyboard shortcuts: Space=flip, 1=Hard, 2=Medium, 3=Easy
  const handleKeyDown = useCallback((e) => {
    if (showAdd) return;
    if (e.code === 'Space') { e.preventDefault(); setIsFlipped(f => !f); }
    if (isFlipped && e.key === '1') next('Hard');
    if (isFlipped && e.key === '2') next('Medium');
    if (isFlipped && e.key === '3') next('Easy');
  }, [showAdd, isFlipped, curCard]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleAdd = async () => {
    const sub = newSub || subjects[0]?.id;
    if (!sub || !newQ.trim() || !newA.trim()) return;
    setSaving(true);
    await onAddCard(sub, newQ.trim(), newA.trim());
    setSaving(false); setNewQ(''); setNewA(''); setShowAdd(false);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="flex gap-2 flex-wrap flex-1">
          <button onClick={() => { setFilterSub('all'); setCardIdx(0); setIsFlipped(false); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterSub === 'all' ? 'btn-gradient text-white' : 'text-gray-500 hover:text-white'}`}
            style={filterSub !== 'all' ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } : {}}>
            All ({cards.length})
          </button>
          {subjects.map(s => {
            const sc = SUBJECT_COLORS[s.color];
            const count = cards.filter(cd => cd.subject_id === s.id).length;
            return (
              <button key={s.id} onClick={() => { setFilterSub(s.id); setCardIdx(0); setIsFlipped(false); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterSub === s.id ? `${sc?.bg} text-white` : 'text-gray-500 hover:text-white'}`}
                style={filterSub !== s.id ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' } : {}}>
                {s.short_name} ({count})
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowAll(p => !p); setCardIdx(0); setIsFlipped(false); }}
            className="px-3 py-1.5 text-xs font-bold rounded-full transition-all text-gray-500 hover:text-white"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {showAll ? 'Due Today' : 'All Cards'}
          </button>
          <button onClick={() => { setShowAdd(true); setNewSub(subjects[0]?.id || ''); }}
            className="flex items-center gap-1.5 text-xs btn-gradient text-white px-3 py-1.5 rounded-full font-bold">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      {!showAll && dueCount > 0 && (
        <div className="mb-5 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-violet-300">{dueCount} card{dueCount !== 1 ? 's' : ''} due for review today</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-bold text-white text-lg">{showAll ? 'No cards yet.' : 'All caught up!'}</p>
          <p className="text-sm text-gray-600 mt-1">{showAll ? 'Add your first flashcard above.' : 'No cards due today. Check back tomorrow!'}</p>
        </div>
      ) : (
        <>
          <p className="text-center text-gray-700 text-xs font-bold tracking-widest uppercase mb-5">
            Card {(cardIdx % filtered.length) + 1} of {filtered.length}
          </p>

          {/* 3D Card */}
          <div className="perspective w-full mb-6 cursor-pointer" onClick={() => !isFlipped && setIsFlipped(true)}>
            <div className="preserve-3d relative w-full" style={{ transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)', transition: 'transform 0.55s cubic-bezier(.4,2,.6,1)' }}>
              {/* Front */}
              <div className="backface-hidden glass rounded-3xl p-6 md:p-10 min-h-[220px] md:min-h-[260px] flex flex-col" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                {curSub && <span className={`self-start text-[10px] md:text-xs font-black px-2.5 py-1 md:px-3 md:py-1 rounded-full mb-3 md:mb-4 ${c.text}`}
                  style={{ background: 'rgba(139,92,246,0.1)', border: `1px solid rgba(139,92,246,0.2)` }}>{curSub.short_name}</span>}
                <div className="flex-1 flex items-center justify-center text-center">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white leading-tight">{curCard?.question}</h2>
                </div>
                <p className="text-center text-gray-700 text-[10px] md:text-xs mt-3 md:mt-4 animate-pulse font-medium">Tap card to reveal answer</p>
              </div>
              {/* Back */}
              <div className="backface-hidden absolute inset-0 rounded-3xl p-6 md:p-10 flex flex-col" style={{ transform: 'rotateX(180deg)', background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.08))', border: '1px solid rgba(139,92,246,0.25)' }}>
                <span className="self-start text-[10px] md:text-xs font-bold text-violet-400 mb-3 md:mb-4">Answer</span>
                <div className="flex-1 flex items-center justify-center text-center overflow-y-auto scrollbar pb-2">
                  <p className="text-lg md:text-xl lg:text-2xl font-medium text-white leading-relaxed">{curCard?.answer}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div className={`flex flex-wrap gap-2 md:gap-3 justify-center transition-all duration-400 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            {[
              ['Hard', 'rgba(239,68,68,0.1)', 'rgba(239,68,68,0.25)', 'text-red-400'],
              ['Medium', 'rgba(245,158,11,0.1)', 'rgba(245,158,11,0.25)', 'text-amber-400'],
              ['Easy', 'rgba(16,185,129,0.1)', 'rgba(16,185,129,0.25)', 'text-emerald-400'],
            ].map(([label, bg, border, text]) => (
              <button key={label} onClick={e => { e.stopPropagation(); next(label); }}
                className={`flex-1 min-w-[80px] px-3 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm transition-all hover:scale-105 ${text}`}
                style={{ background: bg, border: `1px solid ${border}` }}>{label}</button>
            ))}
            <button onClick={e => { e.stopPropagation(); if (curCard) onDeleteCard(curCard.id); }}
              className="px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-gray-700 hover:text-red-400 transition-colors shrink-0"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Keyboard shortcut hint */}
          <p className="text-center text-[10px] text-gray-700 mt-3 font-medium hidden md:block">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-mono text-[9px]">Space</kbd> flip · 
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-mono text-[9px] ml-1">1</kbd> Hard · 
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-mono text-[9px] ml-1">2</kbd> Med · 
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-mono text-[9px] ml-1">3</kbd> Easy
          </p>
        </>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl" style={{ background: 'rgba(12,12,35,0.97)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-white font-bold">New Flashcard</h3>
              <button onClick={() => setShowAdd(false)}><X className="text-gray-600 hover:text-white w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Subject', el: <select value={newSub} onChange={e => setNewSub(e.target.value)} className="w-full text-white text-sm p-2.5 rounded-xl outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>{subjects.map(s => <option key={s.id} value={s.id} style={{ background: '#0f0f2a' }}>{s.name}</option>)}</select> },
                { label: 'Front (Question)', el: <textarea value={newQ} onChange={e => setNewQ(e.target.value)} rows={3} placeholder="What is…?" className="w-full text-white text-sm p-2.5 rounded-xl outline-none resize-none placeholder-gray-700 focus:border-violet-500/50 transition-colors" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} /> },
                { label: 'Back (Answer)',    el: <textarea value={newA} onChange={e => setNewA(e.target.value)} rows={3} placeholder="Answer…" className="w-full text-white text-sm p-2.5 rounded-xl outline-none resize-none placeholder-gray-700 focus:border-violet-500/50 transition-colors" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} /> },
              ].map(({ label, el }) => (
                <div key={label}><label className="text-xs text-gray-600 font-bold uppercase mb-1.5 block">{label}</label>{el}</div>
              ))}
              <button onClick={handleAdd} disabled={saving || !newQ.trim() || !newA.trim()}
                className="w-full btn-gradient disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
