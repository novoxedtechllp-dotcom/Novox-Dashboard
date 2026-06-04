import React, { useState } from 'react';
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
import Login from './components/Login';
import Fab from './components/Fab';

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState(initialCourses);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans text-slate-800 relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white min-w-0">
        <Header activeTab={activeTab} />
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' ? (
            <MainContent activeTab={activeTab} />
          ) : activeTab === 'attendance' ? (
            <AttendanceContent />
          ) : activeTab === 'students' ? (
            <StudentsContent courses={courses} />
          ) : activeTab === 'employees' ? (
            <EmployeesContent />
          ) : activeTab === 'courses' ? (
            <CoursesContent courses={courses} setCourses={setCourses} />
          ) : activeTab === 'fees' ? (
            <FeesContent />
          ) : activeTab === 'payroll' ? (
            <PayrollContent />
          ) : activeTab === 'sales-crm' ? (
            <SalesCrmContent courses={courses} />
          ) : activeTab === 'whatsapp-automation' ? (
            <WhatsappContent />
          ) : activeTab === 'leaderboard' ? (
            <LeaderboardContent />
          ) : activeTab === 'journey' ? (
            <AcademicJourneyContent />
          ) : activeTab === 'seo' ? (
            <SeoAgentContent />
          ) : (
            <div className="p-[24px]">
              <h2 className="text-2xl font-bold capitalize">{activeTab.replace('-', ' ')} Page</h2>
              <p className="text-slate-500 mt-2">Content for {activeTab} will go here.</p>
            </div>
          )}
        </div>
      </main>
      
      
    </div>
  );
}

export default App;
