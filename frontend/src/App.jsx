import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import EmployeeProfile from './components/EmployeeProfile';
import SupportContent from './components/SupportContent';
import Login from './components/Login';
import Signup from './components/Signup';
import Fab from './components/Fab';
import DailyPlan from './components/DailyPlan';

const initialEmployees = [
  {
    id: 1,
    eid: 'EMP001',
    name: 'Alice Johnson',
    department: 'Development',
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

const employeeStatusFromApi = (status) => {
  if (status === 'ON_LEAVE') return 'On Leave';
  if (status === 'TERMINATED') return 'Terminated';
  return 'Active';
};

const employeeDepartmentFromApi = (department) => {
  if (department === 'DEVELOPMENT') return 'Development';
  if (department === 'HR') return 'HR';
  return department ? department.charAt(0) + department.slice(1).toLowerCase() : 'Staff';
};

const getInitials = (name) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'U';
  return words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : words[0][0].toUpperCase();
};

const mapEmployeeFromApi = (d) => ({
  id: d.id,
  eid: d.employee_code || `EMP-${String(d.id).slice(0, 4)}`,
  name: `${d.first_name || ''} ${d.last_name || ''}`.trim(),
  department: employeeDepartmentFromApi(d.employee_roles?.role_name),
  designation: d.designation || '',
  phone: d.phone,
  status: employeeStatusFromApi(d.status),
  joinDate: d.joining_date ? new Date(d.joining_date).toLocaleDateString() : '',
  avatar: d.avatar_url || null
});

const mapCourseFromApi = (d) => {
  const instructorProfile = d.course_instructors?.[0]?.employee_profiles;
  const mentorName = instructorProfile
    ? `${instructorProfile.first_name || ''} ${instructorProfile.last_name || ''}`.trim()
    : 'Unassigned';

  return {
    ...d,
    title: d.name || d.title || '',
    category: d.track || d.category || 'DEVELOPMENT',
    mentorId: instructorProfile?.id || '',
    mentorName,
    mentorInitials: getInitials(mentorName),
    price: d.price || '₹0.00',
    imgUrl: d.imgUrl || null
  };
};

function App() {
  const userInfoStr = sessionStorage.getItem('userInfo');
  const initialUserInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUserInfo);
  const [userRole, setUserRole] = useState(initialUserInfo ? initialUserInfo.role : null);
  const [userInfo, setUserInfo] = useState(initialUserInfo);
  const [courses, setCourses] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const handleUserInfoUpdate = () => {
      const updatedUserInfoStr = sessionStorage.getItem('userInfo');
      if (updatedUserInfoStr) {
        setUserInfo(JSON.parse(updatedUserInfoStr));
      }
    };
    window.addEventListener('userInfoUpdated', handleUserInfoUpdate);
    return () => window.removeEventListener('userInfoUpdated', handleUserInfoUpdate);
  }, []);

  useEffect(() => {
    if (isAuthenticated && initialUserInfo?.token) {
      const headers = { Authorization: `Bearer ${initialUserInfo.token}` };
      
      // Fetch courses
      fetch('/api/v1/courses', { headers })
        .then(res => res.json())
        .then(resData => {
          if (resData?.data) setCourses(resData.data.map(mapCourseFromApi));
        })
        .catch(console.error);

      // Fetch employees
      fetch('/api/v1/employees', { headers })
        .then(res => res.json())
        .then(resData => {
          if (resData?.data) {
            setEmployees(resData.data.map(mapEmployeeFromApi));
          }
        })
        .catch(console.error);
    }
  }, [isAuthenticated]);

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    navigate('/');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    sessionStorage.removeItem('userInfo');
    navigate('/');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // We use userInfo state now
  const isHR = userRole === 'EMPLOYEE' && userInfo?.employee_role === 'HR';
  const isDesign = userRole === 'EMPLOYEE' && userInfo?.employee_role === 'DESIGN';
  const isDevelopment = userRole === 'EMPLOYEE' && userInfo?.employee_role === 'DEVELOPMENT';
  const isSales = userRole === 'EMPLOYEE' && userInfo?.employee_role === 'SALES';
  const isMarketing = userRole === 'EMPLOYEE' && userInfo?.employee_role === 'MARKETING';

  if (userRole === 'STUDENT') {
    return (
      <div className="flex flex-col h-screen w-screen bg-slate-50 font-sans text-slate-800">
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#003F87] rounded-full flex items-center justify-center shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#003F87]">Novox Student Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-700">Welcome, {userInfo?.first_name || 'Student'}!</span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded hover:bg-slate-200 transition-colors"
            >
              Log Out
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <DailyPlan userType="STUDENT" userId={userInfo?.student_profile_id || userInfo?.id} />
        </div>
      </div>
    );
  }

  const basePath = isHR ? '/hr' : isDesign ? '/design' : isDevelopment ? '/development' : isSales ? '/sales' : isMarketing ? '/marketing' : '/admin';

  const canViewEmployees = userRole === 'ADMIN' || isHR;
  const canViewPayroll = userRole === 'ADMIN' || isHR;
  const canViewRecruitment = userRole === 'ADMIN' || isHR;
  const canViewSalesCrm = userRole === 'ADMIN' || isSales;
  const canViewWhatsapp = userRole === 'ADMIN' || isSales || isMarketing;
  const canViewBlog = userRole === 'ADMIN' || isMarketing;
  const canViewSeo = userRole === 'ADMIN' || isMarketing;
  const canViewFees = userRole === 'ADMIN' || isHR || isSales;
  const canViewCourses = userRole === 'ADMIN' || userRole === 'EMPLOYEE';
  const canViewJourney = userRole === 'ADMIN' || isDevelopment || isDesign || isHR || isSales; // General

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans text-slate-800 relative">
      <Sidebar 
        userRole={userRole} 
        isHR={isHR} 
        isDesign={isDesign} 
        isDevelopment={isDevelopment} 
        isSales={isSales}
        isMarketing={isMarketing}
        basePath={basePath} 
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white min-w-0">
        <Header onLogout={handleLogout} userInfo={userInfo} basePath={basePath} />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to={`${basePath}/dashboard`} replace />} />
            <Route path={basePath} element={<Navigate to={`${basePath}/dashboard`} replace />} />
            
            <Route path={`${basePath}/dashboard`} element={<MainContent activeTab="dashboard" employees={employees} />} />
            <Route path={`${basePath}/daily-plan`} element={<DailyPlan userType={userRole} userId={userInfo?.employee_profile_id || userInfo?.id} />} />
            {/* <Route path={`${basePath}/attendance`} element={<AttendanceContent employees={employees} courses={courses} />} /> */}
            <Route path={`${basePath}/students`} element={<StudentsContent courses={courses} />} />
            <Route path={`${basePath}/work-reports`} element={<WorkReportsContent />} />
            <Route path={`${basePath}/leaderboard`} element={<LeaderboardContent />} />
            <Route path={`${basePath}/settings`} element={<SettingsContent />} />
            <Route path={`${basePath}/profile`} element={<EmployeeProfile />} />
            <Route path={`${basePath}/support`} element={<SupportContent />} />

            {canViewEmployees && <Route path={`${basePath}/employees`} element={<EmployeesContent employees={employees} setEmployees={setEmployees} />} />}
            {canViewCourses && <Route path={`${basePath}/courses`} element={<CoursesContent courses={courses} setCourses={setCourses} employees={employees} />} />}
            {canViewFees && <Route path={`${basePath}/fees`} element={<FeesContent />} />}
            {canViewPayroll && <Route path={`${basePath}/payroll`} element={<PayrollContent />} />}
            {canViewSalesCrm && <Route path={`${basePath}/sales-crm`} element={<SalesCrmContent courses={courses} />} />}
            {canViewRecruitment && <Route path={`${basePath}/recruitment`} element={<RecruitmentContent />} />}
            {canViewWhatsapp && <Route path={`${basePath}/whatsapp-automation`} element={<WhatsappContent />} />}
            {canViewJourney && <Route path={`${basePath}/journey`} element={<AcademicJourneyContent />} />}
            {canViewSeo && <Route path={`${basePath}/seo`} element={<SeoAgentContent />} />}
            {canViewBlog && <Route path={`${basePath}/blog`} element={<BlogDashboardContent />} />}
            
            <Route path="*" element={<Navigate to={`${basePath}/dashboard`} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
