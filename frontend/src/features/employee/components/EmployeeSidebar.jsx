import React from 'react';
import { 
  LayoutDashboard, Calendar, CheckSquare, Clock, User, 
  Settings, HelpCircle 
} from 'lucide-react';

const employeeNavItems = [
  { id: 'employee-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  // { id: 'employee-attendance', label: 'Attendance', icon: Calendar },
  { id: 'employee-tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'employee-leaves', label: 'Leaves', icon: Clock },
  { id: 'employee-profile', label: 'Profile', icon: User },
];

const EmployeeSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-[260px] min-w-[260px] h-screen bg-white border-r border-[#C2C6D4] flex flex-col pl-[16px] py-[24px] z-10">
      {/* Top Logo Container - 227x108 */}
      <div className="w-[227px] h-[108px] flex flex-col justify-center shrink-0">
        <h1 className="text-[28px] font-bold text-[#003F87] leading-none">Novox Edtech</h1>
        <p className="text-[10px] font-semibold text-[#555F6B] tracking-[0.15em] uppercase mt-2 leading-tight">
          Employee<br/>Portal
        </p>
      </div>

      {/* Main Nav Container */}
      <nav className="w-[227px] flex-1 flex flex-col gap-[4px] overflow-y-auto mt-4" style={{scrollbarWidth: 'none'}}>
        {employeeNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-[12px] px-[12px] py-[8px] rounded-[4px] transition-colors text-left w-full h-[36px] shrink-0
                ${isActive 
                  ? 'bg-[#D9E3F1] text-[#003F87] font-semibold' 
                  : 'text-[#555F6B] font-medium hover:bg-slate-50'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-[#003F87]' : 'text-[#555F6B]'} />
              <span className="text-[14px] leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Nav Container - pt-[32px] */}
      <div className="w-[227px] pt-[32px] mt-auto border-t border-[#C2C6D4] flex flex-col gap-[12px]">
        <button className="flex items-center gap-[12px] px-[12px] py-[8px] rounded-[4px] text-[#555F6B] font-medium hover:bg-slate-50 transition-colors w-full text-left h-[36px]">
          <Settings size={18} className="text-[#555F6B]" />
          <span className="text-[14px] leading-none">Settings</span>
        </button>
        <button className="flex items-center gap-[12px] px-[12px] py-[8px] rounded-[4px] text-[#555F6B] font-medium hover:bg-slate-50 transition-colors w-full text-left h-[36px]">
          <HelpCircle size={18} className="text-[#555F6B]" />
          <span className="text-[14px] leading-none">Support</span>
        </button>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
