import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './features/admin/components/MainContent';
import AttendanceContent from './features/admin/components/AttendanceContent';
import LeaveManagementContent from './features/admin/components/LeaveManagementContent';
import StudentsContent from './features/student/components/StudentsContent';
import EmployeesContent from './features/admin/components/EmployeesContent';
import CoursesContent from './features/admin/components/CoursesContent';
import FeesContent from './features/admin/components/FeesContent';
import SalesCrmContent from './features/employee/marketing/components/SalesCrmContent';
import WhatsappContent from './features/employee/marketing/components/WhatsappContent';
import LeaderboardContent from './features/admin/components/LeaderboardContent';
import AcademicJourneyContent from './features/student/components/AcademicJourneyContent';
import SeoAgentContent from './features/employee/marketing/components/SeoAgentContent';
import PayrollContent from './features/admin/components/PayrollContent';
import WorkReportsContent from './features/employee/components/WorkReportsContent';
import RecruitmentContent from './features/admin/components/RecruitmentContent';
import BlogDashboardContent from './features/employee/marketing/components/BlogDashboardContent';
import SettingsContent from './features/admin/components/SettingsContent';
import EmployeeProfile from './features/employee/components/EmployeeProfile';
import SupportContent from './features/admin/components/SupportContent';
import Login from './features/auth/components/Login';
import Signup from './features/auth/components/Signup';
import Fab from './components/Fab';
import DailyPlan from './features/employee/components/DailyPlan';

// Employee Components
import EmployeeSidebar from './features/employee/components/EmployeeSidebar';
import EmployeeHeader from './features/employee/components/EmployeeHeader';
import EmployeeDashboard from './features/employee/components/EmployeeDashboard';
import EmployeeTasks from './features/employee/components/EmployeeTasks';
import EmployeeLeave from './features/employee/components/EmployeeLeave';
import EmployeeAttendance from './features/employee/components/EmployeeAttendance';
import EmployeeLeaves from './features/employee/components/EmployeeLeaves';

