const fs = require('fs');
let code = fs.readFileSync('d:/NovoxDashboard/frontend/src/features/admin/components/SettingsContent.jsx', 'utf8');

// 1. Fix import
code = code.replace(
  "import apiClient from '../../../lib/apiClient';",
  "import { apiClient } from '../../../lib/apiClient';"
);

// 2. Fix GET call
code = code.replace(
  "const { data } = await apiClient.get('/roles');",
  "const data = await apiClient('/roles');"
);

// 3. Fix POST call
code = code.replace(
  /const \{ data \} = await apiClient\.post\('\/roles', \{[\s\S]*?\}\);/,
  `const data = await apiClient('/roles', {
        method: 'POST',
        body: JSON.stringify({
          role_name: newRoleName,
          description: newRoleDesc,
          permissions: {}
        })
      });`
);

// 4. Fix PUT call
code = code.replace(
  /await apiClient\.put\(`\/roles\/\$\{selectedRoleId\}`\, \{[\s\S]*?\}\);/,
  `await apiClient(\`/roles/\${selectedRoleId}\`, {
        method: 'PUT',
        body: JSON.stringify({
          permissions: permissions[selectedRoleId]
        })
      });`
);

fs.writeFileSync('d:/NovoxDashboard/frontend/src/features/admin/components/SettingsContent.jsx', code);
console.log('Fixed apiClient calls in SettingsContent.jsx');
