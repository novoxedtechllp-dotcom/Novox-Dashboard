import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle, Users, BarChart2, LogIn, LogOut, MoreVertical, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({ present: 0, halfDay: 0, late: 0, absent: 0 });
  const [studentCount, setStudentCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const userInfoStr = sessionStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!userInfo || !userInfo.token) return;
      try {
        const headers = { 'Authorization': `Bearer ${userInfo.token}` };
        const res = await fetch('/api/v1/attendance?type=employee', { headers });
        if (res.ok) {
          const data = await res.json();
          const allAttendance = (data.data || []).filter(a => a.employee_id === userInfo.id || a.employee_id === userInfo.employee_profile_id);
          
          const now = new Date();
          // Use local timezone string 'YYYY-MM-DD' instead of UTC to avoid timezone mismatches
          const today = now.toLocaleDateString('en-CA');
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          // Today's record
          const record = allAttendance.find(a => a.attendance_date === today || a.attendance_date?.startsWith(today));
          setAttendanceRecord(record || null);

          // Monthly stats
          let present = 0, halfDay = 0, late = 0, absent = 0;
          allAttendance.forEach(a => {
            if (!a.attendance_date) return;
            const d = new Date(a.attendance_date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
              if (a.status === 'PRESENT') present++;
              else if (a.status === 'HALF_DAY') halfDay++;
              else if (a.status === 'LATE') late++;
              else if (a.status === 'ABSENT') absent++;
            }
          });
          setMonthlyStats({ present, halfDay, late, absent });
        }

        // Fetch total courses (real data - replacing Pending Tasks)
        let myCourseIdSet = new Set();
        const crsRes = await fetch('/api/v1/courses', { headers });
        if (crsRes.ok) {
          const crsData = await crsRes.json();
          const allCourses = crsData.data || [];
          const myCourses = allCourses.filter(c => c.instructor_id === userInfo.id || c.employee_id === userInfo.id || c.employee_profile_id === userInfo.id || (c.instructors && c.instructors.includes(userInfo.id)));
          myCourseIdSet = new Set(myCourses.map(c => c.id || c._id));
          setCourseCount(myCourseIdSet.size);
        }

        // Fetch total students (real data)
        const stdRes = await fetch('/api/v1/students', { headers });
        if (stdRes.ok) {
          const stdData = await stdRes.json();
          const allStudents = stdData.data?.students || stdData.data || (Array.isArray(stdData) ? stdData : []);
          
          let assignedCount = 0;
          if (myCourseIdSet.size > 0) {
            assignedCount = allStudents.filter(s => {
              if (s.course_ids && Array.isArray(s.course_ids)) return s.course_ids.some(id => myCourseIdSet.has(id));
              if (s.course && (s.course.id || s.course._id)) return myCourseIdSet.has(s.course.id || s.course._id);
              if (s.course_id) return myCourseIdSet.has(s.course_id);
              return false;
            }).length;
          }
          setStudentCount(assignedCount);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [userInfo?.id]);

  const handlePunch = async (type) => {
    if (!userInfo || !userInfo.token) return;
    setError(null);
    try {
      const headers = { 'Authorization': `Bearer ${userInfo.token}` };
      const endpoint = type === 'in' ? '/api/v1/attendance/check-in' : '/api/v1/attendance/check-out';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers
      });

      if (res.ok) {
        const resData = await res.json();
        setAttendanceRecord(resData.data);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to record punch');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      console.error('Error recording punch:', err);
      setError('An unexpected error occurred. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const isCheckedIn = attendanceRecord && attendanceRecord.check_in && !attendanceRecord.check_out;
  const isCheckedOut = attendanceRecord && attendanceRecord.check_out;
  const hasPunchedInBefore = !!attendanceRecord?.check_in;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Welcome back, <span className="text-[#003F87]">{userInfo?.first_name || 'Employee'}</span>
          </h2>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
            <Calendar size={15} className="text-slate-400" />
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={() => navigate(window.location.pathname.replace('/dashboard', '/leave'))}
          className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[#003F87] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
        >
          <FileText size={18} /> Request Leave
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5 group">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#003F87] group-hover:bg-[#003F87] group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">My Students</p>
            <h3 className="text-2xl font-bold text-slate-900 leading-tight">{studentCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5 group">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#003F87] group-hover:bg-[#003F87] group-hover:text-white transition-colors">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">My Courses</p>
            <h3 className="text-2xl font-bold text-slate-900 leading-tight">{courseCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
             <p className="text-sm font-semibold text-slate-500 mb-2">This Month's Summary</p>
             <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{monthlyStats.present} Present</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#003F87]"></span>{monthlyStats.halfDay} Half</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span>{monthlyStats.late} Late</div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Shift Status */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
          {/* Subtle accent background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#003F87]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Today's Shift</h3>
                <p className="text-sm text-slate-500 mt-1">Monitor your daily attendance</p>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#003F87] animate-pulse"></div>
                <h1 className="text-5xl md:text-6xl font-light text-slate-900 tracking-tight font-mono">
                  {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </h1>
              </div>

              <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                <Clock size={16} className="text-slate-400" />
                <p className="text-sm text-slate-600 font-medium">
                  {isCheckedIn 
                    ? `Checked in at ${new Date(attendanceRecord.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
                    : isCheckedOut 
                      ? `Completed shift at ${new Date(attendanceRecord.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
                      : "Ready to start your day?"}
                </p>
              </div>
            </div>

            <div className="w-full md:w-64 space-y-4">
               {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-4 text-center">
                 <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Status</div>
                 {isCheckedIn ? (
                    <span className="text-[#008A2E] font-bold text-lg flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#008A2E]"></span> Checked In</span>
                 ) : isCheckedOut ? (
                    <span className="text-slate-600 font-bold text-lg flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Checked Out</span>
                 ) : (
                    <span className="text-slate-600 font-bold text-lg flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Pending</span>
                 )}

                 {isCheckedIn ? (
                  <button 
                    onClick={() => handlePunch('out')}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <LogOut size={18} /> Check Out
                  </button>
                ) : (
                  <button 
                    onClick={() => handlePunch('in')}
                    className="w-full bg-[#003F87] hover:bg-[#002b5e] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <LogIn size={18} /> {hasPunchedInBefore ? "Check In Again" : "Check In"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Monthly Overview Details */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
             <BarChart2 size={20} className="text-slate-400" />
             <h3 className="text-lg font-bold text-slate-900">Monthly Overview</h3>
          </div>
          
          <div className="space-y-5 flex-1 flex flex-col justify-center">
             <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500"></div></div>
                   <span className="text-sm font-medium text-slate-600">Present</span>
                </div>
                <span className="text-xl font-bold text-slate-900">{monthlyStats.present}</span>
             </div>
             
             <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#003F87]"><div className="w-2 h-2 rounded-full bg-[#003F87]"></div></div>
                   <span className="text-sm font-medium text-slate-600">Half Day</span>
                </div>
                <span className="text-xl font-bold text-slate-900">{monthlyStats.halfDay}</span>
             </div>

             <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><div className="w-2 h-2 rounded-full bg-amber-500"></div></div>
                   <span className="text-sm font-medium text-slate-600">Late</span>
                </div>
                <span className="text-xl font-bold text-slate-900">{monthlyStats.late}</span>
             </div>

             <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600"><div className="w-2 h-2 rounded-full bg-red-500"></div></div>
                   <span className="text-sm font-medium text-slate-600">Absent</span>
                </div>
                <span className="text-xl font-bold text-slate-900">{monthlyStats.absent}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EmployeeDashboard;
