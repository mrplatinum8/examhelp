// LIFE OS PRIME Data Storage & Sync Helper
// Offline-first persistence via localStorage with reactive state helpers

const STORAGE_KEYS = {
  PRIORITIES: 'life_os_priorities',
  HABITS: 'life_os_habits',
  CAMPAIGNS: 'life_os_campaigns',
  BIO_LOGS: 'life_os_bio_logs',
  STEALTH_ROUTINE: 'life_os_stealth_routine',
  COUNTDOWN_TARGET: 'life_os_countdown_target',
};

// 1. Top 3 Priorities Default
export const DEFAULT_PRIORITIES = [
  { id: 1, text: 'GATE 2027: Solve 10 PYQs on Operating Systems (Memory Management)', done: false },
  { id: 2, text: 'Backlog Blitz: Complete 1 full topic for ADE / CD syllabus', done: false },
  { id: 3, text: 'Job Grind: 2 Blind 75 LeetCode problems (Graphs / Trees)', done: false },
];

// 2. 5 Core Habit Disciplines
export const CORE_DISCIPLINES = [
  { id: 'gate', name: 'GATE 2027', icon: '🎯', desc: 'Core CS & Engg Mathematics mastery' },
  { id: 'backlog', name: 'Backlog Clearance', icon: '📚', desc: 'ADE, CD, WT, SE, DV, BMFA progress' },
  { id: 'job', name: 'Job Search', icon: '💼', desc: 'Blind 75 DSA & System Design grind' },
  { id: 'masters', name: 'Masters Prep', icon: '🎓', desc: 'GRE Quant/Verbal, IELTS & SOP drafting' },
  { id: 'fitness', name: 'Physical Movement', icon: '⚡', desc: 'Workout, mobility, & energy management' },
];

// 3. Master Campaigns Initial Data
export const DEFAULT_CAMPAIGNS = [
  {
    id: 'gate-2027',
    title: 'GATE CS 2027 Mastery',
    icon: '🎯',
    color: 'violet',
    targetDate: '2027-02-14',
    badge: 'AIR < 100 Target',
    description: 'Master core engineering mathematics and computer science fundamentals with comprehensive PYQ practice.',
    milestones: [
      { id: 'g1', title: 'Engineering Mathematics & Discrete Math Complete', done: false },
      { id: 'g2', title: 'Core CS Foundations: OS, DBMS, Computer Networks', done: false },
      { id: 'g3', title: 'Theory of Computation & Compiler Design deep dive', done: false },
      { id: 'g4', title: 'Data Structures & Algorithms problem-solving drill', done: false },
      { id: 'g5', title: 'Digital Logic & Computer Organization architecture', done: false },
      { id: 'g6', title: '15-Year Topic-Wise PYQs (2012–2026)', done: false },
      { id: 'g7', title: 'Full-Length Subject & Mock Tests (Aiming 75+ Score)', done: false },
    ],
  },
  {
    id: 'job-hunt',
    title: 'Job Acquisition Engine',
    icon: '💼',
    color: 'blue',
    targetDate: '2026-12-31',
    badge: 'Blind 75 & SDE Prep',
    description: 'Rigorous technical interview preparation combining LeetCode problem patterns, system design, and polished portfolio.',
    milestones: [
      { id: 'j1', title: 'Blind 75 Core Coding Patterns (Arrays, Pointers, Trees, Graphs)', done: false },
      { id: 'j2', title: 'System Design Fundamentals (LLD & Scalable HLD architectures)', done: false },
      { id: 'j3', title: 'High-Impact Full Stack Portfolio Project with Live Demo', done: false },
      { id: 'j4', title: 'ATS-Optimized Tech Resume & LinkedIn Profile Overhaul', done: false },
      { id: 'j5', title: 'Alumni Outreach & Referral Network Pipeline (20+ contacts)', done: false },
      { id: 'j6', title: 'Mock Interviews & Behavioral STAR Responses Practiced', done: false },
    ],
  },
  {
    id: 'masters-prep',
    title: "Master's Applications",
    icon: '🎓',
    color: 'emerald',
    targetDate: '2026-11-30',
    badge: 'Fall 2027 Intake',
    description: 'Standardized exam benchmarks, strategic global university shortlisting, and compelling statements of purpose.',
    milestones: [
      { id: 'm1', title: 'GRE Quant 165+ / Verbal 155+ Target Mock Scores', done: false },
      { id: 'm2', title: 'IELTS Band 7.5+ or TOEFL 105+ Exam Clearance', done: false },
      { id: 'm3', title: 'Strategic University Shortlist (Ambitious / Target / Safe)', done: false },
      { id: 'm4', title: 'Compelling Statement of Purpose (SOP) Draft & Peer Review', done: false },
      { id: 'm5', title: '3 Strong Letters of Recommendation (Academic & Workplace)', done: false },
      { id: 'm6', title: 'Application Portal Submissions & Transcript Verification', done: false },
    ],
  },
];

