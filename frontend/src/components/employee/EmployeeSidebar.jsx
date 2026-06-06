import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, Wallet, Settings } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
  // { id: 'attendance', label: 'My Attendance', icon: Calendar },
  { id: 'payroll', label: 'My Payroll', icon: Wallet },
];

const EmployeeSidebar = () => {
  const location = useLocation();
  const activeTab = location.pathname.substring(10) || 'dashboard'; // remove '/employee/'

  return (
    <aside className="w-[260px] min-w-[260px] h-screen bg-white border-r border-[#C2C6D4] flex flex-col pl-[16px] py-[24px] z-10">
      {/* Top Logo Container */}
      <div className="w-[227px] h-[108px] flex flex-col justify-center shrink-0">
        <h1 className="text-[28px] font-bold text-[#003F87] leading-none">Novox Edtech</h1>
        <p className="text-[10px] font-semibold text-[#555F6B] tracking-[0.15em] uppercase mt-2 leading-tight">
          Employee<br/>Portal
        </p>
      </div>

      {/* Main Nav Container */}
      <nav className="w-[227px] flex-1 flex flex-col gap-[4px] mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              to={`/employee/${item.id}`}
              className={`flex items-center gap-[12px] px-[12px] py-[8px] rounded-[4px] transition-colors text-left w-full h-[36px] shrink-0
                ${isActive 
                  ? 'bg-[#D9E3F1] text-[#003F87] font-semibold' 
                  : 'text-[#555F6B] font-medium hover:bg-slate-50'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-[#003F87]' : 'text-[#555F6B]'} />
              <span className="text-[14px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav Container */}
      <div className="w-[227px] pt-[32px] mt-auto border-t border-[#C2C6D4] flex flex-col gap-[12px]">
        <Link 
          to="/employee/settings"
          className={`flex items-center gap-[12px] px-[12px] py-[8px] rounded-[4px] font-medium transition-colors w-full text-left h-[36px] ${
            activeTab === 'settings' ? 'bg-[#D9E3F1] text-[#003F87] font-semibold' : 'text-[#555F6B] hover:bg-slate-50'
          }`}
        >
          <Settings size={18} className={activeTab === 'settings' ? 'text-[#003F87]' : 'text-[#555F6B]'} />
          <span className="text-[14px] leading-none">Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
