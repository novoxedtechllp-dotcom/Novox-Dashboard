import React from 'react';
import { Plus, CheckSquare, Clock, AlertTriangle } from 'lucide-react';

const EmployeeTasks = () => {
  return (
    <div className="p-[24px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900">My Tasks</h2>
          <p className="text-slate-500 text-[14px] mt-1">Manage your assigned duties and personal tasks</p>
        </div>
        <button className="bg-[#003F87] hover:bg-[#002B5E] text-white px-5 py-2.5 rounded-md font-bold text-[14px] flex items-center gap-2 transition-colors">
          <Plus size={18} /> Add Personal Task
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* To Do */}
        <div className="bg-slate-50 rounded-lg p-4 border border-[#E2E8F0]">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-[15px]">
            <div className="w-2 h-2 rounded-full bg-slate-400"></div> To Do (2)
          </h3>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-md border border-[#E2E8F0] shadow-sm cursor-pointer hover:border-[#003F87] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">High Priority</span>
                <Clock size={14} className="text-slate-400" />
              </div>
              <h4 className="font-semibold text-[14px] text-slate-800 leading-tight">Prepare Q3 Performance Report</h4>
              <p className="text-[12px] text-slate-500 mt-2">Compile data from sales CRM and format into standard template.</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex justify-center items-center text-[10px] font-bold text-blue-700">ME</div>
                </div>
                <span className="text-[12px] font-medium text-slate-500 flex items-center gap-1"><AlertTriangle size={12} className="text-red-500"/> Due Today</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-[#E2E8F0] shadow-sm cursor-pointer hover:border-[#003F87] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Medium</span>
                <Clock size={14} className="text-slate-400" />
              </div>
              <h4 className="font-semibold text-[14px] text-slate-800 leading-tight">Update Course Material for Web Dev</h4>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex justify-center items-center text-[10px] font-bold text-blue-700">ME</div>
                </div>
                <span className="text-[12px] font-medium text-slate-500">Oct 26</span>
              </div>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-[15px]">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div> In Progress (1)
          </h3>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-md border border-[#E2E8F0] shadow-sm cursor-pointer hover:border-[#003F87] transition-colors border-l-[3px] border-l-blue-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Medium</span>
                <CheckSquare size={14} className="text-blue-500" />
              </div>
              <h4 className="font-semibold text-[14px] text-slate-800 leading-tight">Student Mentorship 1-on-1s</h4>
              <p className="text-[12px] text-slate-500 mt-2">Conduct scheduled sessions for batch 4.</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex justify-center items-center text-[10px] font-bold text-blue-700">ME</div>
                </div>
                <span className="text-[12px] font-medium text-slate-500">Oct 25</span>
              </div>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-green-50/50 rounded-lg p-4 border border-green-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-[15px]">
            <div className="w-2 h-2 rounded-full bg-green-500"></div> Completed (2)
          </h3>
          <div className="space-y-3 opacity-75">
            <div className="bg-white p-4 rounded-md border border-[#E2E8F0] shadow-sm">
              <h4 className="font-semibold text-[14px] text-slate-800 leading-tight line-through text-slate-500">Submit Attendance Logs</h4>
              <div className="mt-3 flex items-center justify-between pt-2">
                <span className="text-[11px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Done</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md border border-[#E2E8F0] shadow-sm">
              <h4 className="font-semibold text-[14px] text-slate-800 leading-tight line-through text-slate-500">Weekly Department Meeting</h4>
              <div className="mt-3 flex items-center justify-between pt-2">
                <span className="text-[11px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Done</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTasks;
