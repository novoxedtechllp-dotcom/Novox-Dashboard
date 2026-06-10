import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const coursesToSeed = [
  { name: 'MERN Stack', duration: 6, track: 'DEVELOPMENT', base_fee: 55000, total_fee: 64900 },
  { name: 'Flutter Development', duration: 4, track: 'DEVELOPMENT', base_fee: 45000, total_fee: 53100 },
  { name: 'Digital Marketing', duration: 4, track: 'MARKETING', base_fee: 45000, total_fee: 53100 },
  { name: 'Python Programming', duration: 4, track: 'DEVELOPMENT', base_fee: 45000, total_fee: 53100 },
  { name: 'Graphic Designing & Video Editing', duration: 6, track: 'DESIGN', base_fee: 55000, total_fee: 64900 },
  { name: 'Video Editing', duration: 2, track: 'DESIGN', base_fee: 25000, total_fee: 29500 },
  { name: 'Graphic Designing', duration: 3, track: 'DESIGN', base_fee: 40000, total_fee: 47200 },
  { name: 'UI / UX Design', duration: 3, track: 'DESIGN', base_fee: 40000, total_fee: 47200 },
  { name: 'Digital Marketing + Graphic Designing + Video Editing (Combo)', duration: 7, track: 'MARKETING', base_fee: 60000, total_fee: 70800 },
  { name: 'Flutter + Node JS + AI Gen (Combo)', duration: 8, track: 'DEVELOPMENT', base_fee: 70000, total_fee: 82600 },
];

async function run() {
  try {
    await client.connect();
    console.log("Connected to database.");

    // 1. Add columns if they don't exist
    await client.query(`
      ALTER TABLE courses 
      ADD COLUMN IF NOT EXISTS base_fee NUMERIC(12,2),
      ADD COLUMN IF NOT EXISTS total_fee NUMERIC(12,2);
    `);
    console.log("Added fee columns to courses table.");

    // 2. Insert or update courses
    for (const c of coursesToSeed) {
      await client.query(`
        INSERT INTO courses (name, description, track, duration_months, capacity, status, base_fee, total_fee)
        VALUES ($1, $2, $3, $4, $5, 'PUBLISHED', $6, $7)
        ON CONFLICT (name) DO UPDATE SET
          track = EXCLUDED.track,
          duration_months = EXCLUDED.duration_months,
          base_fee = EXCLUDED.base_fee,
          total_fee = EXCLUDED.total_fee,
          status = 'PUBLISHED';
      `, [c.name, `${c.name} course`, c.track, c.duration, 30, c.base_fee, c.total_fee]);
    }
    console.log("Successfully seeded 10 courses.");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
