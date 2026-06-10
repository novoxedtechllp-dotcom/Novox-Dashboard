import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to database for Admin seeding.");

    const email = 'admin@novox.com';
    const password = 'admin@novox';
    const passwordHash = await bcrypt.hash(password, 10);

    const userRes = await client.query(`
      INSERT INTO users (email, password_hash, role, status)
      VALUES ($1, $2, 'ADMIN', 'ACTIVE')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id
    `, [email, passwordHash]);

    console.log(`Successfully created/updated ADMIN user: ${email}`);
  } catch (error) {
    console.error("Error creating ADMIN user:", error);
  } finally {
    await client.end();
  }
}

run();
