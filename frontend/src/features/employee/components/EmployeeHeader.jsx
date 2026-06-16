import React from 'react';
import { Search, Bell, HelpCircle, User } from 'lucide-react';

const EmployeeHeader = ({ activeTab }) => {
  const formatTabName = (tab) => {
    return tab.replace('employee-', '').replace('-', ' ');
  };

  return (
    <header className="h-[64px] min-h-[64px] bg-white border-b border-[#C2C6D4] px-[24px] flex items-center justify-between">
      {/* Search Bar & Title */}
      <div className="flex items-center gap-[24px]">
        <h1 className="text-[18px] font-bold text-[#003F87] capitalize">{formatTabName(activeTab)}</h1>
        <div className="flex items-center gap-2 bg-[#F8FAFC] px-[16px] py-[8px] rounded-md w-[320px] h-[36px]">
          <Search size={16} className="text-[#555F6B]" />
          <input 
            type="text" 
            placeholder="Search records, tasks..."
            className="bg-transparent border-none outline-none text-[13px] w-full text-slate-800 placeholder:text-[#555F6B]"
          />
        </div>
      </div>
      
      {/* Header Actions */}
      <div className="flex items-center gap-5">
        <button className="relative text-[#555F6B] hover:text-[#003F87] transition-colors">
          <Bell size={20} />
          <span className="absolute top-[2px] right-[2px] w-[6px] h-[6px] bg-red-500 rounded-full"></span>
        </button>
        <button className="text-[#555F6B] hover:text-[#003F87] transition-colors">
          <HelpCircle size={20} />
        </button>
        
        <div className="flex items-center gap-3 border-l border-[#C2C6D4] pl-5 cursor-pointer">
          <div className="text-right">
            <div className="text-[14px] font-bold text-slate-900 leading-tight">Employee User</div>
            <div className="text-[12px] text-[#555F6B]">Staff Member</div>
          </div>
          <div className="w-[36px] h-[36px] bg-white rounded-full border border-[#003F87] flex items-center justify-center text-[#003F87]">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default EmployeeHeader;
