import React from 'react';
import { 
  ChevronRight, ChevronLeft, Download, FileText, Code, Palette, MousePointerClick, 
  Users, Award, TrendingDown, Gauge, Search, Filter 
} from 'lucide-react';

const AcademicJourneyContent = () => {
  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full overflow-y-auto" style={{scrollbarWidth: 'none'}}>
      
      {/* Top Banner */}
      <div className="w-full bg-[#003F87] rounded-[16px] flex overflow-hidden relative shadow-md min-h-[248px]">
        {/* Left Content */}
        <div className="p-[32px] flex flex-col justify-center w-[60%] z-10">
          <h2 className="text-[28px] font-bold text-white leading-tight mb-2">Institutional Academic Journey</h2>
          <p className="text-[14px] text-blue-100 mb-[32px] max-w-[420px]">
            Aggregate view of student progression across all active courses. Currently monitoring 3 core institutional stages.
          </p>
          <div className="flex gap-[16px]">
            <button className="bg-white text-[#003F87] px-[16px] py-[10px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
              <FileText size={16} /> View Detailed Report
            </button>
            <button className="border border-blue-300 text-white px-[16px] py-[10px] rounded-[6px] text-[13px] font-bold hover:bg-blue-800 transition-colors">
              Manage Curriculum
            </button>
          </div>
        </div>
        
        {/* Right Stats Card - inside banner */}
        <div className="w-[40%] p-[24px] flex items-center justify-end z-10">
          <div className="bg-white rounded-[12px] p-[20px] w-[308px] shadow-lg flex flex-col gap-[16px]">
            <p className="text-[10px] font-bold text-[#555F6B] uppercase tracking-wider">Avg. Completion Rate</p>
            <div className="flex items-end gap-[12px]">
              <h3 className="text-[42px] font-bold text-[#003F87] leading-none">72%</h3>
              <p className="text-[12px] text-[#555F6B] font-medium pb-1">Institutional Average</p>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#F3F4F6] h-[6px] rounded-full">
              <div className="bg-[#003F87] w-[72%] h-full rounded-full"></div>
            </div>
            {/* Split stats */}
            <div className="flex gap-[12px] pt-[8px] border-t border-slate-100">
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[20px] font-bold text-[#003F87] text-center leading-none">1,240</p>
                <p className="text-[10px] text-[#555F6B] text-center leading-tight mt-1">Active<br/>Students</p>
              </div>
              <div className="w-[1px] bg-slate-100"></div>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[20px] font-bold text-[#003F87] text-center leading-none">342</p>
                <p className="text-[10px] text-[#555F6B] text-center leading-tight mt-1">Certs<br/>Issued</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements behind stats */}
        <div className="absolute right-[140px] top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <div className="w-[180px] h-[180px] border-[6px] border-white rounded-full absolute -top-[90px] -right-[90px]"></div>
          <div className="w-[100px] h-[100px] border-[6px] border-white rounded-full absolute top-[70px] -right-[20px] bg-[#003F87]"></div>
          <div className="w-[140px] h-[12px] bg-white absolute top-[120px] right-[70px] rotate-45 rounded-full"></div>
          <div className="w-[40px] h-[40px] border-[6px] border-white rounded-full absolute top-[10px] right-[120px] bg-[#003F87]"></div>
          <div className="w-[100px] h-[6px] bg-white absolute top-[40px] right-[40px] -rotate-45 rounded-full"></div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center justify-between border border-[#C2C6D4] bg-white rounded-[8px] p-[16px] shadow-sm">
        <div className="flex items-center gap-[24px]">
          <div className="flex items-center gap-[8px] text-[#555F6B]">
            <Filter size={16} />
            <span className="text-[13px] font-bold">Filters:</span>
          </div>
          <div className="flex items-center gap-[16px]">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#555F6B] uppercase mb-1 tracking-wider">Course</span>
              <select className="border border-[#C2C6D4] rounded-[4px] text-[13px] px-[12px] py-[6px] min-w-[140px] text-slate-800 outline-none bg-transparent">
                <option>All Courses</option>
              </select>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#555F6B] uppercase mb-1 tracking-wider">Category</span>
              <select className="border border-[#C2C6D4] rounded-[4px] text-[13px] px-[12px] py-[6px] min-w-[140px] text-slate-800 outline-none bg-transparent">
                <option>All Categories</option>
              </select>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#555F6B] uppercase mb-1 tracking-wider">Batch</span>
              <select className="border border-[#C2C6D4] rounded-[4px] text-[13px] px-[12px] py-[6px] min-w-[140px] text-slate-800 outline-none bg-transparent">
                <option>All Batches</option>
              </select>
            </div>
          </div>
        </div>
        <button className="text-[13px] font-bold text-[#003F87] hover:underline px-[16px]">Reset</button>
      </div>

      {/* Main Content Progression Container */}
      <div className="bg-white rounded-[12px] border border-[#C2C6D4] shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Section Header */}
        <div className="p-[24px] flex justify-between items-start border-b border-[#C2C6D4]">
          <div>
            <h3 className="text-[18px] font-bold text-[#003F87] mb-1">Institutional Stage Progression</h3>
            <p className="text-[13px] text-[#555F6B]">Global student distribution and performance metrics across curriculum phases</p>
          </div>
          <div className="flex gap-[16px] items-center">
            <div className="flex items-center gap-[6px]">
              <div className="w-[8px] h-[8px] rounded-full bg-[#003F87]"></div>
              <span className="text-[12px] font-bold text-slate-800">High Participation</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <div className="w-[8px] h-[8px] rounded-full bg-[#C2C6D4]"></div>
              <span className="text-[12px] font-bold text-[#555F6B]">Scaling Phase</span>
            </div>
          </div>
        </div>

        {/* Floating Download Button */}
        <button className="absolute right-[24px] top-[90px] bg-[#003F87] text-white p-[10px] rounded-[6px] shadow-sm hover:bg-[#002B5E] transition-colors z-20">
          <Download size={18} />
        </button>

        {/* Progression Rows */}
        <div className="p-[32px] flex flex-col gap-[32px] relative before:content-[''] before:absolute before:left-[52px] before:top-[40px] before:bottom-[40px] before:w-[2px] before:bg-slate-200 before:z-0">
          
          {/* Row 1 */}
          <div className="flex items-start gap-[32px] relative z-10">
            <div className="w-[44px] h-[44px] rounded-[10px] bg-[#003F87] flex items-center justify-center shrink-0 shadow-md">
              <Code size={22} className="text-white" />
            </div>
            <div className="flex-1 bg-slate-50 border border-[#C2C6D4] rounded-[8px] p-[20px]">
              <h4 className="text-[15px] font-bold text-[#003F87] mb-[16px]">MERN Stack Development</h4>
              <div className="flex gap-[12px] flex-wrap">
                <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                  <span className="text-[13px] font-bold text-slate-900 leading-tight">Alex<br/>Johnson</span>
                  <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 3</span>
                </div>
                <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                  <span className="text-[13px] font-bold text-slate-900 leading-tight">Sarah Chen</span>
                  <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 2</span>
                </div>
                <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                  <span className="text-[13px] font-bold text-slate-900 leading-tight">Mike Ross</span>
                  <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 1</span>
                </div>
                <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                  <span className="text-[13px] font-bold text-slate-900 leading-tight">Emma<br/>Watson</span>
                  <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex items-start gap-[32px] relative z-10">
            <div className="w-[44px] h-[44px] rounded-[10px] bg-[#003F87] flex items-center justify-center shrink-0 shadow-md">
              <ChevronLeft size={22} className="text-white" />
            </div>
            <div className="flex-1 bg-slate-50 border border-[#C2C6D4] rounded-[8px] p-[20px]">
              <h4 className="text-[15px] font-bold text-[#003F87] mb-[16px]">Flutter App Development</h4>
              <div className="flex gap-[12px] flex-wrap">
                <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                  <span className="text-[13px] font-bold text-slate-900 leading-tight">James Miller</span>
                  <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 2</span>
                </div>
                <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                  <span className="text-[13px] font-bold text-slate-900 leading-tight">Lily Evans</span>
                  <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex items-start gap-[32px] relative z-10">
            <div className="w-[44px] h-[44px] rounded-[10px] bg-[#003F87] flex items-center justify-center shrink-0 shadow-md">
              <Palette size={22} className="text-white" />
            </div>
            <div className="flex-1 bg-slate-50 border border-[#C2C6D4] rounded-[8px] p-[20px]">
              <h4 className="text-[15px] font-bold text-[#003F87] mb-[16px]">Graphic Design</h4>
              <div className="flex gap-[12px] flex-wrap">
                <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                  <span className="text-[13px] font-bold text-slate-900 leading-tight">David<br/>Gandy</span>
                  <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 3</span>
                </div>
                <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                  <span className="text-[13px] font-bold text-slate-900 leading-tight">Chloe Price</span>
                  <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4 */}
          <div className="flex items-start gap-[32px] relative z-10">
            <div className="w-[44px] h-[44px] rounded-[10px] bg-[#003F87] flex items-center justify-center shrink-0 shadow-md">
              <MousePointerClick size={22} className="text-white" />
            </div>
            <div className="flex-1 bg-slate-50 border border-[#C2C6D4] rounded-[8px] p-[20px]">
              <h4 className="text-[15px] font-bold text-[#003F87] mb-[16px]">Digital Marketing</h4>
              <div className="flex gap-[12px] flex-wrap">
                <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                  <span className="text-[13px] font-bold text-slate-900 leading-tight">Tom Hardy</span>
                  <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 1</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Stats */}
      <div className="w-full bg-transparent flex flex-col gap-[32px] mt-[16px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[24px]">
          
          <div className="bg-white rounded-[8px] p-[20px] flex flex-col justify-between shadow-sm border border-[#C2C6D4]">
            <div className="flex items-center gap-[8px] mb-[16px]">
              <div className="bg-[#E5F0FF] p-[6px] rounded-[6px]">
                <Users size={16} className="text-[#003F87]" />
              </div>
              <span className="text-[13px] font-bold text-slate-900">Active Cohorts</span>
            </div>
            <div>
              <h3 className="text-[28px] font-bold text-[#003F87] leading-none mb-1">24</h3>
              <p className="text-[11px] text-[#555F6B]">Across 8 departments</p>
            </div>
          </div>

          <div className="bg-white rounded-[8px] p-[20px] flex flex-col justify-between shadow-sm border border-[#C2C6D4]">
            <div className="flex items-center gap-[8px] mb-[16px]">
              <div className="bg-[#E5F0FF] p-[6px] rounded-[6px]">
                <Award size={16} className="text-[#003F87]" />
              </div>
              <span className="text-[13px] font-bold text-slate-900">Certifications</span>
            </div>
            <div>
              <h3 className="text-[28px] font-bold text-[#003F87] leading-none mb-1">342</h3>
              <p className="text-[11px] text-[#555F6B]">+18% this quarter</p>
            </div>
          </div>

          <div className="bg-white rounded-[8px] p-[20px] flex flex-col justify-between shadow-sm border border-[#C2C6D4]">
            <div className="flex items-center gap-[8px] mb-[16px]">
              <div className="bg-[#E5F0FF] p-[6px] rounded-[6px]">
                <TrendingDown size={16} className="text-[#003F87]" />
              </div>
              <span className="text-[13px] font-bold text-slate-900">Drop-out Risk</span>
            </div>
            <div>
              <h3 className="text-[28px] font-bold text-[#D80000] leading-none mb-1">4.2%</h3>
              <p className="text-[11px] text-[#555F6B]">Decreasing trend</p>
            </div>
          </div>

          <div className="bg-white rounded-[8px] p-[20px] flex flex-col justify-between shadow-sm border border-[#C2C6D4]">
            <div className="flex items-center gap-[8px] mb-[16px]">
              <div className="bg-[#E5F0FF] p-[6px] rounded-[6px]">
                <Gauge size={16} className="text-[#003F87]" />
              </div>
              <span className="text-[13px] font-bold text-slate-900">Learning Velocity</span>
            </div>
            <div>
              <h3 className="text-[28px] font-bold text-[#003F87] leading-none mb-1">1.4x</h3>
              <p className="text-[11px] text-[#555F6B]">Above global average</p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Absolute Bottom Footer text */}
      <div className="w-full flex justify-center pb-[16px] pt-[8px]">
        <p className="text-[10px] text-[#555F6B] font-bold uppercase tracking-wider">
          © 2024 Novox Edtech Institutional Management System. Global Institutional Dashboard - V2.4.0
        </p>
      </div>

    </div>
  );
};

export default AcademicJourneyContent;
