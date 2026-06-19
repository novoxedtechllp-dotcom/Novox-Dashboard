import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({ connectionString: process.env.DATABASE_URL });
async function check() {
  await client.connect();
  const res = await client.query('SELECT * FROM gallery_categories');
  console.log('Categories:', res.rows);
  await client.end();
  process.exit(0);
}
check();
