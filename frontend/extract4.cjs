const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\a1c81e23-c63a-4e6d-9fbd-89f18e2245f7\\.system_generated\\logs\\transcript.jsonl', 'utf-8');
const lines = content.split('\n');

let fileContentArray = Array(1500).fill(null);
let maxLineNum = 0;

for (let i = 0; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  try {
    const step = JSON.parse(lines[i]);
    if (step.source === 'SYSTEM' && step.content) {
       for (const item of step.content) {
          if (item.type === 'text' && typeof item.text === 'string') {
             if (item.text.includes('CoursesContent.jsx') && item.text.includes('Showing lines')) {
                 const textLines = item.text.split('\n');
                 for (const textLine of textLines) {
                    const match = textLine.match(/^(\d+): (.*)/);
                    if (match) {
                       const lineNum = parseInt(match[1], 10);
                       const lineText = match[2];
                       fileContentArray[lineNum] = lineText;
                       if (lineNum > maxLineNum) maxLineNum = lineNum;
                    }
                 }
             }
          }
       }
    }
  } catch(e) {}
}

const finalFile = [];
for (let i = 1; i <= maxLineNum; i++) {
  if (fileContentArray[i] !== null) {
     finalFile.push(fileContentArray[i]);
  } else {
     finalFile.push('// MISSING LINE ' + i);
  }
}

fs.writeFileSync('D:\\NovoxDashboard\\frontend\\src\\components\\CoursesContent_reconstructed.jsx', finalFile.join('\n'));
console.log('Reconstructed file with max lines:', maxLineNum);
