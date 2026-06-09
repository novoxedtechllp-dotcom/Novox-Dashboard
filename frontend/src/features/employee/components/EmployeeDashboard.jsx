import React from 'react';
import { Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

const EmployeeDashboard = () => {
  return (
    <div className="p-[24px]">
      <h2 className="text-[20px] font-bold text-slate-900 mb-6">Welcome Back, Employee!</h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-[16px] mb-[24px]">
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 flex flex-col justify-between h-[120px] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Attendance %</p>
              <h3 className="text-[24px] font-bold text-slate-900 mt-1">98%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar size={20} />
            </div>
          </div>
          <p className="text-[12px] text-green-600 flex items-center gap-1 font-medium">
            <CheckCircle2 size={12} /> Excellent
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 flex flex-col justify-between h-[120px] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Open Tasks</p>
              <h3 className="text-[24px] font-bold text-slate-900 mt-1">5</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <AlertCircle size={20} />
            </div>
          </div>
          <p className="text-[12px] text-orange-600 flex items-center gap-1 font-medium">
            2 High Priority
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 flex flex-col justify-between h-[120px] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Leave Balance</p>
              <h3 className="text-[24px] font-bold text-slate-900 mt-1">12</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-[12px] text-slate-500">
            Days remaining
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[24px]">
        {/* Today's Schedule */}
        <div className="col-span-2 bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-[#E2E8F0] pb-3">Today's Schedule</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-[80px] text-[13px] font-bold text-slate-500 text-right mt-1">09:00 AM</div>
              <div className="flex-1 bg-blue-50 border border-blue-100 p-3 rounded-md border-l-[4px] border-l-blue-500">
                <h4 className="font-semibold text-slate-800 text-[14px]">Morning Standup</h4>
                <p className="text-[12px] text-slate-600 mt-1">Conference Room A</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-[80px] text-[13px] font-bold text-slate-500 text-right mt-1">11:30 AM</div>
              <div className="flex-1 bg-purple-50 border border-purple-100 p-3 rounded-md border-l-[4px] border-l-purple-500">
                <h4 className="font-semibold text-slate-800 text-[14px]">Student Mentorship Session</h4>
                <p className="text-[12px] text-slate-600 mt-1">Online via Zoom</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-[80px] text-[13px] font-bold text-slate-500 text-right mt-1">02:00 PM</div>
              <div className="flex-1 bg-green-50 border border-green-100 p-3 rounded-md border-l-[4px] border-l-green-500">
                <h4 className="font-semibold text-slate-800 text-[14px]">Curriculum Review</h4>
                <p className="text-[12px] text-slate-600 mt-1">Department Hall</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-[#E2E8F0] pb-3">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-[#003F87] text-white py-2.5 rounded-md font-semibold text-[14px] hover:bg-[#002B5E] transition-colors">
              Punch In (09:05 AM)
            </button>
            <button className="w-full bg-white border border-[#003F87] text-[#003F87] py-2.5 rounded-md font-semibold text-[14px] hover:bg-blue-50 transition-colors">
              Request Leave
            </button>
            <button className="w-full bg-white border border-[#E2E8F0] text-slate-700 py-2.5 rounded-md font-semibold text-[14px] hover:bg-slate-50 transition-colors">
              View Payslip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
