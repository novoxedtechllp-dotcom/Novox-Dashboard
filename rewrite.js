const fs = require('fs');
let code = fs.readFileSync('d:/NovoxDashboard/frontend/src/features/admin/components/SettingsContent.jsx', 'utf8');

// 1. Add missing imports
code = code.replace(
  'Filter',
  'Filter,\n  Calendar,\n  Image,\n  FileText,\n  Bot'
);

code = code.replace(
  'import React, { useState, useMemo } from \'react\';',
  'import React, { useState, useMemo, useEffect } from \'react\';\nimport apiClient from \'../../../lib/apiClient\';'
);

// 2. Remove initialRoles, initialPermissions, initialStaff
code = code.replace(/const initialRoles = \[[\s\S]*?\];/g, '');
code = code.replace(/const initialPermissions = \{[\s\S]*?\};\n/g, '');
code = code.replace(/const initialStaff = \{[\s\S]*?\};\n/g, '');

// 3. Update states inside component
code = code.replace(
  'const [roles, setRoles] = useState(initialRoles);',
  'const [roles, setRoles] = useState([{ id: \'super-admin\', name: \'Super Admin\', desc: \'Full system access\' }]);'
);
code = code.replace(
  'const [permissions, setPermissions] = useState(initialPermissions);',
  'const [permissions, setPermissions] = useState({});'
);
code = code.replace(
  'const [staff, setStaff] = useState(initialStaff);',
  'const [staff, setStaff] = useState({});'
);

// 4. Add useEffect to fetch roles
const useEffectCode = `
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await apiClient.get('/roles');
        if (data?.data) {
          const fetchedRoles = data.data.roles.map(r => ({
            id: r.id,
            name: r.role_name,
            desc: r.description || 'Role'
          }));
          
          const fetchedPerms = {};
          data.data.roles.forEach(r => {
            fetchedPerms[r.id] = r.permissions || {};
          });

          // Add super admin locally
          fetchedRoles.unshift({ id: 'super-admin', name: 'Super Admin', desc: 'Full system access' });
          
          // Full access for super-admin
          fetchedPerms['super-admin'] = {
            students: { view: true, create: true, edit: true, delete: true, export: true },
            employees: { view: true, create: true, edit: true, delete: true, export: true },
            courses: { view: true, create: true, edit: true, delete: true, export: true },
            fees: { view: true, create: true, edit: true, delete: true, export: true },
            sales: { view: true, create: true, edit: true, delete: true, export: true },
            attendance: { view: true, create: true, edit: true, delete: true, export: true },
            gallery: { view: true, create: true, edit: true, delete: true, export: true },
            leave: { view: true, create: true, edit: true, delete: true, export: true },
            'work-reports': { view: true, create: true, edit: true, delete: true, export: true },
            'blog-agent': { view: true, create: true, edit: true, delete: true, export: true }
          };

          setRoles(fetchedRoles);
          setPermissions(fetchedPerms);

          // Map staff
          const staffMap = { 'super-admin': [] };
          data.data.roles.forEach(r => staffMap[r.id] = []);
          
          if (data.data.staff) {
            data.data.staff.forEach(s => {
              if (s.role_id && staffMap[s.role_id]) {
                staffMap[s.role_id].push({
                  name: \`\${s.first_name} \${s.last_name}\`,
                  role: s.designation,
                  avatar: s.avatar_url || \`\${s.first_name[0]}\${s.last_name[0]}\`
                });
              }
            });
          }
          setStaff(staffMap);
        }
      } catch (err) {
        console.error('Failed to fetch roles', err);
      }
    };
    fetchRoles();
  }, []);
`;

code = code.replace(
  'const [assignFilter, setAssignFilter] = useState(\'all\');',
  'const [assignFilter, setAssignFilter] = useState(\'all\');\n' + useEffectCode
);

