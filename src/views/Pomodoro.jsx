import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Play, Pause, RotateCcw, SkipForward, ChevronDown, Music2, Settings, Bell, BellOff, Volume2, VolumeX, Sparkles, Zap } from 'lucide-react';
import { SUBJECT_COLORS } from '../lib/helpers';
import { useData } from '../contexts/DataContext';
import { audioSynthesizer } from '../lib/audioSynthesizer';

const STATES = { IDLE: 'IDLE', FOCUS: 'FOCUS', SHORT: 'SHORT', LONG: 'LONG' };
const DEFAULT_DURATIONS = { FOCUS: 25, SHORT: 5, LONG: 15 };

// Pre-configured Sprint Presets as specified in LIFE OS PRIME
const SPRINT_PRESETS = [
  { label: '25m Pomodoro', focus: 25, short: 5, long: 15, tag: 'Standard' },
  { label: '45m Backlog Blitz', focus: 45, short: 10, long: 20, tag: 'Backlogs' },
  { label: '60m Dual Leverage', focus: 60, short: 12, long: 25, tag: 'Workplace' },
  { label: '90m GATE Deep Dive', focus: 90, short: 15, long: 30, tag: 'GATE 2027' },
];

const PLAYLISTS = [
  { name: 'LoFi Hip Hop', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', color: 'text-violet-400' },
  { name: 'Brown Noise', url: 'https://www.youtube.com/watch?v=RqzGzwTY-6w', color: 'text-blue-400' },
  { name: 'Deep Focus', url: 'https://www.youtube.com/watch?v=5qap5aO4i9A', color: 'text-cyan-400' },
  { name: 'Classical', url: 'https://www.youtube.com/watch?v=4To8E7s1TG4', color: 'text-pink-400' },
];

function notify(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icon-192.png' });
  }
}

