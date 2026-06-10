import "dotenv/config";
import { supabase } from "./src/config/supabase.js";

async function testShape() {
  const { data, error } = await supabase
    .from("employee_profiles")
    .select(`*, users(email), course_instructors(course_id)`)
    .limit(1)
    .single();
  
  console.log("Data shape:", JSON.stringify(data, null, 2));
  process.exit(0);
}

testShape();
