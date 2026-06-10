import "dotenv/config";
import { supabase } from "./src/config/supabase.js";

async function testUpdate() {
  console.log("Fetching employee...");
  const { data: currentEmployee, error } = await supabase.from("employee_profiles").select("*").limit(1).single();
  if (error || !currentEmployee) {
    console.error("Failed to fetch employee", error);
    return;
  }
  console.log("Found employee:", currentEmployee.id, currentEmployee.user_id);
  
  const employeeId = currentEmployee.id;

  // 1. Try to update designation
  console.log("Updating designation...");
  const { data: pData, error: pError } = await supabase
    .from("employee_profiles")
    .update({ designation: "TEST DESIGNATION" })
    .eq("id", employeeId)
    .select();
  console.log("Profile update result:", pData?.length > 0 ? "Success" : "No data", pError);

  // 2. Try to update email
  console.log("Updating email for user_id:", currentEmployee.user_id);
  const { data: uData, error: uError } = await supabase
    .from("users")
    .update({ email: "testupdate@test.com" })
    .eq("id", currentEmployee.user_id)
    .select();
  console.log("Users update result:", uData?.length > 0 ? "Success" : "No data", uError);

  // 3. Try to update course_instructors
  console.log("Updating course instructors...");
  const { data: cDelData, error: cDelError } = await supabase
    .from("course_instructors")
    .delete()
    .eq("employee_id", employeeId)
    .select();
  console.log("Course instructors delete result:", cDelData?.length >= 0 ? "Success" : "Failed", cDelError);

  const { data: cInsData, error: cInsError } = await supabase
    .from("course_instructors")
    .insert([{ employee_id: employeeId, course_id: 1 }])
    .select();
  console.log("Course instructors insert result:", cInsData?.length > 0 ? "Success" : "No data", cInsError);

  process.exit(0);
}

testUpdate();
