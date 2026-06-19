import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './features/admin/components/MainContent';
import AttendanceContent from './features/admin/components/AttendanceContent';
import LeaveManagementContent from './features/admin/components/LeaveManagementContent';
import StudentsContent from './features/student/components/StudentsContent';
import EmployeesContent from './features/admin/components/EmployeesContent';
import StudentDashboard from './features/student/components/StudentDashboard';
import StudentAttendance from './features/student/components/StudentAttendance';
import StudentLeave from './features/student/components/StudentLeave';
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
import BlogAgentHub from './features/employee/marketing/components/BlogAgentHub';
import BlogAgentEditor from './features/employee/marketing/components/BlogAgentEditor';
import SettingsContent from './features/admin/components/SettingsContent';
import EmployeeProfile from './features/employee/components/EmployeeProfile';
import SupportContent from './features/admin/components/SupportContent';
import Login from './features/auth/components/Login';
import StudentLogin from './features/auth/components/StudentLogin';
import Signup from './features/auth/components/Signup';
import GalleryContent from './components/GalleryContent';
import Fab from './components/Fab';
import DailyPlan from './features/employee/components/DailyPlan';
import StudentTasks from './features/student/components/StudentTasks';
import StudentProfile from './features/student/components/StudentProfile';
import StudentJobs from './features/student/components/jobs/StudentJobs';
import StudentAcademicJourney from './features/student/components/StudentAcademicJourney';

// Employee Components
import EmployeeSidebar from './features/employee/components/EmployeeSidebar';
import EmployeeHeader from './features/employee/components/EmployeeHeader';
import EmployeeDashboard from './features/employee/components/EmployeeDashboard';
import EmployeeTasks from './features/employee/components/EmployeeTasks';
import EmployeeLeave from './features/employee/components/EmployeeLeave';
import EmployeeAttendance from './features/employee/components/EmployeeAttendance';
import EmployeeLeaves from './features/employee/components/EmployeeLeaves';
import DailySchedule from './features/student/components/DailySchedule';

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

const mapEmployeeFromApi = (d) => {
  const id = d.id || d._id;
  return {
    id,
    eid: d.employee_code || `EMP-${String(id).slice(0, 4)}`,
    name: `${d.first_name || ''} ${d.last_name || ''}`.trim(),
    department: employeeDepartmentFromApi(d.employee_roles?.role_name),
  designation: d.designation || '',
  phone: d.phone,
  status: employeeStatusFromApi(d.status),
  joinDate: d.joining_date ? new Date(d.joining_date).toLocaleDateString() : '',
  avatar: d.avatar_url || null,
  email: d.users?.email || '',
  systemRole: d.users?.role || 'EMPLOYEE',
  courseIds: d.course_instructors?.map(ci => ci.course_id || ci.courses?.id) || []
  };
};

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
    price: d.total_fee ? `₹${d.total_fee}` : (d.price || '₹0.00'),
    imgUrl: d.imgUrl || null
  };
};

