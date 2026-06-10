import "dotenv/config";
import { supabase } from "./src/config/supabase.js";

async function checkRoles() {
  const { data, error } = await supabase.from("employee_roles").select("*");
  console.log("Roles:", data, error);
  process.exit(0);
}

checkRoles();
