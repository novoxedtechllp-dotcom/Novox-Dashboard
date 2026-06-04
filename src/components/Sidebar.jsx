import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, BookOpen, Calendar, 
  CreditCard, Wallet, MessageSquare, Handshake, Trophy, 
  GraduationCap, FileText, Globe, Settings, HelpCircle 
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'employees', label: 'Employees', icon: Briefcase },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'fees', label: 'Fees', icon: CreditCard },
  { id: 'payroll', label: 'Payroll', icon: Wallet },
  { id: 'work-reports', label: 'Work Reports', icon: FileText },
  { id: 'whatsapp-automation', label: 'WhatsApp Automation', icon: MessageSquare },
  { id: 'sales-crm', label: 'Sales CRM', icon: Handshake },
  { id: 'recruitment', label: 'Recruitment', icon: Users },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'journey', label: 'Academic Journey', icon: GraduationCap },
  { id: 'blog', label: 'Blog Automation', icon: FileText },
  { id: 'seo', label: 'SEO Agent', icon: Globe },
];

const Sidebar = () => {
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'dashboard';
  return (
    <aside className="w-[260px] min-w-[260px] h-screen bg-white border-r border-[#C2C6D4] flex flex-col pl-[16px] py-[24px] z-10">
      {/* Top Logo Container - 227x108 */}
      <div className="w-[227px] h-[108px] flex flex-col justify-center shrink-0">
        <h1 className="text-[28px] font-bold text-[#003F87] leading-none">Novox Edtech</h1>
        <p className="text-[10px] font-semibold text-[#555F6B] tracking-[0.15em] uppercase mt-2 leading-tight">
          Institutional<br/>Management
        </p>
      </div>

      {/* Main Nav Container */}
      <nav className="w-[227px] flex-1 flex flex-col gap-[4px] overflow-y-auto mt-4" style={{scrollbarWidth: 'none'}}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              to={`/${item.id}`}
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

      {/* Bottom Nav Container - pt-[32px] */}
      <div className="w-[227px] pt-[32px] mt-auto border-t border-[#C2C6D4] flex flex-col gap-[12px]">
        <Link 
          to="/settings"
          className={`flex items-center gap-[12px] px-[12px] py-[8px] rounded-[4px] font-medium transition-colors w-full text-left h-[36px] ${
            activeTab === 'settings' ? 'bg-[#D9E3F1] text-[#003F87] font-semibold' : 'text-[#555F6B] hover:bg-slate-50'
          }`}
        >
          <Settings size={18} className={activeTab === 'settings' ? 'text-[#003F87]' : 'text-[#555F6B]'} />
          <span className="text-[14px] leading-none">Settings</span>
        </Link>
        <Link 
          to="/support"
          className={`flex items-center gap-[12px] px-[12px] py-[8px] rounded-[4px] font-medium transition-colors w-full text-left h-[36px] ${
            activeTab === 'support' ? 'bg-[#D9E3F1] text-[#003F87] font-semibold' : 'text-[#555F6B] hover:bg-slate-50'
          }`}
        >
          <HelpCircle size={18} className={activeTab === 'support' ? 'text-[#003F87]' : 'text-[#555F6B]'} />
          <span className="text-[14px] leading-none">Support</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
