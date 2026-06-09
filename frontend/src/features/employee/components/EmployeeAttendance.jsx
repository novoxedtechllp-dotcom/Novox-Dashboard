import React from 'react';
import { Clock, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';

const EmployeeAttendance = () => {
  return (
    <div className="p-[24px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900">My Attendance</h2>
          <p className="text-slate-500 text-[14px] mt-1">Track your daily punches and working hours</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-md font-bold text-[14px] flex items-center gap-2 transition-colors">
            <Clock size={18} /> Punch In
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-md font-bold text-[14px] flex items-center gap-2 transition-colors">
            <Clock size={18} /> Punch Out
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon size={18} className="text-[#003F87]" /> Recent Attendance
          </h3>
          <select className="border border-[#C2C6D4] rounded-md px-3 py-1.5 text-[14px] outline-none">
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-[12px] uppercase text-slate-500 border-b border-[#E2E8F0]">
              <th className="py-4 px-6 font-semibold">Date</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold">Punch In</th>
              <th className="py-4 px-6 font-semibold">Punch Out</th>
              <th className="py-4 px-6 font-semibold">Total Hours</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            <tr className="border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 font-medium text-slate-800">Oct 24, 2024</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[12px] font-semibold">
                  <CheckCircle2 size={14} /> Present
                </span>
              </td>
              <td className="py-4 px-6 text-slate-600">09:05 AM</td>
              <td className="py-4 px-6 text-slate-600">-</td>
              <td className="py-4 px-6 font-medium">-</td>
            </tr>
            <tr className="border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 font-medium text-slate-800">Oct 23, 2024</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[12px] font-semibold">
                  <CheckCircle2 size={14} /> Present
                </span>
              </td>
              <td className="py-4 px-6 text-slate-600">08:55 AM</td>
              <td className="py-4 px-6 text-slate-600">05:15 PM</td>
              <td className="py-4 px-6 font-medium text-slate-800">8h 20m</td>
            </tr>
            <tr className="border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 font-medium text-slate-800">Oct 22, 2024</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[12px] font-semibold">
                  <XCircle size={14} /> Absent
                </span>
              </td>
              <td className="py-4 px-6 text-slate-400">-</td>
              <td className="py-4 px-6 text-slate-400">-</td>
              <td className="py-4 px-6 text-slate-400">0h 0m</td>
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 font-medium text-slate-800">Oct 21, 2024</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[12px] font-semibold">
                  <CheckCircle2 size={14} /> Present
                </span>
              </td>
              <td className="py-4 px-6 text-slate-600">09:10 AM</td>
              <td className="py-4 px-6 text-slate-600">05:30 PM</td>
              <td className="py-4 px-6 font-medium text-slate-800">8h 20m</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
