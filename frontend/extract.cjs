const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\a1c81e23-c63a-4e6d-9fbd-89f18e2245f7\\.system_generated\\logs\\transcript.jsonl', 'utf-8');
const lines = content.split('\n');

let fileLines = Array(1500).fill(null);
let isCoursesContent = false;

for (let i = 0; i < lines.length; i++) {
  if (!lines[i]) continue;
  try {
    const step = JSON.parse(lines[i]);
    if (step.source === 'SYSTEM' && step.content) {
      let text = typeof step.content === 'string' ? step.content : JSON.stringify(step.content);
      
      if (text.includes('File Path: `file:///d:/NovoxDashboard/frontend/src/components/CoursesContent.jsx`') || 
          text.includes('File Path: `file:///D:/NovoxDashboard/frontend/src/components/CoursesContent.jsx`')) {
         isCoursesContent = true;
      }
      if (text.includes('File Path:') && !text.includes('CoursesContent.jsx')) {
         isCoursesContent = false;
      }

      if (isCoursesContent && text.includes('Showing lines')) {
        const parts = text.split(/\\n|\n/);
        for (const p of parts) {
           const match = p.match(/^(\d+): (.*)/);
           if (match) {
             const num = parseInt(match[1], 10);
             let lineText = match[2];
             // clean up json escape if it was stringified
             lineText = lineText.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
             if (lineText.endsWith('"') && !p.endsWith('}"')) lineText = lineText.slice(0, -1);
             fileLines[num] = lineText;
           }
        }
      }
    }
  } catch(e) {}
}

const finalLines = [];
for (let i = 1; i <= 1050; i++) {
  if (fileLines[i] !== null) {
    finalLines.push(fileLines[i]);
  } else {
    finalLines.push('// MISSING LINE ' + i);
  }
}

fs.writeFileSync('D:\\NovoxDashboard\\frontend\\src\\components\\CoursesContent_recovered.jsx', finalLines.join('\n'));
console.log('Recovered to CoursesContent_recovered.jsx');
