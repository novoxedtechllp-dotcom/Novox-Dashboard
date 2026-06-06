import React, { useState, useMemo, useEffect } from 'react';
import { Download, Plus, DollarSign, Briefcase, MoreVertical, TrendingUp, CheckCircle, Eye, Edit, Trash2, Filter } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const FeesContent = () => {
  const [toast, setToast] = useState(null);
  const alert = (message) => {
    const isError = typeof message === 'string' && (message.toLowerCase().includes('failed') || message.toLowerCase().includes('error'));
    setToast({ message, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const [feesList, setFeesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;
        
        const response = await fetch('/api/v1/fees', {
          headers: { 'Authorization': `Bearer ${userInfo.token}` }
        });
        const resData = await response.json();
        if (response.ok) {
          const feesArray = resData.data?.fees || resData.data || [];
          setFeesList(feesArray);
        }
      } catch (error) {
        console.error('Error fetching fees:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('');

  const filteredData = useMemo(() => {
    return feesList.filter(fee => {
      if (filterStatus !== 'All' && fee.status !== filterStatus) return false;
      if (filterDate) {
        const selectedDateStr = new Date(filterDate).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });
        if (fee.date !== selectedDateStr) return false;
      }
      return true;
    });
  }, [feesList, filterStatus, filterDate]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  const handleDelete = (id) => {
    setFeesList(feesList.filter(fee => fee.id !== id));
    setActiveDropdown(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setFeesList(feesList.map(fee => fee.id === editItem.id ? editItem : fee));
    setEditItem(null);
    alert("Record updated successfully!");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Financial Dashboard - Fees Report", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableColumn = ["Student Name", "Course", "Payment Type", "Amount", "Date", "Status"];
    const tableRows = filteredData.map(fee => [
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

  if (loading) {
    return <LoadingSpinner text="Loading fees data..." />;
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
            <h3 className="text-[32px] font-bold text-slate-900 leading-none mb-2">₹284,500</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#008A2E]">
              <TrendingUp size={12} /> +12% vs last month
            </div>
          </div>
          <div className="p-[24px] flex flex-col justify-center border-b xl:border-b-0 xl:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">OUTSTANDING FEES</p>
            <h3 className="text-[32px] font-bold text-[#D80000] leading-none mb-2">₹12,240</h3>
            <div className="flex items-center gap-1 text-[11px] text-[#555F6B]">
              From 18 students
            </div>
          </div>
          <div className="p-[24px] flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">UPCOMING PAYROLL</p>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none mb-2">₹45,800</h3>
            <div className="flex items-center gap-1 text-[11px] text-[#555F6B]">
              Due in 4 days
            </div>
          </div>
          <div className="p-[24px] flex flex-col justify-center">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">TAX RESERVE</p>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none mb-2">₹14,120</h3>
            <div className="flex items-center gap-1 text-[11px] text-[#555F6B]">
              <CheckCircle size={12} className="text-[#008A2E]" /> Compliant
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-[24px] py-[16px] border-b border-[#C2C6D4] flex items-center gap-6 bg-slate-50">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#555F6B]" />
            <span className="text-[12px] font-bold text-[#555F6B] uppercase">Status:</span>
            <select 
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="text-[13px] border border-[#C2C6D4] rounded-md px-3 py-1.5 outline-none bg-white text-slate-700 focus:border-[#003F87]"
            >
              <option value="All">All Statuses</option>
              <option value="Full Paid">Full Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Pending">Pending / Not Paid</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#555F6B] uppercase">Due Date:</span>
            <div className="flex items-center bg-white border border-[#C2C6D4] rounded-md focus-within:border-[#003F87] overflow-hidden">
              <input 
                type="date"
                value={filterDate}
                onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                className="text-[13px] px-3 py-1.5 outline-none text-slate-700 bg-transparent"
              />
              {filterDate && (
                <button 
                  onClick={() => { setFilterDate(''); setCurrentPage(1); }}
                  className="px-2 text-slate-400 hover:text-red-500 font-bold"
                  title="Clear date"
                >
                  &times;
                </button>
              )}
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
                      <div className="absolute right-[24px] top-[40px] bg-white border border-[#C2C6D4] shadow-lg rounded-md w-[140px] z-[20] flex flex-col overflow-hidden">
                        <button onClick={() => { setViewItem(fee); setActiveDropdown(null); }} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"><Eye size={14} /> View Details</button>
                        <button onClick={() => { setEditItem(fee); setActiveDropdown(null); }} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"><Edit size={14} /> Edit Record</button>
                        <button onClick={() => handleDelete(fee.id)} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"><Trash2 size={14} /> Delete</button>
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
            Showing {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
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

      {/* View Details Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Fee Details</h2>
              <button onClick={() => setViewItem(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase">Student Name</span>
                  <span className="text-sm font-semibold text-slate-900">{viewItem.name}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase">Course</span>
                  <span className="text-sm font-semibold text-slate-900">{viewItem.course}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase">Payment Type</span>
                  <span className="text-sm font-semibold text-slate-900">{viewItem.type}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase">Amount</span>
                  <span className="text-sm font-semibold text-slate-900">{viewItem.amount}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase">Date</span>
                  <span className="text-sm font-semibold text-slate-900">{viewItem.date}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase">Status</span>
                  <span className={`text-sm font-bold ${viewItem.statusColor === 'green' ? 'text-[#008A2E]' : viewItem.statusColor === 'yellow' ? 'text-[#B26E00]' : 'text-[#D80000]'}`}>{viewItem.status}</span>
                </div>
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
                <button onClick={() => setViewItem(null)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Edit Fee Record</h2>
              <button onClick={() => setEditItem(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student Name</label>
                <input type="text" required value={editItem.name} onChange={(e) => setEditItem({...editItem, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label>
                  <input type="text" required value={editItem.amount} onChange={(e) => setEditItem({...editItem, amount: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select value={editItem.status} onChange={(e) => {
                    const status = e.target.value;
                    const statusColor = status === 'Full Paid' ? 'green' : status === 'Partially Paid' ? 'yellow' : 'red';
                    setEditItem({...editItem, status, statusColor});
                  }} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white">
                    <option value="Full Paid">Full Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white hover:bg-[#002B5E]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesContent;
