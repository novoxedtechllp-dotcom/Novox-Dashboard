import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Search, 
  Download, 
  PlayCircle, 
  Eye, 
  Wallet, 
  Info,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';

const initialEmployees = [];

const PayrollContent = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [payrollStatusMap, setPayrollStatusMap] = useState({});

  const currentEmployees = useMemo(() => {
    return initialEmployees.map(emp => {
      const d = new Date();
      const currentYearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      let defaultStatus = emp.status;
      if (selectedMonth < currentYearMonth) {
        defaultStatus = 'PAID';
      } else if (selectedMonth > currentYearMonth) {
        defaultStatus = 'PENDING';
      }
      
      const statusOverride = payrollStatusMap[selectedMonth]?.[emp.id];
      return {
        ...emp,
        status: statusOverride || defaultStatus
      };
    });
  }, [selectedMonth, payrollStatusMap]);

  const formatMonthDisplay = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  
  const itemsPerPage = 5;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const total = currentEmployees.reduce((sum, emp) => sum + emp.netPayable, 0);
    const paid = currentEmployees
      .filter(emp => emp.status === 'PAID')
      .reduce((sum, emp) => sum + emp.netPayable, 0);
    const pending = currentEmployees
      .filter(emp => emp.status === 'PENDING')
      .reduce((sum, emp) => sum + emp.netPayable, 0);

    return { total, paid, pending };
  }, [currentEmployees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return currentEmployees.filter(emp => 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentEmployees, searchQuery]);

  // Paginated employees
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handlePayIndividual = (id, name) => {
    setPayrollStatusMap(prev => ({
      ...prev,
      [selectedMonth]: {
        ...(prev[selectedMonth] || {}),
        [id]: 'PAID'
      }
    }));
    showToast(`Salary successfully disbursed to ${name}!`);
  };

  const handleRunPayroll = () => {
    const pendingCount = currentEmployees.filter(emp => emp.status === 'PENDING').length;
    if (pendingCount === 0) {
      showToast("All payrolls are already processed!");
      return;
    }
    
    const newMonthStatus = {};
    currentEmployees.forEach(emp => {
      newMonthStatus[emp.id] = 'PAID';
    });

    setPayrollStatusMap(prev => ({
      ...prev,
      [selectedMonth]: {
        ...(prev[selectedMonth] || {}),
        ...newMonthStatus
      }
    }));
    showToast(`Successfully processed payroll for ${pendingCount} employees!`);
  };

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Role', 'Base Salary (₹)', 'Leaves', 'Late Days', 'Net Payable (₹)', 'Status'];
    const rows = currentEmployees.map(emp => [
      emp.id,
      emp.name,
      emp.role,
      emp.baseSalary,
      emp.leaves,
      emp.lateDays,
      emp.netPayable,
      emp.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payroll_Export_${formatMonthDisplay(selectedMonth).replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV Exported successfully!");
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 w-full relative bg-[#F8FAFC]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[9999] bg-[#003F87] text-white px-5 py-3 rounded-xl shadow-lg font-semibold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle size={16} />
          {toastMessage}
        </div>
      )}

      {/* Header Container */}
      <div className="w-full flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-[24px] font-bold text-[#003F87] leading-tight">Payroll Management</h1>
          <div className="hidden md:block h-6 w-[1px] bg-[#C2C6D4]"></div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[13px] font-medium mt-0.5">
            <Calendar size={15} className="text-slate-400" />
            <span>Salaries Disbursed on 20th of every month</span>
          </div>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl text-[13px] font-bold h-[42px] transition-colors shadow-sm"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          
          <button 
            onClick={handleRunPayroll}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-[#003F87] hover:bg-[#002F66] text-white rounded-xl text-[13px] font-bold h-[42px] transition-colors shadow-sm"
          >
            <PlayCircle size={16} />
            <span>Run Payroll</span>
          </button>
        </div>
      </div>

      {/* Structured Container matching Fees page */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[16px] flex flex-col overflow-hidden shadow-sm">
        
        {/* Tabs Row */}
        <div className="flex items-center h-[61px] border-b border-[#C2C6D4] px-[24px]">
          <button className="h-full flex items-center gap-2 text-[#003F87] font-bold text-[14px] border-b-[3px] border-[#003F87] px-[8px]">
            <Briefcase size={18} /> Payroll History
          </button>
        </div>

        {/* Stats Grid inside Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#C2C6D4] h-auto md:h-[136px]">
          
          {/* Total Payroll */}
          <div className="p-[24px] flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">Total Payroll This Month</p>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none mb-2">
              ₹{stats.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#003F87] bg-blue-50/50 px-2 py-0.5 rounded-full w-max">
              +4.2% vs last mo
            </div>
          </div>

          {/* Total Paid */}
          <div className="p-[24px] flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">Total Paid</p>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none mb-2">
              ₹{stats.paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-[#008A2E] h-full transition-all duration-500 rounded-full" 
                style={{ width: `${stats.total > 0 ? (stats.paid / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Total Pending */}
          <div className="p-[24px] flex flex-col justify-center">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">Total Pending</p>
            <h3 className="text-[32px] font-bold text-[#D80000] leading-none mb-2">
              ₹{stats.pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full w-max">
              Due in 5 Days
            </div>
          </div>

        </div>

        {/* Filters bar inside Container */}
        <div className="px-[24px] py-[16px] border-b border-[#C2C6D4] flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 bg-slate-50">
          
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#555F6B] uppercase">Cycle Month:</span>
            <div className="relative">
              <button 
                onClick={() => {
                  const [yr] = selectedMonth.split('-');
                  setPickerYear(parseInt(yr));
                  setIsDatePickerOpen(!isDatePickerOpen);
                }}
                className="flex items-center bg-white border border-[#C2C6D4] rounded-md px-3.5 py-1.5 outline-none hover:border-[#003F87] h-[36px] shadow-sm text-[13px] font-bold text-slate-700 min-w-[150px] justify-between gap-2 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <span>{formatMonthDisplay(selectedMonth)}</span>
                </div>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {isDatePickerOpen && (
                <>
                  {/* Click outside backdrop */}
                  <div className="fixed inset-0 z-[100]" onClick={() => setIsDatePickerOpen(false)}></div>
                  
                  {/* Custom popover dropdown */}
                  <div className="absolute left-0 top-full mt-2 bg-white border border-[#C2C6D4] rounded-xl shadow-xl z-[101] p-3 w-[260px] animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {/* Header: Year Selector */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <button 
                        type="button"
                        onClick={() => setPickerYear(y => y - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 font-bold transition-all text-lg"
                      >
                        &lsaquo;
                      </button>
                      <span className="font-extrabold text-[14px] text-slate-800">{pickerYear}</span>
                      <button 
                        type="button"
                        onClick={() => setPickerYear(y => y + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 font-bold transition-all text-lg"
                      >
                        &rsaquo;
                      </button>
                    </div>

                    {/* Months Grid */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                      ].map((monthName, idx) => {
                        const monthStr = String(idx + 1).padStart(2, '0');
                        const targetMonthVal = `${pickerYear}-${monthStr}`;
                        const isSelected = selectedMonth === targetMonthVal;
                        
                        return (
                          <button
                            key={monthName}
                            type="button"
                            onClick={() => {
                              setSelectedMonth(targetMonthVal);
                              setIsDatePickerOpen(false);
                              showToast(`Cycle switched to ${formatMonthDisplay(targetMonthVal)}`);
                            }}
                            className={`py-2 rounded-lg text-[12px] font-bold transition-all text-center ${
                              isSelected
                                ? 'bg-[#003F87] text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            {monthName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[12px] font-bold text-[#555F6B] uppercase">Search:</span>
            <div className="flex items-center bg-white border border-[#C2C6D4] rounded-md px-3.5 py-1.5 h-[36px] w-full sm:w-[260px] shadow-sm transition-all focus-within:border-[#003F87]">
              <Search size={14} className="text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-none outline-none text-[13px] w-full text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

        </div>

        {/* Table inside Container */}
        <div className="w-full overflow-x-auto min-h-[350px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-[#C2C6D4] bg-white text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">
                <th className="py-[16px] px-[24px]">Employee ID & Name</th>
                <th className="py-[16px] px-[24px]">Base Salary</th>
                <th className="py-[16px] px-[24px]">Leaves</th>
                <th className="py-[16px] px-[24px]">Late Days</th>
                <th className="py-[16px] px-[24px]">Net Payable</th>
                <th className="py-[16px] px-[24px]">Status</th>
                <th className="py-[16px] px-[24px] text-center w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  
                  {/* ID & Name */}
                  <td className="py-[16px] px-[24px]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm ${emp.avatarBg}`}>
                        {getInitials(emp.name)}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900 leading-tight">{emp.name}</div>
                        <div className="text-[11px] font-semibold text-slate-400 mt-0.5">{emp.id} • {emp.role}</div>
                      </div>
                    </div>
                  </td>

                  {/* Base Salary */}
                  <td className="py-[16px] px-[24px] text-[13px] font-semibold text-slate-600">
                    ₹{emp.baseSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Leaves */}
                  <td className="py-[16px] px-[24px] text-[13px] font-semibold text-slate-600">
                    {emp.leaves} {emp.leaves === 1 ? 'day' : 'days'}
                  </td>

                  {/* Late Days */}
                  <td className="py-[16px] px-[24px] text-[13px] font-semibold text-slate-600">
                    {emp.lateDays} {emp.lateDays === 1 ? 'day' : 'days'}
                  </td>

                  {/* Net Payable */}
                  <td className="py-[16px] px-[24px] text-[13px] font-bold text-slate-900">
                    ₹{emp.netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Status */}
                  <td className="py-[16px] px-[24px]">
                    {emp.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1.5 bg-[#E5F7ED] text-[#008A2E] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#008A2E]"></span>
                        <span>PAID</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span>PENDING</span>
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-[16px] px-[24px] text-center">
                    {emp.status === 'PAID' ? (
                      <button 
                        onClick={() => setSelectedEmployee(emp)}
                        className="p-2 text-slate-400 hover:text-[#003F87] hover:bg-blue-50/50 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePayIndividual(emp.id, emp.name)}
                        className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all shadow-sm border border-red-100 hover:border-red-500"
                        title="Disburse Salary"
                      >
                        <Wallet size={16} />
                      </button>
                    )}
                  </td>

                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[13px] font-medium text-slate-400">
                    No employee records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Container Footer / Pagination */}
        {filteredEmployees.length > 0 && (
          <div className="p-[16px] px-[24px] bg-white flex justify-between items-center border-t border-[#C2C6D4]">
            <span className="text-[13px] text-[#555F6B] font-medium">
              Showing {Math.min(filteredEmployees.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredEmployees.length, currentPage * itemsPerPage)} of {filteredEmployees.length} employees
            </span>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`w-[28px] h-[28px] flex items-center justify-center rounded-[4px] border border-[#C2C6D4] transition-colors ${
                  currentPage === 1 ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : 'text-[#555F6B] bg-white hover:bg-slate-50'
                }`}
              >
                <ChevronLeft size={15} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[28px] h-[28px] flex items-center justify-center rounded-[4px] font-semibold transition-colors ${
                    currentPage === page 
                      ? 'bg-[#003F87] text-white font-bold' 
                      : 'text-[#555F6B] hover:bg-slate-100'
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
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Payout Notification Info Banner (matches bottom layout) */}
      <div className="w-full bg-[#EBF3FC] border border-blue-100 rounded-2xl p-4 flex gap-3.5 items-start mt-2">
        <div className="w-8 h-8 rounded-lg bg-[#003F87]/10 flex items-center justify-center shrink-0 mt-0.5">
          <Info size={16} className="text-[#003F87]" />
        </div>
        <div>
          <p className="text-[13px] leading-relaxed text-[#003F87] font-semibold">
            Next Payout Date: <span className="font-bold text-slate-900">
              {(() => {
                if (!selectedMonth) return '';
                const [year, month] = selectedMonth.split('-');
                const date = new Date(year, parseInt(month) - 1, 20);
                return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              })()}
            </span>. All pending salaries are scheduled for disbursement on this date. Ensure all leave adjustments are finalized by the 15th.
          </p>
        </div>
      </div>

      {/* Details View Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in scale-in-95 duration-200 border border-slate-100">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-950">Employee Payslip Breakdown</h2>
              <button 
                onClick={() => setSelectedEmployee(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors font-bold text-lg"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm ${selectedEmployee.avatarBg}`}>
                  {getInitials(selectedEmployee.name)}
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">{selectedEmployee.name}</h3>
                  <p className="text-[11px] font-semibold text-slate-400">{selectedEmployee.id} • {selectedEmployee.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[12px] py-1">
                <div>
                  <span className="block text-slate-400 font-medium">Payroll Period</span>
                  <span className="font-bold text-slate-800">{formatMonthDisplay(selectedMonth)}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Status</span>
                  <span className="inline-flex items-center gap-1 bg-[#E5F7ED] text-[#008A2E] px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5">
                    PAID
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 space-y-3 mt-1">
                <div className="flex justify-between items-center text-[12px] font-medium">
                  <span className="text-slate-500">Base Salary</span>
                  <span className="text-slate-800 font-semibold">₹{selectedEmployee.baseSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="flex justify-between items-center text-[12px] font-medium">
                  <span className="text-slate-500">Leaves ({selectedEmployee.leaves} days)</span>
                  <span className="text-amber-600 font-semibold">- ₹{((selectedEmployee.baseSalary / 30) * selectedEmployee.leaves).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center text-[12px] font-medium">
                  <span className="text-slate-500">Late Days ({selectedEmployee.lateDays} days)</span>
                  <span className="text-amber-600 font-semibold">- ₹{((selectedEmployee.baseSalary / 60) * selectedEmployee.lateDays).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="pt-3.5 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-[13px] font-bold text-slate-950">Net Paid Amount</span>
                  <span className="text-[16px] font-black text-[#003F87]">
                    ₹{selectedEmployee.netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setSelectedEmployee(null)} 
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-[12px] font-bold text-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PayrollContent;