function saveTimerState(state) {
  try { sessionStorage.setItem('ef_timer', JSON.stringify(state)); } catch {}
}
function loadTimerState() {
  try {
    const raw = sessionStorage.getItem('ef_timer');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function PomodoroView() {
  const { subjects, sessions, onAddSession } = useData();
  const location = useLocation();

  const [durations, setDurations] = useState(() => {
    try {
      const saved = localStorage.getItem('ef_pomodoro_durations');
      return saved ? JSON.parse(saved) : DEFAULT_DURATIONS;
    } catch { return DEFAULT_DURATIONS; }
  });

  const [soundEnabled, setSoundEnabled] = useState(() => audioSynthesizer.isEnabled());
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(() => {
    return 'Notification' in window && Notification.permission === 'granted';
  });

  const [timeLeft, setTimeLeft] = useState(durations.FOCUS * 60);
  const [timerState, setTimerState] = useState(STATES.IDLE);
  const [sessionCount, setSessionCount] = useState(0);
  const [selId, setSelId] = useState('');
  const [customLink, setCustomLink] = useState('');
  const intervalRef = useRef(null);
  const restoredRef = useRef(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.started_at?.startsWith(todayStr));

  // Handle location state presets if navigated from Backlog Buster or Dashboard
  useEffect(() => {
    if (location.state?.presetMinutes) {
      const mins = location.state.presetMinutes;
      const matched = SPRINT_PRESETS.find(p => p.focus === mins);
      if (matched) {
        setDurations({ FOCUS: matched.focus, SHORT: matched.short, LONG: matched.long });
        setTimeLeft(matched.focus * 60);
      } else {
        setDurations(d => ({ ...d, FOCUS: mins }));
        setTimeLeft(mins * 60);
      }
    }
    if (location.state?.subjectId) {
      setSelId(location.state.subjectId);
    }
  }, [location.state]);

  // Restore timer from sessionStorage on mount
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const saved = loadTimerState();
    if (saved && saved.timerState !== STATES.IDLE) {
      const elapsed = Math.floor((Date.now() - saved.savedAt) / 1000);
      const remaining = Math.max(0, saved.timeLeft - elapsed);
      setTimerState(saved.timerState);
      setTimeLeft(remaining);
      setSessionCount(saved.sessionCount || 0);
      if (saved.selId) setSelId(saved.selId);
      if (remaining > 0) startTicking();
    }
  }, []);

  useEffect(() => {
    if (subjects.length && !selId) setSelId(subjects[0].id);
  }, [subjects, selId]);

  useEffect(() => {
    if (!restoredRef.current) return;
    saveTimerState({
      timerState, timeLeft, sessionCount, selId,
      savedAt: Date.now(),
    });
  }, [timerState, timeLeft, sessionCount, selId]);

  useEffect(() => {
    localStorage.setItem('ef_pomodoro_durations', JSON.stringify(durations));
  }, [durations]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioSynthesizer.setEnabled(next);
    if (next) audioSynthesizer.playSprintStart();
  };

  const clearT = () => clearInterval(intervalRef.current);
  const startTicking = useCallback(() => {
    clearT();
    intervalRef.current = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
  }, []);

  const handlePause = () => { clearT(); setTimerState(STATES.IDLE); };
  const handleReset = () => { clearT(); setTimerState(STATES.IDLE); setTimeLeft(durations.FOCUS * 60); };

  const handleSkip = async () => {
    clearT();
    const wasFocus = timerState === STATES.FOCUS || timerState === STATES.IDLE;
    if (wasFocus && selId) {
      // Synthesize triumphant chime for sprint completion!
      audioSynthesizer.playSprintComplete();
      await onAddSession(selId);
      const next = sessionCount + 1;
      setSessionCount(next);
      const isLong = next % 4 === 0;
      setTimerState(isLong ? STATES.LONG : STATES.SHORT);
      setTimeLeft(isLong ? durations.LONG * 60 : durations.SHORT * 60);
      notify('Break Time! ☕', isLong ? `Long break — ${durations.LONG} minutes` : `Short break — ${durations.SHORT} minutes`);
    } else {
      // Break completed chime
      audioSynthesizer.playBreakComplete();
      setTimerState(STATES.FOCUS);
      setTimeLeft(durations.FOCUS * 60);
      notify('Focus Time! 🎯', `${durations.FOCUS} minutes of deep focus`);
    }
    startTicking();
  };

  const handleStart = () => {
    audioSynthesizer.playSprintStart();
    setTimerState(STATES.FOCUS);
    startTicking();
  };

  useEffect(() => {
    if (timeLeft === 0 && timerState !== STATES.IDLE) handleSkip();
  }, [timeLeft]);

  useEffect(() => () => clearT(), []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationsOn(perm === 'granted');
    }
  };

  const selectPreset = (p) => {
    setDurations({ FOCUS: p.focus, SHORT: p.short, LONG: p.long });
    if (timerState === STATES.IDLE) {
      setTimeLeft(p.focus * 60);
    }
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const isRunning = timerState !== STATES.IDLE;
  const isFocusMode = timerState === STATES.IDLE || timerState === STATES.FOCUS;

  const totalSeconds = isFocusMode ? durations.FOCUS * 60 : timerState === STATES.SHORT ? durations.SHORT * 60 : durations.LONG * 60;
  const pct = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const r = 110;
  const circ = 2 * Math.PI * r;

  const stateColors = {
    [STATES.IDLE]: 'text-white',
    [STATES.FOCUS]: 'text-white',
    [STATES.SHORT]: 'text-emerald-400',
    [STATES.LONG]: 'text-blue-400',
  };

  const stateLabel = {
    [STATES.IDLE]: 'Ready to Engage',
    [STATES.FOCUS]: 'Deep Work Active',
    [STATES.SHORT]: 'Short Break',
    [STATES.LONG]: 'Long Break ✨',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* SPRINT PRESETS SELECTOR BAR */}
      <div className="glass rounded-2xl p-3 border border-white/10 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 shrink-0 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-violet-400" /> Presets:
        </span>
        {SPRINT_PRESETS.map((p) => {
          const isCurrent = durations.FOCUS === p.focus;
          return (
            <button
              key={p.label}
              onClick={() => selectPreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                isCurrent
                  ? 'btn-gradient text-white shadow-md'
                  : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.07] border border-white/5'
              }`}
            >
              <span>{p.label}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${isCurrent ? 'bg-black/20 text-white' : 'text-gray-500'}`}>
                {p.tag}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Timer */}
        <div className="lg:col-span-2 glass rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center min-h-[420px] md:min-h-[520px] relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full opacity-30 transition-colors duration-1000"
              style={{
                background: isFocusMode
                  ? 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* Top Bar: Web Audio + Notifications + Settings */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg glass hover:bg-white/[0.08] transition-colors ${
                soundEnabled ? 'text-violet-400' : 'text-gray-600'
              }`}
              title={soundEnabled ? 'Web Audio Chimes Enabled' : 'Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={requestNotificationPermission}
              className="p-2 rounded-lg glass hover:bg-white/[0.08] text-gray-500 hover:text-white transition-colors"
              title={notificationsOn ? 'Notifications on' : 'Enable notifications'}
            >
              {notificationsOn ? <Bell className="w-4 h-4 text-emerald-400" /> : <BellOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowSettings((s) => !s)}
              className="p-2 rounded-lg glass hover:bg-white/[0.08] text-gray-500 hover:text-white transition-colors"
              title="Timer settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Settings dropdown */}
          {showSettings && (
            <div
              className="absolute top-14 right-4 z-30 w-64 rounded-2xl p-4 shadow-2xl space-y-3"
              style={{ background: 'rgba(12,12,35,0.98)', border: '1px solid rgba(139,92,246,0.25)' }}
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Audio Synthesizer</p>
                <button
                  onClick={() => audioSynthesizer.playTestTone()}
                  className="text-[10px] text-violet-400 hover:text-violet-300 font-bold bg-violet-500/10 px-2 py-0.5 rounded"
                >
                  Test Chime 🎵
                </button>
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Custom Durations (min)</p>
                {['FOCUS', 'SHORT', 'LONG'].map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-12 font-bold">{key}</span>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={durations[key]}
                      onChange={(e) => {
                        const v = Math.max(1, Math.min(180, Number(e.target.value) || 1));
                        setDurations((d) => ({ ...d, [key]: v }));
                        if (!isRunning && key === 'FOCUS') setTimeLeft(v * 60);
                      }}
                      className="flex-1 px-2.5 py-1 text-xs text-white rounded-lg outline-none bg-white/[0.04] border border-white/10"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subject Selector */}
          <div className="relative z-10 w-full max-w-xs mb-6 md:mb-8">
            <label className="block text-center text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 md:mb-2 font-bold">
              Current Mission Subject
            </label>
            <div className="relative">
              <select
                value={selId}
                onChange={(e) => setSelId(e.target.value)}
                disabled={isRunning || subjects.length === 0}
                className="w-full appearance-none glass rounded-xl py-2.5 px-4 text-white font-bold text-sm text-center outline-none cursor-pointer disabled:opacity-60 border-0 bg-white/[0.05]"
                style={{ border: '1px solid rgba(139,92,246,0.25)' }}
              >
                {subjects.length === 0 ? (
                  <option value="" style={{ background: '#0f0f2a' }}>
                    No subjects (Add one first)
                  </option>
                ) : (
                  subjects.map((s) => (
                    <option key={s.id} value={s.id} style={{ background: '#0f0f2a' }}>
                      {s.name} ({s.short_name})
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* SVG Ring + Timer */}
          <div className="relative z-10 flex items-center justify-center mb-6 md:mb-8 scale-90 md:scale-100" style={{ width: 260, height: 260 }}>
            <svg width="260" height="260" className="-rotate-90 absolute">
              <circle cx="130" cy="130" r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
              <circle
                cx="130"
                cy="130"
                r={r}
                stroke="url(#timerGrad)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circ}
                strokeDashoffset={circ - (circ * pct) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={isFocusMode ? '#7c3aed' : '#10b981'} />
                  <stop offset="100%" stopColor={isFocusMode ? '#3b82f6' : '#06b6d4'} />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                {stateLabel[timerState]}
              </p>
              <div
                className={`font-mono text-5xl md:text-6xl font-black tracking-tight select-none ${
                  stateColors[timerState] || 'text-white'
                } ${isRunning && isFocusMode ? 'timer-glow' : ''} ${isRunning && !isFocusMode ? 'timer-glow-green' : ''}`}
              >
                {mins}:{secs}
              </div>
            </div>
          </div>

          {/* Session Dots */}
          <div className="relative z-10 flex gap-2 mb-6 md:mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                  i < sessionCount % 4 ? 'bg-violet-500 glow-violet scale-110' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="relative z-10 flex items-center gap-4">
            <button
              onClick={isRunning ? handlePause : handleStart}
              disabled={subjects.length === 0}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed ${
                isRunning ? 'glass-violet border-violet-500/30 glow-violet' : 'btn-gradient glow-violet'
              }`}
              style={isRunning ? { border: '1px solid rgba(139,92,246,0.4)' } : {}}
            >
              {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>
            <button
              onClick={handleReset}
              className="w-12 h-12 rounded-full glass hover:bg-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleSkip}
              className="w-12 h-12 rounded-full glass hover:bg-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Today's Sessions */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              Today's Deep Work
              <span className="text-xs gradient-text font-black">{todaySessions.length} sessions</span>
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar">
              {todaySessions.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-6">
                  No sessions banked today. Launch a sprint!
                </p>
              )}
              {todaySessions.map((s) => {
                const sub = subjects.find((x) => x.id === s.subject_id);
                const tc = SUBJECT_COLORS[sub?.color]?.text || 'text-gray-400';
                const time = new Date(s.started_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={s.id}
                    className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
                  >
                    <span className={`text-xs font-bold ${tc}`}>{sub?.short_name || 'Sprint'}</span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {time} · {s.duration_minutes || 25}m
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactical Sound Synthesizer Callout */}
          <div className="glass rounded-2xl p-5 border border-violet-500/15">
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Web Audio Synthesizer
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              Synthesizes real-time acoustic cues directly via browser AudioContext without external audio files.
            </p>
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <span className="text-[11px] text-gray-500">Session Chimes: {soundEnabled ? 'Active' : 'Off'}</span>
              <button
                onClick={() => audioSynthesizer.playTestTone()}
                className="text-xs font-bold text-white hover:text-violet-300 flex items-center gap-1"
              >
                Test Chime 🔔
              </button>
            </div>
          </div>

          {/* Focus Playlists */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Music2 className="w-4 h-4 text-violet-400" /> Focus Playlists
            </h3>
            <div className="space-y-2">
              {PLAYLISTS.map((p, i) => (
                <a
                  key={i}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] text-xs font-medium transition-all group border border-transparent hover:border-white/[0.07]"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${p.color.replace('text-', 'bg-')}`} />
                  <span className="text-gray-400 group-hover:text-white transition-colors">{p.name}</span>
                </a>
              ))}
              <div className="pt-2 border-t border-white/[0.05] flex gap-2">
                <input
                  value={customLink}
                  onChange={(e) => setCustomLink(e.target.value)}
                  placeholder="Custom audio link…"
                  className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2 text-[11px] text-white placeholder-gray-600 outline-none focus:border-violet-500/50 transition-colors"
                />
                {customLink && (
                  <a
                    href={customLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 btn-gradient text-white text-xs rounded-xl font-bold shrink-0"
                  >
                    Go
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
