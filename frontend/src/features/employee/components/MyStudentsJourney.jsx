import React, { useState, useEffect } from 'react';
import { BookOpen, Lock, Unlock, CheckCircle2, PlayCircle, Map, Milestone, LockKeyhole, X, CheckCircle, ChevronDown, User, Search } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

const MyStudentsJourney = () => {
  const [students, setStudents] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState(null); // student ID
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCourseTab, setActiveCourseTab] = useState('all');
  
  // Data caches for expanded students
  const [progressDataCache, setProgressDataCache] = useState({});
  const [completedTasksCache, setCompletedTasksCache] = useState({});
  const [loadingStudentDetails, setLoadingStudentDetails] = useState({});

  const userInfoStr = sessionStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (!userInfo || !userInfo.token) return;
        const headers = { 'Authorization': `Bearer ${userInfo.token}` };

        // 1. Get Employee Profile ID
        const profRes = await fetch('/api/v1/profile/me', { headers });
        const profData = await profRes.json();
        const empId = profData?.data?.employeeProfile?.id || userInfo.employee_profile_id;

        // 2. Fetch my courses and their full syllabus
        const crsRes = await fetch('/api/v1/courses', { headers });
        let myFullCourses = [];
        if (crsRes.ok) {
          const crsData = await crsRes.json();
          const allCourses = crsData.data || [];
          const employeeCourses = allCourses.filter(c => 
            c.instructor_id === userInfo.id || 
            c.employee_id === empId || 
            c.employee_profile_id === empId || 
            (c.instructors && c.instructors.includes(userInfo.id)) ||
            (c.course_instructors && c.course_instructors.some(ci => ci.employee_profiles?.id === empId || ci.employee_id === empId))
          );
          
          // Fetch full details (modules) for each of my courses
          const coursePromises = employeeCourses.map(c => 
            fetch(`/api/v1/courses/${c.id || c._id}`, { headers }).then(r => r.json())
          );
          const courseResponses = await Promise.all(coursePromises);
          
          myFullCourses = courseResponses.map(res => {
            const course = res.data;
            if (!course) return null;
            const realModules = (course.course_modules || [])
              .filter(mod => mod.status === 'PUBLISHED')
              .sort((a,b)=>a.sequence_order - b.sequence_order).map(mod => {
              return {
                id: mod.id,
                title: mod.title,
                submodules: (mod.course_submodules || []).sort((a,b)=>a.sequence_order - b.sequence_order)
              };
            });
            return {
              id: course.id || course._id,
              name: course.name || course.title,
              modules: realModules
            };
          }).filter(Boolean);
          
          setMyCourses(myFullCourses);
        }

        // 3. Fetch My Students
        let url = '/api/v1/students?limit=1000';
        const stdRes = await fetch(url, { headers });
        if (stdRes.ok) {
          const stdData = await stdRes.json();
          const studentsList = stdData.data?.students || stdData.data || [];
          
          // Further filter to ensure they are enrolled in at least one of my courses
          const myCourseIds = new Set(myFullCourses.map(c => c.id));
          
          const relevantStudents = studentsList.filter(s => {
             let isEnrolled = false;
             if (s.student_courses && Array.isArray(s.student_courses)) {
               isEnrolled = s.student_courses.some(sc => myCourseIds.has(sc.course_id));
             } else if (s.course_ids && Array.isArray(s.course_ids)) {
               isEnrolled = s.course_ids.some(id => myCourseIds.has(id));
             } else if (s.course && (s.course.id || s.course._id)) {
               isEnrolled = myCourseIds.has(s.course.id || s.course._id);
             } else if (s.course_id) {
               isEnrolled = myCourseIds.has(s.course_id);
             }
             return isEnrolled;
          }).map(s => {
             // Find which of my courses this student is in
             let enrolledCourseIds = [];
             if (s.student_courses && Array.isArray(s.student_courses)) {
               enrolledCourseIds = s.student_courses.map(sc => sc.course_id).filter(id => myCourseIds.has(id));
             } else if (s.course_ids && Array.isArray(s.course_ids)) {
               enrolledCourseIds = s.course_ids.filter(id => myCourseIds.has(id));
             } else if (s.course && (s.course.id || s.course._id) && myCourseIds.has(s.course.id || s.course._id)) {
               enrolledCourseIds = [s.course.id || s.course._id];
             } else if (s.course_id && myCourseIds.has(s.course_id)) {
               enrolledCourseIds = [s.course_id];
             }

             return {
               id: s.id || s._id,
               student_code: s.student_code || s.sid,
               first_name: s.first_name || (s.name ? s.name.split(' ')[0] : 'Unknown'),
               last_name: s.last_name || (s.name ? s.name.split(' ')[1] || '' : ''),
               avatar: s.avatar_url || s.avatar || null,
               enrolledCourseIds: enrolledCourseIds
             };
          });
          
          setStudents(relevantStudents);
        }

      } catch (err) {
        console.error("Error fetching my students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [userInfo?.id]);

  const toggleStudent = async (student) => {
    if (expandedStudent === student.id) {
      setExpandedStudent(null);
      return;
    }
    
    setExpandedStudent(student.id);
    
    // Fetch progress if not cached
    if (!progressDataCache[student.id]) {
      setLoadingStudentDetails(prev => ({ ...prev, [student.id]: true }));
      try {
        const headers = { 'Authorization': `Bearer ${userInfo.token}` };
        
        // Fetch Submodules progress
        const progressRes = await fetch(`/api/v1/students/${student.id}/progress/submodules`, { headers });
        let pData = {};
        if (progressRes.ok) {
           const progJson = await progressRes.json();
           (progJson.data || []).forEach(p => {
             pData[p.submodule_id] = p.is_completed;
           });
        }

        // Fetch Tasks progress
        const tasksRes = await fetch(`/api/v1/students/${student.id}/tasks`, { headers });
        let cTasks = new Set();
        if (tasksRes.ok) {
           const tJson = await tasksRes.json();
           (tJson.data || []).forEach(t => {
             if (t.status === 'APPROVED' || t.status === 'SUBMITTED' || t.status === 'PENDING_REVIEW') {
               cTasks.add(t.task_id);
             }
           });
        }

        setProgressDataCache(prev => ({ ...prev, [student.id]: pData }));
        setCompletedTasksCache(prev => ({ ...prev, [student.id]: cTasks }));
      } catch (err) {
        console.error("Error fetching student progress:", err);
      } finally {
        setLoadingStudentDetails(prev => ({ ...prev, [student.id]: false }));
      }
    }
  };

  const filteredStudents = students.filter(student => {
    if (activeCourseTab !== 'all' && !student.enrolledCourseIds.includes(activeCourseTab)) return false;
    
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    return fullName.includes(term) || (student.student_code && student.student_code.toLowerCase().includes(term));
  });

  if (loading) return <LoadingSpinner text="Loading your students..." />;

  return (
    <div className="flex flex-col w-full h-full bg-[#FAFBFC] font-sans">
      <div className="shrink-0 p-6 md:px-8 md:pt-8 md:pb-6 border-b border-slate-200 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Students</h1>
          <p className="text-slate-500 mt-1">Track the academic journey and progress of the students you teach</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-2 focus:ring-blue-500/10 text-sm font-medium transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-20">
          
          {myCourses.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200">
              <button 
                onClick={() => { setActiveCourseTab('all'); setExpandedStudent(null); }}
                className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-all flex items-center gap-2 ${activeCourseTab === 'all' ? 'bg-[#003F87] text-white shadow-md shadow-blue-900/10' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
              >
                All Subjects
              </button>
              {myCourses.map(course => (
                <button 
                  key={course.id}
                  onClick={() => { setActiveCourseTab(course.id); setExpandedStudent(null); }}
                  className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-all flex items-center gap-2 ${activeCourseTab === course.id ? 'bg-[#003F87] text-white shadow-md shadow-blue-900/10' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                >
                  <BookOpen size={16} className={activeCourseTab === course.id ? 'text-blue-200' : 'text-slate-400'} />
                  {course.name}
                </button>
              ))}
            </div>
          )}

          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm">No students found matching your criteria.</p>
            </div>
          ) : (
            filteredStudents.map(student => {
              const isExpanded = expandedStudent === student.id;
              const isLoadingDetails = loadingStudentDetails[student.id];
              const pData = progressDataCache[student.id] || {};
              const cTasks = completedTasksCache[student.id] || new Set();

              // Determine which courses to show for this student
              const studentCourses = activeCourseTab === 'all' 
                ? myCourses.filter(c => student.enrolledCourseIds.includes(c.id))
                : myCourses.filter(c => c.id === activeCourseTab && student.enrolledCourseIds.includes(c.id));

              return (
                <div key={student.id} className={`bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-2 ring-blue-500/20' : ''}`}>
                  <div 
                    className="flex items-center gap-4 p-6 cursor-pointer select-none"
                    onClick={() => toggleStudent(student)}
                  >
                    <div className="w-14 h-14 rounded-[16px] overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-inner">
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.first_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#003F87] font-black text-xl">{student.first_name[0]}{student.last_name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                          {student.student_code || 'STD'}
                        </span>
                      </div>
                      <h2 className="text-lg font-black text-slate-800 leading-tight truncate">
                        {student.first_name} {student.last_name}
                      </h2>
                      <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5 truncate">
                        <BookOpen size={14} className="text-[#003F87]" />
                        {studentCourses.map(c => c.name).join(', ') || 'No Courses'}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-blue-50 text-[#003F87]' : ''}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/30 p-6 md:p-8">
                      {isLoadingDetails ? (
                        <div className="flex justify-center py-8">
                          <LoadingSpinner text="Fetching academic journey..." />
                        </div>
                      ) : studentCourses.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">
                          No enrolled courses taught by you.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-12">
                          {studentCourses.map(course => {
                            const courseModules = course.modules || [];
                            const totalModules = courseModules.length;
                            
                            // Calculate logic similar to StudentAcademicJourney but readonly
                            let lastUnlockedIndex = 0;
                            let prevModuleCompleted = true;
                            const moduleStatus = courseModules.map((mod, index) => {
                              let isModuleUnlocked = index === 0 ? true : prevModuleCompleted;
                              const currentModSubmodules = mod.submodules || [];
                              const completedTopicsCount = currentModSubmodules.filter(sub => {
                                return sub.course_tasks && sub.course_tasks.length > 0
                                  ? (pData[sub.id] !== undefined ? pData[sub.id] : sub.course_tasks.every(t => cTasks.has(t.id)))
                                  : !!pData[sub.id];
                              }).length;
                              const totalTopicsCount = currentModSubmodules.length;
                              const isCompleted = isModuleUnlocked && totalTopicsCount > 0 && completedTopicsCount === totalTopicsCount;
                              
                              prevModuleCompleted = isModuleUnlocked && (totalTopicsCount === 0 || completedTopicsCount === totalTopicsCount);
                              if (isModuleUnlocked) lastUnlockedIndex = index;

                              return {
                                ...mod,
                                isUnlocked: isModuleUnlocked,
                                isCompleted,
                                completedCount: completedTopicsCount,
                                totalCount: totalTopicsCount
                              };
                            });

                            const completedModules = moduleStatus.filter(m => m.isCompleted).length;
                            const courseProgressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

                            const rowHeight = 160;
                            const svgHeight = totalModules * rowHeight;
                            
                            const moduleColors = [
                              { bg: 'bg-[#003F87]', text: 'text-white', border: 'border-[#003F87]' },
                              { bg: 'bg-[#E25C24]', text: 'text-white', border: 'border-[#E25C24]' },
                              { bg: 'bg-[#0D9488]', text: 'text-white', border: 'border-[#0D9488]' },
                              { bg: 'bg-[#7C3AED]', text: 'text-white', border: 'border-[#7C3AED]' },
                              { bg: 'bg-[#DB2777]', text: 'text-white', border: 'border-[#DB2777]' },
                            ];

                            return (
                              <div key={course.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                {/* Course Header inside expanded area */}
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                                  <div>
                                    <h3 className="text-xl font-bold text-slate-800">{course.name}</h3>
                                    <p className="text-sm text-slate-500 mt-1">Overall Progress: {courseProgressPercent}%</p>
                                  </div>
                                  <div className="w-full md:w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                    <div 
                                      className="h-full bg-gradient-to-r from-blue-600 to-[#003F87] rounded-full transition-all duration-500"
                                      style={{ width: `${courseProgressPercent}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Journey Map */}
                                {totalModules === 0 ? (
                                  <p className="text-center text-slate-400 text-sm py-4">No modules found for this course.</p>
                                ) : (
                                  <div className="relative w-full max-w-[540px] mx-auto animate-in slide-in-from-top-2 fade-in duration-300 select-none my-8" style={{ height: `${svgHeight}px` }}>
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 400 ${svgHeight}`} preserveAspectRatio="none">
                                      {moduleStatus.map((mod, index) => {
                                        if (index === totalModules - 1) return null;
                                        const y1 = index * rowHeight + 80;
                                        const x1 = index % 2 === 0 ? 100 : 300;
                                        const y2 = (index + 1) * rowHeight + 80;
                                        const x2 = (index + 1) % 2 === 0 ? 100 : 300;
                                        const d = `M ${x1} ${y1} C ${x1} ${y1 + 80}, ${x2} ${y2 - 80}, ${x2} ${y2}`;
                                        const p = mod.isCompleted ? 100 : mod.isUnlocked && mod.totalCount > 0 ? (mod.completedCount / mod.totalCount) * 100 : 0;
                                        return (
                                          <g key={`path-${mod.id}`}>
                                            <path d={d} fill="none" stroke="#F1F5F9" strokeWidth="8" strokeLinecap="round" strokeDasharray="16 12" />
                                            {p > 0 && (
                                              <path 
                                                d={d} fill="none" stroke="#003F87" strokeWidth="8" strokeLinecap="round" pathLength="100"
                                                strokeDasharray={`${p} ${100 - p}`} className="transition-all duration-500 ease-out"
                                              />
                                            )}
                                          </g>
                                        );
                                      })}
                                    </svg>
                                    
                                    {moduleStatus.map((mod, index) => {
                                      const color = moduleColors[index % moduleColors.length];
                                      const isLeft = index % 2 === 0;
                                      const y = index * rowHeight + 80;
                                      const xPercent = isLeft ? '25%' : '75%';

                                      return (
                                        <div 
                                          key={mod.id} 
                                          className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
                                          style={{ left: xPercent, top: `${y}px` }}
                                        >
                                          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 ${
                                              mod.isCompleted 
                                                ? 'bg-emerald-500 border-emerald-300 text-white shadow-lg shadow-emerald-500/30' 
                                                : mod.isUnlocked 
                                                ? `${color.bg} ${color.border} text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/10` 
                                                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}>
                                            {mod.isCompleted ? (
                                              <CheckCircle2 size={24} className="text-white" />
                                            ) : mod.isUnlocked ? (
                                              <span className="text-[16px] font-black">{index + 1}</span>
                                            ) : (
                                              <LockKeyhole size={18} className="text-slate-400" />
                                            )}
                                          </div>
                                          
                                          <div className={`absolute whitespace-nowrap px-5 py-3 rounded-2xl border transition-all duration-300 flex flex-col items-start gap-0.5 shadow-sm ${
                                              isLeft ? 'left-18 items-start' : 'right-18 items-end'
                                            } ${
                                              mod.isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
                                              mod.isUnlocked ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                                            }`}
                                            style={{ width: '180px' }}
                                          >
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                              Module {index + 1}
                                            </span>
                                            <span className="text-sm font-black tracking-tight text-slate-800 truncate w-full">{mod.title}</span>
                                            {mod.isUnlocked && (
                                              <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                                                {mod.completedCount} / {mod.totalCount} Topics Done
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MyStudentsJourney;
