import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react';

const StudentAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        const token = userInfo?.token || '';
        const res = await fetch('/api/v1/attendance?type=student', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setAttendanceRecords(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    let presentCount = 0, absentCount = 0, leaveCount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const record = attendanceRecords.find(a => a.date === dateStr || a.date?.startsWith(dateStr));

      let bgColor = 'bg-slate-50';
      let textColor = 'text-slate-700';

      if (record) {
        if (record.status === 'PRESENT') {
          bgColor = 'bg-[#E5F7ED] border border-[#008A2E]/20';
          textColor = 'text-[#008A2E]';
          presentCount++;
        } else if (record.status === 'ABSENT') {
          bgColor = 'bg-[#FDE2E2] border border-[#D80000]/20';
          textColor = 'text-[#D80000]';
          absentCount++;
        } else if (record.status === 'ON_LEAVE' || record.status === 'LEAVE') {
          bgColor = 'bg-[#E5F0FF] border border-[#003F87]/20';
          textColor = 'text-[#003F87]';
          leaveCount++;
        }
      } else {
        bgColor = 'bg-slate-50 border border-slate-100';
      }

      days.push(
        <div key={d} className={`h-10 rounded-md flex items-center justify-center text-[13px] font-bold ${bgColor} ${textColor} m-1 transition-all hover:brightness-95 cursor-default`}>
          {d}
        </div>
      );
    }

    const totalDays = presentCount + absentCount + leaveCount;
    const attendanceRate = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : 0;

    return { days, presentCount, absentCount, leaveCount, attendanceRate };
  };

  const { days: calendarDays, presentCount, absentCount, leaveCount, attendanceRate } = renderCalendar();

  const getStatusStyle = (status) => {
    if (status === 'PRESENT') return 'text-green-700 bg-green-50 border-green-200';
    if (status === 'ABSENT') return 'text-red-700 bg-red-50 border-red-200';
    if (status === 'ON_LEAVE' || status === 'LEAVE') return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-slate-700 bg-slate-50 border-slate-200';
  };

  const getStatusDot = (status) => {
    if (status === 'PRESENT') return 'bg-green-500';
    if (status === 'ABSENT') return 'bg-red-500';
    if (status === 'ON_LEAVE' || status === 'LEAVE') return 'bg-blue-500';
    return 'bg-slate-500';
  };

  const getDisplayStatus = (status) => {
    if (status === 'PRESENT') return 'Present';
    if (status === 'ABSENT') return 'Absent';
    if (status === 'ON_LEAVE' || status === 'LEAVE') return 'On Leave';
    return status;
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFBFC] overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#003F87] mb-2">Attendance Portal</h1>
            <p className="text-slate-500">Review your monthly presence and manage your schedule.</p>
          </div>
        </div>

        {/* Top Row: Summary */}
        <div className="w-full mb-6">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-[15px]">
                <CalendarIcon size={18} className="text-[#003F87]" /> {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })} Summary
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#E5F7ED] border border-[#008A2E]/20 rounded-lg p-4 text-center">
                <div className="text-[24px] font-black text-[#008A2E]">{presentCount}</div>
                <div className="text-[12px] font-bold text-[#008A2E]/70 uppercase mt-1 tracking-wider">Present</div>
              </div>
              <div className="bg-[#FDE2E2] border border-[#D80000]/20 rounded-lg p-4 text-center">
                <div className="text-[24px] font-black text-[#D80000]">{absentCount}</div>
                <div className="text-[12px] font-bold text-[#D80000]/70 uppercase mt-1 tracking-wider">Absent</div>
              </div>
            </div>

            {/* Attendance Rate Progress Bar */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[14px] font-bold text-slate-800">Attendance Rate</span>
                <span className="text-[16px] font-black text-[#003F87]">{attendanceRate}%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] rounded-full h-2.5">
                <div className="bg-[#003F87] h-2.5 rounded-full" style={{ width: `${attendanceRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: List View & Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Attendance Log Table */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={18} className="text-[#003F87]" /> Daily Attendance Log
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-[#E2E8F0]">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px]">
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-slate-500 font-medium">Loading attendance data...</td>
                      </tr>
                    ) : attendanceRecords.length > 0 ? (
                      attendanceRecords.map((record, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                            {record.course_name || 'Class Session'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide border ${getStatusStyle(record.status)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(record.status)}`}></span>
                              {getDisplayStatus(record.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-slate-500 font-medium">No attendance records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm h-full">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors border border-slate-200"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="font-bold text-slate-800 text-[16px]">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors border border-slate-200"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center mb-3">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentAttendance;
