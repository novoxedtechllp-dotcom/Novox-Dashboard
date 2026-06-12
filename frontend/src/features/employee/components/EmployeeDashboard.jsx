import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle, Users, BarChart2, LogIn, LogOut, MoreVertical } from 'lucide-react';

const EmployeeDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({ present: 0, halfDay: 0, late: 0, absent: 0 });
  const [studentCount, setStudentCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
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
          const today = now.toISOString().split('T')[0];
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
    try {
      const headers = { 'Authorization': `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' };
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      const payload = {
        userId: userInfo.employee_profile_id || userInfo.id,
        date: today,
        type: 'employee',
        status: attendanceRecord ? attendanceRecord.status : 'PRESENT',
      };

      if (type === 'in') {
        payload.check_in = now;
        payload.check_out = null;
      } else if (type === 'out') {
        payload.check_out = now;
        if (attendanceRecord?.check_in) payload.check_in = attendanceRecord.check_in;
      }

      const res = await fetch('/api/v1/attendance', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const resData = await res.json();
        setAttendanceRecord(resData.data);
      }
    } catch (err) {
      console.error('Error recording punch:', err);
    }
  };

  const isCheckedIn = attendanceRecord && attendanceRecord.check_in && !attendanceRecord.check_out;
  const isCheckedOut = attendanceRecord && attendanceRecord.check_out;
  const hasPunchedInBefore = !!attendanceRecord?.check_in;

  return (
    <div className="p-[24px]">
      <div className="mb-6">
        <h2 className="text-[28px] font-bold text-slate-900">Welcome back, {userInfo?.first_name || 'Employee'}!</h2>
        <p className="text-slate-500 text-[14px]">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Left Column: Daily Attendance */}
        <div className="w-full lg:w-[350px] bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col justify-between h-[320px]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-[#003F87] text-[16px]">Daily Attendance</h3>
              <p className="text-[13px] text-slate-500 mt-1">Monitor your shift time</p>
            </div>
            {isCheckedIn ? (
              <span className="bg-[#E5F7ED] text-[#008A2E] text-[10px] font-bold px-3 py-1 rounded-full border border-[#008A2E]/20 uppercase tracking-wider">
                Checked In
              </span>
            ) : isCheckedOut ? (
              <span className="bg-[#FFF4E5] text-[#B26E00] text-[10px] font-bold px-3 py-1 rounded-full border border-[#B26E00]/20 uppercase tracking-wider">
                Checked Out
              </span>
            ) : (
              <span className="bg-[#FDE2E2] text-[#D80000] text-[10px] font-bold px-3 py-1 rounded-full border border-[#D80000]/20 uppercase tracking-wider">
                Not Checked In
              </span>
            )}
          </div>

          <div className="text-center my-6">
            <h1 className="text-[42px] font-black text-slate-900 tracking-tight leading-none mb-3">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </h1>
            <p className="text-[14px] text-slate-500 font-medium">
              {isCheckedIn 
                ? `Checked in at ${new Date(attendanceRecord.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
                : isCheckedOut 
                  ? `Checked out at ${new Date(attendanceRecord.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
                  : "Ready to start your day?"}
            </p>
          </div>

          {isCheckedIn ? (
            <button 
              onClick={() => handlePunch('out')}
              className="w-full bg-[#D80000] hover:bg-[#B20000] text-white py-3.5 rounded-lg font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <LogOut size={20} /> Check Out
            </button>
          ) : (
            <button 
              onClick={() => handlePunch('in')}
              className="w-full bg-[#003F87] hover:bg-[#002B5E] text-white py-3.5 rounded-lg font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <LogIn size={20} /> {hasPunchedInBefore ? "Check In Again" : "Check In"}
            </button>
          )}
        </div>

        {/* Right Column */}
        <div className="flex-1 flex gap-6 h-[320px]">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-full">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm text-center flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#003F87] mb-3">
                <Users size={24} />
              </div>
              <p className="text-[13px] font-medium text-slate-500">My Students</p>
              <h3 className="text-[28px] font-black text-slate-900 mt-1">{studentCount}</h3>
              <div className="w-12 h-1 bg-[#003F87] mt-3 rounded-full"></div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col justify-center h-full">
              <p className="text-[13px] font-bold text-slate-800 mb-3 text-center">This Month</p>
              <div className="grid grid-cols-2 gap-2 flex-1 h-full">
                <div className="bg-[#E5F7ED] border border-[#008A2E]/20 rounded-md p-2 text-center flex flex-col justify-center">
                  <div className="text-[18px] font-black text-[#008A2E] leading-none">{monthlyStats.present}</div>
                  <div className="text-[9px] font-bold text-[#008A2E]/70 uppercase mt-1">Present</div>
                </div>
                <div className="bg-[#E5F0FF] border border-[#003F87]/20 rounded-md p-2 text-center flex flex-col justify-center">
                  <div className="text-[18px] font-black text-[#003F87] leading-none">{monthlyStats.halfDay}</div>
                  <div className="text-[9px] font-bold text-[#003F87]/70 uppercase mt-1">Half Day</div>
                </div>
                <div className="bg-[#FFF4E5] border border-[#B26E00]/20 rounded-md p-2 text-center flex flex-col justify-center">
                  <div className="text-[18px] font-black text-[#B26E00] leading-none">{monthlyStats.late}</div>
                  <div className="text-[9px] font-bold text-[#B26E00]/70 uppercase mt-1">Late</div>
                </div>
                <div className="bg-[#FDE2E2] border border-[#D80000]/20 rounded-md p-2 text-center flex flex-col justify-center">
                  <div className="text-[18px] font-black text-[#D80000] leading-none">{monthlyStats.absent}</div>
                  <div className="text-[9px] font-bold text-[#D80000]/70 uppercase mt-1">Absent</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm text-center flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-700 mb-3">
                <Calendar size={24} />
              </div>
              <p className="text-[13px] font-medium text-slate-500">My Courses</p>
              <h3 className="text-[28px] font-black text-slate-900 mt-1">{courseCount}</h3>
              <div className="w-12 h-1 bg-purple-600 mt-3 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EmployeeDashboard;
