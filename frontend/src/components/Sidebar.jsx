import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, BookOpen, Calendar, 
  CreditCard, Wallet, MessageSquare, Handshake, Trophy, 
  GraduationCap, FileText, Globe, Settings, HelpCircle 
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'daily-plan', label: 'Daily Schedule', icon: BookOpen },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'employees', label: 'Employees', icon: Briefcase },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  // { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'fees', label: 'Fees', icon: CreditCard },
  { id: 'payroll', label: 'Payroll', icon: Wallet },
  { id: 'work-reports', label: 'Work Reports', icon: FileText },
  // { id: 'whatsapp-automation', label: 'WhatsApp Automation', icon: MessageSquare },
  // { id: 'sales-crm', label: 'Sales CRM', icon: Handshake },
  // { id: 'recruitment', label: 'Recruitment', icon: Users },
  // { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  // { id: 'journey', label: 'Academic Journey', icon: GraduationCap },
  // { id: 'blog', label: 'Blog Automation', icon: FileText },
  // { id: 'seo', label: 'SEO Agent', icon: Globe },
];

const Sidebar = ({ userRole, isHR, isDesign, isDevelopment, isSales, isMarketing, basePath = '/admin' }) => {
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'dashboard';
  
  let visibleNavItems = navItems;
  if (userRole !== 'ADMIN') {
    const hiddenItems = [];
    
    // Evaluate hidden items based on role
    if (!isHR) {
      hiddenItems.push('employees', 'payroll', 'recruitment');
    }
    if (!isSales) {
      hiddenItems.push('sales-crm');
    }
    if (!(isHR || isSales)) {
      hiddenItems.push('fees');
    }
    if (!(isSales || isMarketing)) {
      hiddenItems.push('whatsapp-automation');
    }
    if (!isMarketing) {
      hiddenItems.push('seo', 'blog');
    }
    
    visibleNavItems = navItems.filter(item => !hiddenItems.includes(item.id));
  }

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
      <nav className="w-[227px] flex-1 flex flex-col gap-[4px] overflow-y-auto mt-4 pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              to={`${basePath}/${item.id}`}
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

      {/* Bottom Nav Container - pt-[32px]
      <div className="w-[227px] pt-[32px] mt-auto border-t border-[#C2C6D4] flex flex-col gap-[12px]">
        <Link 
          to={`${basePath}/settings`}
          className={`flex items-center gap-[12px] px-[12px] py-[8px] rounded-[4px] font-medium transition-colors w-full text-left h-[36px] ${
            activeTab === 'settings' ? 'bg-[#D9E3F1] text-[#003F87] font-semibold' : 'text-[#555F6B] hover:bg-slate-50'
          }`}
        >
          <Settings size={18} className={activeTab === 'settings' ? 'text-[#003F87]' : 'text-[#555F6B]'} />
          <span className="text-[14px] leading-none">Settings</span>
        </Link>
        <Link 
          to={`${basePath}/support`}
          className={`flex items-center gap-[12px] px-[12px] py-[8px] rounded-[4px] font-medium transition-colors w-full text-left h-[36px] ${
            activeTab === 'support' ? 'bg-[#D9E3F1] text-[#003F87] font-semibold' : 'text-[#555F6B] hover:bg-slate-50'
          }`}
        >
          <HelpCircle size={18} className={activeTab === 'support' ? 'text-[#003F87]' : 'text-[#555F6B]'} />
          <span className="text-[14px] leading-none">Support</span>
        </Link>
      </div>
      */}
    </aside>
  );
};

export default Sidebar;
