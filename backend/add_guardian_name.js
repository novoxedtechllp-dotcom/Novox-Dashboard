import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function addGuardianName() {
  try {
    await client.connect();
    console.log('Connected to the database');
    await client.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_name VARCHAR(255);');
    console.log('Successfully added guardian_name column to students table');
  } catch (error) {
    console.error('Error adding guardian_name column:', error);
  } finally {
    await client.end();
  }
}

addGuardianName();
