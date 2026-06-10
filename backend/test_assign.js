import "dotenv/config";
import fetch from "node-fetch";
import { supabase } from "./src/config/supabase.js";

async function testAssign() {
  // 1. Get a course
  const { data: courses } = await supabase.from("courses").select("id").limit(1);
  if (!courses || courses.length === 0) return console.log("No courses found");
  const courseId = courses[0].id;

  // 2. Get an employee
  const { data: employees } = await supabase.from("employee_profiles").select("id").limit(1);
  if (!employees || employees.length === 0) return console.log("No employees found");
  const employeeId = employees[0].id;

  console.log(`Assigning employee ${employeeId} to course ${courseId}`);

  // 3. Try API route (we don't have token, so let's just test DB directly like the controller does)
  const { error: deleteError } = await supabase.from("course_instructors").delete().eq("course_id", courseId);
  if (deleteError) console.log("Delete error:", deleteError);
  else console.log("Delete success");

  const { data: insertData, error: insertError } = await supabase
    .from("course_instructors")
    .insert([{ course_id: courseId, employee_id: employeeId }])
    .select();

  if (insertError) console.log("Insert error:", insertError);
  else console.log("Insert success:", insertData);

  process.exit(0);
}

testAssign();
