const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// List of shared components left in src/components
const sharedComponents = [
  'AddBtn', 'Fab', 'Header', 'LoadingSpinner', 'LowerContent', 'Sidebar', 'StatsGrid'
];

function getDepth(filePath) {
  const relative = path.relative(srcDir, path.dirname(filePath));
  if (!relative) return 0;
  return relative.split(path.sep).length;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      const depth = getDepth(fullPath);
      const prefix = depth === 0 ? './components/' : '../'.repeat(depth) + 'components/';

      for (const comp of sharedComponents) {
        const regex = new RegExp(`from\\s+['"](\\.\\/|\\.\\.\\/|\\.\\.\\/\\.\\.\\/)?${comp}['"]`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `from '${prefix}${comp}'`);
          changed = true;
        }
        
        // Also catch imports like import { Icon } from "lucide-react"; (not what we need, but just in case)
      }
      
      // Also fix imports like import "./Login.css" to import "../styles/Login.css"
      // or similar relative css imports
      // Actually only Login.jsx imports Login.css which we already fixed.
      // But let's check for any css imports.
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated imports in ${path.relative(srcDir, fullPath)}`);
      }
    }
  }
}

processDirectory(srcDir);
