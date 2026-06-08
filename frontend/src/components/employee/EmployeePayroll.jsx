import React, { useState } from 'react';
import { Download, FileText, Eye, DollarSign, Wallet, TrendingUp, AlertCircle, X, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const payrollData = [
  { id: 1, month: 'September 2023', date: 'Oct 1, 2023', gross: '₹60,000', deductions: '₹8,500', net: '₹51,500', status: 'Paid' },
  { id: 2, month: 'August 2023', date: 'Sep 1, 2023', gross: '₹60,000', deductions: '₹8,500', net: '₹51,500', status: 'Paid' },
  { id: 3, month: 'July 2023', date: 'Aug 1, 2023', gross: '₹60,000', deductions: '₹8,500', net: '₹51,500', status: 'Paid' },
  { id: 4, month: 'June 2023', date: 'Jul 1, 2023', gross: '₹56,000', deductions: '₹8,000', net: '₹48,000', status: 'Paid' },
  { id: 5, month: 'October 2023', date: '-', gross: '₹60,000', deductions: '₹8,500', net: '₹51,500', status: 'Processing' },
];

const EmployeePayroll = () => {
  const [viewRecord, setViewRecord] = useState(null);
  const [year, setYear] = useState('2023');

  const handleDownloadPDF = (month, action = 'download') => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Payslip - ${month}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Employee: Staff Member`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);
    
    autoTable(doc, {
      head: [['Description', 'Amount']],
      body: [
        ['Basic Salary', 'Rs. 45,000'],
        ['Allowances', 'Rs. 15,000'],
        ['Tax Deduction', 'Rs. 5,000'],
        ['PF Deduction', 'Rs. 3,500'],
        ['Net Pay', 'Rs. 51,500'],
      ],
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [0, 63, 135] }
    });
    
    if (action === 'print') {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`payslip_${month.replace(' ', '_').toLowerCase()}.pdf`);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Paid': return <span className="inline-flex items-center gap-1.5 bg-[#E5F7ED] text-[#008A2E] px-[10px] py-[4px] rounded-full text-[11px] font-bold"><span className="w-[6px] h-[6px] rounded-full bg-[#008A2E]"></span> {status}</span>;
      case 'Processing': return <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-[10px] py-[4px] rounded-full text-[11px] font-bold"><span className="w-[6px] h-[6px] rounded-full bg-blue-700"></span> {status}</span>;
      default: return null;
    }
  };

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative pb-[100px]">
      <div className="w-full flex justify-between items-end h-[60px]">
        <div className="flex flex-col justify-end">
          <h2 className="text-[24px] font-bold text-[#003F87] leading-tight">My Payroll</h2>
          <p className="text-[#555F6B] text-[14px] mt-1">View and download your payslips.</p>
        </div>
        <select value={year} onChange={e=>setYear(e.target.value)} className="bg-white border border-[#C2C6D4] text-sm font-semibold rounded-md px-3 py-2 outline-none">
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-[#C2C6D4] shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 text-[#003F87] p-3 rounded-lg"><Wallet size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Current Salary</p>
            <p className="text-2xl font-bold text-slate-800">₹60,000</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#C2C6D4] shadow-sm flex items-center gap-4">
          <div className="bg-green-100 text-green-700 p-3 rounded-lg"><DollarSign size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Last Credited</p>
            <p className="text-2xl font-bold text-slate-800">₹51,500</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#C2C6D4] shadow-sm flex items-center gap-4">
          <div className="bg-indigo-100 text-indigo-700 p-3 rounded-lg"><TrendingUp size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">YTD Earnings</p>
            <p className="text-2xl font-bold text-slate-800">₹4.5L</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#C2C6D4] shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 text-amber-700 p-3 rounded-lg"><AlertCircle size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Pending Reimb.</p>
            <p className="text-2xl font-bold text-slate-800">₹2,500</p>
          </div>
        </div>
      </div>

      <div className="w-full bg-white border border-[#C2C6D4] rounded-xl overflow-hidden shadow-sm mt-2">
        <div className="p-4 border-b border-[#C2C6D4] flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">Payslips ({year})</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#C2C6D4] bg-white">
              <th className="py-4 px-6 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Month</th>
              <th className="py-4 px-6 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Gross Salary</th>
              <th className="py-4 px-6 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Deductions</th>
              <th className="py-4 px-6 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Net Salary</th>
              <th className="py-4 px-6 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-bold text-[#555F6B] uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.map((record) => (
              <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-[36px] h-[36px] rounded-lg bg-[#E5F0FF] text-[#003F87] flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-[14px] block">{record.month}</span>
                      <span className="text-[12px] text-slate-500">Processed: {record.date}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6"><span className="font-semibold text-slate-600">{record.gross}</span></td>
                <td className="py-4 px-6"><span className="font-semibold text-slate-600">{record.deductions}</span></td>
                <td className="py-4 px-6"><span className="font-bold text-[14px] text-slate-900">{record.net}</span></td>
                <td className="py-4 px-6">{getStatusBadge(record.status)}</td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setViewRecord(record)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View Payslip">
                      <Eye size={18} />
                    </button>
                    {record.status === 'Paid' && (
                      <button onClick={() => handleDownloadPDF(record.month)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors" title="Download PDF">
                        <Download size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payslip Modal */}
      {viewRecord && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Payslip - {viewRecord.month}</h2>
              <div className="flex gap-2">
                <button onClick={() => handleDownloadPDF(viewRecord.month, 'download')} className="px-3 py-1.5 bg-white border border-[#C2C6D4] text-slate-700 rounded-md font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"><Download size={16}/> PDF</button>
                <button onClick={() => handleDownloadPDF(viewRecord.month, 'print')} className="px-3 py-1.5 bg-white border border-[#C2C6D4] text-slate-700 rounded-md font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"><Printer size={16}/> Print</button>
                <button onClick={() => setViewRecord(null)} className="ml-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
            </div>
            <div className="p-8 flex flex-col gap-8 overflow-y-auto">
              
              <div className="flex justify-between items-start">
                <div>
                  <img src="/novox-edtech-calicut-logo.png" alt="Novox Edtech" className="h-[32px] object-contain mb-2" />
                  <p className="text-sm text-slate-500 mt-1">Payslip for the month of {viewRecord.month}</p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <p>123 Education Lane, Tech District</p>
                  <p>contact@novoxedtech.com</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Employee Name</p>
                  <p className="font-bold text-slate-800">Staff Member</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Employee ID</p>
                  <p className="font-bold text-slate-800">EMP-2023-045</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Department</p>
                  <p className="font-bold text-slate-800">Academic Operations</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Designation</p>
                  <p className="font-bold text-slate-800">Senior Coordinator</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Earnings</h3>
                  <div className="flex justify-between py-2 text-sm text-slate-700"><span>Basic Salary</span> <span>₹45,000</span></div>
                  <div className="flex justify-between py-2 text-sm text-slate-700"><span>Allowances</span> <span>₹15,000</span></div>
                  <div className="flex justify-between py-2 text-sm text-slate-700"><span>Bonus / Incentives</span> <span>₹0</span></div>
                  <div className="flex justify-between py-3 mt-2 text-sm font-bold text-slate-900 border-t border-slate-200"><span>Gross Earnings</span> <span>{viewRecord.gross}</span></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Deductions</h3>
                  <div className="flex justify-between py-2 text-sm text-slate-700"><span>Income Tax</span> <span>₹5,000</span></div>
                  <div className="flex justify-between py-2 text-sm text-slate-700"><span>Provident Fund (PF)</span> <span>₹3,500</span></div>
                  <div className="flex justify-between py-2 text-sm text-slate-700"><span>Other Deductions</span> <span>₹0</span></div>
                  <div className="flex justify-between py-3 mt-2 text-sm font-bold text-red-600 border-t border-slate-200"><span>Total Deductions</span> <span>{viewRecord.deductions}</span></div>
                </div>
              </div>

              <div className="bg-[#E5F0FF] rounded-xl p-6 flex justify-between items-center border border-[#003F87]/20">
                <div>
                  <p className="text-sm font-bold text-[#003F87]">Net Pay</p>
                  <p className="text-xs text-[#003F87]/70 mt-1">Amount transferred to bank account</p>
                </div>
                <p className="text-3xl font-bold text-[#003F87]">{viewRecord.net}</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePayroll;
