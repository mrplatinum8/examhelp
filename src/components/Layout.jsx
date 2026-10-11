import React, { useState, Suspense } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Home,
  Clock,
  Calendar as CalendarIcon,
  Layers,
  BarChart2,
  Activity,
  Zap,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  CalendarClock,
  GraduationCap,
  X,
  BookMarked,
  Shield,
  Target,
  EyeOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { audioSynthesizer } from '../lib/audioSynthesizer';

const NAV_ITEMS = [
  { path: '/',           label: 'Dashboard',        icon: Home },
  { path: '/backlog',    label: 'Backlog Buster',   icon: Shield, badge: '6 Subs' },
  { path: '/pomodoro',   label: 'Deep Work Console',icon: Clock },
  { path: '/habits',     label: 'Habit Matrix',     icon: Zap },
  { path: '/campaigns',  label: 'Master Campaigns', icon: Target },
  { path: '/stealth',    label: 'Stealth Workday',  icon: EyeOff },
  { path: '/subjects',   label: 'Subjects',         icon: BookOpen },
  { path: '/flashcards', label: 'Flashcards',       icon: Layers },
  { path: '/calendar',   label: 'Calendar',         icon: CalendarIcon },
  { path: '/schedule',   label: 'Schedule',         icon: CalendarClock },
  { path: '/exams',      label: 'Exams',            icon: GraduationCap },
  { path: '/analytics',  label: 'Analytics',        icon: BarChart2 },
  { path: '/heatmap',    label: 'Heatmap',          icon: Activity },
  { path: '/study-guide',label: 'Study Guide',      icon: BookMarked },
];

/** Lazy loading spinner for Suspense */
function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-64 gap-3 text-gray-600">
      <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading…</span>
    </div>
  );
}

export default function Layout({ onActivateStealth }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : true
  );
  const [soundOn, setSoundOn] = useState(() => audioSynthesizer.isEnabled());
  const { toast, dismissToast, dataLoading, session, handleSignOut } = useData();
  const location = useLocation();

  const toggleGlobalSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    audioSynthesizer.setEnabled(next);
    if (next) audioSynthesizer.playSprintStart();
  };

  return (
    <div className="min-h-screen flex bg-[#07071a] mesh-bg font-sans overflow-x-hidden">
      {/* Toast */}
      {toast && (
        <div
          key={toast.id}
          className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl animate-in fade-in slide-in-from-top-3 duration-300 flex items-center gap-3 ${
            toast.type === 'error'
              ? 'glass-violet border-red-500/30 text-red-300'
              : 'glass border-violet-500/20 text-white'
          }`}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <span>{toast.msg}</span>
          <button onClick={dismissToast} className="text-gray-500 hover:text-white transition-colors shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mobile backdrop */}
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 bg-[#07071a]/95 backdrop-blur-xl border-r border-white/5
        ${sidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-16' : 'translate-x-0 w-64 md:w-60'} `}
        style={{ background: 'linear-gradient(180deg, rgba(124,58,237,0.06) 0%, rgba(7,7,26,0.95) 100%)' }}
      >
        {/* Sidebar Logo */}
        <div className="flex items-center gap-3 px-4 h-16 shrink-0 border-b border-white/[0.05]">
          <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center shrink-0 glow-violet">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span
            className={`text-sm font-bold tracking-tight whitespace-nowrap transition-opacity ${
              sidebarCollapsed ? 'opacity-100 md:opacity-0 w-auto md:w-0' : 'opacity-100'
            }`}
          >
            <span className="gradient-text font-black">LIFE OS</span>
            <span className="text-violet-400 font-mono text-xs ml-1 font-bold">PRIME</span>
          </span>

          <button
            onClick={() => setSidebarCollapsed(true)}
            className="md:hidden ml-auto p-1 text-gray-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto scrollbar">
          {NAV_ITEMS.map(({ path, label, icon: Icon, badge }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => {
                if (window.innerWidth < 768) setSidebarCollapsed(true);
              }}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'nav-active text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-300'
                    } transition-colors`}
                  />
                  <span
                    className={`whitespace-nowrap transition-opacity flex-1 ${
                      sidebarCollapsed ? 'opacity-100 md:opacity-0 w-auto md:w-0 overflow-hidden' : 'opacity-100'
                    }`}
                  >
                    {label}
                  </span>
                  {badge && !sidebarCollapsed && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Area */}
        <div className="p-3 border-t border-white/[0.05] space-y-2">
          {/* Stealth button in sidebar */}
          <button
            onClick={onActivateStealth}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-amber-300/80 hover:text-amber-300 bg-amber-500/[0.05] hover:bg-amber-500/10 border border-amber-500/20 transition-all ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Camouflage Screen (Alt+S)"
          >
            <EyeOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className={`text-[11px] font-bold truncate ${sidebarCollapsed ? 'hidden md:hidden' : 'block'}`}>
              Stealth (Alt+S)
            </span>
          </button>

          <div
            className={`flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] transition-all ${
              sidebarCollapsed ? 'hidden md:flex md:justify-center' : 'flex'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                sidebarCollapsed ? 'md:w-6 md:h-6 md:text-[10px]' : ''
              }`}
            >
              {session?.user?.email?.[0].toUpperCase()}
            </div>
            <div className={`overflow-hidden transition-all ${sidebarCollapsed ? 'hidden md:hidden' : 'block'}`}>
              <p className="text-xs font-bold text-gray-300 truncate w-28">{session?.user?.email}</p>
              <button
                onClick={handleSignOut}
                className="text-[10px] text-gray-500 hover:text-red-400 transition-colors uppercase tracking-wider font-bold mt-0.5"
              >
                Sign Out
              </button>
            </div>
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex w-full items-center justify-center py-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full ${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-60'
        }`}
      >
        {/* Top Header HUD Bar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-white/[0.05] bg-[#07071a]/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400 hidden sm:inline">
                STATUS: <span className="text-emerald-400 font-bold">ONLINE</span>
              </span>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <span className="text-xs font-mono text-gray-400 hidden md:inline">
                MODE: <span className="text-violet-400 font-bold">6-MONTH ACCELERATOR</span>
              </span>
            </div>
          </div>

          {/* Quick HUD controls */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={toggleGlobalSound}
              className={`p-2 rounded-xl glass hover:bg-white/[0.08] transition-colors flex items-center gap-1.5 text-xs font-bold ${
                soundOn ? 'text-violet-400' : 'text-gray-500'
              }`}
              title={soundOn ? 'Web Audio Synthesizer: ON' : 'Audio Muted'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline font-mono text-[10px]">CHIMES</span>
            </button>

            {/* Stealth Mode Button */}
            <button
              onClick={onActivateStealth}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Activate Stealth Camouflage (Shortcut: Alt+S)"
            >
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Stealth</span>
              <span className="text-[10px] font-mono bg-black/40 px-1 py-0.2 rounded border border-amber-500/20">
                Alt+S
              </span>
            </button>

            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
              {session?.user?.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        {dataLoading ? (
          <div className="flex items-center justify-center h-screen gap-3 text-gray-600">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading your tactical dashboard…</span>
          </div>
        ) : (
          <div className="flex-1 p-4 sm:p-8 overflow-x-hidden">
            <Suspense fallback={<PageSpinner />}>
              <Outlet />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
}
