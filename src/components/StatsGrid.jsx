import React from 'react';
import { Users, Briefcase, BookOpen, CreditCard, TrendingUp } from 'lucide-react';

const StatsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[24px]">
      {/* Total Students */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm h-[250px]">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#003F87]">
            <Users size={20} />
          </div>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">+12%</span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Total Students</p>
          <h3 className="text-3xl font-bold text-slate-800">1,284</h3>
        </div>
      </div>

      {/* Total Employees */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm h-[250px]">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#003F87]">
            <Briefcase size={20} />
          </div>
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">Stable</span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Total Employees</p>
          <h3 className="text-3xl font-bold text-slate-800">56</h3>
        </div>
      </div>

      {/* Active Courses */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm h-[250px]">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#003F87]">
            <BookOpen size={20} />
          </div>
          <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md">4 New</span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Active Courses</p>
          <h3 className="text-3xl font-bold text-slate-800">24</h3>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-[#003F87] rounded-xl p-6 flex flex-col justify-between shadow-md h-[250px] relative overflow-hidden">
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white">
            <CreditCard size={20} />
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-[11px] font-bold text-blue-100 uppercase tracking-wide mb-1">Recent Sales (Today)</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-bold text-white mb-0 leading-none">$12,450</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-blue-200 mt-2">
            <TrendingUp size={12} />
            <span>24 new enrollments completed</span>
          </div>
        </div>
        {/* Node Pattern */}
        <svg className="absolute right-[-10px] bottom-[-15px] w-24 h-24 opacity-20 text-white pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="20" cy="50" r="4" fill="currentColor"/>
          <circle cx="50" cy="25" r="4" fill="currentColor"/>
          <circle cx="50" cy="75" r="4" fill="currentColor"/>
          <circle cx="80" cy="50" r="4" fill="currentColor"/>
          <line x1="20" y1="50" x2="50" y2="25" />
          <line x1="20" y1="50" x2="50" y2="75" />
          <line x1="50" y1="25" x2="80" y2="50" />
          <line x1="50" y1="75" x2="80" y2="50" />
          <line x1="50" y1="25" x2="50" y2="75" />
        </svg>
      </div>
    </div>
  );
};

export default StatsGrid;
