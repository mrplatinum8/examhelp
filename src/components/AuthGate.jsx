import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Zap, AlertCircle, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

function parseHashError() {
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  const errorCode = params.get('error_code');
  const errorDesc = params.get('error_description');
  if (errorCode) {
    history.replaceState(null, '', window.location.pathname);
    return decodeURIComponent((errorDesc || errorCode).replace(/\+/g, ' '));
  }
  return null;
}

export default function AuthGate() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const hashError = parseHashError();
    if (hashError) setError(hashError);
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || !password) { setError('Please enter email and password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError(''); setSuccess('');

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: 'https://examhelp-wheat.vercel.app/'
        }
      });
      setLoading(false);
      if (error) setError(error.message);
      else setSuccess('Account created! You are now signed in.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setLoading(false);
      if (error) setError(error.message === 'Invalid login credentials'
        ? 'Wrong email or password. Try again or create a new account.'
        : error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#07071a] mesh-bg flex items-center justify-center p-4">
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 right-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl btn-gradient flex items-center justify-center glow-violet">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-black leading-none">
              <span className="gradient-text">Exam</span><span className="text-white">Focus</span>
            </div>
            <p className="text-gray-600 text-xs mt-0.5 font-medium">Your personal study tracker</p>
          </div>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8" style={{ border: '1px solid rgba(139,92,246,0.15)' }}>
          {/* Tab toggle */}
          <div className="flex gap-2 mb-7 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {[['signin', <LogIn className="w-3.5 h-3.5" />, 'Sign In'], ['signup', <UserPlus className="w-3.5 h-3.5" />, 'Create Account']].map(([m, icon, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${mode === m ? 'btn-gradient text-white' : 'text-gray-500 hover:text-white'}`}>
                {icon}{label}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-black text-white mb-1">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="text-gray-600 text-xs mb-6">{mode === 'signin' ? 'Enter your credentials to continue.' : 'Set up a free account to start tracking.'}</p>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl text-xs text-red-400 font-medium flex items-start gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-3 py-2.5 rounded-xl text-xs text-emerald-400 font-medium"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              {success}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="you@email.com"
                  className="w-full pl-10 pr-4 py-3 text-white placeholder-gray-700 text-sm rounded-xl outline-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  className="w-full pl-10 pr-10 py-3 text-white placeholder-gray-700 text-sm rounded-xl outline-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading || !email.trim() || !password}
              className="w-full btn-gradient disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>{mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-800 mt-5">Secured by Supabase · Your data is private</p>
      </div>
    </div>
  );
}
