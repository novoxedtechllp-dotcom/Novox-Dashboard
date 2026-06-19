import React, { useState, useEffect } from 'react';
import { Clock, Calendar as CalendarIcon, CheckCircle2, XCircle, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

const EmployeeAttendance = ({ courses = [] }) => {
  const [activeTab, setActiveTab] = useState('My Record');
  const [attendance, setAttendance] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // For Calendar
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) return;

      const headers = { 'Authorization': `Bearer ${userInfo.token}` };

      // Fetch employee attendance
      const attRes = await fetch('/api/v1/attendance?type=employee', { headers });
      if (attRes.ok) {
        const data = await attRes.json();
        // Filter by the employee's ID
        const myAttendance = (data.data || []).filter(a => a.employee_id === userInfo.id || a.employee_id === userInfo.employee_profile_id);
        setAttendance(myAttendance);
      }

      // Fetch students
      const stdRes = await fetch('/api/v1/students', { headers });
      if (stdRes.ok) {
        const resData = await stdRes.json();
        const studs = resData.data?.students || resData.data || (Array.isArray(resData) ? resData : []);
        setStudents(studs);
      }

      // Fetch student attendance
      const stuAttRes = await fetch('/api/v1/attendance?type=student', { headers });
      if (stuAttRes.ok) {
        const sData = await stuAttRes.json();
        setStudentAttendance(sData.data || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);



const formatTime = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '-';
  const diff = new Date(checkOut) - new Date(checkIn);
  if (diff < 0) return '0h 0m';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
};

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

  let presentCount = 0, absentCount = 0, lateCount = 0, halfDayCount = 0;
  let totalLateMs = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const record = attendance.find(a => a.attendance_date === dateStr || a.attendance_date?.startsWith(dateStr));

    let bgColor = 'bg-slate-50';
    let textColor = 'text-slate-700';

    if (record) {
      if (record.status === 'PRESENT') {
        bgColor = 'bg-[#E5F7ED] border border-[#008A2E]/20';
        textColor = 'text-[#008A2E]';
        presentCount++;
      } else if (record.status === 'HALF_DAY') {
        bgColor = 'bg-[#E5F0FF] border border-[#003F87]/20';
        textColor = 'text-[#003F87]';
        halfDayCount++;
      } else if (record.status === 'LATE') {
        bgColor = 'bg-[#FFF4E5] border border-[#B26E00]/20';
        textColor = 'text-[#B26E00]';
        lateCount++;

        if (record.check_in) {
          const checkInTime = new Date(record.check_in);
          const expectedStart = new Date(record.check_in);
          expectedStart.setHours(9, 0, 0, 0); // Default to 9:00 AM

          if (checkInTime > expectedStart) {
            totalLateMs += (checkInTime - expectedStart);
          }
        }
      } else if (record.status === 'ABSENT') {
        bgColor = 'bg-[#FDE2E2] border border-[#D80000]/20';
        textColor = 'text-[#D80000]';
        absentCount++;
      }
    } else {
      // If date is in the past (excluding weekends depending on logic, but for now simple)
      // just keep it empty
      bgColor = 'bg-slate-50 border border-slate-100';
    }

    days.push(
      <div key={d} className={`h-10 rounded-md flex items-center justify-center text-[13px] font-bold ${bgColor} ${textColor} m-1 transition-all hover:brightness-95 cursor-default`}>
        {d}
      </div>
    );
  }

  const totalLateHours = Math.floor(totalLateMs / (1000 * 60 * 60));
  const totalLateMins = Math.floor((totalLateMs % (1000 * 60 * 60)) / (1000 * 60));
  const formattedLateTime = totalLateHours > 0 || totalLateMins > 0 ? `${totalLateHours}h ${totalLateMins}m` : '';

  return { days, presentCount, absentCount, lateCount, halfDayCount, formattedLateTime };
};

