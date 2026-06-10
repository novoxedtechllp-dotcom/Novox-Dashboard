import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './src/config/supabase.js';

async function run() {
  const email = 'admin@novox.com';
  const { data: user, error } = await supabase
    .from("users")
    .select(`
      *,
      employee_profiles(
        id,
        first_name,
        last_name,
        designation,
        avatar_url,
        employee_roles(role_name)
      ),
      students(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq("email", email)
    .single();

  console.log("Error:", error);
  console.log("User:", user);
}
run();
run();
