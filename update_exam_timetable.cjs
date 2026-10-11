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
  if (authErr) {
    console.error('Auth error:', authErr.message);
    return;
  }
  const userId = auth.user.id;
  console.log('User logged in:', userId);

  console.log('Fetching subjects...');
  const { data: subjects, error: subErr } = await supabase.from('subjects').select('id, short_name, name');
  if (subErr) {
    console.error('Fetch subjects error:', subErr.message);
    return;
  }

  const subMap = {};
  subjects.forEach(s => {
    subMap[s.short_name.toUpperCase()] = s.id;
  });

  const timetable = [
    {
      short: 'WT',
      exam_date: '2026-11-17',
      start_time: '10:00',
      end_time: '13:00',
      notes: 'FN (Forenoon Session)'
    },
    {
      short: 'ADE',
      exam_date: '2026-11-18',
      start_time: '10:00',
      end_time: '13:00',
      notes: 'FN (Forenoon Session)'
    },
    {
      short: 'CD',
      exam_date: '2026-11-19',
      start_time: '10:00',
      end_time: '13:00',
      notes: 'FN (Forenoon Session)'
    },
    {
      short: 'DV',
      exam_date: '2026-11-24',
      start_time: '10:00',
      end_time: '13:00',
      notes: 'FN (Forenoon Session)'
    },
    {
      short: 'BMFA',
      exam_date: '2026-11-27',
      start_time: '14:00',
      end_time: '17:00',
      notes: 'AN (Afternoon Session)'
    },
    {
      short: 'SE',
      exam_date: '2026-12-07',
      start_time: '10:00',
      end_time: '13:00',
      notes: 'FN (Forenoon Session)'
    }
  ];

  // 1. Delete old exam entries for this user
  console.log('Clearing existing exam_timetable rows...');
  const { error: delErr } = await supabase.from('exam_timetable').delete().eq('user_id', userId);
  if (delErr) {
    console.error('Delete error:', delErr.message);
  } else {
    console.log('Cleared old entries successfully.');
  }

  // 2. Insert new exam timetable entries
  const newEntries = timetable.map(t => ({
    user_id: userId,
    subject_id: subMap[t.short],
    exam_date: t.exam_date,
    start_time: t.start_time,
    end_time: t.end_time,
    notes: t.notes
  }));

  console.log(`Inserting ${newEntries.length} new exam entries...`);
  const { data: inserted, error: insertErr } = await supabase.from('exam_timetable').insert(newEntries).select();
  if (insertErr) {
    console.error('Insert error:', insertErr.message);
  } else {
    console.log(`Inserted ${inserted.length} exam timetable entries!`);
  }

  // 3. Update subjects table exam_date
  console.log('Updating subjects table exam_date...');
  for (const t of timetable) {
    const subId = subMap[t.short];
    if (subId) {
      await supabase.from('subjects').update({ exam_date: t.exam_date }).eq('id', subId);
    }
  }

  // Reset exam_date for subjects not in this timetable (e.g. ODE, NTPD)
  for (const s of subjects) {
    if (!timetable.some(t => t.short === s.short_name.toUpperCase())) {
      await supabase.from('subjects').update({ exam_date: null }).eq('id', s.id);
    }
  }
  console.log('Subjects exam_date synchronized.');

  // 4. Verify results
  const { data: checkExams } = await supabase
    .from('exam_timetable')
    .select('*, subjects(short_name, name)')
    .order('exam_date');

  console.log('\n--- VERIFIED EXAM TIMETABLE ---');
  checkExams.forEach(e => {
    console.log(`${e.subjects.short_name} (${e.subjects.name}) -> Date: ${e.exam_date} | Time: ${e.start_time} - ${e.end_time} | Session: ${e.notes}`);
  });
  console.log('-------------------------------\n');
}

run();
