import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, HelpCircle, User, LogOut, Settings } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

const Header = ({ onLogout, userInfo, basePath = '/admin' }) => {
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'dashboard';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Enrollment', shortMessage: 'Sarah Jenkins has enrolled in MERN Stack Development.', message: 'Sarah Jenkins has enrolled in MERN Stack Development cohort. Payment verified.', time: '10 mins ago', isUnread: true },
    { id: 2, title: 'System Update', shortMessage: 'Scheduled maintenance will occur at midnight.', message: 'Scheduled database maintenance will occur at midnight EST. Expected downtime is 15 minutes.', time: '2 hours ago', isUnread: true },
    { id: 3, title: 'New Lead Captured', shortMessage: 'Michael Chang requested syllabus details.', message: 'Michael Chang requested syllabus details for the Data Science Bootcamp.', time: 'Yesterday', isUnread: true },
    { id: 4, title: 'Report Ready', shortMessage: 'Monthly academic report is ready.', message: 'Monthly academic performance report is ready to be reviewed.', time: 'Oct 12, 2023', isUnread: true }
  ]);
  const hasUnread = notifications.some(n => n.isUnread);

  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
  const markAsRead = (id) => setNotifications(notifications.map(n => n.id === id ? { ...n, isUnread: false } : n));

  const profileRef = useClickOutside(() => setIsDropdownOpen(false));
  const notifRef = useClickOutside(() => setIsNotifOpen(false));

  let displayName = 'User';
  if (userInfo?.first_name) {
    displayName = `${userInfo.first_name} ${userInfo.last_name || ''}`;
  } else if (userInfo?.name) {
    displayName = userInfo.name;
  } else if (userInfo?.email) {
    displayName = userInfo.email.split('@')[0];
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  } else {
    displayName = userInfo?.role === 'ADMIN' ? 'Admin User' : 'User';
  }
  const displayEmail = userInfo?.email || 'admin@novoxedtech.com';
  let roleTitle = 'Super Admin';
  if (userInfo?.role === 'EMPLOYEE') {
    roleTitle = userInfo?.designation || 'Employee';
  } else if (userInfo?.role === 'STUDENT') {
    roleTitle = 'Student';
  }

  return (
    <header className="h-[64px] min-h-[64px] bg-white border-b border-[#C2C6D4] px-[24px] flex items-center justify-between">
      {/* Search Bar & Title */}
      <div className="flex items-center gap-[24px]">
        <div className="flex items-center gap-2 bg-[#F8FAFC] px-[16px] py-[8px] rounded-md w-[320px] h-[36px]">
          <Search size={16} className="text-[#555F6B]" />
          <input 
            type="text" 
            placeholder={activeTab === 'students' ? "Search by student ID, name..." : activeTab === 'courses' ? "Search courses, mentors, or IDs..." : activeTab === 'fees' ? "Search transactions, students..." : activeTab === 'sales-crm' ? "Search leads, status, or courses..." : activeTab === 'whatsapp-automation' ? "Search templates or logs..." : activeTab === 'leaderboard' ? "Search students, rankings, or courses..." : activeTab === 'journey' ? "Search institutional data, courses, or guides..." : activeTab === 'seo' ? "Search across automation tasks..." : "Search students or records..."} 
            className="bg-transparent border-none outline-none text-[13px] w-full text-slate-800 placeholder:text-[#555F6B]"
          />
        </div>
      </div>
      
      {/* Header Actions */}
      <div className="flex items-center gap-[16px]">
        {/* Settings Button */}
        <Link to={`${basePath}/settings`} className="p-[8px] text-[#555F6B] hover:text-[#003F87] transition-colors rounded-full hover:bg-slate-50 cursor-pointer">
          <Settings size={20} />
        </Link>
        
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <div 
            className="p-[8px] text-[#555F6B] hover:text-[#003F87] transition-colors rounded-full hover:bg-slate-50 cursor-pointer relative"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-[6px] right-[8px] w-2 h-2 bg-[#D80000] border border-white rounded-full"></span>
            )}
          </div>
          
          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 top-[110%] w-[380px] bg-white border border-[#C2C6D4] rounded-lg shadow-lg z-50 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#E0E0E0] flex justify-between items-center bg-[#F8FAFC]">
                <h3 className="font-bold text-[#1A202C] text-[14px]">Notifications</h3>
                {hasUnread && (
                  <button onClick={markAllRead} className="text-[#003F87] text-[12px] font-semibold hover:underline">
                    Mark all as read
                  </button>
                )}
              </div>
              
              {/* Notif List */}
              <div className="flex-1 overflow-y-auto max-h-[320px] scrollbar-thin scrollbar-thumb-slate-200">
                {(showAllNotifications ? notifications : notifications.slice(0, 3)).map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-4 border-b border-[#F0F0F0] cursor-pointer transition-colors ${notif.isUnread ? 'bg-[#F0F7FF] hover:bg-[#E6F3FF]' : 'hover:bg-[#F8FAFC]'}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-[13px] ${notif.isUnread ? 'font-bold text-[#003F87]' : 'font-semibold text-slate-800'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[11px] text-[#555F6B] whitespace-nowrap ml-2">{notif.time}</span>
                    </div>
                    <p className="text-[12px] text-[#555F6B] leading-snug">
                      {notif.isUnread ? notif.message : notif.shortMessage}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="px-4 py-3 border-t border-[#E0E0E0] bg-[#F8FAFC] text-center">
                <button 
                  onClick={() => setShowAllNotifications(!showAllNotifications)}
                  className="text-[#003F87] text-[13px] font-semibold hover:underline"
                >
                  {showAllNotifications ? 'Show Less' : 'View All Notifications'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Support Divider */}
        <div className="w-[1px] h-[24px] bg-[#C2C6D4] mx-[4px]"></div>
        
        {/* Support Link */}
        <Link to={`${basePath}/support`} className="p-[8px] text-[#555F6B] hover:text-[#003F87] transition-colors rounded-full hover:bg-slate-50 cursor-pointer">
          <HelpCircle size={20} />
        </Link>
        
        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <div 
            className="flex items-center gap-[12px] ml-[8px] cursor-pointer hover:bg-slate-50 p-[4px] rounded-md transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="text-right">
              <div className="text-[13px] font-bold text-slate-800 leading-none">
                {displayName}
              </div>
              <div className="text-[11px] text-[#555F6B] mt-[2px] font-semibold">
                {roleTitle}
              </div>
            </div>
            <div className="w-[36px] h-[36px] rounded-full bg-slate-200 flex items-center justify-center shrink-0 border border-slate-300">
              <User size={18} className="text-slate-500" />
            </div>
          </div>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-[110%] w-[240px] bg-white border border-[#C2C6D4] rounded-lg shadow-lg py-[8px] z-50">
              <div className="px-[16px] py-[8px] border-b border-[#E0E0E0] mb-[4px]">
                <div className="text-[14px] font-bold text-slate-800">{displayName}</div>
                <div className="text-[12px] text-[#555F6B]">{displayEmail}</div>
              </div>
              <Link to={`${basePath}/settings`} className="flex items-center gap-[12px] px-[16px] py-[10px] text-[#555F6B] hover:bg-[#F8FAFC] hover:text-[#003F87] transition-colors cursor-pointer text-[13px] font-semibold" onClick={() => setIsDropdownOpen(false)}>
                <User size={16} /> My Profile
              </Link>
              <Link to={`${basePath}/settings`} className="flex items-center gap-[12px] px-[16px] py-[10px] text-[#555F6B] hover:bg-[#F8FAFC] hover:text-[#003F87] transition-colors cursor-pointer text-[13px] font-semibold" onClick={() => setIsDropdownOpen(false)}>
                <Settings size={16} /> Preferences
              </Link>
              <div className="border-t border-[#E0E0E0] my-[4px]"></div>
              <div 
                className="flex items-center gap-[12px] px-[16px] py-[10px] text-[#D80000] hover:bg-[#FFF0F0] transition-colors cursor-pointer text-[13px] font-semibold"
                onClick={onLogout}
              >
                <LogOut size={16} /> Log Out
              </div>
            </div>
          )}
        </div>
      </div>

      {showAllNotifications && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Bell size={20} className="text-[#003F87]" /> All Notifications
              </h2>
              <button onClick={() => setShowAllNotifications(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-0 flex flex-col max-h-[70vh] overflow-y-auto">
              {notifications.map(notif => (
                <div key={notif.id} onClick={() => markAsRead(notif.id)} className="px-6 py-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                    <span className="text-xs text-slate-400 mt-2 block font-medium">{notif.time}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.isUnread ? 'bg-red-500' : 'bg-green-500'}`}></div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-xs text-slate-500">Showing {notifications.length} of 48 notifications</span>
              {hasUnread && (
                <button onClick={markAllRead} className="text-sm text-[#003F87] font-bold hover:underline">Mark All as Read</button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
