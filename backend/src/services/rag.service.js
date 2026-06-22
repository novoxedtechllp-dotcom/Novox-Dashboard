import { GoogleGenAI } from '@google/genai';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
// It will automatically use process.env.GEMINI_API_KEY if not passed, but we pass it explicitly just in case
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const schemaPath = path.resolve(__dirname, '../db/schema.sql');
let dbSchema = '';
try {
  dbSchema = fs.readFileSync(schemaPath, 'utf8');
} catch (error) {
  console.error("Could not load schema.sql for RAG service:", error);
}

export const askRagBot = async (question, userRole) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  // Step 1: Use Gemini to generate a SQL query based on the schema and question
  const prompt1 = `You are an expert PostgreSQL database developer.
I need a SQL query to answer the following question: "${question}"

The user asking this question has the role: ${userRole}. Only fetch data they are allowed to see based on common sense.

Here is the database schema:
${dbSchema}

IMPORTANT RULES:
1. Generate ONLY a single, valid PostgreSQL SELECT query.
2. DO NOT wrap the query in markdown blocks (no \`\`\`sql ... \`\`\`). Just return the raw SQL string.
3. Do not include any explanations.
4. DO NOT generate INSERT, UPDATE, DELETE, DROP, or ALTER statements.
5. Use double quotes for column names if necessary, but standard SQL is preferred.
6. SECURITY GUARDRAIL: If the question is asking for personal advice, contains vulgarity/profanity, or is completely unrelated to querying this database, return the exact word "REJECT" and nothing else.`;

  let response1;
  try {
    response1 = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using 2.5-flash as the fallback/standard for the genai sdk
      contents: prompt1,
    });
  } catch (error) {
     // fallback to flash-lite if needed
     try {
       response1 = await ai.models.generateContent({
         model: 'gemini-2.5-flash-lite',
         contents: prompt1,
       });
     } catch(e) {
       console.log("Error generating content:", e);
       throw new Error("Failed to generate SQL query with Gemini.");
     }
  }

  let sqlQuery = response1.text.trim();
  
  if (sqlQuery.toUpperCase() === 'REJECT') {
    return "I am a business assistant. I can only answer work-related questions regarding the company database, and I cannot answer off-topic, personal, or inappropriate questions.";
  }

  // Clean up markdown just in case the model ignored instructions
  if (sqlQuery.startsWith('```sql')) {
    sqlQuery = sqlQuery.substring(6);
  } else if (sqlQuery.startsWith('```')) {
    sqlQuery = sqlQuery.substring(3);
  }
  if (sqlQuery.endsWith('```')) {
    sqlQuery = sqlQuery.substring(0, sqlQuery.length - 3);
  }
  sqlQuery = sqlQuery.trim();

  // Basic sanity check to prevent obvious non-select queries
  if (!sqlQuery.toUpperCase().startsWith('SELECT') && !sqlQuery.toUpperCase().startsWith('WITH')) {
    throw new Error("Generated query is not a SELECT statement.");
  }

  // Step 2: Execute query safely
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  let queryResult;
  try {
    await client.connect();
    // Enforce read-only transaction for absolute safety against accidental writes
    await client.query('BEGIN READ ONLY');
    const result = await client.query(sqlQuery);
    queryResult = result.rows;
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Generated SQL failed:", sqlQuery, error);
    throw new Error(`Database query failed.`);
  } finally {
    await client.end();
  }

  // Step 3: Use Gemini again to synthesize the answer
  const prompt2 = `You are a helpful AI assistant for an employee/admin dashboard. 
A user with role ${userRole} asked the following question: "${question}"

To help answer this, a database query was executed. 
Here are the results (in JSON format):
${JSON.stringify(queryResult)}

CRITICAL RULES:
1. Synthesize a clear, accurate, and concise answer to the user's question based ONLY on the provided data. 
2. Do not mention that you queried a database or executed SQL. 
3. If the data is empty or insufficient, politely say that no relevant information was found.
4. GUARDRAIL: If the user's question contains vulgarity, personal details, or is completely unrelated to business, politely refuse to answer.`;

  let response2;
  try {
    response2 = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt2,
    });
  } catch (error) {
    try {
      response2 = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt2,
      });
    } catch(e) {
      throw new Error("Failed to synthesize answer with Gemini.");
    }
  }

  return response2.text;
};
