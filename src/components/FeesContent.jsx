import React from 'react';
import { Download, Plus, DollarSign, Briefcase, MoreVertical, TrendingUp, CheckCircle } from 'lucide-react';

const FeesContent = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const submitFees = (e) => {
    e.preventDefault();
    setIsModalOpen(false);
    alert("Fees recorded successfully!");
  };

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative">
      {/* Header Container */}
      <div className="w-full flex justify-between items-end h-[60px]">
        <div className="flex flex-col justify-end">
          <div className="text-[11px] font-semibold text-[#003F87] mb-1 flex items-center gap-1">
            <span className="text-[#555F6B]">Financials</span> &gt; Management
          </div>
          <h2 className="text-[24px] font-bold text-[#003F87] leading-tight">Financial Dashboard</h2>
        </div>
        <div className="flex items-center gap-[12px]">
          <button className="bg-white border border-[#C2C6D4] shadow-sm text-[#555F6B] px-[16px] py-[8px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export Report
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#003F87] text-white px-[16px] py-[8px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors shadow-sm">
            <Plus size={16} /> Add Fees
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[16px] flex flex-col overflow-hidden shadow-sm">
        
        {/* Tabs */}
        <div className="flex items-center h-[61px] border-b border-[#C2C6D4] px-[24px]">
          <button className="h-full flex items-center gap-2 text-[#003F87] font-bold text-[14px] border-b-[3px] border-[#003F87] px-[8px] mr-[32px]">
            <DollarSign size={18} /> Fees (Students)
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 border-b border-[#C2C6D4] h-auto xl:h-[136px]">
          {/* Metric 1 */}
          <div className="p-[24px] flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">TOTAL COLLECTIONS</p>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none mb-2">$284,500</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#008A2E]">
              <TrendingUp size={12} /> +12% vs last month
            </div>
          </div>
          
          {/* Metric 2 */}
          <div className="p-[24px] flex flex-col justify-center border-b xl:border-b-0 xl:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">OUTSTANDING FEES</p>
            <h3 className="text-[32px] font-bold text-[#D80000] leading-none mb-2">$12,240</h3>
            <div className="flex items-center gap-1 text-[11px] text-[#555F6B]">
              From 18 students
            </div>
          </div>

          {/* Metric 3 */}
          <div className="p-[24px] flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">UPCOMING PAYROLL</p>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none mb-2">$45,800</h3>
            <div className="flex items-center gap-1 text-[11px] text-[#555F6B]">
              Due in 4 days
            </div>
          </div>

          {/* Metric 4 */}
          <div className="p-[24px] flex flex-col justify-center">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">TAX RESERVE</p>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none mb-2">$14,120</h3>
            <div className="flex items-center gap-1 text-[11px] text-[#555F6B]">
              <CheckCircle size={12} className="text-[#008A2E]" /> Compliant
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-[#C2C6D4] bg-white">
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider w-[220px]">Student Name</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider w-[180px]">Course</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider text-center">Payment Type</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Amount</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Date</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider w-[140px]">Status</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr className="border-b border-slate-100">
                <td className="py-[16px] px-[24px]">
                  <div className="flex items-center gap-3">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#E5F0FF] text-[#003F87] font-bold text-[11px] flex items-center justify-center shrink-0">JD</div>
                    <div className="text-[13px] font-bold text-slate-900 leading-tight">John<br/>Doe</div>
                  </div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B] leading-tight">Advanced Cloud<br/>Architecture</div>
                </td>
                <td className="py-[16px] px-[24px] text-center">
                  <span className="inline-block bg-[#F8FAFC] text-[#555F6B] text-[11px] font-bold px-[12px] py-[4px] rounded-full border border-[#C2C6D4]">Monthly</span>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[14px] font-bold text-slate-900">$1,200.00</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B] leading-tight">Oct 24,<br/>2023</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <span className="inline-flex items-center gap-2 bg-[#E5F7ED] text-[#008A2E] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#008A2E]"></span> Full Paid
                  </span>
                </td>
                <td className="py-[16px] px-[24px] text-right">
                  <button className="text-[#555F6B] hover:text-[#003F87]"><MoreVertical size={18} /></button>
                </td>
              </tr>
              
              {/* Row 2 */}
              <tr className="border-b border-slate-100">
                <td className="py-[16px] px-[24px]">
                  <div className="flex items-center gap-3">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#E5F0FF] text-[#003F87] font-bold text-[11px] flex items-center justify-center shrink-0">SA</div>
                    <div className="text-[13px] font-bold text-slate-900 leading-tight">Sarah<br/>Adams</div>
                  </div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B] leading-tight">Full Stack<br/>Bootcamp</div>
                </td>
                <td className="py-[16px] px-[24px] text-center">
                  <span className="inline-block bg-[#E5F0FF] text-[#003F87] text-[11px] font-bold px-[12px] py-[4px] rounded-full border border-[#003F87]">Full</span>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[14px] font-bold text-slate-900">$4,500.00</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B] leading-tight">Oct 23,<br/>2023</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="inline-flex items-center gap-2 bg-[#FFF4E5] text-[#B26E00] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#B26E00] shrink-0"></span> 
                    <span className="leading-tight text-left">Partially<br/>Paid</span>
                  </div>
                </td>
                <td className="py-[16px] px-[24px] text-right">
                  <button className="text-[#555F6B] hover:text-[#003F87]"><MoreVertical size={18} /></button>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="border-b border-slate-100">
                <td className="py-[16px] px-[24px]">
                  <div className="flex items-center gap-3">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#F3F4F6] text-[#555F6B] font-bold text-[11px] flex items-center justify-center shrink-0">MK</div>
                    <div className="text-[13px] font-bold text-slate-900 leading-tight">Michael<br/>K.</div>
                  </div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B] leading-tight">Data Science<br/>Masterclass</div>
                </td>
                <td className="py-[16px] px-[24px] text-center">
                  <span className="inline-block bg-[#F8FAFC] text-[#555F6B] text-[11px] font-bold px-[12px] py-[4px] rounded-full border border-[#C2C6D4]">Monthly</span>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[14px] font-bold text-slate-900">$1,200.00</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B] leading-tight">Oct 22,<br/>2023</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <span className="inline-flex items-center gap-2 bg-[#FDE2E2] text-[#D80000] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#D80000]"></span> Pending
                  </span>
                </td>
                <td className="py-[16px] px-[24px] text-right">
                  <button className="text-[#555F6B] hover:text-[#003F87]"><MoreVertical size={18} /></button>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="border-b border-slate-100">
                <td className="py-[16px] px-[24px]">
                  <div className="flex items-center gap-3">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#E5F0FF] text-[#003F87] font-bold text-[11px] flex items-center justify-center shrink-0">EL</div>
                    <div className="text-[13px] font-bold text-slate-900 leading-tight">Emma<br/>Lee</div>
                  </div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B] leading-tight">UI/UX Design<br/>Path</div>
                </td>
                <td className="py-[16px] px-[24px] text-center">
                  <span className="inline-block bg-[#F8FAFC] text-[#555F6B] text-[11px] font-bold px-[12px] py-[4px] rounded-full border border-[#C2C6D4]">Monthly</span>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[14px] font-bold text-slate-900">$950.00</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <div className="text-[13px] text-[#555F6B] leading-tight">Oct 21,<br/>2023</div>
                </td>
                <td className="py-[16px] px-[24px]">
                  <span className="inline-flex items-center gap-2 bg-[#E5F7ED] text-[#008A2E] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#008A2E]"></span> Full Paid
                  </span>
                </td>
                <td className="py-[16px] px-[24px] text-right">
                  <button className="text-[#555F6B] hover:text-[#003F87]"><MoreVertical size={18} /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-[16px] px-[24px] bg-white flex justify-between items-center border-t border-[#C2C6D4]">
          <div className="text-[13px] text-[#555F6B] font-medium">Showing 1 to 10 of 258 entries</div>
          <div className="flex items-center gap-1">
            <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] border border-[#C2C6D4] text-[#555F6B] bg-white hover:bg-slate-50 transition-colors">&lt;</button>
            <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] bg-[#003F87] text-white font-bold">1</button>
            <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#555F6B] hover:bg-slate-100 transition-colors font-semibold">2</button>
            <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#555F6B] hover:bg-slate-100 transition-colors font-semibold">3</button>
            <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] border border-[#C2C6D4] text-[#555F6B] bg-white hover:bg-slate-50 transition-colors">&gt;</button>
          </div>
        </div>

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Record Fee Payment</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={submitFees} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student Name / ID</label>
                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label>
                <input type="number" required className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm" placeholder="e.g. 500" />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white hover:bg-[#002B5E]">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesContent;
