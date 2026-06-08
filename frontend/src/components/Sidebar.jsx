import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, BookOpen, Calendar, 
  CreditCard, Wallet, MessageSquare, Handshake, Trophy, 
  GraduationCap, FileText, Globe, Settings, HelpCircle, Menu
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'daily-plan', label: 'Daily Schedule', icon: BookOpen },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'employees', label: 'Employees', icon: Briefcase },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  // { id: 'attendance', label: 'Attendance', icon: Calendar },
  // { id: 'fees', label: 'Fees', icon: CreditCard },
  // { id: 'payroll', label: 'Payroll', icon: Wallet },
  // { id: 'work-reports', label: 'Work Reports', icon: FileText },
  // { id: 'whatsapp-automation', label: 'WhatsApp Automation', icon: MessageSquare },
  // { id: 'sales-crm', label: 'Sales CRM', icon: Handshake },
  // { id: 'recruitment', label: 'Recruitment', icon: Users },
  // { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  // { id: 'journey', label: 'Academic Journey', icon: GraduationCap },
  // { id: 'blog', label: 'Blog Automation', icon: FileText },
  // { id: 'seo', label: 'SEO Agent', icon: Globe },
];

const Sidebar = ({ userRole, isHR, isDesign, isDevelopment, isSales, isMarketing, basePath = '/admin', isOpen, setIsOpen }) => {
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`
        fixed lg:static top-0 left-0 h-screen bg-white border-r border-[#C2C6D4] 
        flex flex-col z-50 transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen 
          ? 'w-[260px] min-w-[260px] translate-x-0 pl-[16px] py-[24px]' 
          : 'w-[260px] min-w-[260px] lg:w-0 lg:min-w-0 lg:p-0 -translate-x-full lg:translate-x-0 lg:border-r-0'}
      `}>
        {/* Container to prevent text wrapping when width shrinks */}
        <div className="w-[227px] min-w-[227px] flex flex-col h-full">
          {/* Top Logo Container - 227x108 */}
          <div className="h-[108px] flex flex-col justify-center shrink-0 relative">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-[28px] font-bold text-[#003F87] leading-none">Novox Edtech</h1>
                <p className="text-[10px] font-semibold text-[#555F6B] tracking-[0.15em] uppercase mt-2 leading-tight">
                  Institutional<br/>Management
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-[4px] text-[#555F6B] hover:bg-slate-100 rounded-md transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Main Nav Container */}
          <nav className="flex-1 flex flex-col gap-[4px] overflow-y-auto mt-4 pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  to={`${basePath}/${item.id}`}
                  onClick={() => window.innerWidth < 1024 && setIsOpen && setIsOpen(false)}
                  className={`flex items-center gap-[12px] px-[12px] py-[8px] rounded-[4px] transition-colors text-left w-full h-[36px] shrink-0
                    ${isActive 
                      ? 'bg-[#D9E3F1] text-[#003F87] font-semibold' 
                      : 'text-[#555F6B] font-medium hover:bg-slate-50'
                    }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#003F87]' : 'text-[#555F6B]'} />
                  <span className="text-[14px] leading-none whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
