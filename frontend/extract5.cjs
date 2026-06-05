const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\a1c81e23-c63a-4e6d-9fbd-89f18e2245f7\\.system_generated\\logs\\transcript.jsonl', 'utf-8');

const idx = content.lastIndexOf('export default CoursesContent');
if (idx !== -1) {
   const startIdx = content.lastIndexOf('import { useState', idx);
   if (startIdx !== -1) {
      let fileText = content.substring(startIdx, idx + 40);
      
      // The transcript might be json-escaped if it's inside a json string.
      // E.g. \n instead of actual newline, \" instead of ".
      // Actually, if we just parse the whole file line by line, it's safer.
      
      // Let's just do a simple replacement for json encoded newlines
      fileText = fileText.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\t/g, '\t');
      
      const lines = fileText.split('\n');
      const cleanLines = lines.map(line => {
         const match = line.match(/^(\d+):\s(.*)/);
         if (match) return match[2];
         return line;
      });
      fs.writeFileSync('D:\\NovoxDashboard\\frontend\\src\\components\\CoursesContent_latest.jsx', cleanLines.join('\n'));
      console.log('Saved to CoursesContent_latest.jsx', cleanLines.length, 'lines');
   }
}
