import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const employees = [
  { first_name: 'Amit', last_name: 'Sharma', phone: '9876543210', role_name: 'SALES', designation: 'Sales Manager', salary: 60000, code: 'NVX-E0001' },
  { first_name: 'Priya', last_name: 'Singh', phone: '9876543211', role_name: 'MARKETING', designation: 'Marketing Exec', salary: 45000, code: 'NVX-E0002' },
  { first_name: 'Rahul', last_name: 'Verma', phone: '9876543212', role_name: 'DEVELOPMENT', designation: 'Senior Dev', salary: 80000, code: 'NVX-E0003' },
  { first_name: 'Neha', last_name: 'Gupta', phone: '9876543213', role_name: 'DESIGN', designation: 'UI/UX Designer', salary: 50000, code: 'NVX-E0004' }
];

async function run() {
  try {
    await client.connect();
    console.log("Connected to database for employees seeding.");

    for (const emp of employees) {
      // Create user
      const email = `${emp.first_name.toLowerCase()}.${emp.last_name.toLowerCase()}@novox.local`;
      const password = `${emp.first_name}@123`;
      const passwordHash = await bcrypt.hash(password, 10);

      const userRes = await client.query(`
        INSERT INTO users (email, password_hash, role, status)
        VALUES ($1, $2, 'EMPLOYEE', 'ACTIVE')
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, [email, passwordHash]);
      
      let userId;
      if (userRes.rows.length > 0) {
        userId = userRes.rows[0].id;
      } else {
        const u = await client.query(`SELECT id FROM users WHERE email = $1`, [email]);
        userId = u.rows[0].id;
      }

      // Get role
      const roleRes = await client.query(`SELECT id FROM employee_roles WHERE role_name = $1`, [emp.role_name]);
      let roleId;
      if (roleRes.rows.length > 0) {
        roleId = roleRes.rows[0].id;
      } else {
        // Create role if not exists
        const newRole = await client.query(`INSERT INTO employee_roles (role_name) VALUES ($1) RETURNING id`, [emp.role_name]);
        roleId = newRole.rows[0].id;
      }

      // Insert employee
      await client.query(`
        INSERT INTO employee_profiles (user_id, employee_code, first_name, last_name, phone, joining_date, designation, role_id, salary, status)
        VALUES ($1, $2, $3, $4, $5, '2025-01-01', $6, $7, $8, 'ACTIVE')
        ON CONFLICT (employee_code) DO NOTHING
      `, [userId, emp.code, emp.first_name, emp.last_name, emp.phone, emp.designation, roleId, emp.salary]);

      console.log(`Seeded employee: ${emp.first_name} ${emp.last_name} (${emp.code})`);
    }

    console.log("Employees seeded successfully.");
  } catch (error) {
    console.error("Error seeding employees:", error);
  } finally {
    await client.end();
  }
}

run();
