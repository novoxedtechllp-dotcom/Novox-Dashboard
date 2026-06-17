import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({ connectionString: process.env.DATABASE_URL });
async function test() {
  await client.connect();
  try {
    const res = await client.query(`
      INSERT INTO gallery_categories (name, slug, website_id)
      VALUES ('Test Cat', 'test-cat', 'ca25888a-2988-408d-8c9f-e72b3dd7d78e')
      RETURNING *;
    `);
    console.log('Inserted:', res.rows[0]);
  } catch(e) {
    console.error('Error:', e.message);
  }
  await client.end();
  process.exit(0);
}
test();
