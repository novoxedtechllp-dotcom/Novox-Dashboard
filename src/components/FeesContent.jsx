import React, { useState } from 'react';
import { Download, Plus, DollarSign, Briefcase, MoreVertical, TrendingUp, CheckCircle, Eye, Edit, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Generate 15 mock items for pagination testing
const baseFeesData = [
  { initials: 'JD', name: 'John Doe', course: 'Advanced Cloud Architecture', type: 'Monthly', amount: '$1,200.00', status: 'Full Paid', statusColor: 'green' },
  { initials: 'SA', name: 'Sarah Adams', course: 'Full Stack Bootcamp', type: 'Full', amount: '$4,500.00', status: 'Partially Paid', statusColor: 'yellow' },
  { initials: 'MK', name: 'Michael K.', course: 'Data Science Masterclass', type: 'Monthly', amount: '$1,200.00', status: 'Pending', statusColor: 'red' },
  { initials: 'EL', name: 'Emma Lee', course: 'UI/UX Design Path', type: 'Monthly', amount: '$950.00', status: 'Full Paid', statusColor: 'green' },
  { initials: 'RJ', name: 'Ryan Jones', course: 'AI Foundations', type: 'Monthly', amount: '$1,100.00', status: 'Full Paid', statusColor: 'green' }
];

const feesData = Array.from({ length: 15 }, (_, i) => {
  const base = baseFeesData[i % baseFeesData.length];
  const dateObj = new Date(2023, 9, 24 - i);
  return {
    ...base,
    id: i + 1,
    name: `${base.name.split(' ')[0]} ${String.fromCharCode(65 + (i % 26))}.`,
    date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
});

const FeesContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(feesData.length / itemsPerPage);

  const paginatedData = feesData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const submitFees = (e) => {
    e.preventDefault();
    setIsModalOpen(false);
    alert("Fees recorded successfully!");
  };

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Financial Dashboard - Fees Report", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableColumn = ["Student Name", "Course", "Payment Type", "Amount", "Date", "Status"];
    // Export only the current page, or all data? Usually all data is preferred, but let's export all data
    const tableRows = feesData.map(fee => [
      fee.name,
      fee.course,
      fee.type,
      fee.amount,
      fee.date,
      fee.status
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 63, 135] }
    });
    
    doc.save(`fees_report_${new Date().getTime()}.pdf`);
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
          <button onClick={handleExportPDF} className="bg-white border border-[#C2C6D4] shadow-sm text-[#555F6B] px-[16px] py-[8px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
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
          <div className="p-[24px] flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">TOTAL COLLECTIONS</p>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none mb-2">$284,500</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#008A2E]">
              <TrendingUp size={12} /> +12% vs last month
            </div>
          </div>
          <div className="p-[24px] flex flex-col justify-center border-b xl:border-b-0 xl:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">OUTSTANDING FEES</p>
            <h3 className="text-[32px] font-bold text-[#D80000] leading-none mb-2">$12,240</h3>
            <div className="flex items-center gap-1 text-[11px] text-[#555F6B]">
              From 18 students
            </div>
          </div>
          <div className="p-[24px] flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">UPCOMING PAYROLL</p>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none mb-2">$45,800</h3>
            <div className="flex items-center gap-1 text-[11px] text-[#555F6B]">
              Due in 4 days
            </div>
          </div>
          <div className="p-[24px] flex flex-col justify-center">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">TAX RESERVE</p>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none mb-2">$14,120</h3>
            <div className="flex items-center gap-1 text-[11px] text-[#555F6B]">
              <CheckCircle size={12} className="text-[#008A2E]" /> Compliant
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto min-h-[400px]">
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
              {paginatedData.map((fee) => (
                <tr key={fee.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-[16px] px-[24px]">
                    <div className="flex items-center gap-3">
                      <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] ${
                        fee.statusColor === 'green' || fee.statusColor === 'yellow' ? 'bg-[#E5F0FF] text-[#003F87]' : 'bg-[#F3F4F6] text-[#555F6B]'
                      }`}>
                        {fee.initials}
                      </div>
                      <div className="text-[13px] font-bold text-slate-900 leading-tight">
                        {fee.name.split(' ')[0]}<br/>{fee.name.split(' ').slice(1).join(' ')}
                      </div>
                    </div>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    <div className="text-[13px] text-[#555F6B] leading-tight">
                      {fee.course.split(' ')[0]} {fee.course.split(' ').length > 1 && fee.course.split(' ')[1]}<br/>
                      {fee.course.split(' ').slice(2).join(' ')}
                    </div>
                  </td>
                  <td className="py-[16px] px-[24px] text-center">
                    <span className={`inline-block text-[11px] font-bold px-[12px] py-[4px] rounded-full border ${
                      fee.type === 'Full' ? 'bg-[#E5F0FF] text-[#003F87] border-[#003F87]' : 'bg-[#F8FAFC] text-[#555F6B] border-[#C2C6D4]'
                    }`}>
                      {fee.type}
                    </span>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    <div className="text-[14px] font-bold text-slate-900">{fee.amount}</div>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    <div className="text-[13px] text-[#555F6B] leading-tight">
                      {fee.date.split(',')[0]},<br/>{fee.date.split(',')[1]}
                    </div>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    {fee.statusColor === 'green' && (
                      <span className="inline-flex items-center gap-2 bg-[#E5F7ED] text-[#008A2E] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                        <span className="w-[6px] h-[6px] rounded-full bg-[#008A2E]"></span> {fee.status}
                      </span>
                    )}
                    {fee.statusColor === 'yellow' && (
                      <div className="inline-flex items-center gap-2 bg-[#FFF4E5] text-[#B26E00] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                        <span className="w-[6px] h-[6px] rounded-full bg-[#B26E00] shrink-0"></span> 
                        <span className="leading-tight text-left">Partially<br/>Paid</span>
                      </div>
                    )}
                    {fee.statusColor === 'red' && (
                      <span className="inline-flex items-center gap-2 bg-[#FDE2E2] text-[#D80000] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                        <span className="w-[6px] h-[6px] rounded-full bg-[#D80000]"></span> {fee.status}
                      </span>
                    )}
                  </td>
                  <td className="py-[16px] px-[24px] text-right relative">
                    <button onClick={() => toggleDropdown(fee.id)} className="text-[#555F6B] hover:text-[#003F87]"><MoreVertical size={18} /></button>
                    {activeDropdown === fee.id && (
                      <div className="absolute right-[24px] top-[40px] bg-white border border-[#C2C6D4] shadow-lg rounded-md w-[140px] z-10 flex flex-col overflow-hidden">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"><Eye size={14} /> View Details</button>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"><Edit size={14} /> Edit Record</button>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"><Trash2 size={14} /> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-[16px] px-[24px] bg-white flex justify-between items-center border-t border-[#C2C6D4]">
          <div className="text-[13px] text-[#555F6B] font-medium">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, feesData.length)} of {feesData.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`w-[28px] h-[28px] flex items-center justify-center rounded-[4px] border border-[#C2C6D4] transition-colors ${
                currentPage === 1 ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : 'text-[#555F6B] bg-white hover:bg-slate-50'
              }`}
            >&lt;</button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-[28px] h-[28px] flex items-center justify-center rounded-[4px] font-semibold transition-colors ${
                  currentPage === page ? 'bg-[#003F87] text-white font-bold' : 'text-[#555F6B] hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`w-[28px] h-[28px] flex items-center justify-center rounded-[4px] border border-[#C2C6D4] transition-colors ${
                currentPage === totalPages ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : 'text-[#555F6B] bg-white hover:bg-slate-50'
              }`}
            >&gt;</button>
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
