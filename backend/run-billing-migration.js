import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = `
ALTER TABLE student_fee_plans ADD COLUMN IF NOT EXISTS start_date DATE;
`;

async function runMigration() {
  console.log('Connecting to database...');
  await client.connect();
  console.log('Connected! Running migration...\n');

  try {
    await client.query(sql);
    console.log('✓ Migration completed successfully!');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
