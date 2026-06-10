import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to database to add avatar_url columns.");

    await client.query(`ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
    console.log("Added avatar_url to employee_profiles.");

    await client.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
    console.log("Added avatar_url to students.");

  } catch (error) {
    console.error("Error altering tables:", error);
  } finally {
    await client.end();
  }
}

run();
