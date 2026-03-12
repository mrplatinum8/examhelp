// Color class maps (full strings required for Tailwind JIT)
export const SUBJECT_COLORS = {
  blue:    { bg: 'bg-blue-500',    text: 'text-blue-400',    border: 'border-blue-500/30',    glow: 'shadow-blue-500/20' },
  amber:   { bg: 'bg-amber-500',   text: 'text-amber-400',   border: 'border-amber-500/30',   glow: 'shadow-amber-500/20' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
  purple:  { bg: 'bg-purple-500',  text: 'text-purple-400',  border: 'border-purple-500/30',  glow: 'shadow-purple-500/20' },
  pink:    { bg: 'bg-pink-500',    text: 'text-pink-400',    border: 'border-pink-500/30',    glow: 'shadow-pink-500/20' },
  red:     { bg: 'bg-red-500',     text: 'text-red-400',     border: 'border-red-500/30',     glow: 'shadow-red-500/20' },
  cyan:    { bg: 'bg-cyan-500',    text: 'text-cyan-400',    border: 'border-cyan-500/30',    glow: 'shadow-cyan-500/20' },
  indigo:  { bg: 'bg-indigo-500',  text: 'text-indigo-400',  border: 'border-indigo-500/30',  glow: 'shadow-indigo-500/20' },
};

export const SUBJECTS_SEED = [
  { name: 'Ordinary Differential Equations', short_name: 'ODE', color: 'blue', exam_date: null,
    topics: ['1st Order (Cooling, Growth)', 'Higher Order (Variation of Parameters)', 'Double Integrals (Polar, Order Change)', 'Vector Diff (Directional Deriv, Irrotational)', 'Vector Int (Green\'s, Stoke\'s, Gauss)'] },
  { name: 'Numerical Techniques & Probability Distributions', short_name: 'NTPD', color: 'amber', exam_date: '2026-04-20',
    topics: ['Roots (Bisection, N-R) & Interpolation', 'Integration (Trap/Simpson) & ODEs (R-K)', 'Laplace Transforms & Convolution', 'Normal & Poisson Distributions', 'Hypothesis Testing (Chi-Square)'] },
  { name: 'Analog & Digital Electronics', short_name: 'ADE', color: 'emerald', exam_date: null,
    topics: ['P-N Junction / Zener Diode', 'BJT or UJT Characteristics', 'FET Operation', 'K-map Boolean simplifications', 'Counter/Sequential Circuit Design'] },
  { name: 'Software Engineering', short_name: 'SE', color: 'purple', exam_date: '2026-04-24',
    topics: ['Process Models (Waterfall, Spiral, CMMI)', 'UML & Modeling (Sequence/Collab)', 'Testing Strategies (Black-box, Integration)', 'Risk Management', 'Software Configuration Management (SCM)'] },
  { name: 'Web Technologies', short_name: 'WT', color: 'pink', exam_date: '2026-04-21',
    topics: ['PHP (MySQL, Sessions/Cookies)', 'HTML Forms & XML', 'Servlets (Life Cycle, HTTP)', 'JSP (Execution Phases, DB)', 'JavaScript (Events, Validation)'] },
  { name: 'Compiler Design', short_name: 'CD', color: 'red', exam_date: '2026-04-23',
    topics: ['Parsing (Predictive, SLR)', 'Intermediate-Code (Quadruples/Triples)', 'Lexical Analysis (Input Buffering)', 'Run-Time Environments (Stack/Heap)', 'Optimization (Data Flow & Peephole)'] },
  { name: 'Data Visualization', short_name: 'DV', color: 'cyan', exam_date: '2026-04-29',
    topics: ['Cognition & 8 Visual Variables', 'Spatial/Geospatial & Map Projections', 'Time-oriented & Multivariate Data', 'Text (Vector Space) & Graph Data', 'Design Problems in Visualizations'] },
  { name: 'Business Mgmt & Financial Analysis', short_name: 'BMFA', color: 'indigo', exam_date: '2026-05-04',
    topics: ['Management Theories (Taylor, Fayol)', 'Demand Forecasting Methods', 'Break-Even Analysis', 'Financial Statements Ratio Analysis'] },
];

export function computeStreak(sessions) {
  if (!sessions.length) return 0;
  const days = [...new Set(sessions.map(s => s.started_at.split('T')[0]))].sort().reverse();
  let streak = 0;
  const cursor = new Date();
  for (const day of days) {
    const check = cursor.toISOString().split('T')[0];
    if (day === check) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else if (day < check) break;
  }
  return streak;
}

export function computeHeatmap(sessions, studyLogs) {
  const data = {};
  sessions.forEach(s => { const d = s.started_at.split('T')[0]; data[d] = (data[d] || 0) + 1; });
  studyLogs.forEach(l => { data[l.date] = (data[l.date] || 0) + Math.ceil((l.duration_minutes || 60) / 25); });
  return data;
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date(new Date().toDateString());
  return Math.ceil(diff / 86400000);
}
