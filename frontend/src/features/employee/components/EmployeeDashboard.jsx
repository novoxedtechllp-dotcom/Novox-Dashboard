import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle, Users, BarChart2, LogIn, LogOut, FileText, CheckCircle2 } from 'lucide-react';
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
          const today = now.toLocaleDateString('en-CA');
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const record = allAttendance.find(a => a.attendance_date === today || a.attendance_date?.startsWith(today));
          setAttendanceRecord(record || null);

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

        let myCourseIdSet = new Set();
        const crsRes = await fetch('/api/v1/courses', { headers });
        if (crsRes.ok) {
          const crsData = await crsRes.json();
          const allCourses = crsData.data || [];
          const myCourses = allCourses.filter(c => c.instructor_id === userInfo.id || c.employee_id === userInfo.id || c.employee_profile_id === userInfo.id || (c.instructors && c.instructors.includes(userInfo.id)));
          myCourseIdSet = new Set(myCourses.map(c => c.id || c._id));
          setCourseCount(myCourseIdSet.size);
        }

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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const totalAttendanceDays = monthlyStats.present + monthlyStats.halfDay;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
            {getGreeting()}, <span className="text-indigo-600">{userInfo?.first_name || 'Employee'}</span>
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1 flex items-center gap-2">
            <Calendar size={15} className="text-indigo-400" />
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={() => navigate(window.location.pathname.replace('/dashboard', '/leave'))}
          className="bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
        >
          <FileText size={16} /> Request Leave
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column (Main Focus) */}
        <div className="xl:col-span-2 flex flex-col gap-6 lg:gap-8">
          
          {/* Time & Action Hero Card */}
          <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200/60 shadow-sm relative overflow-hidden group">
            {/* Minimalist ambient glow */}
            <div className="absolute -right-32 -top-32 w-96 h-96 bg-indigo-100/50 rounded-full blur-[80px] opacity-60 group-hover:opacity-80 transition-opacity duration-1000 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              
              <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-bold tracking-widest uppercase shadow-sm border border-slate-200/50">
                    <Clock size={12} className={isCheckedIn ? "text-indigo-500 animate-pulse" : "text-slate-400"} /> 
                    Today's Shift
                  </div>
                  <span className="text-slate-400 font-medium text-sm flex items-center gap-1.5">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                
                <h1 className="text-6xl md:text-[5.5rem] font-light text-slate-800 tracking-tighter tabular-nums leading-none">
                  {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                </h1>
                
                <div className="text-slate-500 font-medium text-sm md:text-base flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                  {isCheckedIn ? (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      Checked in at {new Date(attendanceRecord.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </>
                  ) : isCheckedOut ? (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                      Completed shift at {new Date(attendanceRecord.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                      Ready to start your day?
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center w-full md:w-auto gap-4 md:min-w-[200px]">
                 {isCheckedIn ? (
                   <>
                    <div className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Shift
                    </div>
                    <button 
                      onClick={() => handlePunch('out')}
                      className="w-full bg-white border-2 border-slate-200 hover:border-rose-500 hover:bg-rose-50 text-slate-700 hover:text-rose-600 py-3.5 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all group"
                    >
                      <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> Check Out
                    </button>
                   </>
                ) : isCheckedOut ? (
                   <>
                    <div className="text-slate-500 bg-slate-100 border border-slate-200 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                      <CheckCircle2 size={16} /> Shift Completed
                    </div>
                    <button 
                      disabled
                      className="w-full bg-slate-50 border border-slate-200 text-slate-400 py-3.5 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      Done for today
                    </button>
                   </>
                ) : (
                  <>
                    <div className="text-slate-500 bg-slate-100 border border-slate-200 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                      Waiting to Start
                    </div>
                    <button 
                      onClick={() => handlePunch('in')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-[0_8px_16px_-6px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 active:translate-y-0 group"
                    >
                      <LogIn size={20} className="group-hover:translate-x-1 transition-transform" /> {hasPunchedInBefore ? "Check In Again" : "Check In"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-3xl font-semibold text-slate-800">{studentCount}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">My Students</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-3xl font-semibold text-slate-800">{courseCount}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">My Courses</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                 <BarChart2 size={20} />
              </div>
              <div>
                <h3 className="text-3xl font-semibold text-slate-800">
                  {totalAttendanceDays} <span className="text-lg text-slate-400 font-normal">Days</span>
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Overall Attendance</p>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Monthly Overview */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 size={20} className="text-indigo-500" />
                Monthly Overview
             </h3>
             <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
               {new Date().toLocaleString('default', { month: 'short' })}
             </span>
          </div>
          
          <div className="space-y-6 flex-1">
             <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className="w-2.5 h-10 rounded-full bg-emerald-500 group-hover:scale-y-110 transition-transform"></div>
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-slate-700">Present</span>
                     <span className="text-xs text-slate-500">Full working days</span>
                   </div>
                </div>
                <span className="text-2xl font-semibold text-slate-800">{monthlyStats.present}</span>
             </div>
             
             <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className="w-2.5 h-10 rounded-full bg-blue-500 group-hover:scale-y-110 transition-transform"></div>
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-slate-700">Half Day</span>
                     <span className="text-xs text-slate-500">Partial hours</span>
                   </div>
                </div>
                <span className="text-2xl font-semibold text-slate-800">{monthlyStats.halfDay}</span>
             </div>

             <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className="w-2.5 h-10 rounded-full bg-amber-500 group-hover:scale-y-110 transition-transform"></div>
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-slate-700">Late</span>
                     <span className="text-xs text-slate-500">After shift start</span>
                   </div>
                </div>
                <span className="text-2xl font-semibold text-slate-800">{monthlyStats.late}</span>
             </div>

             <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className="w-2.5 h-10 rounded-full bg-rose-500 group-hover:scale-y-110 transition-transform"></div>
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-slate-700">Absent</span>
                     <span className="text-xs text-slate-500">Missed shifts</span>
                   </div>
                </div>
                <span className="text-2xl font-semibold text-slate-800">{monthlyStats.absent}</span>
             </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3">
              <Clock size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Your attendance is tracked automatically when you punch in and out. Ensure you check out at the end of your shift to maintain accurate records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EmployeeDashboard;
