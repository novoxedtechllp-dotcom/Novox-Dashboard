import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL="https://ybtpofrmpnozbxifilqr.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY="sb_secret_Acwl53gC77hVccaeBbWd7Q_Z6H3jtLi"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const courseId = 'b0b1bc6b-3132-4415-843c-6622340b313f'; // need a valid courseId
  
  // Let's just fetch one course to get a courseId
  const { data: courseData } = await supabase.from('courses').select('id').limit(1);
  if (!courseData || courseData.length === 0) {
    console.log("No courses");
    return;
  }
  const targetCourseId = courseData[0].id;
  console.log("Using course:", targetCourseId);

  const { data: submodules, error: subError } = await supabase
    .from("course_submodules")
    .select("*, course_modules!inner(course_id, sequence_order)")
    .eq("course_modules.course_id", targetCourseId)
    .order("sequence_order", { ascending: true, foreignTable: "course_modules" })
    .order("sequence_order", { ascending: true });

  if (subError) {
    console.error("Sub error", subError);
    return;
  }

  console.log("Found submodules:", submodules.length);

  const updates = [];
  let currentDate = new Date();
  
  for (const sub of submodules) {
    updates.push({
      id: sub.id,
      module_id: sub.module_id,
      title: sub.title,
      description: sub.description,
      sequence_order: sub.sequence_order,
      scheduled_date: '2026-06-06'
    });
  }

  if (updates.length > 0) {
    const { data: updateData, error: updateError } = await supabase
      .from("course_submodules")
      .upsert(updates)
      .select();

    if (updateError) {
      console.error("UPSERT ERROR:", updateError);
    } else {
      console.log("Upsert success", updateData.length);
    }
  }
}

run();
