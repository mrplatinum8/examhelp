const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

const flashcardsData = [
  { sub: 'CD', q: 'What are the key parsing techniques to master for Unit II?', a: 'Predictive Parsers and SLR Parsers.' },
  { sub: 'CD', q: 'What are the three main forms of Intermediate-Code generation?', a: 'Quadruples, Triples, and Indirect Triples.' },
  { sub: 'CD', q: 'What are the two memory allocation strategies in Run-Time Environments?', a: 'Stack allocation and Heap allocation.' },
  { sub: 'DV', q: 'What foundational concept outlines the semiology of graphical symbols?', a: 'The eight visual variables.' },
  { sub: 'DV', q: 'How is Geospatial Data primarily visualized?', a: 'Through the visualization of point, line, and area data, and utilizing map projections.' },
  { sub: 'DV', q: 'What is the primary model used for text and document visualization?', a: 'The Vector Space Model.' },
  { sub: 'NTPD', q: 'What are the two most frequently tested methods for finding the roots of equations?', a: 'Bisection Method and Newton-Raphson Method.' },
  { sub: 'NTPD', q: 'Which rules are essential for Numerical Integration?', a: 'Trapezoidal rule and Simpson’s 1/3rd and 3/8 rules.' },
  { sub: 'NTPD', q: 'Which hypothesis test evaluates goodness of fit (e.g., the proportion of beans or dice thrown)?', a: 'The Chi-Square (χ²) test.' },
  { sub: 'ODE', q: 'What are the most common applications of First Order ODEs?', a: "Newton's law of cooling and the law of natural growth and decay (e.g., bacterial culture problems)." },
  { sub: 'ODE', q: 'Which method is used to solve higher-order linear differential equations?', a: 'Method of variation of parameters.' },
  { sub: 'ODE', q: 'What are the three major theorems in Vector Integration?', a: 'Green’s theorem, Gauss divergence theorem, and Stoke’s theorem.' },
  { sub: 'SE', q: 'Which Software Process Models are heavily tested?', a: 'The Waterfall model, Spiral model, and Unified Process Model. You should also know CMMI.' },
  { sub: 'SE', q: 'Which UML diagrams should you be able to draw?', a: 'Sequence diagrams and Collaboration diagrams.' },
  { sub: 'SE', q: 'What are the two approaches to Risk Management?', a: 'Proactive risk strategies and Reactive risk strategies.' },
  { sub: 'WT', q: 'How is state management handled in PHP?', a: 'By using Sessions and Cookies.' },
  { sub: 'WT', q: 'What are the distinct phases in the life cycle of a Servlet?', a: 'Initialization, processing HTTP requests/responses, and destruction.' },
  { sub: 'WT', q: 'What is JavaScript primarily used for in Unit V?', a: 'Event Handling and Form Validation.' },
  { sub: 'ADE', q: 'Which diode characteristics are mandatory to learn?', a: 'P-N junction diode (forward/reverse bias) and Zener diode V-I characteristics.' },
  { sub: 'ADE', q: 'What is the standard method for minimizing Boolean functions?', a: 'K-map (Karnaugh Map) simplification (4 or 5 variables).' },
  { sub: 'ADE', q: 'What Sequential Circuits design questions are most common?', a: 'Drawing and explaining specific Counters (e.g., BCD Ripple Counter, Ring Counter) and explaining state reduction/assignment.' },
  { sub: 'BMFA', q: 'What are the foundational management theories?', a: "FW Taylor's Scientific Management and Henry Fayol's Modern Management." },
  { sub: 'BMFA', q: 'What are the primary techniques for Financial Statement Analysis?', a: 'Solving simple problems using Liquidity, Leverage, and Activity Ratios.' }
];

async function run() {
  console.log('Logging in...');
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'tarun@gmail.com',
    password: 'mvemjsun@9'
  });

  if (authErr) {
    console.error('Auth error:', authErr.message);
    return;
  }

  console.log('Fetching subjects...');
  const { data: subjects, error: subErr } = await supabase.from('subjects').select('id, short_name');
  if (subErr) {
    console.error('Fetch subjects error:', subErr.message);
    return;
  }

  const subMap = {};
  subjects.forEach(s => { subMap[s.short_name] = s.id; });

  const toInsert = flashcardsData.map(f => ({
    subject_id: subMap[f.sub],
    question: f.q,
    answer: f.a,
    user_id: auth.user.id
  })).filter(f => f.subject_id);

  console.log(`Inserting ${toInsert.length} flashcards...`);
  const { error: insErr } = await supabase.from('flashcards').insert(toInsert);

  if (insErr) {
    console.error('Insert error:', insErr.message);
  } else {
    console.log('Success!');
  }
}

run();
