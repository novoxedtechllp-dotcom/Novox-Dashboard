const fs = require('fs');
let code = fs.readFileSync('d:/NovoxDashboard/frontend/src/components/Sidebar.jsx', 'utf8');

// Update Sidebar props
code = code.replace(
  'const Sidebar = ({ userRole, isHR, isDesign, isDevelopment, isSales, isMarketing, isAccounts, basePath = \'/admin\', isOpen, setIsOpen, onLogout }) => {',
  'const Sidebar = ({ userRole, permissions = {}, isHR, isDesign, isDevelopment, isSales, isMarketing, isAccounts, basePath = \'/admin\', isOpen, setIsOpen, onLogout }) => {'
);

// Replace visibility logic
const newLogic = `else if (userRole !== 'ADMIN') {
    const hiddenItems = [];
    
    // Evaluate hidden items based on permissions
    if (!permissions.employees?.view) hiddenItems.push('employees', 'recruitment');
    if (!permissions.courses?.view) hiddenItems.push('courses');
    if (!permissions.fees?.view) hiddenItems.push('fees', 'payroll');
    if (!permissions.sales?.view) hiddenItems.push('sales-crm');
    if (!permissions.whatsapp?.view) hiddenItems.push('whatsapp-automation');
    if (!permissions.attendance?.view) hiddenItems.push('attendance');
    if (!permissions.gallery?.view) hiddenItems.push('gallery');
    if (!permissions.leave?.view) hiddenItems.push('leave');
    if (!permissions['work-reports']?.view) hiddenItems.push('work-reports');
    if (!permissions['blog-agent']?.view) hiddenItems.push('blog-agent', 'seo');

    if (userRole === 'STUDENT') {
      hiddenItems.push('courses', 'students');
    }
    
    visibleNavItems = navItems.filter(item => !hiddenItems.includes(item.id))
      .map(item => {
        if (item.id === 'leave') {
          return { ...item, label: userRole === 'STUDENT' ? 'Leave Requests' : 'Leave Management' };
        }
        return item;
      });
  }`;

code = code.replace(
  /else if \(userRole !== 'ADMIN'\) \{[\s\S]*?if \(userRole === 'STUDENT'\) \{[\s\S]*?\}\s*visibleNavItems = navItems\.filter[\s\S]*?return item;\s*\};\s*\}/,
  newLogic
);

fs.writeFileSync('d:/NovoxDashboard/frontend/src/components/Sidebar.jsx', code);
console.log('Sidebar.jsx updated');