const getMappedStudentData = () => {
  const today = new Date().toISOString().split('T')[0];

  // Attempt to filter by assigned courses
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo')) || {};
  const myCourses = courses.filter(c => c.instructor_id === userInfo.id || c.employee_id === userInfo.id || c.employee_profile_id === userInfo.id || (c.instructors && c.instructors.includes(userInfo.id)));
  const myCourseIdSet = new Set(myCourses.map(c => c.id || c._id));

  let relevantStudents = [];
  if (myCourseIdSet.size > 0) {
    relevantStudents = students.filter(s => {
      if (s.course_ids && Array.isArray(s.course_ids)) return s.course_ids.some(id => myCourseIdSet.has(id));
      if (s.course && (s.course.id || s.course._id)) return myCourseIdSet.has(s.course.id || s.course._id);
      if (s.course_id) return myCourseIdSet.has(s.course_id);
      return false;
    });
  }

  return relevantStudents.map(student => {
    const studentId = student.id || student._id;
    const sa = studentAttendance.find(a => a.student_id === studentId && (a.attendance_date === today || a.date === today || a.attendance_date?.startsWith(today)));
    const name = `${student.first_name || ''} ${student.last_name || ''}`.trim() || `Unknown Student`;
    const initials = student.first_name ? `${student.first_name[0]}${student.last_name ? student.last_name[0] : ''}`.toUpperCase() : '??';

    return {
      ...(sa || {}),
      userId: studentId,
      identifier: student.student_code || 'N/A',
      name,
      initials,
      course: student.course?.name || 'N/A',
      status: sa ? sa.status : 'NOT_MARKED',
      attendance_date: sa ? sa.attendance_date : today
    };
  });
};



if (loading) return <LoadingSpinner text="Loading your attendance..." />;

const { days: calendarDays, presentCount, absentCount, lateCount, halfDayCount, formattedLateTime } = renderCalendar();
const mappedStudents = getMappedStudentData().sort((a, b) => {
  const timeA = new Date(a.check_out || a.check_in || 0).getTime();
  const timeB = new Date(b.check_out || b.check_in || 0).getTime();
  if (timeA !== timeB) return timeB - timeA;
  return a.name.localeCompare(b.name);
});

const studentStats = {
  total: mappedStudents.length,
  present: mappedStudents.filter(s => s.status === 'PRESENT' || s.status === 'HALF_DAY').length,
  absent: mappedStudents.filter(s => s.status === 'ABSENT').length,
  late: mappedStudents.filter(s => s.status === 'LATE').length
};

