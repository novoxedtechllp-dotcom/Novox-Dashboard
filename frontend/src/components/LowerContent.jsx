import React, { useState, useEffect } from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const LowerContent = ({ employees = [], students }) => {
  const [viewAllBtn, setViewAllBtn] = useState(true);
  const [attendanceTab, setAttendanceTab] = useState('Students');
  
  // Local state for dashboard students if not passed as prop
  const [dashboardStudents, setDashboardStudents] = useState(students || []);
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

  const handleViewAllClick = () => {
    setViewAllBtn(!viewAllBtn);
  };

  const displayData = attendanceTab === 'Students' 
    ? dashboardStudents.map(s => {
        const fullName = s.first_name ? `${s.first_name} ${s.last_name || ''}` : (s.name || 'Unknown');
        return {
          id: s.id || s._id,
          name: fullName,
          subtitle: s.course || 'Enrolled',
          initials: fullName.substring(0, 2).toUpperCase(),
          time: s.status === 'ACTIVE' ? '08:15 AM' : '--:--',
          status: s.status === 'ACTIVE' ? 'Present' : 'Absent',
          statusColor: s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600',
          dotColor: s.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'
        };
      })
    : employees.map(e => ({
        id: e.id,
        name: e.name,
        subtitle: e.department,
        initials: e.name.substring(0, 2).toUpperCase(),
        time: e.status === 'Active' ? '08:00 AM' : '--:--',
        status: e.status === 'Active' ? 'Present' : 'On Leave',
        statusColor: e.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600',
        dotColor: e.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'
      }));

  const visibleData = viewAllBtn ? displayData.slice(0, 4) : displayData;

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
              onClick={() => setAttendanceTab('Students')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${attendanceTab === 'Students' ? 'bg-white text-[#003F87] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Students
            </button>
            <button 
              onClick={() => setAttendanceTab('Employees')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${attendanceTab === 'Employees' ? 'bg-white text-[#003F87] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Employees
            </button>
          </div>
        </div>
        
        <div className="w-full overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Entity Name</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check-In</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleData.length > 0 ? visibleData.map(item => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-[#003F87] font-bold text-xs flex items-center justify-center">{item.initials}</div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.subtitle}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-slate-700">{item.time}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 ${item.statusColor} px-2.5 py-1 rounded-full text-[11px] font-bold`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`}></span>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-[#003F87] text-xs font-bold hover:underline">Details</button>
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

