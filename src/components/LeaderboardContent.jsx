import React from 'react';
import { ChevronRight, Star, GitMerge, Users, Code, Layers, MoreHorizontal, Filter, Share2 } from 'lucide-react';

const LeaderboardContent = () => {
  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full overflow-y-auto" style={{scrollbarWidth: 'none'}}>
      
      {/* Header Area */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[20px] font-bold text-[#003F87] leading-tight mb-1">Student Achievement Leaderboard</h2>
          <p className="text-[13px] text-[#555F6B]">Recognizing excellence across internal courses and professional platforms.</p>
        </div>
        <div className="flex flex-col items-end gap-[12px]">
          <div className="flex bg-[#F8FAFC] rounded-[8px] p-[4px] border border-[#C2C6D4]">
            <button className="px-[12px] py-[4px] text-[12px] font-bold text-[#003F87] bg-white rounded-[4px] shadow-sm">All Time</button>
            <button className="px-[12px] py-[4px] text-[12px] font-bold text-[#555F6B] hover:text-slate-900 transition-colors">Monthly</button>
            <button className="px-[12px] py-[4px] text-[12px] font-bold text-[#555F6B] hover:text-slate-900 transition-colors">Weekly</button>
          </div>
          <button className="flex items-center gap-[6px] text-[12px] font-bold text-[#555F6B] border border-[#C2C6D4] px-[12px] py-[6px] rounded-[6px] hover:bg-slate-50 transition-colors">
            <Filter size={14} /> Advanced Filters
          </button>
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="flex gap-[12px] overflow-x-auto pb-2" style={{scrollbarWidth: 'none'}}>
        <div className="flex items-center gap-[12px] px-[16px] py-[12px] border-[2px] border-[#003F87] rounded-[8px] bg-white cursor-pointer min-w-[180px] shrink-0">
          <Star size={20} className="text-[#003F87] fill-[#003F87]" />
          <div className="leading-tight">
            <p className="text-[13px] font-bold text-[#003F87]">Internal</p>
            <p className="text-[11px] text-[#555F6B]">Coursework</p>
          </div>
        </div>
        <div className="flex items-center gap-[12px] px-[16px] py-[12px] border border-[#C2C6D4] rounded-[8px] bg-white opacity-60 hover:opacity-100 cursor-pointer min-w-[180px] shrink-0 transition-opacity">
          <GitMerge size={20} className="text-[#555F6B]" />
          <div className="leading-tight">
            <p className="text-[13px] font-bold text-slate-800">GitHub</p>
            <p className="text-[11px] text-[#555F6B]">Code Contrib.</p>
          </div>
        </div>
        <div className="flex items-center gap-[12px] px-[16px] py-[12px] border border-[#C2C6D4] rounded-[8px] bg-white opacity-60 hover:opacity-100 cursor-pointer min-w-[180px] shrink-0 transition-opacity">
          <Users size={20} className="text-[#0A66C2]" />
          <div className="leading-tight">
            <p className="text-[13px] font-bold text-slate-800">LinkedIn</p>
            <p className="text-[11px] text-[#555F6B]">Professional</p>
          </div>
        </div>
        <div className="flex items-center gap-[12px] px-[16px] py-[12px] border border-[#C2C6D4] rounded-[8px] bg-white opacity-60 hover:opacity-100 cursor-pointer min-w-[180px] shrink-0 transition-opacity">
          <Layers size={20} className="text-[#1769FF]" />
          <div className="leading-tight">
            <p className="text-[13px] font-bold text-slate-800">Behance</p>
            <p className="text-[11px] text-[#555F6B]">Design Portfolio</p>
          </div>
        </div>
        <div className="flex items-center gap-[12px] px-[16px] py-[12px] border border-[#C2C6D4] rounded-[8px] bg-white opacity-60 hover:opacity-100 cursor-pointer min-w-[180px] shrink-0 transition-opacity">
          <Code size={20} className="text-[#FFA116]" />
          <div className="leading-tight">
            <p className="text-[13px] font-bold text-slate-800">LeetCode</p>
            <p className="text-[11px] text-[#555F6B]">Algorithms</p>
          </div>
        </div>
        <div className="flex items-center gap-[12px] px-[16px] py-[12px] border border-[#C2C6D4] rounded-[8px] bg-white opacity-60 hover:opacity-100 cursor-pointer min-w-[150px] shrink-0 transition-opacity">
          <MoreHorizontal size={20} className="text-[#555F6B]" />
          <div className="leading-tight">
            <p className="text-[13px] font-bold text-slate-800">Other</p>
            <p className="text-[11px] text-[#555F6B]">External API</p>
          </div>
        </div>
      </div>

      {/* Podium Area */}
      <div className="flex justify-center items-end mt-[24px] gap-[24px]">
        {/* Rank 2 */}
        <div className="flex flex-col items-center bg-white rounded-[16px] p-[24px] border border-[#C2C6D4] shadow-sm w-[280px]">
          <div className="relative mb-[16px]">
            <img src="https://i.pravatar.cc/150?u=ethan" alt="Ethan Wright" className="w-[80px] h-[80px] rounded-[16px] object-cover border-4 border-white shadow-md" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[28px] h-[28px] bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-[14px] border-2 border-white">2</div>
          </div>
          <h3 className="text-[18px] font-bold text-slate-900 text-center">Ethan Wright</h3>
          <p className="text-[12px] text-[#555F6B] text-center mb-[24px]">Full Stack Development</p>
          <div className="bg-[#F8FAFC] w-full py-[16px] rounded-[8px] text-center">
            <p className="text-[28px] font-bold text-[#003F87] leading-none">2,840</p>
            <p className="text-[10px] font-bold text-[#555F6B] uppercase tracking-wider mt-1">Points</p>
          </div>
        </div>

        {/* Rank 1 */}
        <div className="flex flex-col items-center bg-white rounded-[16px] p-[24px] border-[2px] border-[#003F87] shadow-lg w-[320px] relative z-10 -mt-[40px]">
          <div className="absolute -top-[16px]">
            <Star size={32} className="text-[#FFB800] fill-[#FFB800]" />
          </div>
          <div className="relative mb-[16px] mt-[12px]">
            <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah Jenkins" className="w-[100px] h-[100px] rounded-[20px] object-cover border-4 border-[#003F87] shadow-md" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[32px] h-[32px] bg-[#003F87] text-white rounded-full flex items-center justify-center font-bold text-[16px] border-2 border-white">1</div>
          </div>
          <h3 className="text-[22px] font-bold text-[#003F87] text-center">Sarah Jenkins</h3>
          <p className="text-[13px] text-[#555F6B] text-center mb-[24px]">Advanced UI/UX Design</p>
          <div className="bg-[#003F87] w-full py-[20px] rounded-[12px] text-center">
            <p className="text-[36px] font-bold text-white leading-none">3,125</p>
            <p className="text-[10px] font-bold text-[#93C5FD] uppercase tracking-widest mt-2">Elite Achievement Score</p>
          </div>
        </div>

        {/* Rank 3 */}
        <div className="flex flex-col items-center bg-white rounded-[16px] p-[24px] border border-[#C2C6D4] shadow-sm w-[280px]">
          <div className="relative mb-[16px]">
            <img src="https://i.pravatar.cc/150?u=aarav" alt="Aarav Patel" className="w-[80px] h-[80px] rounded-[16px] object-cover border-4 border-white shadow-md" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[28px] h-[28px] bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-[14px] border-2 border-white">3</div>
          </div>
          <h3 className="text-[18px] font-bold text-slate-900 text-center">Aarav Patel</h3>
          <p className="text-[12px] text-[#555F6B] text-center mb-[24px]">Cloud Architecture</p>
          <div className="bg-[#F8FAFC] w-full py-[16px] rounded-[8px] text-center">
            <p className="text-[28px] font-bold text-[#003F87] leading-none">2,610</p>
            <p className="text-[10px] font-bold text-[#555F6B] uppercase tracking-wider mt-1">Points</p>
          </div>
        </div>
      </div>

      {/* List View */}
      <div className="flex flex-col border border-[#C2C6D4] rounded-[12px] bg-white shadow-sm mt-[8px] relative">
        
        {/* Row 4 */}
        <div className="flex items-center justify-between p-[20px] border-b border-[#C2C6D4] hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-[24px]">
            <span className="text-[18px] font-bold text-slate-900 w-[24px] text-center">4</span>
            <img src="https://i.pravatar.cc/150?u=maya" alt="Maya" className="w-[48px] h-[48px] rounded-[8px] object-cover" />
            <div>
              <h4 className="text-[15px] font-bold text-slate-900">Maya Rodriguez</h4>
              <p className="text-[12px] text-[#555F6B]">Digital Marketing Professional</p>
            </div>
          </div>
          <div className="flex items-center gap-[24px]">
            <div className="flex items-center gap-[12px] border-r border-[#C2C6D4] pr-[24px]">
              <div className="flex gap-2 opacity-60 items-center">
                <Star size={16} /> <GitMerge size={16} /> <Users size={16} />
              </div>
              <span className="text-[13px] font-bold text-slate-800">12 Courses Completed</span>
            </div>
            <div className="text-right min-w-[100px]">
              <p className="text-[18px] font-bold text-[#003F87] leading-none">2,450</p>
              <p className="text-[11px] font-bold text-[#008A2E] mt-1">↗ +142 this week</p>
            </div>
            <ChevronRight size={20} className="text-[#C2C6D4]" />
          </div>
        </div>

        {/* Row 5 */}
        <div className="flex items-center justify-between p-[20px] border-b border-[#C2C6D4] hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-[24px]">
            <span className="text-[18px] font-bold text-slate-900 w-[24px] text-center">5</span>
            <img src="https://i.pravatar.cc/150?u=lucas" alt="Lucas" className="w-[48px] h-[48px] rounded-[8px] object-cover" />
            <div>
              <h4 className="text-[15px] font-bold text-slate-900">Lucas Bennett</h4>
              <p className="text-[12px] text-[#555F6B]">Data Science Immersion</p>
            </div>
          </div>
          <div className="flex items-center gap-[24px]">
            <div className="flex items-center gap-[12px] border-r border-[#C2C6D4] pr-[24px]">
              <div className="flex gap-2 opacity-60 items-center">
                <Star size={16} /> <Users size={16} />
              </div>
              <span className="text-[13px] font-bold text-slate-800">9 Courses Completed</span>
            </div>
            <div className="text-right min-w-[100px]">
              <p className="text-[18px] font-bold text-[#003F87] leading-none">2,280</p>
              <p className="text-[11px] font-bold text-[#555F6B] mt-1">— No change</p>
            </div>
            <ChevronRight size={20} className="text-[#C2C6D4]" />
          </div>
        </div>

        {/* Row 6 */}
        <div className="flex items-center justify-between p-[20px] hover:bg-slate-50 transition-colors rounded-b-[12px]">
          <div className="flex items-center gap-[24px]">
            <span className="text-[18px] font-bold text-slate-900 w-[24px] text-center">6</span>
            <img src="https://i.pravatar.cc/150?u=elena" alt="Elena" className="w-[48px] h-[48px] rounded-[8px] object-cover" />
            <div>
              <h4 className="text-[15px] font-bold text-slate-900">Elena Kozlova</h4>
              <p className="text-[12px] text-[#555F6B]">Cyber Security Specialist</p>
            </div>
          </div>
          <div className="flex items-center gap-[24px]">
            <div className="flex items-center gap-[12px] border-r border-[#C2C6D4] pr-[24px]">
              <div className="flex gap-2 opacity-60 items-center">
                <Star size={16} />
              </div>
              <span className="text-[13px] font-bold text-slate-800">15 Courses Completed</span>
            </div>
            <div className="text-right min-w-[100px]">
              <p className="text-[18px] font-bold text-[#003F87] leading-none">2,115</p>
              <p className="text-[11px] font-bold text-[#D80000] mt-1">↘ -1 rank</p>
            </div>
            <ChevronRight size={20} className="text-[#C2C6D4]" />
          </div>
        </div>
        
        {/* Floating Share Button on the right edge */}
        <button className="absolute -right-[16px] bottom-[20px] bg-[#003F87] text-white p-[12px] rounded-[8px] shadow-lg hover:bg-[#002B5E] transition-colors">
          <Share2 size={20} />
        </button>

      </div>

      {/* Footer Load More */}
      <div className="w-full flex flex-col items-center mt-[24px] pb-[12px]">
        <button className="border border-[#C2C6D4] text-[#003F87] bg-white hover:bg-slate-50 transition-colors px-[24px] py-[8px] rounded-[6px] text-[13px] font-bold mb-[12px] shadow-sm">
          Load More Students
        </button>
        <p className="text-[11px] text-[#555F6B]">Showing 6 of 1,248 enrolled students</p>
      </div>

    </div>
  );
};

export default LeaderboardContent;
