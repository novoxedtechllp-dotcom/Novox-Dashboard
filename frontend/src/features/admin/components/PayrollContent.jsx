import React, { useState, useMemo, useEffect } from 'react';
import { Download, Plus, FileText, CheckCircle, TrendingUp, MoreVertical, Eye, Calendar, DollarSign, Briefcase } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const PayrollContent = () => {
  const [toast, setToast] = useState(null);
  const alert = (message) => {
    const isError = typeof message === 'string' && (message.toLowerCase().includes('failed') || message.toLowerCase().includes('error'));
    setToast({ message, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayroll = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;
        
        const response = await fetch('/api/v1/payroll', {
          headers: { 'Authorization': `Bearer ${userInfo.token}` }
        });
        const resData = await response.json();
        if (response.ok) {
          const prArray = resData.data?.payroll || resData.data || [];
          setPayrollData(prArray);
        }
      } catch (error) {
        console.error('Error fetching payroll:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  
  // New Payroll Form State
  const [newPayroll, setNewPayroll] = useState({
    employee_id: '',
    employee_name: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basic_salary: '',
    bonus: 0,
    deductions: 0
  });

  const [sortBy, setSortBy] = useState('Newest');

  // Pagination & Sorting
  const sortedData = useMemo(() => {
    let data = [...payrollData];
    switch (sortBy) {
      case 'Highest Salary':
        return data.sort((a, b) => Number(b.net_salary) - Number(a.net_salary));
      case 'Lowest Salary':
        return data.sort((a, b) => Number(a.net_salary) - Number(b.net_salary));
      case 'A-Z':
        return data.sort((a, b) => a.employee_name.localeCompare(b.employee_name));
      case 'Z-A':
        return data.sort((a, b) => b.employee_name.localeCompare(a.employee_name));
      case 'Newest':
      default:
        return data; // Default is order of addition (newest first based on handleGeneratePayroll)
    }
  }, [payrollData, sortBy]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const calculateNet = (basic, bonus, deductions) => {
    return (Number(basic) || 0) + (Number(bonus) || 0) - (Number(deductions) || 0);
  };

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...newPayroll,
      net_salary: calculateNet(newPayroll.basic_salary, newPayroll.bonus, newPayroll.deductions),
      status: 'PENDING',
      payment_date: new Date().toISOString().split('T')[0]
    };

    try {
      // Simulate API call POST /api/v1/payroll/process
      // const response = await fetch('/api/v1/payroll/process', { method: 'POST', body: JSON.stringify(payload) });
      // if (response.ok) { ... }
      
      const newRecord = {
        id: `pay-${Date.now()}`,
        ...payload
      };
      
      setPayrollData([newRecord, ...payrollData]);
      setIsModalOpen(false);
      setNewPayroll({
        employee_id: '', employee_name: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), basic_salary: '', bonus: 0, deductions: 0
      });
      alert('Payroll generated successfully!');
    } catch (error) {
      console.error('Error generating payroll', error);
    }
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleDownloadPayslip = (payrollId) => {
    // Simulate GET /api/v1/payroll/:payrollId/payslip
    const item = payrollData.find(p => p.id === payrollId);
    if (!item) return;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Payslip", 105, 20, null, null, "center");
    
    doc.setFontSize(12);
    doc.text(`Employee Name: ${item.employee_name}`, 20, 40);
    doc.text(`Employee ID: ${item.employee_id}`, 20, 50);
    doc.text(`Period: ${months[item.month - 1]} ${item.year}`, 20, 60);
    
    autoTable(doc, {
      startY: 70,
      head: [['Description', 'Amount (INR)']],
      body: [
        ['Basic Salary', item.basic_salary],
        ['Bonus', item.bonus],
        ['Deductions', item.deductions],
      ],
      foot: [['Net Salary (INR)', item.net_salary]],
      theme: 'grid',
      headStyles: { fillColor: [0, 63, 135] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });
    
    doc.save(`payslip_${item.employee_name}_${months[item.month - 1]}_${item.year}.pdf`);
    setActiveDropdown(null);
  };

  const totalPaid = useMemo(() => {
    return payrollData.filter(p => p.status === 'PAID').reduce((acc, curr) => acc + Number(curr.net_salary), 0);
  }, [payrollData]);

  const pendingCount = useMemo(() => {
    return payrollData.filter(p => p.status === 'PENDING').length;
  }, [payrollData]);

  if (loading) {
    return <LoadingSpinner text="Loading payroll data..." />;
  }

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative">
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl font-bold text-sm transform transition-all duration-300 translate-y-0 opacity-100 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {toast.message}
        </div>
      )}
      {/* Header Container */}
      <div className="w-full flex justify-between items-end h-[60px]">
        <div className="flex flex-col justify-end">
          <div className="text-[11px] font-semibold text-[#003F87] mb-1 flex items-center gap-1">
            <span className="text-[#555F6B]">HR / Admin</span> &gt; Payroll
          </div>
          <h2 className="text-[24px] font-bold text-[#003F87] leading-tight">Payroll Management</h2>
        </div>
        <div className="flex items-center gap-[12px]">
          <button onClick={() => setIsModalOpen(true)} className="bg-[#003F87] text-white px-[16px] py-[8px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors shadow-sm">
            <Plus size={16} /> Generate Payroll
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[16px] flex flex-col overflow-hidden shadow-sm">
        
        {/* Tabs & Filters */}
        <div className="flex justify-between items-center h-[61px] border-b border-[#C2C6D4] px-[24px]">
          <button className="h-full flex items-center gap-2 text-[#003F87] font-bold text-[14px] border-b-[3px] border-[#003F87] px-[8px]">
            <Briefcase size={18} /> Payroll History
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-slate-500">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              className="bg-[#F8FAFC] border border-[#E2E8F0] text-slate-700 text-[12px] rounded-md px-2 py-1 outline-none font-medium cursor-pointer"
            >
              <option value="Newest">Newest First</option>
              <option value="Highest Salary">Highest Salary</option>
              <option value="Lowest Salary">Lowest Salary</option>
              <option value="A-Z">Name (A-Z)</option>
              <option value="Z-A">Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#C2C6D4] h-auto md:h-[136px]">
          <div className="p-[24px] flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">TOTAL PAYOUT (YTD)</p>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none mb-2">₹{totalPaid.toLocaleString()}</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#008A2E]">
              <TrendingUp size={12} /> Disbursed successfully
            </div>
          </div>
          <div className="p-[24px] flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">PENDING PROCESSING</p>
            <h3 className="text-[32px] font-bold text-[#B26E00] leading-none mb-2">{pendingCount} Records</h3>
            <div className="flex items-center gap-1 text-[11px] text-[#555F6B]">
              Awaiting authorization
            </div>
          </div>
          <div className="p-[24px] flex flex-col justify-center">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">SYSTEM STATUS</p>
            <h3 className="text-[24px] font-bold text-slate-900 leading-none mb-2 flex items-center gap-2">
              <CheckCircle size={24} className="text-[#008A2E]" /> Active
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-[#555F6B]">
              Payroll Engine V1
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-[#C2C6D4] bg-white">
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Employee</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Period</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider text-right">Basic Salary</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider text-right">Net Salary</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Payment Date</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider w-[120px]">Status</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((payroll) => (
                <tr key={payroll.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-[16px] px-[24px]">
                    <div className="text-[13px] font-bold text-slate-900">{payroll.employee_name}</div>
                    <div className="text-[11px] text-slate-500">{payroll.employee_id}</div>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    <div className="flex items-center gap-2 text-[13px] text-[#555F6B] font-medium">
                      <Calendar size={14} className="text-slate-400" />
                      {months[payroll.month - 1]} {payroll.year}
                    </div>
                  </td>
                  <td className="py-[16px] px-[24px] text-right">
                    <div className="text-[13px] text-slate-600">₹{Number(payroll.basic_salary).toLocaleString()}</div>
                  </td>
                  <td className="py-[16px] px-[24px] text-right">
                    <div className="text-[14px] font-bold text-slate-900">₹{Number(payroll.net_salary).toLocaleString()}</div>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    <div className="text-[13px] text-[#555F6B]">{payroll.payment_date || '-'}</div>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    {payroll.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1.5 bg-[#E5F7ED] text-[#008A2E] px-[10px] py-[4px] rounded-full text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#008A2E]"></span> PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-[#FFF4E5] text-[#B26E00] px-[10px] py-[4px] rounded-full text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B26E00]"></span> PENDING
                      </span>
                    )}
                  </td>
                  <td className="py-[16px] px-[24px] text-right relative">
                    <button onClick={() => toggleDropdown(payroll.id)} className="text-[#555F6B] hover:text-[#003F87]">
                      <MoreVertical size={18} />
                    </button>
                    {activeDropdown === payroll.id && (
                      <div className="absolute right-[24px] top-[40px] bg-white border border-[#C2C6D4] shadow-lg rounded-md w-[160px] z-[20] flex flex-col overflow-hidden">
                        <button onClick={() => { setViewItem(payroll); setActiveDropdown(null); }} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left">
                          <Eye size={14} /> View Details
                        </button>
                        <button onClick={() => handleDownloadPayslip(payroll.id)} className="flex items-center gap-2 px-4 py-2 text-sm text-[#003F87] hover:bg-slate-50 w-full text-left">
                          <Download size={14} /> Download Payslip
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-[32px] text-center text-slate-500">No payroll records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="p-[16px] px-[24px] bg-white flex justify-between items-center border-t border-[#C2C6D4]">
            <div className="text-[13px] text-[#555F6B] font-medium">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, payrollData.length)} of {payrollData.length} entries
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
        )}
      </div>

      {/* Generate Payroll Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Process New Payroll</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleGeneratePayroll} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Employee Name</label>
                  <input type="text" required value={newPayroll.employee_name} onChange={e => setNewPayroll({...newPayroll, employee_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm" placeholder="e.g. Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Employee ID</label>
                  <input type="text" required value={newPayroll.employee_id} onChange={e => setNewPayroll({...newPayroll, employee_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm" placeholder="e.g. emp-123" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Month</label>
                  <select required value={newPayroll.month} onChange={e => setNewPayroll({...newPayroll, month: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white">
                    {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year</label>
                  <input type="number" required value={newPayroll.year} onChange={e => setNewPayroll({...newPayroll, year: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Basic Salary</label>
                  <input type="number" required value={newPayroll.basic_salary} onChange={e => setNewPayroll({...newPayroll, basic_salary: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bonus</label>
                  <input type="number" value={newPayroll.bonus} onChange={e => setNewPayroll({...newPayroll, bonus: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deductions</label>
                  <input type="number" value={newPayroll.deductions} onChange={e => setNewPayroll({...newPayroll, deductions: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm" placeholder="0" />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700">Calculated Net Salary:</span>
                <span className="text-xl font-bold text-[#003F87]">₹{calculateNet(newPayroll.basic_salary, newPayroll.bonus, newPayroll.deductions).toLocaleString()}</span>
              </div>

              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white hover:bg-[#002B5E]">Process & Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Payroll Details</h2>
              <button onClick={() => setViewItem(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewItem.employee_name}</h3>
                  <p className="text-xs text-slate-500">ID: {viewItem.employee_id}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${viewItem.status === 'PAID' ? 'bg-[#E5F7ED] text-[#008A2E]' : 'bg-[#FFF4E5] text-[#B26E00]'}`}>
                  {viewItem.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Period</span>
                  <span className="text-sm font-semibold text-slate-900">{months[viewItem.month - 1]} {viewItem.year}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Date</span>
                  <span className="text-sm font-semibold text-slate-900">{viewItem.payment_date || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 mt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Basic Salary</span>
                  <span className="font-semibold">₹{Number(viewItem.basic_salary).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Bonus</span>
                  <span className="font-semibold text-[#008A2E]">+ ₹{Number(viewItem.bonus).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Deductions</span>
                  <span className="font-semibold text-[#D80000]">- ₹{Number(viewItem.deductions).toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Net Salary</span>
                  <span className="text-lg font-bold text-[#003F87]">₹{Number(viewItem.net_salary).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end mt-2 pt-4 border-t border-slate-200">
                <button onClick={() => setViewItem(null)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollContent;
