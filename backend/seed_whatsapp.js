import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to database for WhatsApp seeding.");

    // 1. Create a WhatsApp template
    const tmplRes = await client.query(`
      INSERT INTO whatsapp_templates (name, template_content)
      VALUES ($1, $2)
      ON CONFLICT (name) DO NOTHING
      RETURNING id
    `, ['welcome_message', 'Hello {{1}}, welcome to Novox Dashboard!']);
    
    let templateId;
    if (tmplRes.rows.length > 0) {
      templateId = tmplRes.rows[0].id;
    } else {
      const t = await client.query(`SELECT id FROM whatsapp_templates WHERE name = 'welcome_message'`);
      templateId = t.rows[0].id;
    }
    
    // Get some students to create conversations
    const studentsRes = await client.query(`SELECT id, first_name FROM students LIMIT 2`);
    if (studentsRes.rows.length === 0) {
      console.log("No students found to link whatsapp data.");
      return;
    }

    // Get an employee
    const empRes = await client.query(`SELECT id FROM employee_profiles LIMIT 1`);
    let empId = empRes.rows.length > 0 ? empRes.rows[0].id : null;

    // 2. Create conversations and messages
    for (const student of studentsRes.rows) {
      const convRes = await client.query(`
        INSERT INTO whatsapp_conversations (student_id, assigned_employee_id, status)
        VALUES ($1, $2, 'OPEN')
        RETURNING id
      `, [student.id, empId]);
      const conversationId = convRes.rows[0].id;

      await client.query(`
        INSERT INTO whatsapp_messages (conversation_id, sender_type, message_content)
        VALUES ($1, 'BOT', $2)
      `, [conversationId, `Hello ${student.first_name}, welcome to Novox Dashboard!`]);

      await client.query(`
        INSERT INTO whatsapp_messages (conversation_id, sender_type, message_content)
        VALUES ($1, 'USER', $2)
      `, [conversationId, `Hi, thank you!`]);
    }

    // 3. Create a campaign
    if (empId) {
      await client.query(`
        INSERT INTO whatsapp_campaigns (template_id, target_segment, created_by, scheduled_at, status)
        VALUES ($1, 'ALL_STUDENTS', $2, NOW() + INTERVAL '1 day', 'SCHEDULED')
      `, [templateId, empId]);
    }

    console.log("WhatsApp data seeded successfully.");
  } catch (error) {
    console.error("Error seeding WhatsApp data:", error);
  } finally {
    await client.end();
  }
}

run();
