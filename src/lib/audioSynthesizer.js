// Web Audio API Synthesizer for LIFE OS PRIME
// Zero external sound assets needed — generates pure harmonic audio tones

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const audioSynthesizer = {
  isEnabled() {
    try {
      const val = localStorage.getItem('life_os_audio_enabled');
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  },

  setEnabled(enabled) {
    try {
      localStorage.setItem('life_os_audio_enabled', enabled ? 'true' : 'false');
    } catch {}
  },

  /** Tactical double chime on sprint start (523Hz -> 659Hz) */
  playSprintStart() {
    if (!this.isEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Note 1: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // Note 2: E5 (659.25 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.12);
      gain2.gain.setValueAtTime(0.0001, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.22, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.4);
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  },

  /** Triumphant harmonic chime on sprint completion (A4 -> C#5 -> E5 -> A5 chord) */
  playSprintComplete() {
    if (!this.isEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.08;
        const duration = 0.8 - idx * 0.1;

        osc.type = idx === 3 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      });
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  },

  /** Break complete alert chime */
  playBreakComplete() {
    if (!this.isEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [784, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + i * 0.16;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.14);
      });
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  },

  /** Test preview chime */
  playTestTone() {
    this.playSprintComplete();
  }
};
