import React, { useState, useEffect } from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const LowerContent = ({ employees = [], students }) => {
  const [viewAllBtn, setViewAllBtn] = useState(true);
  const [attendanceTab, setAttendanceTab] = useState('Employees');
  
  // Local state for dashboard students if not passed as prop
  const [dashboardStudents, setDashboardStudents] = useState(students || []);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!students || students.length === 0) {
      // Fetch students from backend just for dashboard if not lifted
      const fetchStudents = async () => {
        setLoading(true);
        try {
          const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
          if (!userInfo || !userInfo.token) return;
          const response = await fetch('/api/v1/students', {
            headers: { 'Authorization': `Bearer ${userInfo.token}` }
          });
          if (!response.ok) throw new Error(`Students API error: ${response.status}`);
          const resData = await response.json();
          if (response.ok) {
            const studs = resData.data?.students || resData.data || [];
            setDashboardStudents(studs);
          }
        } catch (error) {
          console.error('Error fetching students for dashboard:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    } else {
      setDashboardStudents(students);
    }
  }, [students]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;
        
        const headers = { 'Authorization': `Bearer ${userInfo.token}` };
        const today = new Date().toLocaleDateString('en-CA');
        
        const [studentRes, employeeRes] = await Promise.all([
          fetch(`/api/v1/attendance?type=student&from=${today}&to=${today}`, { headers }),
          fetch(`/api/v1/attendance?type=employee&from=${today}&to=${today}`, { headers })
        ]);

        let allRecords = [];
        if (studentRes.ok) {
          const sData = await studentRes.json();
          if (sData.data) allRecords = [...allRecords, ...sData.data];
        }
        if (employeeRes.ok) {
          const eData = await employeeRes.json();
          if (eData.data) allRecords = [...allRecords, ...eData.data];
        }
        
        setAttendanceRecords(allRecords);
      } catch (error) {
        console.error('Error fetching dashboard attendance:', error);
      }
    };
    fetchAttendance();
  }, []);

  const handleViewAllClick = () => {
    setViewAllBtn(!viewAllBtn);
  };

  const getStatusDisplay = (status) => {
    if (status === 'PRESENT' || status === 'LATE' || status === 'HALF_DAY') {
      return { text: status.replace('_', ' '), color: 'bg-green-100 text-green-700', dot: 'bg-green-500' };
    }
    return { text: 'Absent', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const displayData = attendanceTab === 'Students' 
    ? dashboardStudents.map(s => {
        const att = attendanceRecords.find(a => a.student_id === (s.id || s._id));
        const fullName = s.first_name ? `${s.first_name} ${s.last_name || ''}` : (s.name || 'Unknown');
        const statusData = att ? getStatusDisplay(att.status) : { text: 'Not Marked', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
        return {
          id: s.id || s._id,
          name: fullName,
          subtitle: s.course || 'Enrolled',
          initials: fullName.substring(0, 2).toUpperCase(),
          time: att ? formatTime(att.check_in) : '--:--',
          checkoutTime: att && att.check_out ? formatTime(att.check_out) : '--:--',
          status: statusData.text,
          statusColor: statusData.color,
          dotColor: statusData.dot,
          rawTime: att ? new Date(att.check_out || att.check_in || 0).getTime() : 0
        };
      })
    : employees.map(e => {
        const att = attendanceRecords.find(a => a.employee_id === e.id);
        const statusData = att ? getStatusDisplay(att.status) : { text: 'Not Marked', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
        return {
          id: e.id,
          name: e.name || 'Unknown',
          subtitle: e.department || 'Staff',
          initials: (e.name || 'UN').substring(0, 2).toUpperCase(),
          time: att ? formatTime(att.check_in) : '--:--',
          checkoutTime: att && att.check_out ? formatTime(att.check_out) : '--:--',
          status: statusData.text,
          statusColor: statusData.color,
          dotColor: statusData.dot,
          rawTime: att ? new Date(att.check_out || att.check_in || 0).getTime() : 0
        };
      });

  const sortedDisplayData = [...displayData].sort((a, b) => {
    if (a.rawTime !== b.rawTime) return b.rawTime - a.rawTime;
    return a.name.localeCompare(b.name);
  });

  const visibleData = viewAllBtn ? sortedDisplayData.slice(0, 4) : sortedDisplayData;

  if (loading) {
    return <LoadingSpinner text="Loading attendance..." />;
  }

  return (
    <div className="flex flex-col gap-[24px]">
      {/* Attendance Overview (Full width) */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[8px] flex flex-col h-full">
        <div className="p-[24px] border-b border-[#C2C6D4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <h2 className="text-[16px] font-bold text-slate-800">Today's Attendance Overview</h2>
            <p className="text-[12px] text-slate-500">Real-time status tracking for the institution.</p>
          </div>
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button 
              onClick={() => setAttendanceTab('Employees')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${attendanceTab === 'Employees' ? 'bg-white text-[#003F87] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Employees
            </button>
            <button 
              onClick={() => setAttendanceTab('Students')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${attendanceTab === 'Students' ? 'bg-white text-[#003F87] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Students
            </button>
          </div>
        </div>
        
        <div className="w-full overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-2/5">Entity Name</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/5">Check-In</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/5">Check-Out</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/5">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleData.length > 0 ? visibleData.map(item => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-9 h-9 shrink-0 rounded-full bg-blue-50 text-[#003F87] font-bold text-xs flex items-center justify-center">{item.initials}</div>
                      <div className="truncate">
                        <div className="text-sm font-bold text-slate-800 truncate">{item.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{item.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-slate-700 truncate">{item.time}</td>
                  <td className="py-4 px-6 text-[13px] font-medium text-slate-700 truncate">{item.checkoutTime}</td>
                  <td className="py-4 px-6 truncate">
                    <span className={`inline-flex items-center gap-1.5 ${item.statusColor} px-2.5 py-1 rounded-full text-[11px] font-bold`}>
                      <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${item.dotColor}`}></span>
                      {item.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-sm text-slate-500">
                    No {attendanceTab.toLowerCase()} data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {viewAllBtn && (
          <div className="p-4 text-center border-t border-slate-200">
            <button onClick={handleViewAllClick} className="text-[#003F87] text-xs font-bold hover:underline">
              View All Attendance Records
            </button>
          </div>
        )}
      </div>


      {/* Widgets (Takes 1 column) 
      <div className="xl:col-span-1 flex flex-col gap-[24px]">
        <div className="bg-[#003F87] rounded-xl p-6 flex items-center justify-between shadow-sm cursor-pointer hover:bg-[#002B5E] transition-colors text-white">
          <div>
            <h3 className="text-[15px] font-bold">New Lead</h3>
            <p className="text-[12px] text-blue-100 mt-1">Register a new prospective student</p>
          </div>
          <ChevronRight size={20} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-bold text-slate-800">SEO Agent Active</h3>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Zap size={16} />
            </div>
          </div>
          <p className="text-[12px] text-slate-500 leading-relaxed mb-6">
            Your blog automation is running. 3 new articles published this week.
          </p>
          
          <div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div className="w-[75%] h-full bg-[#003F87] rounded-full"></div>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-500">Optimization Score</span>
              <span className="text-[#003F87]">75%</span>
            </div>
          </div>
        </div>
      </div>
      */}
    </div>
  );
};

export default LowerContent;

