import fs from 'fs';
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await client.connect();
  console.log("Connected to database");
  const data = fs.readFileSync('../student_details.csv', 'utf8');
  const lines = data.split('\n').filter(l => l.trim().length > 0);
  const headers = lines[0].split(',');
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Simple CSV parser for quoted fields
    const cols = [];
    let curr = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      if (line[c] === '"') inQuotes = !inQuotes;
      else if (line[c] === ',' && !inQuotes) {
        cols.push(curr);
        curr = '';
      } else {
        curr += line[c];
      }
    }
    cols.push(curr);

    const fullName = cols[0] || '';
    const guardianName = cols[1] || '';
    const address = cols[2] || '';
    let phone = cols[3] || '0000000000';
    let parentPhone = cols[4] || null;
    const dob = cols[5] || null;
    const aadhar = cols[6] || null;
    const pan = cols[7] || null;
    let joiningDate = cols[8] || null;
    
    if (phone.length > 20) phone = phone.substring(0, 20);
    if (parentPhone && parentPhone.length > 20) parentPhone = parentPhone.substring(0, 20);

    if (joiningDate) {
      // transform DD/MM/YY or DD-MM-YYYY to YYYY-MM-DD
      const parts = joiningDate.split(/[-/]/);
      if (parts.length === 3) {
        let y = parts[2];
        if (y.length === 2) y = '20' + y;
        joiningDate = `${y}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else {
        joiningDate = '2025-06-01';
      }
    } else {
      joiningDate = '2025-06-01';
    }

    const bloodGroup = cols[9] || null;

    let firstName = fullName;
    let lastName = ' ';
    if (fullName.includes(' ')) {
      const idx = fullName.indexOf(' ');
      firstName = fullName.substring(0, idx);
      lastName = fullName.substring(idx + 1).trim();
      if (!lastName) lastName = ' ';
    }
    
    // Check if student exists
    const existRes = await client.query(`SELECT id FROM students WHERE phone = $1 AND first_name = $2`, [phone, firstName]);
    if (existRes.rows.length > 0) {
      console.log(`Skipping existing student ${fullName}`);
      continue;
    }

    // 1. Generate student code
    const scRes = await client.query(`SELECT student_code FROM students WHERE student_code LIKE 'NVX-S%' ORDER BY student_code DESC LIMIT 1`);
    let nextCodeNum = 1;
    if (scRes.rows.length > 0) {
      const lastCode = scRes.rows[0].student_code;
      nextCodeNum = parseInt(lastCode.replace('NVX-S', ''), 10) + 1;
    }
    const studentCode = `NVX-S${String(nextCodeNum).padStart(4, '0')}`;

    // 2. Create user
    const email = `${studentCode.toLowerCase()}-${Date.now()}@students.novox.local`;
    const password = `${studentCode}@123`;
    const passwordHash = await bcrypt.hash(password, 10);

    const userRes = await client.query(`
      INSERT INTO users (email, password_hash, role, status)
      VALUES ($1, $2, 'STUDENT', 'ACTIVE')
      RETURNING id
    `, [email, passwordHash]);
    const userId = userRes.rows[0].id;

    // 3. Create student
    await client.query(`
      INSERT INTO students (user_id, student_code, first_name, last_name, phone, parent_phone, guardian_name, address, joining_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE')
    `, [userId, studentCode, firstName, lastName, phone, parentPhone, guardianName, address, joiningDate]);

    console.log(`Inserted student ${fullName} (${studentCode})`);
  }
  
  await client.end();
  console.log("Done inserting students.");
}
run().catch(console.error);
