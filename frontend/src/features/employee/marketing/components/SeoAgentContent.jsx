import React from 'react';
import { 
  TrendingUp, History, Sparkles, Rocket, 
  Gauge, Key, Link as LinkIcon, Eye, CheckCircle2, Clock
} from 'lucide-react';

const SeoAgentContent = () => {
  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full overflow-y-auto" style={{scrollbarWidth: 'none'}}>
      
      {/* Header Area */}
      <div className="flex flex-col gap-[4px] w-full min-h-[52px]">
        <h2 className="text-[20px] font-bold text-[#003F87] leading-tight">Content Intelligence Hub</h2>
        <p className="text-[13px] text-[#555F6B]">Manage AI-driven content generation and search engine optimization in one unified dashboard.</p>
      </div>

      {/* Top 2 Columns */}
      <div className="flex gap-[24px] w-full">
        
        {/* Left Column - Most Viewed Blogs */}
        <div className="flex-[2] bg-white border border-[#C2C6D4] rounded-[12px] shadow-sm flex flex-col">
          <div className="flex items-center justify-between p-[20px] border-b border-[#C2C6D4]">
            <div className="flex items-center gap-[8px] text-[#003F87]">
              <TrendingUp size={18} />
              <h3 className="text-[15px] font-bold">Most Viewed Blogs</h3>
            </div>
            <button className="text-[13px] font-bold text-[#003F87] hover:underline">View Analytics</button>
          </div>
          <div className="flex flex-col p-[20px] gap-[24px]">
            
            {/* Blog 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[16px]">
                <div className="w-[48px] h-[48px] bg-slate-100 rounded-[8px] border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
                  <div className="w-[32px] h-[32px] bg-slate-200 rounded"></div>
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-slate-900 leading-tight mb-1">The Future of AI in Education 2024</h4>
                  <p className="text-[11px] text-[#555F6B]">Published 12 days ago • Category: EdTech</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold text-[#003F87]">12.4k</p>
                <p className="text-[11px] text-[#555F6B]">Total Views</p>
              </div>
            </div>

            {/* Blog 2 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[16px]">
                <div className="w-[48px] h-[48px] bg-slate-800 rounded-[8px] border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-blue-500 opacity-20"></div>
                  {/* Abstract lines */}
                  <div className="w-[120%] h-[2px] bg-blue-400 rotate-12 absolute"></div>
                  <div className="w-[120%] h-[2px] bg-cyan-400 -rotate-12 absolute"></div>
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-slate-900 leading-tight mb-1">10 Strategies for Better Student<br/>Engagement</h4>
                  <p className="text-[11px] text-[#555F6B]">Published 5 days ago • Category: Pedagogy</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold text-[#003F87]">8.2k</p>
                <p className="text-[11px] text-[#555F6B]">Total Views</p>
              </div>
            </div>

            {/* Blog 3 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[16px]">
                <div className="w-[48px] h-[48px] bg-slate-600 rounded-[8px] border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-600 opacity-40"></div>
                  <div className="w-[120%] h-[2px] bg-white/40 rotate-[30deg] absolute top-[10px]"></div>
                  <div className="w-[120%] h-[2px] bg-white/40 rotate-[45deg] absolute bottom-[10px]"></div>
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-slate-900 leading-tight mb-1">Navigating the New Accreditation<br/>Standards</h4>
                  <p className="text-[11px] text-[#555F6B]">Published 20 days ago • Category: Compliance</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold text-[#003F87]">5.9k</p>
                <p className="text-[11px] text-[#555F6B]">Total Views</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column - Recent Additions */}
        <div className="flex-[1] bg-white border border-[#C2C6D4] rounded-[12px] shadow-sm flex flex-col relative min-w-[280px]">
          <div className="flex items-center gap-[8px] text-[#003F87] p-[20px] border-b border-[#C2C6D4]">
            <History size={18} />
            <h3 className="text-[15px] font-bold">Recent Additions</h3>
          </div>
          
          <div className="flex flex-col p-[24px] gap-[24px] relative">
            {/* Timeline vertical line */}
            <div className="absolute left-[27px] top-[32px] bottom-[32px] w-[2px] bg-slate-100 z-0"></div>

            {/* Item 1 */}
            <div className="flex items-start gap-[12px] relative z-10">
              <div className="w-[8px] h-[8px] bg-[#003F87] rounded-full mt-[4px] border-2 border-white box-content shrink-0 shadow-sm"></div>
              <div className="flex flex-col gap-[2px]">
                <p className="text-[11px] text-[#555F6B]">Today, 10:45 AM</p>
                <h4 className="text-[13px] font-bold text-slate-900 leading-tight">AI Grading: A Deep Dive</h4>
                <p className="text-[10px] text-[#555F6B] font-medium mt-1">Status: <span className="text-[#008A2E] font-bold uppercase tracking-wider">PUBLISHED</span></p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-start gap-[12px] relative z-10">
              <div className="w-[8px] h-[8px] bg-[#C2C6D4] rounded-full mt-[4px] border-2 border-white box-content shrink-0 shadow-sm"></div>
              <div className="flex flex-col gap-[2px]">
                <p className="text-[11px] text-[#555F6B]">Yesterday, 04:20 PM</p>
                <h4 className="text-[13px] font-bold text-slate-900 leading-tight">Hybrid Learning Models for 2025</h4>
                <p className="text-[10px] text-[#555F6B] font-medium mt-1">Status: <span className="font-bold uppercase tracking-wider text-[#003F87]">DRAFTING</span></p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-start gap-[12px] relative z-10">
              <div className="w-[8px] h-[8px] bg-[#C2C6D4] rounded-full mt-[4px] border-2 border-white box-content shrink-0 shadow-sm"></div>
              <div className="flex flex-col gap-[2px]">
                <p className="text-[11px] text-[#555F6B]">2 days ago</p>
                <h4 className="text-[13px] font-bold text-slate-900 leading-tight">Maximizing LMS Efficiency</h4>
                <p className="text-[10px] text-[#555F6B] font-medium mt-1">Status: <span className="font-bold uppercase tracking-wider text-[#555F6B]">SCHEDULED</span></p>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-[#C2C6D4] p-[16px] text-center bg-slate-50 rounded-b-[12px]">
            <button className="text-[13px] font-bold text-[#003F87] hover:underline">View All Activity</button>
          </div>
        </div>
      </div>

      {/* Blue SEO Banner */}
      <div className="w-full bg-[#003F87] rounded-[12px] p-[32px] flex items-center justify-between shadow-md text-white min-h-[244px]">
        {/* Left Side */}
        <div className="flex flex-col w-[45%]">
          <div className="flex items-center gap-[8px] mb-[16px]">
            <Sparkles size={16} className="text-white" />
            <span className="text-[12px] font-bold tracking-widest uppercase">SEO AI AGENT ACTIVE</span>
          </div>
          <h3 className="text-[20px] font-bold mb-[12px]">Analyze Your Digital Authority</h3>
          <p className="text-[13px] text-blue-100 mb-[24px] max-w-[360px] leading-relaxed">
            Enter any URL to get a comprehensive SEO analysis and improvement suggestions from our AI agent.
          </p>
          <div className="flex bg-white rounded-[6px] overflow-hidden p-[4px] shadow-sm max-w-[420px]">
            <input 
              type="text" 
              placeholder="https://novox-edtech.com/blog/ai-future" 
              className="flex-1 px-[12px] text-[13px] outline-none text-slate-800 placeholder:text-slate-400 min-w-0"
            />
            <button className="bg-[#003F87] text-white px-[20px] py-[8px] rounded-[4px] text-[13px] font-bold flex items-center gap-[8px] hover:bg-[#002B5E] transition-colors whitespace-nowrap">
              Analyze <Rocket size={14} />
            </button>
          </div>
        </div>

        {/* Right Side Stats */}
        <div className="flex-1 grid grid-cols-2 gap-[24px] ml-[24px] max-w-[480px]">
          
          <div className="border border-white/20 rounded-[8px] p-[20px] flex flex-col justify-between h-[96px] bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-[8px] text-blue-200">
              <Gauge size={16} />
              <span className="text-[12px]">Page Speed</span>
            </div>
            <p className="text-[20px] font-bold">98/100</p>
          </div>

          <div className="border border-white/20 rounded-[8px] p-[20px] flex flex-col justify-between h-[96px] bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-[8px] text-blue-200">
              <Key size={16} />
              <span className="text-[12px]">Keywords</span>
            </div>
            <p className="text-[20px] font-bold">24 Active</p>
          </div>

          <div className="border border-white/20 rounded-[8px] p-[20px] flex flex-col justify-between h-[96px] bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-[8px] text-blue-200">
              <LinkIcon size={16} />
              <span className="text-[12px]">Backlinks</span>
            </div>
            <p className="text-[20px] font-bold">1.2k</p>
          </div>

          <div className="border border-white/20 rounded-[8px] p-[20px] flex flex-col justify-between h-[96px] bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-[8px] text-blue-200">
              <Eye size={16} />
              <span className="text-[12px]">Visibility</span>
            </div>
            <p className="text-[20px] font-bold">+12%</p>
          </div>

        </div>
      </div>

      {/* Weekly SEO Health Summary */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[12px] shadow-sm flex flex-col">
        <div className="p-[24px] flex items-start justify-between border-b border-[#C2C6D4]">
          <div>
            <h3 className="text-[16px] font-bold text-[#003F87] mb-1">Weekly SEO Health Summary</h3>
            <p className="text-[13px] text-[#555F6B]">AI Agent automated scans 3 times per week.</p>
          </div>
          <div className="flex items-center gap-[16px]">
            <div className="flex items-center gap-[6px]">
              <div className="w-[8px] h-[8px] rounded-full bg-[#003F87]"></div>
              <span className="text-[12px] font-bold text-slate-800">Scan Completed</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <div className="w-[8px] h-[8px] rounded-full bg-[#C2C6D4]"></div>
              <span className="text-[12px] font-bold text-[#555F6B]">Upcoming</span>
            </div>
          </div>
        </div>

        <div className="flex w-full divide-x divide-[#C2C6D4]">
          
          {/* Card 1 */}
          <div className="flex-1 p-[24px] flex flex-col gap-[16px] hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-1">Monday, May 13</p>
                <h4 className="text-[15px] font-bold text-slate-900">Health Score: 88%</h4>
              </div>
              <CheckCircle2 size={20} className="text-[#003F87]" />
            </div>
            <div className="w-full h-[6px] bg-[#F3F4F6] rounded-full overflow-hidden">
              <div className="h-full bg-[#003F87] w-[88%] rounded-full"></div>
            </div>
            <p className="text-[13px] text-[#555F6B] leading-relaxed pr-2">
              Identified 4 new keyword opportunities in technical sections.
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex-1 p-[24px] flex flex-col gap-[16px] hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-1">Wednesday, May 15</p>
                <h4 className="text-[15px] font-bold text-slate-900">Health Score: 92%</h4>
              </div>
              <CheckCircle2 size={20} className="text-[#003F87]" />
            </div>
            <div className="w-full h-[6px] bg-[#F3F4F6] rounded-full overflow-hidden">
              <div className="h-full bg-[#003F87] w-[92%] rounded-full"></div>
            </div>
            <p className="text-[13px] text-[#555F6B] leading-relaxed pr-2">
              Optimization applied to mobile layout images. Load speed +15%.
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex-1 p-[24px] flex flex-col gap-[16px] hover:bg-slate-50 transition-colors bg-slate-50/50">
            <div className="flex items-start justify-between opacity-60">
              <div>
                <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-1">Friday, May 17</p>
                <h4 className="text-[15px] font-bold text-[#555F6B]">Pending Scan</h4>
              </div>
              <Clock size={20} className="text-[#555F6B]" />
            </div>
            <div className="w-full h-[6px] bg-[#F3F4F6] rounded-full overflow-hidden opacity-60">
              <div className="h-full bg-[#C2C6D4] w-[30%] rounded-full"></div>
            </div>
            <p className="text-[13px] text-[#555F6B] leading-relaxed pr-2 opacity-60">
              Scheduled for 09:00 AM. Includes deep link analysis.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default SeoAgentContent;
