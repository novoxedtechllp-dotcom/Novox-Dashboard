import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/MainContent';
import AttendanceContent from './components/AttendanceContent';
import StudentsContent from './components/StudentsContent';
import EmployeesContent from './components/EmployeesContent';
import CoursesContent from './components/CoursesContent';
import FeesContent from './components/FeesContent';
import SalesCrmContent from './components/SalesCrmContent';
import WhatsappContent from './components/WhatsappContent';
import LeaderboardContent from './components/LeaderboardContent';
import AcademicJourneyContent from './components/AcademicJourneyContent';
import SeoAgentContent from './components/SeoAgentContent';
import PayrollContent from './components/PayrollContent';
import WorkReportsContent from './components/WorkReportsContent';
import RecruitmentContent from './components/RecruitmentContent';
import BlogDashboardContent from './components/BlogDashboardContent';
import SettingsContent from './components/SettingsContent';
import SupportContent from './components/SupportContent';
import Login from './components/Login';
import Fab from './components/Fab';

const initialEmployees = [
  {
    id: 1,
    eid: 'EMP001',
    name: 'Alice Johnson',
    department: 'Engineering',
    phone: '+1 (555) 123-4567',
    status: 'Active',
    joinDate: 'Jan 2023',
    avatar: null
  },
  {
    id: 2,
    eid: 'EMP002',
    name: 'Bob Smith',
    department: 'Marketing',
    phone: '+1 (555) 987-6543',
    status: 'On Leave',
    joinDate: 'Mar 2023',
    avatar: null
  }
];

// Employee Components
import EmployeeSidebar from './components/employee/EmployeeSidebar';
import EmployeeHeader from './components/employee/EmployeeHeader';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import EmployeeTasks from './components/employee/EmployeeTasks';
import EmployeeAttendance from './components/employee/EmployeeAttendance';
import EmployeePayroll from './components/employee/EmployeePayroll';
import EmployeeSettings from './components/employee/EmployeeSettings';

const initialCourses = [
  {
    id: 1,
    category: 'DEVELOPMENT',
    title: 'Full Stack Web Engineering',
    duration: '24 Weeks',
    price: '$1,200.00',
    mentorName: 'Sarah Mitchell',
    mentorInitials: 'SM',
    imgUrl: null
  },
  {
    id: 2,
    category: 'MARKETING',
    title: 'Advanced Digital Strategy',
    duration: '12 Weeks',
    price: '$850.00',
    mentorName: 'David Chen',
    mentorInitials: 'DC',
    imgUrl: null
  },
  {
    id: 3,
    category: 'DESIGN',
    title: 'UI/UX Design Masterclass',
    duration: '16 Weeks',
    price: '$990.00',
    mentorName: 'Elena Lopez',
    mentorInitials: 'EL',
    imgUrl: null
  },
  {
    id: 4,
    category: 'HR',
    title: 'Strategic HR Management',
    duration: '8 Weeks',
    price: '$600.00',
    mentorName: 'James Baxter',
    mentorInitials: 'JB',
    imgUrl: null
  },
  {
    id: 5,
    category: 'DEVELOPMENT',
    title: 'Data Science & Analytics',
    duration: '20 Weeks',
    price: '$1,450.00',
    mentorName: 'Rajiv Kapoor',
    mentorInitials: 'RK',
    imgUrl: null
  }
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [courses, setCourses] = useState(initialCourses);
  const [employees, setEmployees] = useState(initialEmployees);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={(role) => { setIsAuthenticated(true); setUserRole(role); }} />;
  }

  if (userRole === 'Employee') {
    return (
      <div className="flex h-screen w-screen bg-white overflow-hidden font-sans text-slate-800 relative">
        <EmployeeSidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white min-w-0">
          <EmployeeHeader onLogout={() => setIsAuthenticated(false)} />
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
              <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
              <Route path="/employee/tasks" element={<EmployeeTasks />} />
              <Route path="/employee/attendance" element={<EmployeeAttendance />} />
              <Route path="/employee/payroll" element={<EmployeePayroll />} />
              <Route path="/employee/settings" element={<EmployeeSettings />} />
              <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans text-slate-800 relative">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white min-w-0">
        <Header onLogout={() => setIsAuthenticated(false)} />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<MainContent activeTab="dashboard" employees={employees} />} />
            <Route path="/attendance" element={<AttendanceContent employees={employees} courses={courses} />} />
            <Route path="/students" element={<StudentsContent courses={courses} />} />
            <Route path="/employees" element={<EmployeesContent employees={employees} setEmployees={setEmployees} />} />
            <Route path="/courses" element={<CoursesContent courses={courses} setCourses={setCourses} employees={employees} />} />
            <Route path="/fees" element={<FeesContent />} />
            <Route path="/payroll" element={<PayrollContent />} />
            <Route path="/work-reports" element={<WorkReportsContent />} />
            <Route path="/sales-crm" element={<SalesCrmContent courses={courses} />} />
            <Route path="/recruitment" element={<RecruitmentContent />} />
            <Route path="/whatsapp-automation" element={<WhatsappContent />} />
            <Route path="/leaderboard" element={<LeaderboardContent />} />
            <Route path="/journey" element={<AcademicJourneyContent />} />
            <Route path="/seo" element={<SeoAgentContent />} />
            <Route path="/settings" element={<SettingsContent />} />
            <Route path="/support" element={<SupportContent />} />
            <Route path="/blog" element={<BlogDashboardContent />} />
          </Routes>
        </div>
      </main>
      
      
    </div>
  );
}

export default App;
