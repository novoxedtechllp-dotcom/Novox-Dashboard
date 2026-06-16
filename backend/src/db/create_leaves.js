import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const setupLeavesTable = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const createLeavesQuery = `
      CREATE TABLE IF NOT EXISTS leaves (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          reason TEXT NOT NULL,
          status APPROVAL_STATUS DEFAULT 'PENDING',
          admin_message TEXT,
          applied_on TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves(employee_id);
    `;

    console.log('Creating leaves table safely...');
    await client.query(createLeavesQuery);
    console.log('✅ Leaves table created successfully!');
  } catch (error) {
    console.error('❌ Error creating leaves table:', error);
  } finally {
    await client.end();
  }
};

setupLeavesTable();