// 5. Update handleCreateRoleSubmit
code = code.replace(
  /const handleCreateRoleSubmit = \(e\) => \{[\s\S]*?setToastText\(`Role '\$\{newRoleName\}' created successfully!`\);\n    setShowToast\(true\);\n    setTimeout\(\(\) => setShowToast\(false\), 3000\);\n  \};/g,
  `const handleCreateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoleName) return;
    
    try {
      const { data } = await apiClient.post('/roles', {
        role_name: newRoleName,
        description: newRoleDesc,
        permissions: {}
      });
      
      const newRole = data.data;
      const roleId = newRole.id;
      
      setRoles(prev => [...prev, { id: roleId, name: newRoleName, desc: newRoleDesc || \`\${newRoleName} Role\` }]);
      setPermissions(prev => ({
        ...prev,
        [roleId]: {}
      }));
      setStaff(prev => ({ ...prev, [roleId]: [] }));
      setSelectedRoleId(roleId);

      setIsCreateRoleOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      setToastText(\`Role '\${newRoleName}' created successfully!\`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setToastText(err.response?.data?.message || 'Failed to create role');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };`
);

// 6. Update handlePermissionsSave
code = code.replace(
  /const handlePermissionsSave = \(\) => \{[\s\S]*?setTimeout\(\(\) => setShowToast\(false\), 3000\);\n  \};/g,
  `const handlePermissionsSave = async () => {
    if (selectedRoleId === 'super-admin') {
      setToastText('Super Admin permissions cannot be edited.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    try {
      await apiClient.put(\`/roles/\${selectedRoleId}\`, {
        permissions: permissions[selectedRoleId]
      });
      setToastText('Permissions saved successfully.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setToastText('Failed to save permissions');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };`
);

// 7. Update handleResetPermissions (remove the hardcoded initialPermissions fallback and just reset locally)
code = code.replace(
  /const handleResetPermissions = \(\) => \{[\s\S]*?setTimeout\(\(\) => setShowToast\(false\), 3000\);\n  \};/g,
  `const handleResetPermissions = () => {
    // Just force a refetch or clear the current role
    setPermissions(prev => ({
        ...prev,
        [selectedRoleId]: {}
    }));
    setToastText('Permissions cleared for this role. Save to apply.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };`
);

// 8. Update modules table mapping
code = code.replace(
  /\{\[[\s\S]*?\]\.map\(\(mod\) => \{/g,
  `{[
    { key: 'students', label: 'Students', icon: GraduationCap },
    { key: 'employees', label: 'Employees', icon: Briefcase },
    { key: 'courses', label: 'Courses', icon: BookOpen },
    { key: 'fees', label: 'Fees & Revenue', icon: CreditCard },
    { key: 'sales', label: 'Sales CRM', icon: Handshake },
    { key: 'attendance', label: 'Attendance', icon: Calendar },
    { key: 'gallery', label: 'Gallery', icon: Image },
    { key: 'leave', label: 'Leave Management', icon: FileText },
    { key: 'work-reports', label: 'Work Reports', icon: FileText },
    { key: 'blog-agent', label: 'Blog Agent', icon: Bot },
  ].map((mod) => {`
);

// 9. Disable checkboxes for super-admin
code = code.replace(
  /onChange=\{\(\) => togglePermission\(mod\.key, 'view'\)\}/g,
  `onChange={() => togglePermission(mod.key, 'view')} disabled={selectedRoleId === 'super-admin'}`
);
code = code.replace(
  /onChange=\{\(\) => togglePermission\(mod\.key, 'create'\)\}/g,
  `onChange={() => togglePermission(mod.key, 'create')} disabled={selectedRoleId === 'super-admin'}`
);
code = code.replace(
  /onChange=\{\(\) => togglePermission\(mod\.key, 'edit'\)\}/g,
  `onChange={() => togglePermission(mod.key, 'edit')} disabled={selectedRoleId === 'super-admin'}`
);
code = code.replace(
  /onChange=\{\(\) => togglePermission\(mod\.key, 'delete'\)\}/g,
  `onChange={() => togglePermission(mod.key, 'delete')} disabled={selectedRoleId === 'super-admin'}`
);
code = code.replace(
  /onChange=\{\(\) => togglePermission\(mod\.key, 'export'\)\}/g,
  `onChange={() => togglePermission(mod.key, 'export')} disabled={selectedRoleId === 'super-admin'}`
);

// Disable Select All View for super-admin
code = code.replace(
  /onChange=\{toggleSelectAllView\}/g,
  `onChange={toggleSelectAllView} disabled={selectedRoleId === 'super-admin'}`
);

fs.writeFileSync('d:/NovoxDashboard/frontend/src/features/admin/components/SettingsContent.jsx', code);
console.log('Done rewriting SettingsContent.jsx');
