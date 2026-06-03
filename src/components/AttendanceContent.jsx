import React from 'react';
import { Search, Calendar, RefreshCcw, MoreVertical, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const AttendanceContent = () => {
  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full">
      {/* Header Section: 972 x 52 */}
      <div className="w-full flex justify-between items-center h-[52px]">
        <div>
          <h2 className="text-[20px] font-bold text-[#003F87] leading-tight">Attendance Management</h2>
          <p className="text-[13px] text-[#555F6B] mt-1">Real-time tracking of institutional presence and engagement.</p>
        </div>
        <div className="flex bg-[#F8FAFC] rounded-[4px] p-[4px] border border-[#C2C6D4]">
          <button className="px-6 py-1.5 text-[13px] font-bold bg-white text-[#003F87] rounded-[4px] shadow-sm border border-[#C2C6D4]">Students</button>
          <button className="px-6 py-1.5 text-[13px] font-bold text-[#555F6B] hover:text-slate-800 transition-colors">Employees</button>
        </div>
      </div>

      {/* Filter Section: 972 x 116 */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[8px] p-[24px] flex flex-col md:flex-row items-end gap-[24px]">
        {/* Search */}
        <div className="flex-1 w-full">
          <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Search by Name/ID</label>
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px]">
            <input type="text" placeholder="e.g. STU-001" className="bg-transparent border-none outline-none text-[13px] w-full text-slate-800 placeholder:text-[#555F6B]" />
            <Search size={16} className="text-[#555F6B]" />
          </div>
        </div>
        {/* Category */}
        <div className="flex-1 w-full">
          <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Category/Course</label>
          <select className="w-full bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px] text-[13px] text-slate-800 outline-none appearance-none">
            <option>All Categories</option>
          </select>
        </div>
        {/* Date Range */}
        <div className="flex-[0.8] w-full">
          <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Date Range</label>
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px]">
            <input type="text" value="10/27/2023" readOnly className="bg-transparent border-none outline-none text-[13px] w-full text-slate-800" />
            <Calendar size={16} className="text-[#555F6B]" />
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-[12px] w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-[#003F87] text-white px-[24px] py-[10px] rounded-[6px] text-[13px] font-bold hover:bg-[#002B5E] transition-colors h-[42px] whitespace-nowrap">
            Apply Filters
          </button>
          <button className="bg-white border border-[#C2C6D4] w-[42px] h-[42px] shrink-0 rounded-[6px] flex items-center justify-center text-[#555F6B] hover:bg-slate-50 transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* Table Section: 972 x 471 */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[8px] flex flex-col overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#C2C6D4] bg-white">
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider w-[120px]">Student ID</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Name</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Course</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider w-[200px]">Status</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">In Time</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Out Time</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr className="border-b border-slate-100">
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] font-bold text-[#003F87] leading-tight">STU-<br/>1024</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="flex items-center gap-3">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#E5F0FF] text-[#003F87] font-bold text-[11px] flex items-center justify-center shrink-0">JB</div>
                    <div className="text-[14px] font-bold text-slate-900 leading-tight">Jordan<br/>Belfort</div>
                  </div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B] leading-tight">Investment<br/>Banking</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <span className="inline-flex items-center gap-2 bg-[#E5F7ED] text-[#008A2E] px-[12px] py-[4px] rounded-full text-[12px] font-bold">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#008A2E]"></span> Present
                  </span>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] font-medium text-slate-900 leading-tight">08:45<br/>AM</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] font-medium text-slate-900 leading-tight">04:30<br/>PM</div>
                </td>
                <td className="py-[16px] px-[24px] text-right">
                  <button className="text-[#555F6B] hover:text-[#003F87]"><MoreVertical size={18} /></button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="border-b border-slate-100">
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] font-bold text-[#003F87] leading-tight">STU-<br/>1025</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="flex items-center gap-3">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#F3F4F6] text-[#555F6B] font-bold text-[11px] flex items-center justify-center shrink-0">SC</div>
                    <div className="text-[14px] font-bold text-slate-900 leading-tight">Sarah Connor</div>
                  </div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B]">Cyber Security</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="flex flex-col items-start gap-1">
                    <span className="inline-flex items-center gap-2 bg-[#FFF4E5] text-[#B26E00] px-[12px] py-[4px] rounded-full text-[12px] font-bold">
                      <span className="w-[6px] h-[6px] rounded-full bg-[#B26E00]"></span> Late
                    </span>
                    <span className="text-[10px] text-[#B26E00] leading-tight max-w-[140px]">Note: Transit delay due to rain</span>
                  </div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] font-medium text-slate-900 leading-tight">09:15<br/>AM</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B]">-- : --</div>
                </td>
                <td className="py-[16px] px-[24px] text-right">
                  <button className="text-[#555F6B] hover:text-[#003F87]"><MoreVertical size={18} /></button>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="border-b border-slate-100">
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] font-bold text-[#003F87] leading-tight">STU-<br/>1026</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="flex items-center gap-3">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#F3F4F6] text-[#555F6B] font-bold text-[11px] flex items-center justify-center shrink-0">MP</div>
                    <div className="text-[14px] font-bold text-slate-900 leading-tight">Marcus<br/>Phoenix</div>
                  </div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B] leading-tight">Mech<br/>Engineering</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <span className="inline-flex items-center gap-2 bg-[#FDE2E2] text-[#D80000] px-[12px] py-[4px] rounded-full text-[12px] font-bold">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#D80000]"></span> Absent
                  </span>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B]">-- : --</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B]">-- : --</div>
                </td>
                <td className="py-[16px] px-[24px] text-right">
                  <button className="text-[#555F6B] hover:text-[#003F87]"><MoreVertical size={18} /></button>
                </td>
              </tr>
              {/* Row 4 */}
              <tr className="">
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] font-bold text-[#003F87] leading-tight">STU-<br/>1027</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="flex items-center gap-3">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#E5F0FF] text-[#003F87] font-bold text-[11px] flex items-center justify-center shrink-0">EL</div>
                    <div className="text-[14px] font-bold text-slate-900 leading-tight">Eleven<br/>Hopper</div>
                  </div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B]">Physics</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <span className="inline-flex items-center gap-2 bg-[#E5F0FF] text-[#003F87] px-[12px] py-[4px] rounded-full text-[12px] font-bold">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#003F87]"></span> Leave
                  </span>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B]">-- : --</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B]">-- : --</div>
                </td>
                <td className="py-[16px] px-[24px] text-right">
                  <button className="text-[#555F6B] hover:text-[#003F87]"><MoreVertical size={18} /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-[16px] px-[24px] border-t border-[#C2C6D4] bg-[#F8FAFC] flex justify-between items-center rounded-b-[8px]">
          <div className="text-[13px] text-[#555F6B] font-medium">Showing 1 to 10 of 250 entries</div>
          <div className="flex items-center gap-1">
            <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] border border-[#C2C6D4] text-[#555F6B] bg-white hover:bg-slate-50 transition-colors">&lt;</button>
            <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] bg-[#003F87] text-white font-bold">1</button>
            <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#555F6B] hover:bg-slate-100 transition-colors font-semibold">2</button>
            <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#555F6B] hover:bg-slate-100 transition-colors font-semibold">3</button>
            <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] border border-[#C2C6D4] text-[#555F6B] bg-white hover:bg-slate-50 transition-colors">&gt;</button>
          </div>
        </div>
      </div>

      {/* Stats Cards Bottom: 972 x 231 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[24px] pt-[8px]">
        {/* Overall Presence */}
        <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col justify-between h-[231px] shadow-sm">
          <div>
            <div className="w-[48px] h-[48px] rounded-full bg-[#E5F0FF] flex items-center justify-center text-[#003F87] mb-4">
              <CheckCircle size={24} />
            </div>
            <p className="text-[12px] font-bold text-[#555F6B] uppercase tracking-wide mb-1">OVERALL PRESENCE</p>
            <h3 className="text-[36px] font-bold text-[#003F87] leading-none">94.2%</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#008A2E]">
            <TrendingUp size={16} />
            <span>+2.4% from last week</span>
          </div>
        </div>

        {/* Average Latency */}
        <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col justify-between h-[231px] shadow-sm">
          <div>
            <div className="w-[48px] h-[48px] rounded-[8px] bg-[#FFF4E5] flex items-center justify-center text-[#B26E00] mb-4">
              <Clock size={24} />
            </div>
            <p className="text-[12px] font-bold text-[#555F6B] uppercase tracking-wide mb-1">AVERAGE LATENCY</p>
            <h3 className="text-[36px] font-bold text-[#003F87] leading-none">12m</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#B26E00]">
            <span className="w-3 border-b-[2px] border-current inline-block"></span>
            <span>No change in 30 days</span>
          </div>
        </div>
        
        {/* Placeholders for grid spacing as per Figma */}
        <div className="border border-solid border-[#C2C6D4] rounded-[8px] h-[231px] bg-white hidden xl:block"></div>
        <div className="border border-solid border-[#C2C6D4] rounded-[8px] h-[231px] bg-white hidden xl:block"></div>
      </div>

    </div>
  );
};

export default AttendanceContent;
