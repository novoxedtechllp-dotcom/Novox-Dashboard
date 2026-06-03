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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

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
            <StudentsContent />
          ) : activeTab === 'courses' ? (
            <CoursesContent />
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
      
      <Fab />
    </div>
  );
}

export default App;
