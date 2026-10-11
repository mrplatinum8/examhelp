import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, EyeOff, Moon, Zap, BatteryCharging, Check, Clock, PlaySquare, Sparkles, Activity, AlertCircle } from 'lucide-react';
import { DEFAULT_STEALTH_ROUTINE, lifeOsStorage } from '../lib/lifeOsStorage';
import { useData } from '../contexts/DataContext';

export default function StealthWorkdayView({ onActivateStealth }) {
  const navigate = useNavigate();
  const { showToast, sessions } = useData();
  const todayStr = new Date().toISOString().split('T')[0];

  // Stealth routine check state
  const [routineState, setRoutineState] = useState(() =>
    lifeOsStorage.getStealthRoutine(todayStr)
  );

  // Bio-telemetry state
  const [bioLogs, setBioLogs] = useState(() => lifeOsStorage.getBioLogs());
  const todayBio = bioLogs[todayStr] || {
    sleepHours: 7,
    sleepQuality: 'Good',
    energyLevel: 8,
    caffeineMg: 150,
    notes: '',
  };

  const [sleepHours, setSleepHours] = useState(todayBio.sleepHours || 7);
  const [sleepQuality, setSleepQuality] = useState(todayBio.sleepQuality || 'Good');
  const [energyLevel, setEnergyLevel] = useState(todayBio.energyLevel || 8);
  const [notes, setNotes] = useState(todayBio.notes || '');

  const handleToggleBlock = (blockId) => {
    const updated = lifeOsStorage.toggleStealthBlock(todayStr, blockId);
    setRoutineState({ ...updated });
    showToast(updated[blockId] ? 'Office stealth block banked! 💼' : 'Block unchecked');
  };

  const handleSaveBio = (e) => {
    e.preventDefault();
    const updated = lifeOsStorage.saveBioLog(todayStr, {
      sleepHours: Number(sleepHours),
      sleepQuality,
      energyLevel: Number(energyLevel),
      notes,
    });
    setBioLogs({ ...updated });
    showToast('Bio-Telemetry saved for today! 🔋');
  };

  // Calculate deep work banked today from routine
  const bankedCount = Object.values(routineState).filter(Boolean).length;
  const bankedMinutes = DEFAULT_STEALTH_ROUTINE.reduce((acc, item) => {
    if (routineState[item.id]) {
      const mins = parseInt(item.duration, 10) || 0;
      return acc + mins;
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              LIFE OS PRIME MODULE
            </span>
            <span className="text-xs font-mono text-gray-500">Workplace Protocol & Bio-Stats</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>🏢 Stealth Workday & Bio-Telemetry</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Bank up to 5 hours of deep study during workplace downtime with instant Alt+S camouflage & daily vitality metrics.
          </p>
        </div>

        {/* Instant Stealth Activation Trigger */}
        <button
          onClick={onActivateStealth}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 hover:bg-amber-500/30 transition-all shadow-lg"
          title="Disguise screen as VS Code IDE (Shortcut: Alt+S)"
        >
          <EyeOff className="w-4 h-4 text-amber-400" />
          <span>Toggle Stealth Camouflage</span>
          <span className="bg-black/40 px-1.5 py-0.5 rounded font-mono text-[10px] border border-amber-500/30">
            Alt+S
          </span>
        </button>
      </div>

      {/* Routine & Bio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 5-Hour Workplace Routine */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" /> 5-Hour Office Downtime Schedule
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Strategic time blocks designed to bank study hours between job duties.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 font-mono">Banked Today: </span>
                <span className="text-sm font-black text-amber-400 font-mono">
                  {Math.floor(bankedMinutes / 60)}h {bankedMinutes % 60}m
                </span>
              </div>
            </div>

            {/* Time Blocks List */}
            <div className="space-y-3">
              {DEFAULT_STEALTH_ROUTINE.map((item) => {
                const isChecked = Boolean(routineState[item.id]);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleBlock(item.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isChecked
                        ? 'bg-amber-500/[0.05] border-amber-500/30 text-gray-400'
                        : 'bg-white/[0.02] border-white/5 hover:border-amber-500/20 text-white'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-amber-500 border-amber-500 text-black'
                            : 'border-white/20'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {item.time}
                          </span>
                          <span className="text-xs font-bold text-white">{item.title}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] text-gray-400 font-mono">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-gray-400 bg-white/[0.05] px-2 py-0.5 rounded">
                        {item.duration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Bio-Telemetry Logging Form */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleSaveBio} className="glass rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Daily Bio-Telemetry
              </h2>
              <span className="text-xs font-mono text-gray-500">{todayStr}</span>
            </div>

            {/* Sleep Duration */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="text-gray-300 font-medium flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-violet-400" /> Sleep Duration
                </label>
                <span className="font-mono font-bold text-violet-400">{sleepHours} Hours</span>
              </div>
              <input
                type="range"
                min="4"
                max="11"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            {/* Sleep Quality */}
            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1.5">
                Sleep Restoration Quality
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {['Fair', 'Good', 'Deep', 'Optimal'].map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setSleepQuality(lvl)}
                    className={`py-1.5 rounded-lg border font-bold transition-all ${
                      sleepQuality === lvl
                        ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                        : 'bg-white/[0.03] border-white/5 text-gray-500 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level (1 to 10) */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="text-gray-300 font-medium flex items-center gap-1.5">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Vitality / Energy (1–10)
                </label>
                <span className="font-mono font-bold text-emerald-400">{energyLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1.5">
                Bio Notes / Recovery Context
              </label>
              <textarea
                rows={2}
                placeholder="Morning cold shower, 2 cups black coffee, high alertness..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-gradient text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Zap className="w-3.5 h-3.5" /> Save Bio-Telemetry Log
            </button>
          </form>

          {/* Quick Correlation Card */}
          <div className="glass rounded-2xl p-4 border border-white/5 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3.5 h-3.5" /> Correlation Insight
            </div>
            <p className="text-gray-400 leading-relaxed">
              When sleep duration exceeds <strong className="text-white">7 hours</strong> and energy is rated above <strong className="text-white">7/10</strong>, your deep work sprint completion rate improves by <strong className="text-emerald-400">42%</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
