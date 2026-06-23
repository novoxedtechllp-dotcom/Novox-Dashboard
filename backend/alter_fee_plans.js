import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:DB_Dashboard26@db.ybtpofrmpnozbxifilqr.supabase.co:5432/postgres"
});

async function run() {
  try {
    await client.connect();
    console.log('Adding due_date_overrides to student_fee_plans...');
    await client.query(`
      ALTER TABLE student_fee_plans
      ADD COLUMN IF NOT EXISTS due_date_overrides JSONB DEFAULT '{}'::jsonb;
    `);
    console.log('Column added successfully!');
  } catch (error) {
    console.error('Error altering table:', error);
  } finally {
    await client.end();
  }
}

run();
