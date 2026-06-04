import React from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import { useState } from 'react';

const LowerContent = () => {
  const [viewAllBtn, setViewAllBtn] = useState(true);
  const handleViewAllClick = () => {
    setViewAllBtn(!viewAllBtn);
  };
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-[24px]">
      {/* Attendance Overview (Takes 2 columns) */}
      <div className="xl:col-span-2 bg-white border border-[#C2C6D4] rounded-[8px] flex flex-col h-full">
        <div className="p-[24px] border-b border-[#C2C6D4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <h2 className="text-[16px] font-bold text-slate-800">Today's Attendance Overview</h2>
            <p className="text-[12px] text-slate-500">Real-time status tracking for the institution.</p>
          </div>
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button className="px-4 py-1.5 text-xs font-bold bg-white text-[#003F87] rounded-md shadow-sm">Students</button>
            <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Employees</button>
          </div>
        </div>
        
        <div className="w-full overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Entity Name</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check-In</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-[#003F87] font-bold text-xs flex items-center justify-center">AS</div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Alex Thompson</div>
                    <div className="text-[11px] text-slate-500">Grade 12 - Section A</div>
                  </div>
                </td>
                <td className="py-4 px-6 text-[13px] font-medium text-slate-700">08:15 AM</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Present
                  </span>
                </td>
                <td className="py-4 px-6">
                  <a href="#" className="text-[#003F87] text-xs font-bold hover:underline">Details</a>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-[#003F87] font-bold text-xs flex items-center justify-center">MB</div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Maria Garcia</div>
                    <div className="text-[11px] text-slate-500">Grade 11 - Section B</div>
                  </div>
                </td>
                <td className="py-4 px-6 text-[13px] font-medium text-slate-700">08:42 AM</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Late
                  </span>
                </td>
                <td className="py-4 px-6">
                  <a href="#" className="text-[#003F87] text-xs font-bold hover:underline">Details</a>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-[#003F87] font-bold text-xs flex items-center justify-center">JD</div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">James Wilson</div>
                    <div className="text-[11px] text-slate-500">Grade 12 - Section A</div>
                  </div>
                </td>
                <td className="py-4 px-6 text-[13px] font-medium text-slate-500">--:--</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    Absent
                  </span>
                </td>
                <td className="py-4 px-6">
                  <a href="#" className="text-[#003F87] text-xs font-bold hover:underline">Details</a>
                </td>
              </tr>
              {/* Row 4 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-[#003F87] font-bold text-xs flex items-center justify-center">LK</div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Linda Kim</div>
                    <div className="text-[11px] text-slate-500">Grade 10 - Section C</div>
                  </div>
                </td>
                <td className="py-4 px-6 text-[13px] font-medium text-slate-700">08:02 AM</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Present
                  </span>
                </td>
                <td className="py-4 px-6">
                  <a href="#" className="text-[#003F87] text-xs font-bold hover:underline">Details</a>
                </td>
              </tr>
              {!viewAllBtn && (
                <>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-[#003F87] font-bold text-xs flex items-center justify-center">LK</div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Linda Kim</div>
                      <div className="text-[11px] text-slate-500">Grade 10 - Section C</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-slate-700">08:02 AM</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Present
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <a href="#" className="text-[#003F87] text-xs font-bold hover:underline">Details</a>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-[#003F87] font-bold text-xs flex items-center justify-center">LK</div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Linda Kim</div>
                      <div className="text-[11px] text-slate-500">Grade 10 - Section C</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-slate-700">08:02 AM</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Present
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <a href="#" className="text-[#003F87] text-xs font-bold hover:underline">Details</a>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-[#003F87] font-bold text-xs flex items-center justify-center">LK</div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Linda Kim</div>
                      <div className="text-[11px] text-slate-500">Grade 10 - Section C</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-slate-700">08:02 AM</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Present
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <a href="#" className="text-[#003F87] text-xs font-bold hover:underline">Details</a>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-[#003F87] font-bold text-xs flex items-center justify-center">LK</div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Linda Kim</div>
                      <div className="text-[11px] text-slate-500">Grade 10 - Section C</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-slate-700">08:02 AM</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Present
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <a href="#" className="text-[#003F87] text-xs font-bold hover:underline">Details</a>
                  </td>
                </tr>
                </>
                
              )}
            </tbody>
          </table>
        </div>
        {viewAllBtn && (
          <div className="p-4 text-center border-t border-slate-200">
            <button onClick={handleViewAllClick} className="text-[#003F87] text-xs font-bold hover:underline">
              View All Attendance Records
            </button>
          </div>
        )}
      </div>


      {/* Widgets (Takes 1 column) */}
      <div className="xl:col-span-1 flex flex-col gap-[24px]">
        {/* New Lead Widget */}
        <div className="bg-[#003F87] rounded-xl p-6 flex items-center justify-between shadow-sm cursor-pointer hover:bg-[#002B5E] transition-colors text-white">
          <div>
            <h3 className="text-[15px] font-bold">New Lead</h3>
            <p className="text-[12px] text-blue-100 mt-1">Register a new prospective student</p>
          </div>
          <ChevronRight size={20} />
        </div>

        {/* SEO Widget */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-bold text-slate-800">SEO Agent Active</h3>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Zap size={16} />
            </div>
          </div>
          <p className="text-[12px] text-slate-500 leading-relaxed mb-6">
            Your blog automation is running. 3 new articles published this week.
          </p>
          
          <div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div className="w-[75%] h-full bg-[#003F87] rounded-full"></div>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-500">Optimization Score</span>
              <span className="text-[#003F87]">75%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowerContent;
