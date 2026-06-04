import React, { useState } from 'react';
import { Search, Calendar, RefreshCcw, MoreVertical, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const initialAttendanceData = [
  { id: 1, type: 'Student', identifier: 'STU-1024', name: 'Jordan Belfort', initials: 'JB', course: 'Full Stack Web Engineering', status: 'Present', inTime: '08:45 AM', outTime: '04:30 PM', date: '2023-10-27' },
  { id: 2, type: 'Student', identifier: 'STU-1025', name: 'Sarah Connor', initials: 'SC', course: 'Advanced Digital Strategy', status: 'Late', inTime: '09:15 AM', outTime: '-- : --', date: '2023-10-27', note: 'Transit delay due to rain' },
  { id: 3, type: 'Student', identifier: 'STU-1026', name: 'Marcus Phoenix', initials: 'MP', course: 'UI/UX Design Masterclass', status: 'Absent', inTime: '-- : --', outTime: '-- : --', date: '2023-10-27' },
  { id: 4, type: 'Student', identifier: 'STU-1027', name: 'Eleven Hopper', initials: 'EH', course: 'Data Science & Analytics', status: 'Leave', inTime: '-- : --', outTime: '-- : --', date: '2023-10-27' },
  { id: 5, type: 'Employee', identifier: 'EMP-001', name: 'Walter White', initials: 'WW', course: 'N/A', status: 'Present', inTime: '08:00 AM', outTime: '05:00 PM', date: '2023-10-27' },
  { id: 6, type: 'Employee', identifier: 'EMP-002', name: 'Jesse Pinkman', initials: 'JP', course: 'N/A', status: 'Late', inTime: '09:30 AM', outTime: '-- : --', date: '2023-10-27' }
];

const AttendanceContent = ({ courses = [] }) => {
  const [activeTab, setActiveTab] = useState('Students');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All Categories');
  const [dateFilter, setDateFilter] = useState('');

  const handleRefresh = () => {
    setSearchQuery('');
    setCourseFilter('All Categories');
    setDateFilter('');
  };

  const filteredData = initialAttendanceData.filter(item => {
    if (activeTab === 'Students' && item.type !== 'Student') return false;
    if (activeTab === 'Employees' && item.type !== 'Employee') return false;

    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(term) && !item.identifier.toLowerCase().includes(term)) {
        return false;
      }
    }

    if (courseFilter !== 'All Categories' && item.course !== courseFilter) {
      return false;
    }

    if (dateFilter && item.date !== dateFilter) {
      return false;
    }

    return true;
  });

  const uniqueCourses = ['All Categories', ...courses.map(c => c.title)];

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full">
      {/* Header Section */}
      <div className="w-full flex justify-between items-center min-h-[52px]">
        <div>
          <h2 className="text-[20px] font-bold text-[#003F87] leading-tight">Attendance Management</h2>
          <p className="text-[13px] text-[#555F6B] mt-1">Real-time tracking of institutional presence and engagement.</p>
        </div>
        <div className="flex bg-[#F8FAFC] rounded-[4px] p-[4px] border border-[#C2C6D4]">
          <button 
            onClick={() => setActiveTab('Students')}
            className={`px-6 py-1.5 text-[13px] font-bold rounded-[4px] transition-colors ${activeTab === 'Students' ? 'bg-white text-[#003F87] shadow-sm border border-[#C2C6D4]' : 'text-[#555F6B] hover:text-slate-800'}`}
          >
            Students
          </button>
          <button 
            onClick={() => setActiveTab('Employees')}
            className={`px-6 py-1.5 text-[13px] font-bold rounded-[4px] transition-colors ${activeTab === 'Employees' ? 'bg-white text-[#003F87] shadow-sm border border-[#C2C6D4]' : 'text-[#555F6B] hover:text-slate-800'}`}
          >
            Employees
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[8px] p-[24px] flex flex-col md:flex-row items-end gap-[24px]">
        {/* Search */}
        <div className="flex-1 w-full">
          <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Search by Name/ID</label>
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px]">
            <input 
              type="text" 
              placeholder="e.g. STU-001" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] w-full text-slate-800 placeholder:text-[#555F6B]" 
            />
            <Search size={16} className="text-[#555F6B]" />
          </div>
        </div>
        {/* Category */}
        <div className="flex-1 w-full">
          <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Category/Course</label>
          <select 
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            disabled={activeTab === 'Employees'}
            className="w-full bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px] text-[13px] text-slate-800 outline-none appearance-none disabled:opacity-50"
          >
            {uniqueCourses.map(course => <option key={course} value={course}>{course}</option>)}
          </select>
        </div>
        {/* Date Range */}
        <div className="flex-[0.8] w-full">
          <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Date Filter</label>
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px]">
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] w-full text-slate-800" 
            />
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-[12px] w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-[#003F87] text-white px-[24px] py-[10px] rounded-[6px] text-[13px] font-bold hover:bg-[#002B5E] transition-colors h-[42px] whitespace-nowrap">
            Apply Filters
          </button>
          <button 
            onClick={handleRefresh}
            className="bg-white border border-[#C2C6D4] w-[42px] h-[42px] shrink-0 rounded-[6px] flex items-center justify-center text-[#555F6B] hover:bg-slate-50 transition-colors"
            title="Refresh Filters"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[8px] flex flex-col overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#C2C6D4] bg-white">
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider w-[120px]">ID</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Name</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Course / Role</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider w-[200px]">Status</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">In Time</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Out Time</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((item, index) => (
                <tr key={item.id} className={index !== filteredData.length - 1 ? "border-b border-slate-100" : ""}>
                  <td className="py-[16px] px-[24px]">
                    <div className="text-[13px] font-bold text-[#003F87] leading-tight break-words max-w-[80px]">{item.identifier}</div>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    <div className="flex items-center gap-3">
                      <div className={`w-[32px] h-[32px] rounded-full font-bold text-[11px] flex items-center justify-center shrink-0 ${item.type === 'Student' ? 'bg-[#E5F0FF] text-[#003F87]' : 'bg-[#F3F4F6] text-[#555F6B]'}`}>
                        {item.initials}
                      </div>
                      <div className="text-[14px] font-bold text-slate-900 leading-tight">{item.name}</div>
                    </div>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    <div className="text-[13px] text-[#555F6B] leading-tight">{item.course}</div>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`inline-flex items-center gap-2 px-[12px] py-[4px] rounded-full text-[12px] font-bold
                        ${item.status === 'Present' ? 'bg-[#E5F7ED] text-[#008A2E]' : ''}
                        ${item.status === 'Late' ? 'bg-[#FFF4E5] text-[#B26E00]' : ''}
                        ${item.status === 'Absent' ? 'bg-[#FDE2E2] text-[#D80000]' : ''}
                        ${item.status === 'Leave' ? 'bg-[#E5F0FF] text-[#003F87]' : ''}
                      `}>
                        <span className={`w-[6px] h-[6px] rounded-full 
                          ${item.status === 'Present' ? 'bg-[#008A2E]' : ''}
                          ${item.status === 'Late' ? 'bg-[#B26E00]' : ''}
                          ${item.status === 'Absent' ? 'bg-[#D80000]' : ''}
                          ${item.status === 'Leave' ? 'bg-[#003F87]' : ''}
                        `}></span> 
                        {item.status}
                      </span>
                      {item.note && <span className="text-[10px] text-[#B26E00] leading-tight max-w-[140px]">Note: {item.note}</span>}
                    </div>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    <div className="text-[13px] font-medium text-slate-900 leading-tight">{item.inTime}</div>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    <div className="text-[13px] font-medium text-slate-900 leading-tight">{item.outTime}</div>
                  </td>
                  <td className="py-[16px] px-[24px] text-right">
                    <button className="text-[#555F6B] hover:text-[#003F87]"><MoreVertical size={18} /></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="py-[32px] text-center text-[13px] text-[#555F6B]">
                    No attendance records found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[24px] pt-[8px]">
        {/* Overall Presence */}
        <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col justify-between h-[231px] shadow-sm">
          <div>
            <div className="w-[48px] h-[48px] rounded-full bg-[#E5F0FF] flex items-center justify-center text-[#003F87] mb-4">
              <CheckCircle size={24} />
            </div>
            <p className="text-[12px] font-bold text-[#555F6B] uppercase tracking-wide mb-1">OVERALL PRESENCE</p>
            <h3 className="text-[36px] font-bold text-[#003F87] leading-none">94.2%</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#008A2E]">
            <TrendingUp size={16} />
            <span>+2.4% from last week</span>
          </div>
        </div>

        {/* Average Latency */}
        <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col justify-between h-[231px] shadow-sm">
          <div>
            <div className="w-[48px] h-[48px] rounded-[8px] bg-[#FFF4E5] flex items-center justify-center text-[#B26E00] mb-4">
              <Clock size={24} />
            </div>
            <p className="text-[12px] font-bold text-[#555F6B] uppercase tracking-wide mb-1">AVERAGE LATENCY</p>
            <h3 className="text-[36px] font-bold text-[#003F87] leading-none">12m</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#B26E00]">
            <span className="w-3 border-b-[2px] border-current inline-block"></span>
            <span>No change in 30 days</span>
          </div>
        </div>
        
        {/* Placeholders for grid spacing as per Figma */}
        <div className="border border-solid border-[#C2C6D4] rounded-[8px] h-[231px] bg-white hidden xl:block"></div>
        <div className="border border-solid border-[#C2C6D4] rounded-[8px] h-[231px] bg-white hidden xl:block"></div>
      </div>

    </div>
  );
};

export default AttendanceContent;
