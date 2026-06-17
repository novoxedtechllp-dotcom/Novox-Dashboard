import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:DB_Dashboard26@db.ybtpofrmpnozbxifilqr.supabase.co:5432/postgres"
});

async function run() {
  await client.connect();
  
  const res = await client.query(`
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'gallery_images'::regclass
    AND contype = 'u';
  `);
  
  for (const row of res.rows) {
    if (row.conname.includes('image_hash')) {
      console.log('Dropping constraint:', row.conname);
      await client.query(`ALTER TABLE gallery_images DROP CONSTRAINT "${row.conname}"`);
    }
  }

  console.log('Adding new unique constraint on (image_hash, website_id)');
  // Ensure we can add the constraint without conflicts
  // First, we might need to clear exact duplicate rows if any exist, but it's unlikely since it was uniquely restricted by hash
  await client.query(`ALTER TABLE gallery_images ADD CONSTRAINT gallery_images_image_hash_website_id_key UNIQUE NULLS NOT DISTINCT (image_hash, website_id)`);
  
  console.log('Done!');
  await client.end();
}

run().catch(console.error);
