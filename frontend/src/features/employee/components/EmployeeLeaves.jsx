import React from 'react';
import { Clock, Calendar as CalendarIcon, FileText, CheckCircle2, Clock3 } from 'lucide-react';

const EmployeeLeaves = () => {
  return (
    <div className="p-[24px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900">Leave Requests</h2>
          <p className="text-slate-500 text-[14px] mt-1">Manage and track your leave applications</p>
        </div>
        <button className="bg-[#003F87] hover:bg-[#002B5E] text-white px-5 py-2.5 rounded-md font-bold text-[14px] flex items-center gap-2 transition-colors">
          <FileText size={18} /> Apply for Leave
        </button>
      </div>

      {/* Leave Balances */}
      <div className="grid grid-cols-4 gap-[16px] mb-8">
        <div className="bg-white rounded-lg border border-blue-100 p-4 shadow-sm">
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sick Leave</p>
          <div className="flex items-end gap-2">
            <h3 className="text-[28px] font-bold text-blue-700 leading-none">05</h3>
            <span className="text-[13px] text-slate-500 mb-1">/ 10 days</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-purple-100 p-4 shadow-sm">
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Casual Leave</p>
          <div className="flex items-end gap-2">
            <h3 className="text-[28px] font-bold text-purple-700 leading-none">04</h3>
            <span className="text-[13px] text-slate-500 mb-1">/ 08 days</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-green-100 p-4 shadow-sm">
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Earned Leave</p>
          <div className="flex items-end gap-2">
            <h3 className="text-[28px] font-bold text-green-700 leading-none">12</h3>
            <span className="text-[13px] text-slate-500 mb-1">days</span>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-orange-100 p-4 shadow-sm">
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Loss of Pay</p>
          <div className="flex items-end gap-2">
            <h3 className="text-[28px] font-bold text-orange-700 leading-none">00</h3>
            <span className="text-[13px] text-slate-500 mb-1">days</span>
          </div>
        </div>
      </div>

      {/* Leave History */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon size={18} className="text-[#003F87]" /> Leave History
          </h3>
          <div className="flex gap-2">
             <button className="px-3 py-1 bg-white border border-[#C2C6D4] rounded-md text-[13px] font-medium text-slate-600 hover:bg-slate-50">Filter</button>
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-[12px] uppercase text-slate-500 border-b border-[#E2E8F0]">
              <th className="py-4 px-6 font-semibold">Date Applied</th>
              <th className="py-4 px-6 font-semibold">Leave Date(s)</th>
              <th className="py-4 px-6 font-semibold">Leave Type</th>
              <th className="py-4 px-6 font-semibold">Reason</th>
              <th className="py-4 px-6 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            <tr className="border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 text-slate-600">Oct 20, 2024</td>
              <td className="py-4 px-6 font-medium text-slate-800">Oct 28 - Oct 29, 2024</td>
              <td className="py-4 px-6 font-medium text-slate-700">Casual Leave</td>
              <td className="py-4 px-6 text-slate-600 truncate max-w-[200px]">Family function out of station</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-[12px] font-semibold">
                  <Clock3 size={14} /> Pending
                </span>
              </td>
            </tr>
            <tr className="border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 text-slate-600">Sep 15, 2024</td>
              <td className="py-4 px-6 font-medium text-slate-800">Sep 18, 2024</td>
              <td className="py-4 px-6 font-medium text-slate-700">Sick Leave</td>
              <td className="py-4 px-6 text-slate-600 truncate max-w-[200px]">Fever and cold</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[12px] font-semibold">
                  <CheckCircle2 size={14} /> Approved
                </span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 text-slate-600">Aug 02, 2024</td>
              <td className="py-4 px-6 font-medium text-slate-800">Aug 10 - Aug 14, 2024</td>
              <td className="py-4 px-6 font-medium text-slate-700">Earned Leave</td>
              <td className="py-4 px-6 text-slate-600 truncate max-w-[200px]">Vacation trip</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[12px] font-semibold">
                  <CheckCircle2 size={14} /> Approved
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeLeaves;
