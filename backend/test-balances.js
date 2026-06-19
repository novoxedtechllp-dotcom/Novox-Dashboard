const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://ybtpofrmpnozbxifilqr.supabase.co', 'sb_secret_Acwl53gC77hVccaeBbWd7Q_Z6H3jtLi');

async function test() {
  const { data: enrollments, error } = await sb
    .from("student_courses")
    .select(`
      id, student_id, course_id, enrolled_at, progress_percentage,
      students!inner(id, first_name, last_name, student_code, avatar_url, status),
      courses!inner(id, name, track, total_fee)
    `);

  console.log('Enrollments:', enrollments?.length);
  if (enrollments && enrollments.length > 0) {
    console.log(enrollments[0]);
  }
}
test();
