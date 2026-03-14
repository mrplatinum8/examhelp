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
  // Recurring slots for ALL days (Mon–Sat = 1–6)
  const scheduleSlots = [];
  for (let day = 1; day <= 6; day++) {
    scheduleSlots.push(
      { user_id: userId, day_of_week: day, start_time: '10:30', end_time: '12:30', title: 'ODE Class', subject_id: subMap['ODE'], color: 'blue' },
      { user_id: userId, day_of_week: day, start_time: '13:00', end_time: '15:00', title: 'NTPD Class', subject_id: subMap['NTPD'], color: 'amber' }
    );
  }

  console.log(`Inserting ${scheduleSlots.length} schedule slots...`);
  const { error: schedErr } = await supabase.from('daily_schedule').insert(scheduleSlots);
  if (schedErr) console.error('Schedule insert error:', schedErr.message);
  else console.log('Schedule seeded!');

  // --- EXAM TIMETABLE ---
  const examEntries = [
    { user_id: userId, subject_id: subMap['ADE'],  exam_date: '2026-06-04' },
    { user_id: userId, subject_id: subMap['NTPD'], exam_date: '2026-04-20' },
    { user_id: userId, subject_id: subMap['SE'],   exam_date: '2026-04-24' },
    { user_id: userId, subject_id: subMap['WT'],   exam_date: '2026-04-21' },
    { user_id: userId, subject_id: subMap['CD'],   exam_date: '2026-04-23' },
    { user_id: userId, subject_id: subMap['DV'],   exam_date: '2026-04-29' },
    { user_id: userId, subject_id: subMap['BMFA'], exam_date: '2026-05-04' },
  ];

  console.log(`Inserting ${examEntries.length} exam timetable entries...`);
  const { error: examErr } = await supabase.from('exam_timetable').insert(examEntries);
  if (examErr) console.error('Exam insert error:', examErr.message);
  else console.log('Exam timetable seeded!');

  console.log('Done!');
}

run();