// 4. Stealth Workday Routine Blocks
export const DEFAULT_STEALTH_ROUTINE = [
  { id: 's1', time: '08:30 – 10:00', duration: '90m', title: 'Pre-Standup Stealth Block', tag: 'GATE Deep Dive', desc: 'Focus on OS/DBMS theoretical concepts and rigorous PYQ derivation before morning meetings begin.' },
  { id: 's2', time: '11:30 – 12:30', duration: '60m', title: 'Mid-Day Dual Leverage', tag: 'Coding & SDE', desc: 'Discreet DSA problem solving (Trees/Graphs on Blind 75) during quiet office intervals.' },
  { id: 's3', time: '13:30 – 14:15', duration: '45m', title: 'Post-Lunch Backlog Blitz', tag: 'University Backlogs', desc: '45m high-yield study on ADE/CD/WT/SE/DV/BMFA exam syllabus units.' },
  { id: 's4', time: '16:00 – 17:30', duration: '90m', title: 'Afternoon Downtime Block', tag: 'Mastery & Notes', desc: 'Review flashcards, formula sheets, and complete GRE vocabulary or system design reading.' },
  { id: 's5', time: '18:00 – 18:30', duration: '30m', title: 'Daily Wrap-Up & Bio Sync', tag: 'Logistics', desc: 'Log deep work hours, check off habits, and record sleep/energy bio-telemetry.' },
];

export const lifeOsStorage = {
  // Top 3 Priorities
  getPriorities(dateStr = new Date().toISOString().split('T')[0]) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRIORITIES) || '{}');
      return all[dateStr] || DEFAULT_PRIORITIES;
    } catch {
      return DEFAULT_PRIORITIES;
    }
  },

  savePriorities(priorities, dateStr = new Date().toISOString().split('T')[0]) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRIORITIES) || '{}');
      all[dateStr] = priorities;
      localStorage.setItem(STORAGE_KEYS.PRIORITIES, JSON.stringify(all));
    } catch {}
  },

  // Habits
  getHabits() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '{}');
    } catch {
      return {};
    }
  },

  toggleHabit(dateStr, disciplineId) {
    try {
      const all = this.getHabits();
      const currentDay = all[dateStr] || {};
      const updated = {
        ...all,
        [dateStr]: {
          ...currentDay,
          [disciplineId]: !currentDay[disciplineId],
        },
      };
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(updated));
      return updated;
    } catch {
      return {};
    }
  },

  calculateHabitStreak(disciplineId) {
    const habits = this.getHabits();
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 90; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayData = habits[key];

      if (dayData && dayData[disciplineId]) {
        streak++;
      } else if (i === 0) {
        // Today not logged yet, continue check from yesterday
        continue;
      } else {
        break;
      }
    }
    return streak;
  },

  // Campaigns
  getCampaigns() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      return saved ? JSON.parse(saved) : DEFAULT_CAMPAIGNS;
    } catch {
      return DEFAULT_CAMPAIGNS;
    }
  },

  saveCampaigns(campaigns) {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    } catch {}
  },

  toggleCampaignMilestone(campaignId, milestoneId) {
    const campaigns = this.getCampaigns().map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          milestones: c.milestones.map(m =>
            m.id === milestoneId ? { ...m, done: !m.done } : m
          ),
        };
      }
      return c;
    });
    this.saveCampaigns(campaigns);
    return campaigns;
  },

  // Bio-Telemetry
  getBioLogs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BIO_LOGS) || '{}');
    } catch {
      return {};
    }
  },

  saveBioLog(dateStr, data) {
    try {
      const all = this.getBioLogs();
      all[dateStr] = {
        ...all[dateStr],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.BIO_LOGS, JSON.stringify(all));
      return all;
    } catch {
      return {};
    }
  },

  // Stealth Workday Routine checkmarks
  getStealthRoutine(dateStr = new Date().toISOString().split('T')[0]) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.STEALTH_ROUTINE) || '{}');
      return all[dateStr] || {};
    } catch {
      return {};
    }
  },

  toggleStealthBlock(dateStr, blockId) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.STEALTH_ROUTINE) || '{}');
      const dayData = all[dateStr] || {};
      dayData[blockId] = !dayData[blockId];
      all[dateStr] = dayData;
      localStorage.setItem(STORAGE_KEYS.STEALTH_ROUTINE, JSON.stringify(all));
      return dayData;
    } catch {
      return {};
    }
  },

  // Countdown Target (Defaults to 6 months from now or April 10, 2027)
  getCountdownTarget() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUNTDOWN_TARGET);
      if (saved) return saved;
      // Default to 6 months accelerator milestone: 180 days from now
      const target = new Date();
      target.setDate(target.getDate() + 180);
      const iso = target.toISOString();
      localStorage.setItem(STORAGE_KEYS.COUNTDOWN_TARGET, iso);
      return iso;
    } catch {
      return new Date(Date.now() + 180 * 86400000).toISOString();
    }
  },

  setCountdownTarget(isoString) {
    try {
      localStorage.setItem(STORAGE_KEYS.COUNTDOWN_TARGET, isoString);
    } catch {}
  },
};