// Mock data removed

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
  avatar: d.avatar_url || null,
  email: d.users?.email || '',
  systemRole: d.users?.role || 'EMPLOYEE'
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
  const [searchQuery, setSearchQuery] = useState('');
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
    if (isAuthenticated && userInfo?.token) {
      const headers = { Authorization: `Bearer ${userInfo.token}` };
      
      // Fetch courses
      fetch('/api/v1/courses', { headers })
        .then(res => {
          if (!res.ok) throw new Error(`Courses API error: ${res.status}`);
          return res.json();
        })
        .then(resData => {
          if (resData?.data) setCourses(resData.data.map(mapCourseFromApi));
        })
        .catch(err => console.error('Failed to fetch courses:', err));

      // Fetch employees
      fetch('/api/v1/employees', { headers })
        .then(res => {
          if (!res.ok) throw new Error(`Employees API error: ${res.status}`);
          return res.json();
        })
        .then(resData => {
          if (resData?.data) {
            setEmployees(resData.data.map(mapEmployeeFromApi));
          }
        })
        .catch(err => console.error('Failed to fetch employees:', err));
    }
  }, [isAuthenticated, userInfo]);

  const handleLogin = (role) => {
    const updatedUserInfoStr = sessionStorage.getItem('userInfo');
    if (updatedUserInfoStr) {
      setUserInfo(JSON.parse(updatedUserInfoStr));
    }
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserInfo(null);
    sessionStorage.removeItem('userInfo');
    localStorage.removeItem('userInfo');
  };



  const isHR = userRole === 'EMPLOYEE' && userInfo?.employee_role === 'HR';
  const isDesign = userRole === 'EMPLOYEE' && userInfo?.employee_role === 'DESIGN';
  const isDevelopment = userRole === 'EMPLOYEE' && userInfo?.employee_role === 'DEVELOPMENT';
  const isSales = userRole === 'EMPLOYEE' && userInfo?.employee_role === 'SALES';
  const isMarketing = userRole === 'EMPLOYEE' && userInfo?.employee_role === 'MARKETING';

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans text-slate-800 relative">
      {isAuthenticated && userRole !== 'STUDENT' && (
        <Sidebar 
          userRole={userRole} 
          isHR={isHR} 
          isDesign={isDesign} 
          isDevelopment={isDevelopment} 
          isSales={isSales}
          isMarketing={isMarketing}
          basePath={basePath}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onLogout={handleLogout}
        />
      )}
      
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white min-w-0">
        {isAuthenticated && userRole !== 'STUDENT' && (
          <Header 
            onLogout={handleLogout} 
            userInfo={userInfo} 
            basePath={basePath} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}

        <div className="flex-1 overflow-y-auto">
          <Routes>
            {!isAuthenticated ? (
              <>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : userRole === 'STUDENT' ? (
              <Route path="*" element={
                <div className="flex flex-col h-full w-full bg-slate-50">
                  <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                      <img src="/novox-edtech-calicut-logo.png" alt="Novox Edtech" className="h-[32px] object-contain" />
                      <h1 className="text-xl font-bold text-[#003F87]">Student Portal</h1>
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
                  <div className="flex-1 overflow-y-auto">
                    <DailyPlan userType="STUDENT" userId={userInfo?.student_profile_id || userInfo?.id} />
                  </div>
                </div>
              } />
            ) : (
              <>
                <Route path="/" element={<Navigate to={`${basePath}/dashboard`} replace />} />
                <Route path={basePath} element={<Navigate to={`${basePath}/dashboard`} replace />} />
                
                <Route path={`${basePath}/dashboard`} element={userRole === 'EMPLOYEE' ? <EmployeeDashboard /> : <MainContent activeTab="dashboard" employees={employees} />} />
                <Route path={`${basePath}/daily-plan`} element={<DailyPlan userType={userRole} userId={userInfo?.employee_profile_id || userInfo?.id} />} />
                <Route path={`${basePath}/attendance`} element={userRole === 'EMPLOYEE' ? <EmployeeAttendance courses={courses} /> : <AttendanceContent employees={employees} courses={courses} />} />
                <Route path={`${basePath}/leave`} element={(userRole === 'ADMIN' || isHR) ? <LeaveManagementContent /> : (userRole === 'EMPLOYEE' ? <EmployeeLeave /> : <Navigate to={`${basePath}/dashboard`} />)} />
                <Route path={`${basePath}/students`} element={<StudentsContent courses={courses} searchQuery={searchQuery} />} />
                <Route path={`${basePath}/work-reports`} element={<WorkReportsContent />} />
                <Route path={`${basePath}/leaderboard`} element={<LeaderboardContent />} />
                <Route path={`${basePath}/settings`} element={<SettingsContent />} />
                <Route path={`${basePath}/profile`} element={<EmployeeProfile />} />
                <Route path={`${basePath}/support`} element={<SupportContent />} />

                {canViewEmployees && <Route path={`${basePath}/employees`} element={<EmployeesContent employees={employees} setEmployees={setEmployees} searchQuery={searchQuery} />} />}
                {canViewCourses && <Route path={`${basePath}/courses`} element={<CoursesContent courses={courses} setCourses={setCourses} employees={employees} searchQuery={searchQuery} />} />}
                {canViewFees && <Route path={`${basePath}/fees`} element={<FeesContent />} />}
                {canViewPayroll && <Route path={`${basePath}/payroll`} element={<PayrollContent />} />}
                {canViewSalesCrm && <Route path={`${basePath}/sales-crm`} element={<SalesCrmContent courses={courses} />} />}
                {canViewRecruitment && <Route path={`${basePath}/recruitment`} element={<RecruitmentContent />} />}
                {canViewWhatsapp && <Route path={`${basePath}/whatsapp-automation`} element={<WhatsappContent />} />}
                {canViewJourney && <Route path={`${basePath}/journey`} element={<AcademicJourneyContent />} />}
                {canViewSeo && <Route path={`${basePath}/seo`} element={<SeoAgentContent />} />}
                {canViewBlog && <Route path={`${basePath}/blog`} element={<BlogDashboardContent />} />}
                
                <Route path="*" element={<Navigate to={`${basePath}/dashboard`} replace />} />
              </>
            )}
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
