import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:DB_Dashboard26@db.ybtpofrmpnozbxifilqr.supabase.co:5432/postgres"
});

async function run() {
  await client.connect();
  
  const res = await client.query(`
    SELECT enumlabel 
    FROM pg_enum 
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
    WHERE pg_type.typname = 'crm_stage';
  `);
  
  console.log(res.rows);
  await client.end();
}

run().catch(console.error);
