import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = `
ALTER TABLE student_fee_plans ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE student_fee_plans ADD COLUMN IF NOT EXISTS admission_fee NUMERIC(12,2) DEFAULT 5000.00;
ALTER TABLE student_fee_plans ADD COLUMN IF NOT EXISTS monthly_installment NUMERIC(12,2) DEFAULT 10000.00;
ALTER TABLE student_fee_plans ADD COLUMN IF NOT EXISTS start_month INTEGER;
ALTER TABLE student_fee_plans ADD COLUMN IF NOT EXISTS start_year INTEGER;
ALTER TABLE student_fee_plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'INSTALLMENT';
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS month INTEGER;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS notes TEXT;
CREATE INDEX IF NOT EXISTS idx_fee_plans_student ON student_fee_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_plans_course ON student_fee_plans(course_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_month_year ON fee_payments(month, year);
CREATE INDEX IF NOT EXISTS idx_fee_payments_plan ON fee_payments(fee_plan_id);
`;

async function runMigration() {
  console.log('Connecting to database...');
  await client.connect();
  console.log('Connected! Running migration...\n');

  try {
    await client.query(sql);
    console.log('✓ Migration completed successfully!');

    // Verify columns exist
    const { rows: planCols } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student_fee_plans' 
      ORDER BY ordinal_position
    `);
    console.log('\nstudent_fee_plans columns:');
    planCols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));

    const { rows: paymentCols } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'fee_payments' 
      ORDER BY ordinal_position
    `);
    console.log('\nfee_payments columns:');
    paymentCols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));

  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
