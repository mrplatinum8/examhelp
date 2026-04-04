import React, { useState, Suspense } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Home, Clock, Calendar as CalendarIcon, Layers, BarChart2, Activity, Zap, ChevronLeft, ChevronRight, CalendarCheck, CalendarClock, GraduationCap, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const NAV_ITEMS = [
  { path: '/',          label: 'Dashboard', icon: Home },
  { path: '/subjects',  label: 'Subjects',  icon: BookOpen },
  { path: '/pomodoro',  label: 'Pomodoro',  icon: Clock },
  { path: '/calendar',  label: 'Calendar',  icon: CalendarIcon },
  { path: '/flashcards',label: 'Flashcards',icon: Layers },
  { path: '/revision',  label: 'Revision',  icon: CalendarCheck },
  { path: '/schedule',  label: 'Schedule',  icon: CalendarClock },
  { path: '/exams',     label: 'Exams',     icon: GraduationCap },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/heatmap',   label: 'Heatmap',   icon: Activity },
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

export default function Layout() {
  // Default sidebar collapsed on mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : true
  );
  const { toast, dismissToast, dataLoading, session, handleSignOut } = useData();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-[#07071a] mesh-bg font-sans overflow-x-hidden">
      {/* Toast */}
      {toast && (
        <div key={toast.id}
          className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl animate-in fade-in slide-in-from-top-3 duration-300 flex items-center gap-3 ${toast.type === 'error' ? 'glass-violet border-red-500/30 text-red-300' : 'glass border-violet-500/20 text-white'}`}
          style={{ backdropFilter: 'blur(12px)' }}>
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
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 bg-[#07071a]/95 backdrop-blur-xl border-r border-white/5
        ${sidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-16' : 'translate-x-0 w-64 md:w-56'} `}
        style={{ background: 'linear-gradient(180deg, rgba(124,58,237,0.05) 0%, rgba(7,7,26,0.8) 100%)' }}>
        
        {/* Sidebar Logo */}
        <div className="flex items-center gap-3 px-4 h-16 shrink-0 border-b border-white/[0.05]">
          <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center shrink-0 glow-violet">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className={`text-sm font-bold tracking-tight whitespace-nowrap transition-opacity ${sidebarCollapsed ? 'opacity-100 md:opacity-0 w-auto md:w-0' : 'opacity-100'}`}>
            <span className="gradient-text">Exam</span>
            <span className="text-gray-400 font-light">Focus</span>
          </span>
          
          <button onClick={() => setSidebarCollapsed(true)} className="md:hidden ml-auto p-1 text-gray-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} end={path === '/'}
              onClick={() => { if(window.innerWidth < 768) setSidebarCollapsed(true); }}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive ? 'nav-active' : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'}`
              }>
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 md:w-4 md:h-4 shrink-0 ${isActive ? 'text-violet-400' : 'text-gray-600 group-hover:text-gray-400'} transition-colors`} />
                  <span className={`whitespace-nowrap transition-opacity ${sidebarCollapsed ? 'opacity-100 md:opacity-0 w-auto md:w-0 overflow-hidden' : 'opacity-100'}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/[0.05]">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex w-full items-center justify-center py-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all">
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          
          <div className={`mt-2 flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] transition-all ${sidebarCollapsed ? 'hidden md:flex md:justify-center' : 'flex'}`}>
            <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0 ${sidebarCollapsed ? 'md:w-6 md:h-6 md:text-[10px]' : ''}`}>
              {session.user.email?.[0].toUpperCase()}
            </div>
            <div className={`overflow-hidden transition-all ${sidebarCollapsed ? 'hidden md:hidden' : 'block'}`}>
              <p className="text-xs font-bold text-gray-300 truncate w-32">{session.user.email}</p>
              <button onClick={handleSignOut} className="text-[10px] text-gray-500 hover:text-red-400 transition-colors uppercase tracking-wider font-bold mt-0.5">Sign Out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full ${sidebarCollapsed ? 'md:pl-16' : 'md:pl-56'}`}>
        {/* Mobile Top Header */}
        <header className="md:hidden h-16 shrink-0 flex items-center justify-between px-4 border-b border-white/[0.05] bg-[#07071a]/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarCollapsed(false)} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg btn-gradient flex items-center justify-center shrink-0 glow-violet">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">
                <span className="gradient-text">Exam</span>
                <span className="text-gray-400 font-light">Focus</span>
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
            {session.user.email?.[0].toUpperCase()}
          </div>
        </header>

        {dataLoading ? (
          <div className="flex items-center justify-center h-screen gap-3 text-gray-600">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading your data…</span>
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
