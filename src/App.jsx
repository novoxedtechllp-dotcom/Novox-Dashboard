import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/MainContent';
import AttendanceContent from './components/AttendanceContent';
import StudentsContent from './components/StudentsContent';
import CoursesContent from './components/CoursesContent';
import FeesContent from './components/FeesContent';
import SalesCrmContent from './components/SalesCrmContent';
import WhatsappContent from './components/WhatsappContent';
import LeaderboardContent from './components/LeaderboardContent';
import AcademicJourneyContent from './components/AcademicJourneyContent';
import SeoAgentContent from './components/SeoAgentContent';
import Login from './components/Login';
import Fab from './components/Fab';

const initialCourses = [
  { id: 1, title: 'Full Stack Web Engineering', category: 'DEVELOPMENT', duration: '24 Weeks', price: '$1,200.00', mentorName: 'Sarah Mitchell', mentorInitials: 'SM', imgUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80' },
  { id: 2, title: 'Advanced Digital Strategy', category: 'MARKETING', duration: '12 Weeks', price: '$850.00', mentorName: 'David Chen', mentorInitials: 'DC', imgUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80' },
  { id: 3, title: 'UI/UX Design Masterclass', category: 'DESIGN', duration: '16 Weeks', price: '$990.00', mentorName: 'Elena Lopez', mentorInitials: 'EL', imgUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80' },
  { id: 4, title: 'Strategic HR Management', category: 'HR', duration: '8 Weeks', price: '$600.00', mentorName: 'James Baxter', mentorInitials: 'JB', imgUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&q=80' },
  { id: 5, title: 'Data Science & Analytics', category: 'DEVELOPMENT', duration: '20 Weeks', price: '$1,450.00', mentorName: 'Rajiv Kapoor', mentorInitials: 'RK', imgUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80' }
];

const initialNotifications = [
  { id: 1, title: 'New Enrollment', message: 'David Harrison enrolled in M.S. Data Science.', time: '2 mins ago' },
  { id: 2, title: 'System Update', message: 'Version 2.4.0 is now live across all regions.', time: '1 hour ago' },
  { id: 3, title: 'Payment Received', message: '$1,200 processing fee from James Miller.', time: '3 hours ago' }
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState(initialCourses);
  const [notifications, setNotifications] = useState(initialNotifications);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans text-slate-800 relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white min-w-0">
        <Header 
          activeTab={activeTab} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onLogout={() => setIsAuthenticated(false)} 
          notifications={notifications}
        />
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' ? (
            <MainContent activeTab={activeTab} />
          ) : activeTab === 'attendance' ? (
            <AttendanceContent courses={courses} />
          ) : activeTab === 'students' ? (
            <StudentsContent searchQuery={searchQuery} courses={courses} />
          ) : activeTab === 'courses' ? (
            <CoursesContent courses={courses} setCourses={setCourses} />
          ) : activeTab === 'fees' ? (
            <FeesContent />
          ) : activeTab === 'sales-crm' ? (
            <SalesCrmContent />
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
      
      {activeTab !== 'students' && activeTab !== 'attendance' && <Fab />}
    </div>
  );
}

export default App;
