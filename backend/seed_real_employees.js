import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const employees = [
  { first_name: 'Akarsh', last_name: '', phone: '7736751357', role_name: 'Accounts', designation: 'Accounts Manager', salary: 40000, code: 'NVX-E0010', courses: [] },
  { first_name: 'Vishnu', last_name: '', phone: '7306130559', role_name: 'Sales', designation: 'Business Development Manager', salary: 50000, code: 'NVX-E0011', courses: [] },
  { first_name: 'Devananda', last_name: '', phone: '7306042404', role_name: 'HR', designation: 'HR', salary: 40000, code: 'NVX-E0012', courses: [] },
  { first_name: 'Aswathi', last_name: '', phone: '9747227033', role_name: 'Marketing', designation: 'Digital Marketing Head', salary: 60000, code: 'NVX-E0013', courses: ['Digital Marketing'] },
  { first_name: 'Agraj', last_name: '', phone: '9633180095', role_name: 'Design', designation: 'Creative Designer', salary: 50000, code: 'NVX-E0014', courses: ['Graphic Designing', 'Video Editing', 'UI / UX Design', 'Graphic Designing & Video Editing'] },
  { first_name: 'Sajad', last_name: '', phone: '9778711090', role_name: 'Development', designation: 'Software Developer', salary: 50000, code: 'NVX-E0015', courses: ['Flutter Development'] },
  { first_name: 'Sajid', last_name: '', phone: '8089391497', role_name: 'Development', designation: 'Senior Software Developer', salary: 80000, code: 'NVX-E0016', courses: ['MERN Stack'] }
];

async function run() {
  try {
    await client.connect();
    console.log("Connected to database for real employees seeding.");

    // Optionally delete old dummy employees
    await client.query('DELETE FROM whatsapp_messages');
    await client.query('DELETE FROM whatsapp_conversations');
    await client.query('DELETE FROM whatsapp_campaigns');
    await client.query('DELETE FROM whatsapp_templates');
    
    const dummyNames = ['Amit', 'Priya', 'Rahul', 'Neha'];
    for (const name of dummyNames) {
      await client.query(`
        DELETE FROM users WHERE email LIKE $1
      `, [`${name.toLowerCase()}%`]);
    }
    console.log("Cleared old dummy employees.");

    // Fetch all courses to map IDs
    const coursesRes = await client.query('SELECT id, name FROM courses');
    const courseMap = {};
    coursesRes.rows.forEach(c => {
      courseMap[c.name] = c.id;
    });

    for (const emp of employees) {
      // Create user
      const email = `${emp.first_name.toLowerCase()}@novox.local`;
      const password = `${emp.first_name}@123`;
      const passwordHash = await bcrypt.hash(password, 10);

      const userRes = await client.query(`
        INSERT INTO users (email, password_hash, role, status)
        VALUES ($1, $2, 'EMPLOYEE', 'ACTIVE')
        ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE'
        RETURNING id
      `, [email, passwordHash]);
      
      let userId;
      if (userRes.rows.length > 0) {
        userId = userRes.rows[0].id;
      } else {
        const u = await client.query(`SELECT id FROM users WHERE email = $1`, [email]);
        userId = u.rows[0].id;
      }

      // Get or create role
      let roleName = emp.role_name.toUpperCase();
      const roleRes = await client.query(`SELECT id FROM employee_roles WHERE role_name = $1`, [roleName]);
      let roleId;
      if (roleRes.rows.length > 0) {
        roleId = roleRes.rows[0].id;
      } else {
        const newRole = await client.query(`INSERT INTO employee_roles (role_name) VALUES ($1) RETURNING id`, [roleName]);
        roleId = newRole.rows[0].id;
      }

      // Insert employee
      const empRes = await client.query(`
        INSERT INTO employee_profiles (user_id, employee_code, first_name, last_name, phone, joining_date, designation, role_id, salary, status)
        VALUES ($1, $2, $3, $4, $5, '2025-01-01', $6, $7, $8, 'ACTIVE')
        ON CONFLICT (employee_code) DO UPDATE SET 
          first_name = EXCLUDED.first_name,
          designation = EXCLUDED.designation,
          phone = EXCLUDED.phone
        RETURNING id
      `, [userId, emp.code, emp.first_name, emp.last_name, emp.phone, emp.designation, roleId, emp.salary]);
      
      let employeeId;
      if (empRes.rows.length > 0) {
        employeeId = empRes.rows[0].id;
      } else {
        const existingEmp = await client.query(`SELECT id FROM employee_profiles WHERE employee_code = $1`, [emp.code]);
        employeeId = existingEmp.rows[0].id;
      }

      // Link to courses
      for (const courseName of emp.courses) {
        const courseId = courseMap[courseName];
        if (courseId) {
          await client.query(`
            INSERT INTO course_instructors (course_id, employee_id)
            VALUES ($1, $2)
            ON CONFLICT (course_id, employee_id) DO NOTHING
          `, [courseId, employeeId]);
        } else {
          console.log(`Course not found for mapping: ${courseName}`);
        }
      }

      console.log(`Seeded employee: ${emp.first_name} (${emp.code})`);
    }

    console.log("Real employees seeded successfully.");
  } catch (error) {
    console.error("Error seeding real employees:", error);
  } finally {
    await client.end();
  }
}

run();