return (
  <div className="p-[24px]">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-[24px] font-bold text-slate-900">Attendance Portal</h2>
        <p className="text-slate-500 text-[14px] mt-1">Manage your attendance and view your students' records</p>
      </div>
    </div>

    {/* Tab Switcher */}
    <div className="flex bg-[#F8FAFC] rounded-[4px] p-[4px] border border-[#C2C6D4] w-fit mb-6 shadow-sm">
      <button
        onClick={() => setActiveTab('My Record')}
        className={`px-8 py-2 rounded-[4px] text-[14px] font-semibold transition-all ${activeTab === 'My Record' ? 'bg-[#003F87] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
      >
        My Record
      </button>
      <button
        onClick={() => setActiveTab('Students')}
        className={`px-8 py-2 rounded-[4px] text-[14px] font-semibold transition-all ${activeTab === 'Students' ? 'bg-[#003F87] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
      >
        Students
      </button>
    </div>

    {activeTab === 'My Record' && (
      <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-300 fade-in">
        {/* Bottom Row: Calendar (Left) & List View (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h3 className="font-bold text-slate-800 text-[15px]">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays}
                </div>
              </div>

              {/* Compact stats summary inside Calendar card */}
              <div className="grid grid-cols-4 gap-2.5 mt-6 pt-6 border-t border-slate-100">
                <div className="bg-slate-50/50 border border-slate-100 rounded-lg py-2.5 px-1.5 text-center">
                  <div className="text-[16px] font-black text-slate-800">{presentCount}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-wider">Present</div>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 rounded-lg py-2.5 px-1.5 text-center">
                  <div className="text-[16px] font-black text-slate-800">{halfDayCount}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-wider">Half Day</div>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 rounded-lg py-2.5 px-1.5 text-center">
                  <div className="text-[16px] font-black text-slate-800">{lateCount}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-wider">Late</div>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 rounded-lg py-2.5 px-1.5 text-center">
                  <div className="text-[16px] font-black text-slate-800">{absentCount}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-wider">Absent</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Punches */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm h-full">
              <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-[15px]">
                  <Clock size={18} className="text-[#003F87]" /> Recent Punches
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-[#E2E8F0]">
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Punch In</th>
                      <th className="py-4 px-6">Punch Out</th>
                      <th className="py-4 px-6">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {attendance.length > 0 ? attendance.slice(0, 10).map((record, index) => (
                      <tr key={record.id || index} className="border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-800">{formatDate(record.attendance_date)}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide
                            ${record.status === 'PRESENT' || record.status === 'HALF_DAY' ? 'bg-[#E5F7ED] text-[#008A2E]' : ''}
                            ${record.status === 'LATE' ? 'bg-[#FFF4E5] text-[#B26E00]' : ''}
                            ${record.status === 'ABSENT' ? 'bg-[#FDE2E2] text-[#D80000]' : ''}
                          `}>
                            {record.status === 'PRESENT' || record.status === 'HALF_DAY' ? <CheckCircle2 size={12} /> : null}
                            {record.status === 'ABSENT' ? <XCircle size={12} /> : null}
                            {record.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">{formatTime(record.check_in)}</td>
                        <td className="py-4 px-6 text-slate-600 font-medium">{formatTime(record.check_out)}</td>
                        <td className="py-4 px-6 font-bold text-slate-800">{calculateHours(record.check_in, record.check_out)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500 font-medium">No attendance records found for this month.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {activeTab === 'Students' && (
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-300 fade-in">
        <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-[15px]">My Students' Attendance</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">Showing attendance for students in your assigned courses</p>
          </div>
          <div className="text-[13px] font-bold text-[#003F87] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            {new Date().toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Students Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-white border-b border-[#E2E8F0]">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 text-center">
            <div className="text-[20px] font-black text-slate-800">{studentStats.total}</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase mt-1 tracking-wider">Total Students</div>
          </div>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 text-center">
            <div className="text-[20px] font-black text-slate-800">{studentStats.present}</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase mt-1 tracking-wider">Present</div>
          </div>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 text-center">
            <div className="text-[20px] font-black text-slate-800">{studentStats.late}</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase mt-1 tracking-wider">Late</div>
          </div>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 text-center">
            <div className="text-[20px] font-black text-slate-800">{studentStats.absent}</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase mt-1 tracking-wider">Absent</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-[#E2E8F0]">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Course</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Check In</th>
                <th className="py-4 px-6">Check Out</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappedStudents.length > 0 ? mappedStudents.map((student, index) => (
                <tr key={student.userId} className={index !== mappedStudents.length - 1 ? "border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors" : "hover:bg-slate-50 transition-colors"}>
                  <td className="py-4 px-6">
                    <div className="text-[13px] font-bold text-[#003F87]">{student.identifier}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E5F0FF] text-[#003F87] font-bold text-[11px] flex items-center justify-center shrink-0">
                        {student.initials}
                      </div>
                      <div className="text-[14px] font-bold text-slate-900">{student.name}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-[13px] text-slate-600 font-medium">{student.course}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide
                          ${student.status === 'PRESENT' ? 'bg-[#E5F7ED] text-[#008A2E]' : ''}
                          ${student.status === 'LATE' ? 'bg-[#FFF4E5] text-[#B26E00]' : ''}
                          ${student.status === 'ABSENT' ? 'bg-[#FDE2E2] text-[#D80000]' : ''}
                          ${student.status === 'HALF_DAY' ? 'bg-[#E5F0FF] text-[#003F87]' : ''}
                          ${student.status === 'NOT_MARKED' ? 'bg-slate-100 text-slate-500' : ''}
                        `}>
                        <span className={`w-1.5 h-1.5 rounded-full 
                            ${student.status === 'PRESENT' ? 'bg-[#008A2E]' : ''}
                            ${student.status === 'LATE' ? 'bg-[#B26E00]' : ''}
                            ${student.status === 'ABSENT' ? 'bg-[#D80000]' : ''}
                            ${student.status === 'HALF_DAY' ? 'bg-[#003F87]' : ''}
                            ${student.status === 'NOT_MARKED' ? 'bg-slate-400' : ''}
                          `}></span>
                        {student.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-[13px] font-medium text-slate-900">{formatTime(student.check_in)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-[13px] font-medium text-slate-900">{formatTime(student.check_out)}</div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-slate-400 hover:text-[#003F87] p-1.5 rounded hover:bg-slate-100 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="text-[14px] font-semibold text-slate-700">No assigned students found</div>
                    <p className="text-[13px] text-slate-500 mt-1">You are not currently assigned as an instructor for any active courses.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);
};

export default EmployeeAttendance;
