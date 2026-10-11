const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

async function run() {
  console.log('Logging in...');
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'tarun@gmail.com',
    password: 'mvemjsun@9'
  });
  if (authErr) { console.error('Auth error:', authErr.message); return; }
  const userId = auth.user.id;

  console.log('Fetching subjects...');
  const { data: subjects } = await supabase.from('subjects').select('id, short_name');
  const subMap = {};
  subjects.forEach(s => { subMap[s.short_name] = s.id; });

  // --- DAILY SCHEDULE ---
  // No recurring classes for passed subjects (ODE / NTPD)
  const scheduleSlots = [];

  // --- EXAM TIMETABLE ---
  const examEntries = [
    { user_id: userId, subject_id: subMap['WT'],   exam_date: '2026-11-17', start_time: '10:00', end_time: '13:00', notes: 'FN (Forenoon Session)' },
    { user_id: userId, subject_id: subMap['ADE'],  exam_date: '2026-11-18', start_time: '10:00', end_time: '13:00', notes: 'FN (Forenoon Session)' },
    { user_id: userId, subject_id: subMap['CD'],   exam_date: '2026-11-19', start_time: '10:00', end_time: '13:00', notes: 'FN (Forenoon Session)' },
    { user_id: userId, subject_id: subMap['DV'],   exam_date: '2026-11-24', start_time: '10:00', end_time: '13:00', notes: 'FN (Forenoon Session)' },
    { user_id: userId, subject_id: subMap['BMFA'], exam_date: '2026-11-27', start_time: '14:00', end_time: '17:00', notes: 'AN (Afternoon Session)' },
    { user_id: userId, subject_id: subMap['SE'],   exam_date: '2026-12-07', start_time: '10:00', end_time: '13:00', notes: 'FN (Forenoon Session)' },
  ];

  console.log(`Inserting ${examEntries.length} exam timetable entries...`);
  const { error: examErr } = await supabase.from('exam_timetable').insert(examEntries);
  if (examErr) console.error('Exam insert error:', examErr.message);
  else console.log('Exam timetable seeded!');

  console.log('Done!');
}

run();
