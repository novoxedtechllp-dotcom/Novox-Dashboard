<<<<<<< HEAD
import React from 'react';
import { Search, Bell, HelpCircle, User, UserPlus, Plus } from 'lucide-react';
import AddBtn from './AddBtn';
=======
import React, { useState } from 'react';
import { Search, Bell, HelpCircle, User, Plus, LogOut } from 'lucide-react';

const Header = ({ activeTab, searchQuery, setSearchQuery, onLogout, notifications = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
>>>>>>> 3ed7742abbb34d709942173671f0e8468e85b94d

  return (
    <header className="h-[64px] min-h-[64px] bg-white border-b border-[#C2C6D4] px-[24px] flex items-center justify-between relative z-50">
      {/* Search Bar & Title */}
      <div className="flex items-center gap-[24px]">
        {activeTab === 'students' && (
          <h1 className="text-[18px] font-bold text-[#003F87] capitalize">{activeTab}</h1>
        )}
        <div className="flex items-center gap-2 bg-[#F8FAFC] px-[16px] py-[8px] rounded-md w-[320px] h-[36px]">
          <Search size={16} className="text-[#555F6B]" />
          <input 
            type="text" 
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder={activeTab === 'students' ? "Search by student ID, name..." : activeTab === 'courses' ? "Search courses, mentors, or IDs..." : activeTab === 'fees' ? "Search transactions, students..." : activeTab === 'sales-crm' ? "Search leads, status, or courses..." : activeTab === 'whatsapp-automation' ? "Search templates or logs..." : activeTab === 'leaderboard' ? "Search students, rankings, or courses..." : activeTab === 'journey' ? "Search institutional data, courses, or guides..." : activeTab === 'seo' ? "Search across automation tasks..." : "Search students or records..."} 
            className="bg-transparent border-none outline-none text-[13px] w-full text-slate-800 placeholder:text-[#555F6B]"
          />
        </div>
      </div>
      
      {/* Header Actions */}
      <div className="flex items-center gap-5">
<<<<<<< HEAD
        {activeTab === 'students' && (
          <AddBtn title="Add Student" />
        )}
=======
>>>>>>> 3ed7742abbb34d709942173671f0e8468e85b94d
        {activeTab === 'sales-crm' && (
          <button className="bg-[#003F87] text-white px-[16px] h-[36px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors">
            <Plus size={16} /> New Lead
          </button>
        )}
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-[#555F6B] hover:text-[#003F87] transition-colors flex items-center"
          >
            <Bell size={20} />
            <span className="absolute top-[0px] right-[0px] w-[8px] h-[8px] bg-red-500 rounded-full border border-white"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-4 w-[320px] bg-white border border-[#C2C6D4] shadow-xl rounded-[8px] z-50 overflow-hidden">
              <div className="p-3 border-b border-[#C2C6D4] font-bold text-slate-800 flex justify-between items-center bg-slate-50">
                Notifications {notifications.length > 0 && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wide">{notifications.length} New</span>}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                    <p className="text-[13px] font-bold text-slate-800 mb-1">{notif.title}</p>
                    <p className="text-[12px] text-slate-500">{notif.message}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-2 uppercase tracking-wide">{notif.time}</p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="p-4 text-center text-slate-500 text-[12px]">No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        <button className="text-[#555F6B] hover:text-[#003F87] transition-colors">
          <HelpCircle size={20} />
        </button>
        
        <div className="relative">
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 border-l border-[#C2C6D4] pl-5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="text-right">
              <div className="text-[14px] font-bold text-slate-900 leading-tight">Admin User</div>
              <div className="text-[12px] text-[#555F6B]">Super Admin</div>
            </div>
            <div className="w-[36px] h-[36px] bg-white rounded-full border border-[#003F87] flex items-center justify-center text-[#003F87]">
              <User size={18} />
            </div>
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-4 w-[200px] bg-white border border-[#C2C6D4] shadow-xl rounded-[8px] z-50 overflow-hidden">
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors font-bold text-[13px]"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