function App() {
  const userInfoStr = sessionStorage.getItem('userInfo');
  const initialUserInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUserInfo);
  const [logoutPath, setLogoutPath] = useState('/login');
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

      // Fetch employees (Only if not STUDENT)
      if (userInfo.role !== 'STUDENT') {
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
    setLogoutPath(userRole === 'STUDENT' ? '/student-login' : '/login');
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
  const isAccounts = userRole === 'EMPLOYEE' && userInfo?.employee_role === 'ACCOUNTS';

  const basePath = userRole === 'STUDENT' ? '/student' :
    isHR ? '/hr' : isDesign ? '/design' : isDevelopment ? '/development' : isSales ? '/sales' : isMarketing ? '/marketing' : isAccounts ? '/accounts' : '/admin';

  const canViewEmployees = userRole === 'ADMIN' || isHR;
  const canViewPayroll = userRole === 'ADMIN' || isHR || isAccounts;
  const canViewRecruitment = userRole === 'ADMIN' || isHR;
  const canViewSalesCrm = userRole === 'ADMIN' || isSales;
  const canViewWhatsapp = userRole === 'ADMIN' || isSales || isMarketing;
  const canViewBlog = userRole === 'ADMIN' || isMarketing;
  const canViewSeo = userRole === 'ADMIN' || isMarketing;
  const canViewFees = userRole === 'ADMIN' || isHR || isSales || isAccounts;
  const canViewCourses = userRole === 'ADMIN' || userRole === 'EMPLOYEE';
  const canViewJourney = userRole === 'ADMIN' || isDevelopment || isDesign || isHR || isSales || isAccounts; // General
  const canViewGallery = userRole === 'ADMIN' || isMarketing;

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans text-slate-800 relative">
      {isAuthenticated && (
        <Sidebar
          userRole={userRole}
          isHR={isHR}
          isDesign={isDesign}
          isDevelopment={isDevelopment}
          isSales={isSales}
          isMarketing={isMarketing}
          isAccounts={isAccounts}
          basePath={basePath}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onLogout={handleLogout}
        />
      )}

      <div className={`flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300 ${isSidebarOpen ? 'lg:pl-0' : 'lg:pl-0'}`}>

        {isAuthenticated && (
          <Header
            userRole={userRole}
            userInfo={userInfo}
            basePath={basePath}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onLogout={handleLogout}
          />
        )}

        <div id="main-scroll-container" className="flex-1 overflow-y-auto">
          <Routes>
            {!isAuthenticated ? (
              <>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/student-login" element={<StudentLogin onLogin={handleLogin} />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<Navigate to={logoutPath} replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Navigate to={`${basePath}/dashboard`} replace />} />
                <Route path={basePath} element={<Navigate to={`${basePath}/dashboard`} replace />} />

                <Route path={`${basePath}/dashboard`} element={userRole === 'STUDENT' ? <StudentDashboard userInfo={userInfo} /> : (userRole === 'EMPLOYEE' ? <EmployeeDashboard /> : <MainContent activeTab="dashboard" employees={employees} />)} />
                <Route path={`${basePath}/daily-plan`} element={userRole === 'STUDENT' ? <DailySchedule /> : <DailyPlan userType={userRole} userId={userInfo?.employee_profile_id || userInfo?.id} />} />
                <Route path={`${basePath}/schedule`} element={userRole === 'STUDENT' ? <DailySchedule /> : <DailyPlan userType={userRole} userId={userInfo?.employee_profile_id || userInfo?.id} />} />
                <Route path={`${basePath}/attendance`} element={userRole === 'STUDENT' ? <StudentAttendance searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> : (userRole === 'EMPLOYEE' ? <EmployeeAttendance courses={courses} searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> : <AttendanceContent employees={employees} courses={courses} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />)} />
                <Route path={`${basePath}/leave`} element={userRole === 'STUDENT' ? <StudentLeave searchQuery={searchQuery} /> : (userRole === 'ADMIN' ? <LeaveManagementContent searchQuery={searchQuery} /> : (userRole === 'EMPLOYEE' ? <EmployeeLeave searchQuery={searchQuery} /> : <Navigate to={`${basePath}/dashboard`} />))} />
                <Route path={`${basePath}/students`} element={<StudentsContent courses={courses} searchQuery={searchQuery} />} />
                <Route path={`${basePath}/work-reports`} element={<WorkReportsContent />} />
                <Route path={`${basePath}/leaderboard`} element={<LeaderboardContent />} />
                <Route path={`${basePath}/settings`} element={<SettingsContent employees={employees} />} />
                <Route path={`${basePath}/profile`} element={userRole === 'STUDENT' ? <StudentProfile userInfo={userInfo} /> : <EmployeeProfile />} />
                <Route path={`${basePath}/tasks`} element={userRole === 'STUDENT' ? <StudentTasks userInfo={userInfo} /> : <Navigate to={`${basePath}/dashboard`} />} />
                <Route path={`${basePath}/jobs`} element={userRole === 'STUDENT' ? <StudentJobs userInfo={userInfo} /> : <Navigate to={`${basePath}/dashboard`} />} />
                <Route path={`${basePath}/journey`} element={userRole === 'STUDENT' ? <StudentAcademicJourney userInfo={userInfo} /> : (canViewJourney ? <AcademicJourneyContent /> : <Navigate to={`${basePath}/dashboard`} />)} />
                <Route path={`${basePath}/support`} element={<SupportContent />} />

                {canViewEmployees && <Route path={`${basePath}/employees`} element={<EmployeesContent employees={employees} setEmployees={setEmployees} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />}
                {canViewCourses && <Route path={`${basePath}/courses`} element={<CoursesContent courses={courses} setCourses={setCourses} employees={employees} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />}
                {canViewFees && <Route path={`${basePath}/fees`} element={<FeesContent />} />}
                {canViewPayroll && <Route path={`${basePath}/payroll`} element={<PayrollContent />} />}
                {canViewSalesCrm && <Route path={`${basePath}/sales-crm`} element={<SalesCrmContent courses={courses} searchQuery={searchQuery} />} />}
                {canViewRecruitment && <Route path={`${basePath}/recruitment`} element={<RecruitmentContent />} />}
                {canViewWhatsapp && <Route path={`${basePath}/whatsapp-automation`} element={<WhatsappContent />} />}
                {canViewSeo && <Route path={`${basePath}/seo`} element={<SeoAgentContent />} />}
                {canViewBlog && <Route path={`${basePath}/blog`} element={<BlogDashboardContent />} />}
                {canViewBlog && <Route path={`${basePath}/blog-agent`} element={<BlogAgentHub />} />}
                {canViewBlog && <Route path={`${basePath}/blog-agent/:site`} element={<BlogAgentEditor />} />}
                {canViewGallery && <Route path={`${basePath}/gallery`} element={<GalleryContent searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />}

                <Route path="*" element={<Navigate to={`${basePath}/dashboard`} replace />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
