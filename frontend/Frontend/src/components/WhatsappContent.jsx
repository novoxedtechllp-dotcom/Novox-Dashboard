import React from 'react';
import { Bell, GraduationCap, Calendar, Play, ChevronRight, CheckCircle } from 'lucide-react';

const WhatsappContent = () => {
  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {/* Inner Sidebar */}
      <div className="w-[200px] h-full border-r border-[#C2C6D4] flex flex-col pt-[24px] overflow-y-auto shrink-0">
        
        <div className="mb-[24px]">
          <h4 className="text-[10px] font-bold text-[#555F6B] uppercase tracking-wider px-[24px] mb-[8px]">Configuration</h4>
          <div className="flex flex-col">
            <button className="text-left text-[#003F87] font-bold text-[13px] py-[8px] pl-[22px] pr-[24px] border-l-[2px] border-[#003F87] bg-blue-50/50">API Management</button>
            <button className="text-left text-[#555F6B] hover:text-slate-900 font-medium text-[13px] py-[8px] px-[24px] border-l-[2px] border-transparent">Webhooks</button>
            <button className="text-left text-[#555F6B] hover:text-slate-900 font-medium text-[13px] py-[8px] px-[24px] border-l-[2px] border-transparent">Security Keys</button>
          </div>
        </div>

        <div className="mb-[24px]">
          <h4 className="text-[10px] font-bold text-[#555F6B] uppercase tracking-wider px-[24px] mb-[8px]">Engagement</h4>
          <div className="flex flex-col">
            <button className="text-left text-[#555F6B] hover:text-slate-900 font-medium text-[13px] py-[8px] px-[24px] border-l-[2px] border-transparent leading-tight">Message<br/>Templates</button>
            <button className="text-left text-[#555F6B] hover:text-slate-900 font-medium text-[13px] py-[8px] px-[24px] border-l-[2px] border-transparent leading-tight">Automated<br/>Flows</button>
            <button className="text-left text-[#555F6B] hover:text-slate-900 font-medium text-[13px] py-[8px] px-[24px] border-l-[2px] border-transparent">Media Library</button>
          </div>
        </div>

        <div className="mb-[24px]">
          <h4 className="text-[10px] font-bold text-[#555F6B] uppercase tracking-wider px-[24px] mb-[8px]">Analytics</h4>
          <div className="flex flex-col">
            <button className="text-left text-[#555F6B] hover:text-slate-900 font-medium text-[13px] py-[8px] px-[24px] border-l-[2px] border-transparent">Delivery Logs</button>
            <button className="text-left text-[#555F6B] hover:text-slate-900 font-medium text-[13px] py-[8px] px-[24px] border-l-[2px] border-transparent">Read Rates</button>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-[32px] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-[24px]">
          <div>
            <h2 className="text-[20px] font-bold text-[#003F87] leading-tight mb-1">WhatsApp Automation</h2>
            <p className="text-[13px] text-[#555F6B]">Manage your institutional communication flows and API health.</p>
          </div>
          <div className="flex items-center gap-[12px]">
            <button className="bg-[#F8FAFC] border border-[#C2C6D4] text-[#555F6B] px-[16px] py-[8px] rounded-[6px] text-[13px] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">
              View API Docs
            </button>
            <button className="bg-[#003F87] text-white px-[16px] py-[8px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors shadow-sm">
              <Play size={14} className="fill-white" /> Test Connection
            </button>
          </div>
        </div>

        {/* Stats Grid: 4 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-[24px] mb-[32px]">
          <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[20px] shadow-sm flex flex-col justify-between">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-3">API STATUS</p>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-[8px] h-[8px] rounded-full bg-[#008A2E]"></div>
                <h3 className="text-[20px] font-bold text-[#008A2E] leading-none">Healthy</h3>
              </div>
              <p className="text-[11px] text-[#555F6B]">Latency: 124ms</p>
            </div>
          </div>

          <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[20px] shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">MESSAGES SENT</p>
              <h3 className="text-[24px] font-bold text-[#003F87] leading-none mb-3">12,482</h3>
            </div>
            <div className="w-full bg-[#F3F4F6] h-[4px] rounded-full mt-auto">
              <div className="bg-[#003F87] w-[60%] h-full rounded-full"></div>
            </div>
          </div>

          <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[20px] shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">OPEN RATE</p>
              <h3 className="text-[24px] font-bold text-[#003F87] leading-none mb-2">92.4%</h3>
            </div>
            <p className="text-[11px] font-bold text-[#008A2E] flex items-center gap-1">↑ 4.2% from last week</p>
          </div>

          <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[20px] shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">ACTIVE TEMPLATES</p>
              <h3 className="text-[24px] font-bold text-[#003F87] leading-none mb-2">24</h3>
            </div>
            <p className="text-[11px] text-[#555F6B]">4 Pending approval</p>
          </div>
        </div>

        {/* Priority Use Cases */}
        <div className="w-full flex flex-col gap-[24px]">
          <div>
            <div className="flex justify-between items-center mb-[16px]">
              <h3 className="text-[16px] font-bold text-[#003F87]">Priority Use Cases</h3>
              <button className="text-[13px] font-bold text-[#003F87] hover:underline">View All</button>
            </div>
            
            <div className="bg-white rounded-[8px] border border-[#C2C6D4] flex flex-col shadow-sm overflow-hidden">
              
              {/* Item 1 */}
              <div className="p-[20px] flex items-center justify-between border-b border-[#C2C6D4] hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-start gap-[16px]">
                  <div className="w-[40px] h-[40px] rounded-[8px] bg-[#E5F0FF] flex items-center justify-center shrink-0">
                    <Bell size={20} className="text-[#003F87]" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900 mb-1">Fee Reminder Alerts</h4>
                    <p className="text-[13px] text-[#555F6B] mb-2 max-w-[500px]">Automatically send payment links to parents 3 days before due date.</p>
                    <div className="flex gap-2">
                      <span className="bg-[#E5F7ED] text-[#008A2E] text-[10px] font-bold px-[8px] py-[2px] rounded uppercase">Active</span>
                      <span className="bg-[#F3F4F6] text-[#555F6B] text-[10px] font-bold px-[8px] py-[2px] rounded uppercase">Daily Flow</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#C2C6D4]" />
              </div>

              {/* Item 2 */}
              <div className="p-[20px] flex items-center justify-between border-b border-[#C2C6D4] hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-start gap-[16px]">
                  <div className="w-[40px] h-[40px] rounded-[8px] bg-[#E5F0FF] flex items-center justify-center shrink-0">
                    <GraduationCap size={20} className="text-[#003F87]" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900 mb-1">Admission Confirmation</h4>
                    <p className="text-[13px] text-[#555F6B] mb-2 max-w-[500px]">Instant welcome message and PDF brochure for new student inquiries.</p>
                    <div className="flex gap-2">
                      <span className="bg-[#E5F7ED] text-[#008A2E] text-[10px] font-bold px-[8px] py-[2px] rounded uppercase">Active</span>
                      <span className="bg-[#F3F4F6] text-[#555F6B] text-[10px] font-bold px-[8px] py-[2px] rounded uppercase">Transactional</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#C2C6D4]" />
              </div>

              {/* Item 3 */}
              <div className="p-[20px] flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-start gap-[16px]">
                  <div className="w-[40px] h-[40px] rounded-[8px] bg-[#F8FAFC] border border-[#C2C6D4] flex items-center justify-center shrink-0">
                    <Calendar size={20} className="text-[#555F6B]" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900 mb-1">Exam Schedule Broadcast</h4>
                    <p className="text-[13px] text-[#555F6B] mb-2 max-w-[500px]">Bulk send timetable images to specific classroom groups.</p>
                    <div className="flex gap-2">
                      <span className="bg-[#FFF4E5] text-[#B26E00] text-[10px] font-bold px-[8px] py-[2px] rounded uppercase">Draft</span>
                      <span className="bg-[#F3F4F6] text-[#555F6B] text-[10px] font-bold px-[8px] py-[2px] rounded uppercase">Broadcast</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#C2C6D4]" />
              </div>

            </div>
          </div>
          
          {/* Recent Activity Log Placeholder */}
          <div className="mt-2">
            <h3 className="text-[16px] font-bold text-[#003F87] mb-[16px]">Recent Activity Log</h3>
            <div className="w-full overflow-x-auto rounded-[8px] border border-[#C2C6D4] shadow-sm">
              <table className="w-full text-left border-collapse min-w-[700px] bg-white">
                <thead>
                  <tr className="border-b border-[#C2C6D4]">
                    <th className="py-[12px] px-[20px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Recipient</th>
                    <th className="py-[12px] px-[20px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Template</th>
                    <th className="py-[12px] px-[20px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Status</th>
                    <th className="py-[12px] px-[20px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-[16px] px-[20px] text-[13px] font-bold text-slate-900">+91 98765-XXXXX</td>
                    <td className="py-[16px] px-[20px]">
                      <span className="text-[13px] text-[#555F6B] font-mono bg-[#F8FAFC] border border-[#C2C6D4] px-[8px] py-[2px] rounded">fee_reminder_p1</span>
                    </td>
                    <td className="py-[16px] px-[20px]">
                      <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#008A2E]">
                        <CheckCircle size={14} /> Read
                      </span>
                    </td>
                    <td className="py-[16px] px-[20px] text-[13px] text-[#555F6B] text-right">2 mins ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
};

export default WhatsappContent;
