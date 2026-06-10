import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await client.connect();
  const r1 = await client.query("SELECT * FROM student_attendance");
  console.log("student_attendance:", r1.rows);
  const r2 = await client.query("SELECT trigger_name, event_object_table, action_statement FROM information_schema.triggers");
  console.log("triggers:", r2.rows);
  await client.end();
}
run();
