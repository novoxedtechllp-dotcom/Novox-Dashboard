import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, HelpCircle, User, LogOut, Search, Settings } from 'lucide-react';

const EmployeeHeader = ({ onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <header className="h-[64px] min-h-[64px] bg-white border-b border-[#C2C6D4] px-[24px] flex items-center justify-between">
      {/* Title & Search */}
      <div className="flex items-center gap-[24px]">
        <h1 className="text-[18px] font-bold text-[#003F87] w-[150px]">Employee Portal</h1>
        
        <div className="flex items-center gap-2 bg-[#F8FAFC] px-[16px] py-[8px] rounded-md w-[320px] h-[36px] border border-[#E2E8F0]">
          <Search size={16} className="text-[#94A3B8]" />
          <input 
            type="text" 
            placeholder="Search tasks, attendance, payroll..." 
            className="bg-transparent border-none outline-none text-[13px] w-full text-slate-700 placeholder:text-[#94A3B8]"
          />
        </div>
      </div>
      
      {/* Header Actions */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative text-[#555F6B] hover:text-[#003F87] transition-colors p-2">
            <Bell size={20} />
            <span className="absolute top-[4px] right-[4px] w-[6px] h-[6px] bg-red-500 rounded-full"></span>
          </button>
          
          {isNotifOpen && (
            <div className="absolute right-0 top-[40px] w-[300px] bg-white border border-[#C2C6D4] rounded-md shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
                <button className="text-xs text-[#003F87] font-semibold hover:underline">Mark all read</button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <div className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <p className="text-sm font-semibold text-slate-800">New Task Assigned</p>
                  <p className="text-xs text-slate-500 mt-1">You have been assigned to "Update Course Materials".</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">10 mins ago</span>
                </div>
                <div className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <p className="text-sm font-semibold text-slate-800">Payslip Available</p>
                  <p className="text-xs text-slate-500 mt-1">Your payslip for September is now available for download.</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">2 hours ago</span>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-50 text-center border-t border-slate-200">
                <button className="text-xs text-[#003F87] font-bold hover:underline">View All Notifications</button>
              </div>
            </div>
          )}
        </div>
        <button className="text-[#555F6B] hover:text-[#003F87] transition-colors">
          <HelpCircle size={20} />
        </button>
        
        <div className="relative">
          <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 border-l border-[#C2C6D4] pl-5 cursor-pointer">
            <div className="text-right">
              <div className="text-[14px] font-bold text-slate-900 leading-tight">Staff Member</div>
              <div className="text-[12px] text-[#555F6B]">Employee</div>
            </div>
            <div className="w-[36px] h-[36px] bg-[#E5F0FF] rounded-full border border-[#003F87] flex items-center justify-center text-[#003F87]">
              <User size={18} />
            </div>
          </div>
          
          {isDropdownOpen && (
            <div className="absolute right-0 top-[48px] w-48 bg-white border border-[#C2C6D4] rounded-md shadow-lg overflow-hidden z-50 flex flex-col py-1">
              <div className="px-4 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs text-slate-500">Signed in as</p>
                <p className="text-sm font-bold text-slate-800 truncate">staff@novox.com</p>
              </div>
              <Link 
                to="/employee/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="w-full text-left px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Settings size={16} className="text-slate-400" /> Settings
              </Link>
              <div className="border-t border-slate-100 my-1"></div>
              <button 
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-[13px] font-semibold text-[#D80000] hover:bg-red-50 transition-colors flex items-center gap-2"
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

export default EmployeeHeader;
