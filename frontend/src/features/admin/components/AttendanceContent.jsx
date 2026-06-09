import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, RefreshCcw, MoreVertical, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

const AttendanceContent = ({ employees = [], courses = [] }) => {
  const [students, setStudents] = useState([]);
  
  // Database tables mock state
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [employeeAttendance, setEmployeeAttendance] = useState([]);

  const [activeTab, setActiveTab] = useState('Students');
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  
  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm] = useState({ status: 'PRESENT', check_in: '', check_out: '', remarks: '' });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All Categories');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
          return;
        }

        const headers = { 'Authorization': `Bearer ${userInfo.token}` };

        // Fetch students
        const stdRes = await fetch('/api/v1/students', { headers });
        if (stdRes.ok) setStudents(await stdRes.json());

        // Fetch attendance (V2 API uses a single endpoint for all attendance)
        const attRes = await fetch('/api/v1/attendance', { headers });
        if (attRes.ok) {
          const attendanceData = await attRes.json();
          // Assuming the backend returns mixed data or we filter it here
          // If the backend hasn't implemented V2 fully, this will just gracefully fallback to empty arrays
          setStudentAttendance(attendanceData.filter(a => a.student_id));
          setEmployeeAttendance(attendanceData.filter(a => a.employee_id));
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRefresh = () => {
    setSearchQuery('');
    setCourseFilter('All Categories');
    setDateFilter('');
  };

  const handleUpdateStatus = (id, newStatus) => {
    const table = activeTab === 'Students' ? studentAttendance : employeeAttendance;
    const setTable = activeTab === 'Students' ? setStudentAttendance : setEmployeeAttendance;
    
    const updated = table.map(item => {
      if (item.id === id) {
        const now = new Date().toISOString();
        return { 
          ...item, 
          status: newStatus,
          check_in: newStatus === 'PRESENT' || newStatus === 'LATE' || newStatus === 'HALF_DAY' ? now : null,
          remarks: newStatus === 'LATE' ? 'Manually updated' : item.remarks
        };
      }
      return item;
    });
    setTable(updated);
    setOpenActionMenuId(null);
  };

  const handleOpenEdit = (item) => {
    setEditForm({
      status: item.status,
      check_in: item.check_in ? item.check_in.substring(11, 16) : '', // 'HH:mm' for time input
      check_out: item.check_out ? item.check_out.substring(11, 16) : '',
      remarks: item.remarks || ''
    });
    setEditRecord(item);
    setOpenActionMenuId(null);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const table = activeTab === 'Students' ? studentAttendance : employeeAttendance;
    const setTable = activeTab === 'Students' ? setStudentAttendance : setEmployeeAttendance;
    
    const updated = table.map(item => {
      if (item.id === editRecord.id) {
        // Construct full ISO strings from the time inputs for the current attendance date
        const datePrefix = item.attendance_date;
        return { 
          ...item, 
          status: editForm.status,
          check_in: editForm.check_in ? `${datePrefix}T${editForm.check_in}:00` : null,
          check_out: editForm.check_out ? `${datePrefix}T${editForm.check_out}:00` : null,
          remarks: editForm.remarks
        };
      }
      return item;
    });
    setTable(updated);
    setEditRecord(null);
  };

  // Join data with respective Profiles
  const getMappedData = () => {
    if (activeTab === 'Students') {
      return studentAttendance.map(sa => {
        const student = students.find(s => (s.id || s._id) === sa.student_id);
        const name = student ? `${student.first_name || ''} ${student.last_name || ''}`.trim() : `Unknown Student (ID: ${sa.student_id})`;
        const initials = student && student.first_name ? `${student.first_name[0]}${student.last_name ? student.last_name[0] : ''}`.toUpperCase() : '??';
        return { ...sa, type: 'Student', identifier: student?.student_code || 'N/A', name, initials, course: 'Mapped from courses later' }; // Assuming course mapping isn't directly on attendance table
      });
    } else {
      return employeeAttendance.map(ea => {
        const employee = employees.find(e => e.id === ea.employee_id);
        const name = employee ? employee.name : `Unknown Employee (ID: ${ea.employee_id})`;
        const initials = name !== 'Unknown Employee' ? name.substring(0, 2).toUpperCase() : '??';
        return { ...ea, type: 'Employee', identifier: employee?.eid || 'N/A', name, initials, course: employee?.department || 'N/A' };
      });
    }
  };

  const formattedTime = (isoString) => {
    if (!isoString) return '-- : --';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const joinedData = getMappedData();

  const filteredData = joinedData.filter(item => {
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(term) && !item.identifier.toLowerCase().includes(term)) {
        return false;
      }
    }
    if (courseFilter !== 'All Categories' && item.course !== courseFilter) {
      return false;
    }
    if (dateFilter && item.attendance_date !== dateFilter) {
      return false;
    }
    return true;
  });

  const total = filteredData.length;
  const presentCount = filteredData.filter(d => d.status === 'PRESENT' || d.status === 'LATE' || d.status === 'HALF_DAY').length;
  const lateCount = filteredData.filter(d => d.status === 'LATE').length;
  
  const presencePercent = total === 0 ? 0 : (presentCount / total * 100).toFixed(1);
  const avgLatency = total === 0 ? 0 : Math.round((lateCount * 15) / total); // Mock calculation

  const uniqueCourses = ['All Categories', ...courses.map(c => c.title)];

  if (loading) {
    return <LoadingSpinner text="Loading attendance data..." />;
  }

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full">
      {/* Header Section */}
      <div className="w-full flex justify-between items-center min-h-[52px]">
        <div>
          <h2 className="text-[20px] font-bold text-[#003F87] leading-tight">Attendance Management</h2>
          <p className="text-[13px] text-[#555F6B] mt-1">Real-time tracking for {activeTab.toLowerCase()}.</p>
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
        <div className="flex-1 w-full">
          <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Search by Name/ID</label>
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px]">
            <input 
              type="text" 
              placeholder="e.g. 001" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] w-full text-slate-800 placeholder:text-[#555F6B]" 
            />
            <Search size={16} className="text-[#555F6B]" />
          </div>
        </div>
        
        {/* Category (Only relevant if mapping students to courses, handled loosely here) */}
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
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Course / Dept</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider w-[200px]">Status</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Check In</th>
                <th className="py-[16px] px-[24px] text-[11px] font-bold text-[#555F6B] uppercase tracking-wider">Check Out</th>
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
                      <span className={`inline-flex items-center gap-2 px-[12px] py-[4px] rounded-full text-[11px] font-bold tracking-wide
                        ${item.status === 'PRESENT' ? 'bg-[#E5F7ED] text-[#008A2E]' : ''}
                        ${item.status === 'LATE' ? 'bg-[#FFF4E5] text-[#B26E00]' : ''}
                        ${item.status === 'ABSENT' ? 'bg-[#FDE2E2] text-[#D80000]' : ''}
                        ${item.status === 'HALF_DAY' ? 'bg-[#E5F0FF] text-[#003F87]' : ''}
                      `}>
                        <span className={`w-[6px] h-[6px] rounded-full 
                          ${item.status === 'PRESENT' ? 'bg-[#008A2E]' : ''}
                          ${item.status === 'LATE' ? 'bg-[#B26E00]' : ''}
                          ${item.status === 'ABSENT' ? 'bg-[#D80000]' : ''}
                          ${item.status === 'HALF_DAY' ? 'bg-[#003F87]' : ''}
                        `}></span> 
                        {item.status.replace('_', ' ')}
                      </span>
                      {item.remarks && <span className="text-[10px] text-[#B26E00] leading-tight max-w-[140px] truncate" title={item.remarks}>R: {item.remarks}</span>}
                    </div>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    <div className="text-[13px] font-medium text-slate-900 leading-tight">{formattedTime(item.check_in)}</div>
                  </td>
                  <td className="py-[16px] px-[24px]">
                    <div className="text-[13px] font-medium text-slate-900 leading-tight">{formattedTime(item.check_out)}</div>
                  </td>
                  <td className="py-[16px] px-[24px] text-right relative">
                    <button 
                      onClick={() => setOpenActionMenuId(openActionMenuId === item.id ? null : item.id)}
                      className="text-[#555F6B] hover:text-[#003F87] p-1 rounded hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openActionMenuId === item.id && (
                      <div className={`absolute right-[24px] ${index >= filteredData.length - 2 && filteredData.length > 2 ? 'bottom-[40px]' : 'top-[40px]'} w-[140px] bg-white border border-[#C2C6D4] shadow-lg rounded-[8px] z-50 overflow-hidden text-left flex flex-col`}>
                        <button onClick={() => handleUpdateStatus(item.id, 'PRESENT')} className="px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#008A2E] text-left border-b border-slate-100 transition-colors">Mark Present</button>
                        <button onClick={() => handleUpdateStatus(item.id, 'LATE')} className="px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#B26E00] text-left border-b border-slate-100 transition-colors">Mark Late</button>
                        <button onClick={() => handleUpdateStatus(item.id, 'ABSENT')} className="px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#D80000] text-left border-b border-slate-100 transition-colors">Mark Absent</button>
                        <button onClick={() => handleUpdateStatus(item.id, 'HALF_DAY')} className="px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#003F87] text-left border-b border-slate-100 transition-colors">Mark Half Day</button>
                        <button onClick={() => handleOpenEdit(item)} className="px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 text-left transition-colors">Edit Record</button>
                      </div>
                    )}
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
            <h3 className="text-[36px] font-bold text-[#003F87] leading-none">{presencePercent}%</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#008A2E]">
            <TrendingUp size={16} />
            <span>Calculated from visible data</span>
          </div>
        </div>

        {/* Average Latency */}
        <div className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col justify-between h-[231px] shadow-sm">
          <div>
            <div className="w-[48px] h-[48px] rounded-[8px] bg-[#FFF4E5] flex items-center justify-center text-[#B26E00] mb-4">
              <Clock size={24} />
            </div>
            <p className="text-[12px] font-bold text-[#555F6B] uppercase tracking-wide mb-1">AVERAGE LATENCY</p>
            <h3 className="text-[36px] font-bold text-[#003F87] leading-none">{avgLatency}m</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#B26E00]">
            <span className="w-3 border-b-[2px] border-current inline-block"></span>
            <span>Based on late arrivals</span>
          </div>
        </div>
        
        {/* Placeholders for grid spacing as per Figma */}
        <div className="border border-solid border-[#C2C6D4] rounded-[8px] h-[231px] bg-white hidden xl:block"></div>
        <div className="border border-solid border-[#C2C6D4] rounded-[8px] h-[231px] bg-white hidden xl:block"></div>
      </div>

      {editRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Edit Attendance Record</h2>
              <button onClick={() => setEditRecord(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
                <select 
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm bg-white"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="HALF_DAY">HALF DAY</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Check In</label>
                  <input 
                    type="time" 
                    value={editForm.check_in}
                    onChange={(e) => setEditForm({...editForm, check_in: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Check Out</label>
                  <input 
                    type="time" 
                    value={editForm.check_out}
                    onChange={(e) => setEditForm({...editForm, check_out: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Remarks</label>
                <textarea 
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({...editForm, remarks: e.target.value})}
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm resize-none" 
                  placeholder="E.g. Transit delay..."
                />
              </div>
              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditRecord(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-lg text-sm font-semibold text-white hover:bg-[#002B5E]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceContent;

