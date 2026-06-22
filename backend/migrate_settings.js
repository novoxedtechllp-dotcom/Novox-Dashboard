import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const setupDatabase = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();

    console.log('Creating company_settings table...');
    const sql = `
      CREATE TABLE IF NOT EXISTS company_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          late_time TIME DEFAULT '10:15:00',
          half_day_time TIME DEFAULT '11:00:00',
          updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Insert a default row if the table is empty
      INSERT INTO company_settings (late_time, half_day_time)
      SELECT '10:15:00', '11:00:00'
      WHERE NOT EXISTS (SELECT 1 FROM company_settings);
    `;

    await client.query(sql);
    console.log('✅ company_settings table created and seeded successfully!');
  } catch (error) {
    console.error('❌ Error executing the schema:', error);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
};

setupDatabase();
