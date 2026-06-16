import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle2, Database, BookOpen, Clock, MapPin, MessageSquare, ChevronRight, CheckSquare, AlertCircle, X } from 'lucide-react';

const StudentDashboard = ({ userInfo }) => {
  const [attendancePercent, setAttendancePercent] = useState(0);
  const [tasksDonePercent, setTasksDonePercent] = useState(0);
  const [currentModule, setCurrentModule] = useState(null);
  const [todaySessions, setTodaySessions] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const studentId = userInfo?.student_profile_id || userInfo?.id;
    if (studentId) {
      const localSocialLinks = JSON.parse(localStorage.getItem(`student_social_links_${studentId}`) || '{}');
      if (!localSocialLinks.github && !localSocialLinks.linkedin) {
        setShowNotification(true);
      }
    }

    const fetchDashboardData = async () => {
      try {
        const token = userInfo?.token || sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Attendance
        // Using existing attendance API
        const attRes = await fetch(`/api/v1/attendance?type=student`, { headers });
        if (attRes.ok) {
          const attData = await attRes.json();
          // Assuming attData is an array of records. If no records, 0%.
          // This is a naive calculation for demonstration. Real calculation depends on total classes.
          if (attData && attData.data && attData.data.length > 0) {
            // For now, if there is ANY data, let's just count present / total
            const total = attData.data.length;
            const present = attData.data.filter(r => r.status === 'PRESENT').length;
            setAttendancePercent(Math.round((present / total) * 100));
          } else {
            setAttendancePercent(0);
          }
        }

        // 2. Fetch Tasks (Placeholder API path, as no dedicated tasks API was visible in grep)
        // We will default to 0% and empty if it fails
        const tasksRes = await fetch(`/api/v1/students/${userInfo?.id || userInfo?.student_profile_id}/tasks`, { headers });
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          if (tasksData && tasksData.data) {
            setPendingTasks(tasksData.data.filter(t => !t.completed));
            const totalTasks = tasksData.data.length;
            const completedTasks = tasksData.data.filter(t => t.completed).length;
            if (totalTasks > 0) {
              setTasksDonePercent(Math.round((completedTasks / totalTasks) * 100));
            }
          }
        }

        // 3. Fetch Today's Classes/Sessions
        const dateStr = new Date().toISOString().split('T')[0];
        const studentProfileId = userInfo?.student_profile_id || userInfo?.id;
        const scheduleRes = await fetch(`/api/v1/students/${studentProfileId}/daily-plan?date=${dateStr}`, { headers });
        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json();
          if (scheduleData && scheduleData.data) {
            setTodaySessions(scheduleData.data);
          }
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [userInfo]);

  const firstName = userInfo?.first_name || 'Student';

  // Format Date: Monday, October 23, 2023
  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  return (
    <div className="flex flex-col h-full bg-[#FAFBFC] overflow-y-auto">
      {/* Main Content Area */}
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col xl:flex-row gap-6">
        
        {/* Left Column (Main) */}
        <div className="flex-1 flex flex-col gap-6">
          
          {showNotification && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="text-[14px] font-bold text-amber-800">Action Required: Complete Your Profile</h4>
                <p className="text-[13px] text-amber-700/80 mt-1 mb-2">Please add your GitHub and LinkedIn profile links. These are required to help instructors review your projects and build your professional network.</p>
                <a href="/student/profile" className="inline-block text-[12px] font-bold text-amber-700 hover:text-amber-900 underline">Go to My Profile →</a>
              </div>
              <button onClick={() => setShowNotification(false)} className="text-amber-400 hover:text-amber-600 transition-colors p-1">
                <X size={18} />
              </button>
            </div>
          )}

          {/* Welcome Banner */}
          <div className="bg-[#003F87] rounded-2xl p-8 text-white relative overflow-hidden shadow-sm">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-3xl mix-blend-overlay"></div>
            <div className="absolute bottom-[-50%] left-[10%] w-[300px] h-[300px] rounded-full bg-cyan-400/10 blur-3xl mix-blend-overlay"></div>
            <div className="absolute top-[20%] right-[15%] w-[180px] h-[180px] rounded-full bg-white/5 backdrop-blur-md"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h2>
              <p className="text-blue-100 text-sm">
                Today is {formattedDate}. You have {todaySessions.length} classes today.
              </p>
              {/* Note: The user requested to REMOVE the "Request Leave" and "Late Request" buttons */}
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Attendance */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-[#003F87] p-2 rounded-lg">
                  <UserCheck size={18} />
                </div>
                {/* Optional trend indicator can go here if API supports it */}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mb-1">Attendance</p>
                <h3 className="text-3xl font-black text-slate-800">{attendancePercent}%</h3>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4">
                <div 
                  className="bg-[#003F87] h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${attendancePercent}%` }}
                ></div>
              </div>
            </div>

            {/* Card 2: Tasks Done */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-50 text-slate-600 p-2 rounded-lg">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mb-1">Tasks Done</p>
                <h3 className="text-3xl font-black text-slate-800">{tasksDonePercent}%</h3>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4">
                <div 
                  className="bg-slate-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${tasksDonePercent}%` }}
                ></div>
              </div>
            </div>

            {/* Card 3: Current Module */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-50 text-slate-600 p-2 rounded-lg">
                  <Database size={18} />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mb-1">Current Module</p>
                <h3 className="text-2xl font-black text-slate-800 leading-none truncate">
                  {currentModule ? currentModule.name : 'N/A'}
                </h3>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4">
                <div 
                  className="bg-slate-800 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Today Session */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Today Session</h3>
              <button className="text-[12px] font-bold text-[#003F87] hover:underline flex items-center">
                Full Schedule <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              {loading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-[#003F87] rounded-full animate-spin"></div>
                </div>
              ) : todaySessions.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {todaySessions.map((session, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-6">
                      <div className="w-full sm:w-[160px] h-[120px] bg-slate-100 rounded-xl overflow-hidden shrink-0">
                        {/* Placeholder image for class */}
                        <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&q=80" alt="Class" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#003F87] uppercase tracking-wider mb-1">
                          <BookOpen size={12} />
                          {session.course_modules?.courses?.name || 'COURSE'}
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-2">{session.title || 'Untitled Session'}</h4>
                        
                        <div className="flex items-center gap-4 text-slate-500 text-sm font-medium mb-4">
                          <span className="flex items-center gap-1.5"><Clock size={14} /> Sequence: {session.sequence_order || '1'}</span>
                          <span className="flex items-center gap-1.5"><BookOpen size={14} /> Module: {session.course_modules?.title || 'General'}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button className="bg-[#003F87] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#002b5e] transition-colors">
                            Start Topic
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <BookOpen size={32} className="text-slate-300" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-1">A Clear Day</h4>
                  <p className="text-slate-500 text-sm">You have no topics or tasks scheduled for this date.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="w-full xl:w-[320px] flex flex-col gap-6 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Pending Tasks</h3>
              {pendingTasks.length > 0 && (
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingTasks.length} NEW
                </span>
              )}
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              {loading ? (
                 <div className="flex-1 flex items-center justify-center py-8">
                   <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin"></div>
                 </div>
              ) : pendingTasks.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {pendingTasks.map((task, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      {/* Priority Line Indicator */}
                      <div className="w-1 bg-red-500 rounded-full shrink-0"></div>
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-bold text-slate-800 leading-tight">{task.title || 'Untitled Task'}</h4>
                          <span className="text-[10px] font-bold text-red-500 shrink-0 ml-2">{task.dueTime || 'Pending'}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {task.courseName || 'Course'} • {task.dueDate || 'No Date'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center opacity-60">
                  <CheckSquare size={32} className="text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-500">No pending tasks</p>
                </div>
              )}
              
              <div className="mt-auto pt-6">
                <button className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  View All Tasks
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
