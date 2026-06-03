import React from 'react';
import { GraduationCap, Phone, Plus } from 'lucide-react';

const StudentsContent = () => {
  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full">
      {/* Top Filter Container */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[8px] p-[24px] flex flex-col sm:flex-row gap-[24px] h-auto sm:h-[108px] items-center">
        <div className="flex-1 w-full max-w-none sm:max-w-[240px]">
          <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Course Filter</label>
          <select className="w-full bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px] text-[13px] text-slate-800 outline-none appearance-none">
            <option>All Courses</option>
          </select>
        </div>
        <div className="flex-1 w-full max-w-none sm:max-w-[240px]">
          <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Enrollment Month</label>
          <select className="w-full bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px] text-[13px] text-slate-800 outline-none appearance-none">
            <option>All Months</option>
          </select>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px]">
        
        {/* Card 1 */}
        <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col h-[247px]">
          <div className="flex items-start gap-4 mb-auto">
            <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden bg-slate-200 shrink-0">
              <img src="https://i.pravatar.cc/150?u=1" alt="David Harrison" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#008A2E] border-[2px] border-white rounded-full"></div>
            </div>
            <div>
              <span className="inline-block bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] mb-1">SID: 20240101</span>
              <h3 className="text-[16px] font-bold text-slate-900 leading-tight">David Harrison</h3>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-4 mb-4">
            <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
              <GraduationCap size={14} /> M.S. Data Science
            </div>
            <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
              <Phone size={14} /> +1 (555) 012-3456
            </div>
          </div>
          
          <div className="border-t border-dashed border-[#C2C6D4] pt-4 flex justify-between items-center">
            <div className="text-[11px] font-semibold text-[#555F6B]">Fee Status: <span className="text-[#008A2E] font-bold">Paid</span></div>
            <div className="text-[11px] font-semibold text-[#555F6B]">Att: <span className="text-[#003F87] font-bold">94%</span></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col h-[247px]">
          <div className="flex items-start gap-4 mb-auto">
            <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden bg-slate-200 shrink-0">
              <img src="https://i.pravatar.cc/150?u=2" alt="Elena Rodriguez" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#008A2E] border-[2px] border-white rounded-full"></div>
            </div>
            <div>
              <span className="inline-block bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] mb-1">SID: 20240102</span>
              <h3 className="text-[16px] font-bold text-slate-900 leading-tight">Elena Rodriguez</h3>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-4 mb-4">
            <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
              <GraduationCap size={14} /> UX Design Professional
            </div>
            <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
              <Phone size={14} /> +1 (555) 012-7890
            </div>
          </div>
          
          <div className="border-t border-dashed border-[#C2C6D4] pt-4 flex justify-between items-center">
            <div className="text-[11px] font-semibold text-[#555F6B]">Fee Status: <span className="text-[#D80000] font-bold">Pending</span></div>
            <div className="text-[11px] font-semibold text-[#555F6B]">Att: <span className="text-[#003F87] font-bold">88%</span></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col h-[247px]">
          <div className="flex items-start gap-4 mb-auto">
            <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden bg-slate-200 shrink-0">
              <img src="https://i.pravatar.cc/150?u=3" alt="James Miller" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#008A2E] border-[2px] border-white rounded-full"></div>
            </div>
            <div>
              <span className="inline-block bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] mb-1">SID: 20240103</span>
              <h3 className="text-[16px] font-bold text-slate-900 leading-tight">James Miller</h3>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-4 mb-4">
            <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
              <GraduationCap size={14} /> Business Admin
            </div>
            <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
              <Phone size={14} /> +1 (555) 012-1122
            </div>
          </div>
          
          <div className="border-t border-dashed border-[#C2C6D4] pt-4 flex justify-between items-center">
            <div className="text-[11px] font-semibold text-[#555F6B]">Fee Status: <span className="text-[#008A2E] font-bold">Paid</span></div>
            <div className="text-[11px] font-semibold text-[#555F6B]">Att: <span className="text-[#003F87] font-bold">97%</span></div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col h-[247px]">
          <div className="flex items-start gap-4 mb-auto">
            <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden bg-slate-200 shrink-0">
              <img src="https://i.pravatar.cc/150?u=4" alt="Sophia Chen" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#008A2E] border-[2px] border-white rounded-full"></div>
            </div>
            <div>
              <span className="inline-block bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] mb-1">SID: 20240104</span>
              <h3 className="text-[16px] font-bold text-slate-900 leading-tight">Sophia Chen</h3>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-4 mb-4">
            <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
              <GraduationCap size={14} /> Marketing Strategy
            </div>
            <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
              <Phone size={14} /> +1 (555) 012-9988
            </div>
          </div>
          
          <div className="border-t border-dashed border-[#C2C6D4] pt-4 flex justify-between items-center">
            <div className="text-[11px] font-semibold text-[#555F6B]">Fee Status: <span className="text-[#008A2E] font-bold">Paid</span></div>
            <div className="text-[11px] font-semibold text-[#555F6B]">Att: <span className="text-[#003F87] font-bold">92%</span></div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col h-[247px]">
          <div className="flex items-start gap-4 mb-auto">
            <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden bg-slate-200 shrink-0">
              <img src="https://i.pravatar.cc/150?u=5" alt="Michael Scott" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#008A2E] border-[2px] border-white rounded-full"></div>
            </div>
            <div>
              <span className="inline-block bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] mb-1">SID: 20240105</span>
              <h3 className="text-[16px] font-bold text-slate-900 leading-tight">Michael Scott</h3>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-4 mb-4">
            <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
              <GraduationCap size={14} /> Cybersecurity Ops
            </div>
            <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
              <Phone size={14} /> +1 (555) 012-3344
            </div>
          </div>
          
          <div className="border-t border-dashed border-[#C2C6D4] pt-4 flex justify-between items-center">
            <div className="text-[11px] font-semibold text-[#555F6B]">Fee Status: <span className="text-[#008A2E] font-bold">Paid</span></div>
            <div className="text-[11px] font-semibold text-[#555F6B]">Att: <span className="text-[#003F87] font-bold">76%</span></div>
          </div>
        </div>

        {/* Enroll Card */}
        <div className="bg-white rounded-[8px] border border-dashed border-[#C2C6D4] p-[24px] flex flex-col items-center justify-center h-[247px] cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="w-[40px] h-[40px] rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#555F6B] mb-3">
            <Plus size={20} />
          </div>
          <h3 className="text-[14px] font-bold text-slate-900 leading-tight">Enroll New Student</h3>
          <p className="text-[11px] text-[#555F6B] mt-1">Quick intake form</p>
        </div>

      </div>

      {/* Pagination */}
      <div className="w-full flex justify-between items-center pt-[8px]">
        <div className="text-[13px] text-[#555F6B] font-medium">Showing 1 to 5 of 1,240 students</div>
        <div className="flex items-center gap-1">
          <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] border border-[#C2C6D4] text-[#555F6B] bg-white hover:bg-slate-50 transition-colors">&lt;</button>
          <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] bg-[#003F87] text-white font-bold">1</button>
          <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#555F6B] hover:bg-slate-100 transition-colors font-semibold">2</button>
          <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#555F6B] hover:bg-slate-100 transition-colors font-semibold">3</button>
          <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#555F6B] hover:bg-slate-100 transition-colors">...</button>
          <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#555F6B] hover:bg-slate-100 transition-colors font-semibold">24</button>
          <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] border border-[#C2C6D4] text-[#555F6B] bg-white hover:bg-slate-50 transition-colors">&gt;</button>
        </div>
      </div>

    </div>
  );
};

export default StudentsContent;
