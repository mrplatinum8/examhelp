const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
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

  // 1. Fetch ODE & NTPD subjects
  const { data: subjects, error: subErr } = await supabase
    .from('subjects')
    .select('id, short_name, name')
    .in('short_name', ['ODE', 'NTPD']);

  if (subErr || !subjects || subjects.length === 0) {
    console.error('Could not find ODE/NTPD subjects:', subErr);
    return;
  }

  const subjectIds = subjects.map(s => s.id);
  console.log('Found subjects:', subjects.map(s => `${s.short_name} (${s.id})`));

  // 2. Mark all topics for ODE and NTPD as completed (done = true)
  const { data: updatedTopics, error: topicErr } = await supabase
    .from('topics')
    .update({ done: true })
    .in('subject_id', subjectIds)
    .select();

  if (topicErr) {
    console.error('Topic update error:', topicErr.message);
  } else {
    console.log(`Marked ${updatedTopics.length} topics as completed (100% done) for ODE & NTPD.`);
  }

  // 3. Remove any leftover exam timetable entries. Exam dates live only here.
  for (const s of subjects) {
    await supabase.from('exam_timetable').delete().eq('user_id', userId).eq('subject_id', s.id);
  }
  console.log('Cleared exam timetable entries for ODE & NTPD.');

  // 4. Remove daily schedule slots for ODE & NTPD
  const { data: deletedSlots, error: schedErr } = await supabase
    .from('daily_schedule')
    .delete()
    .eq('user_id', userId)
    .in('subject_id', subjectIds)
    .select();

  if (schedErr) {
    console.error('Schedule slot delete error:', schedErr.message);
  } else {
    console.log(`Removed ${deletedSlots.length} daily schedule slots for ODE & NTPD.`);
  }

  // 5. Verify subjects status
  const { data: allSubjects } = await supabase
    .from('subjects')
    .select('short_name, name, topics(id, label, done)')
    .order('name');

  console.log('\n--- VERIFIED SUBJECT STATUS ---');
  allSubjects.forEach(s => {
    const total = s.topics ? s.topics.length : 0;
    const doneCount = s.topics ? s.topics.filter(t => t.done).length : 0;
    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    console.log(`${s.short_name.padEnd(5)} | ${s.name.padEnd(45)} | Progress: ${pct}% (${doneCount}/${total})`);
  });
  console.log('-------------------------------\n');
}

run();
