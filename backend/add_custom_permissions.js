import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/novox'
});

async function runMigration() {
  try {
    await client.connect();
    console.log("Connected to database");
    
    // Check if column exists
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='employee_profiles' and column_name='custom_permissions';
    `);
    
    if (res.rows.length === 0) {
      await client.query(`ALTER TABLE employee_profiles ADD COLUMN custom_permissions JSONB DEFAULT NULL;`);
      console.log("Column custom_permissions added successfully to employee_profiles table");
    } else {
      console.log("Column custom_permissions already exists in employee_profiles table");
    }
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();
