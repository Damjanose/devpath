// Reset a Supabase user's enrollments, progress, badges, and profile XP
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://muirhlmbooaxbrprwrgo.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aXJobG1ib29heGJycHJ3cmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTM1NzAsImV4cCI6MjA4ODEyOTU3MH0.ZsY55ya8i1sUUkVyV90dPKM89HQ4aH_WLSupf-N8XyY';

const USER_EMAIL = process.argv[2] || 'damjanoda@gmail.com';
const USER_PASSWORD = process.argv[3];
const USER_ID = '70f43b46-2b3e-4628-b94e-b295b2cf1b86';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function main() {
  // Sign in as the user so RLS allows profile updates
  if (USER_PASSWORD) {
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: USER_EMAIL,
      password: USER_PASSWORD,
    });
    if (signInErr) {
      console.error('Sign-in failed:', signInErr.message);
      console.log('Continuing with anon key (profile reset may fail due to RLS)...');
    } else {
      console.log('Signed in as', USER_EMAIL);
    }
  } else {
    console.log('No password provided — profile reset may fail due to RLS.');
    console.log('Usage: node reset-user.mjs <email> <password>');
  }

  console.log('Resetting user:', USER_ID);

  // 1. Delete lesson_progress
  const r1 = await supabase.from('lesson_progress').delete().eq('user_id', USER_ID);
  console.log('lesson_progress:', r1.error ? r1.error.message : 'cleared');

  // 2. Delete user_badges
  const r2 = await supabase.from('user_badges').delete().eq('user_id', USER_ID);
  console.log('user_badges:', r2.error ? r2.error.message : 'cleared');

  // 3. Delete enrollments
  const r3 = await supabase.from('enrollments').delete().eq('user_id', USER_ID);
  console.log('enrollments:', r3.error ? r3.error.message : 'cleared');

  // 4. Reset profile
  const r4 = await supabase.from('profiles').update({ total_points: 0, level: 1 }).eq('user_id', USER_ID);
  console.log('profile reset:', r4.error ? r4.error.message : 'done');

  // 5. Verify
  const { data: profile } = await supabase.from('profiles').select('total_points, level').eq('user_id', USER_ID).maybeSingle();
  const { data: enrollments } = await supabase.from('enrollments').select('id').eq('user_id', USER_ID);
  const { data: progress } = await supabase.from('lesson_progress').select('id').eq('user_id', USER_ID);

  console.log('\nVerification:');
  console.log('  Profile:', profile);
  console.log('  Enrollments:', enrollments?.length ?? 0);
  console.log('  Lesson progress:', progress?.length ?? 0);
  console.log('\nDone!');
}

main().catch(console.error);
