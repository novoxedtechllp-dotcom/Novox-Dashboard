import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Unlock, CheckCircle2, PlayCircle, Map, Milestone, LockKeyhole, X, CheckCircle, ChevronDown } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

const StudentAcademicJourney = ({ userInfo }) => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [progressData, setProgressData] = useState({});
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  const showToast = (message, isError = false) => {
    setToast({ message, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        const studentId = userInfo?.student_profile_id || userInfo?.id;
        const token = userInfo?.token || sessionStorage.getItem('token');
        if (!studentId || !token) {
          setLoading(false);
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Fetch Student Details to get their courses
        const studentRes = await fetch(`/api/v1/students/${studentId}`, { headers });
        if (!studentRes.ok) throw new Error('Failed to fetch student details');
        const studentData = await studentRes.json();
        
        const coursesData = studentData.data?.student_courses?.map(sc => sc.course) || [];
        
        // 1.5 Fetch Progress
        const actualStudentId = studentData.data.id;
        const progressRes = await fetch(`/api/v1/students/${actualStudentId}/progress/submodules`, { headers });
        let pData = {};
        if (progressRes.ok) {
           const progJson = await progressRes.json();
           (progJson.data || []).forEach(p => {
             pData[p.submodule_id] = p.is_completed;
           });
        }
        setProgressData(pData);

        // 1.6 Fetch Completed Tasks
        const tasksRes = await fetch(`/api/v1/students/${actualStudentId}/tasks`, { headers });
        let cTasks = new Set();
        if (tasksRes.ok) {
           const tJson = await tasksRes.json();
           (tJson.data || []).forEach(t => {
             if (t.status === 'APPROVED' || t.status === 'SUBMITTED' || t.status === 'PENDING_REVIEW') {
               cTasks.add(t.task_id);
             }
           });
        }
        setCompletedTasks(cTasks);

        const courseIds = studentData.data?.student_courses?.map(sc => sc.course_id) || [];

        // 2. Fetch all courses
        const syllabusPromises = courseIds.map(cId => 
          fetch(`/api/v1/courses/${cId}`, { headers }).then(r => r.json())
        );
        const syllabusResponses = await Promise.all(syllabusPromises);
        const fetchedCourses = syllabusResponses.map(res => res.data).filter(Boolean);

        // 3. Combine into expected structure
        const combined = fetchedCourses.map(course => {
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
            id: course.id,
            name: course.name || course.title,
            modules: realModules
          };
        });

        setCourses(combined);
        setExpandedCourses({});
      } catch (error) {
        console.error('Error fetching journey:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJourney();
  }, [userInfo]);

  const toggleSubmodule = async (sub, currentStatus) => {
    if (toggling) return;
    
    // Once completed, it cannot be undone / redone
    if (currentStatus) {
      showToast("Completed topics cannot be unchecked.", true);
      return;
    }
    
    // Enforce task completion if trying to check (mark as done)
    if (!currentStatus && sub.course_tasks && sub.course_tasks.length > 0) {
      const allDone = sub.course_tasks.every(t => completedTasks.has(t.id));
      if (!allDone) {
        showToast("Please complete all tasks in this topic before marking it as done.", true);
        return;
      }
    }

    setToggling(true);
    try {
      const studentId = userInfo?.student_profile_id || userInfo?.id;
      const token = userInfo?.token || sessionStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
      
      const res = await fetch(`/api/v1/students/${studentId}/progress/submodules/${sub.id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ is_completed: !currentStatus })
      });
      if (res.ok) {
        setProgressData(prev => ({ ...prev, [sub.id]: !currentStatus }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setToggling(false);
    }
  };

  const toggleModule = async (submodules, isCurrentlyCompleted) => {
    if (toggling || !submodules || submodules.length === 0) return;
    
    // Once completed, it cannot be undone / redone
    if (isCurrentlyCompleted) {
      showToast("Completed modules cannot be unchecked.", true);
      return;
    }
    
    const targetStatus = !isCurrentlyCompleted;

    // Enforce task completion for all submodules if trying to check
    if (targetStatus) {
      const hasIncompleteTasks = submodules.some(sub => {
        if (!sub.course_tasks || sub.course_tasks.length === 0) return false;
        return !sub.course_tasks.every(t => completedTasks.has(t.id));
      });
      if (hasIncompleteTasks) {
        showToast("Please complete all tasks in all topics of this module before marking it as done.", true);
        return;
      }
    }

    setToggling(true);
    try {
      const studentId = userInfo?.student_profile_id || userInfo?.id;
      const token = userInfo?.token || sessionStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
      
      const targetStatus = !isCurrentlyCompleted;
      const realSubmodules = submodules.filter(sub => !String(sub.id).startsWith('dummy-'));
      const promises = realSubmodules.map(sub => 
        fetch(`/api/v1/students/${studentId}/progress/submodules/${sub.id}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ is_completed: targetStatus })
        })
      );
      
      await Promise.all(promises);
      
      const newData = { ...progressData };
      submodules.forEach(sub => {
        newData[sub.id] = targetStatus;
      });
      setProgressData(newData);
    } catch (error) {
      console.error(error);
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your academic journey..." />;

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => {
      // If it's already expanded, close it
      if (prev[courseId]) return {};
      // Otherwise, open ONLY this course
      return { [courseId]: true };
    });
  };

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Header - Pinned at top */}
      <div className="shrink-0 p-6 md:px-8 md:pt-8 md:pb-6 border-b border-slate-200 bg-white z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Academic Journey</h1>
          <p className="text-slate-500 mt-1">Track your progress and complete topics sequentially</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
        <div className="w-full">

      {courses.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-slate-500 text-sm">You are not enrolled in any active courses yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10 pb-20">
          {courses.map(course => {
            const isCourseExpanded = expandedCourses[course.id];
            
            // Calculate stats for the course header
            const courseModules = course.modules || [];
            const totalModules = courseModules.length;
            const completedModules = courseModules.filter((mod, index) => {
              let isModuleUnlocked = index === 0;
              if (index > 0) {
                let prevCompleted = true;
                for (let i = 0; i < index; i++) {
                  const m = courseModules[i];
                  const subs = m.submodules || [];
                  const isMCompleted = subs.length > 0 && subs.every(sub => {
                    return sub.course_tasks && sub.course_tasks.length > 0
                      ? (progressData[sub.id] !== undefined ? progressData[sub.id] : sub.course_tasks.every(t => completedTasks.has(t.id)))
                      : !!progressData[sub.id];
                  });
                  if (!isMCompleted) prevCompleted = false;
                }
                isModuleUnlocked = prevCompleted;
              }
              const subs = mod.submodules || [];
              return isModuleUnlocked && subs.length > 0 && subs.every(sub => {
                return sub.course_tasks && sub.course_tasks.length > 0
                  ? (progressData[sub.id] !== undefined ? progressData[sub.id] : sub.course_tasks.every(t => completedTasks.has(t.id)))
                  : !!progressData[sub.id];
              });
            }).length;

            const courseProgressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

            return (
              <div key={course.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mb-8">
                {/* Course Accordion Header */}
                <div 
                  className={`flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 cursor-pointer select-none transition-all duration-200 ${
                    isCourseExpanded ? 'bg-slate-50/50 border-b border-slate-100' : 'hover:bg-slate-50/30'
                  }`}
                  onClick={() => toggleCourse(course.id)}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#003F87] flex items-center justify-center shrink-0 shadow-inner">
                      <BookOpen size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#003F87] px-2.5 py-0.5 rounded-full">
                          Course
                        </span>
                        {courseProgressPercent === 100 ? (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                            Completed
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/50 px-2.5 py-0.5 rounded-full">
                            In Progress
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-extrabold tracking-tight text-slate-800 hover:text-[#003F87] transition-colors truncate">
                        {course.name}
                      </h2>
                      {/* Sub-bar / progress */}
                      <div className="flex items-center gap-4 mt-3 max-w-md">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-[#003F87] rounded-full transition-all duration-500"
                            style={{ width: `${courseProgressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-500 shrink-0">
                          {courseProgressPercent}% Done ({completedModules}/{totalModules} Mods)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end mt-4 md:mt-0 gap-4 shrink-0 pl-16 md:pl-0">
                    <div className={`w-10 h-10 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-[#003F87] flex items-center justify-center transition-all duration-300 border border-slate-150 ${
                      isCourseExpanded ? 'rotate-180 border-[#003F87]/20 shadow-sm' : ''
                    }`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {isCourseExpanded && (
                  <div className="p-6 md:p-8 bg-white">
                    {(() => {
                      const totalModules = course.modules.length;
                      const rowHeight = 160;
                      const svgHeight = totalModules * rowHeight;

                      // Generate SVG paths
                      let fullPath = "";
                      let progressPath = "";
                      
                      // Find the last unlocked/completed module index
                      let lastUnlockedIndex = 0;
                      let prevModuleCompleted = true; // For index 0
                      const moduleStatus = course.modules.map((mod, index) => {
                        let isModuleUnlocked = false;
                        if (index === 0) {
                          isModuleUnlocked = true;
                        } else {
                          isModuleUnlocked = prevModuleCompleted;
                        }

                        const currentModSubmodules = mod.submodules || [];
                        const completedTopicsCount = currentModSubmodules.filter(sub => {
                          return sub.course_tasks && sub.course_tasks.length > 0
                            ? (progressData[sub.id] !== undefined ? progressData[sub.id] : sub.course_tasks.every(t => completedTasks.has(t.id)))
                            : !!progressData[sub.id];
                        }).length;
                        const totalTopicsCount = currentModSubmodules.length;
                        
                        const isCompleted = isModuleUnlocked && totalTopicsCount > 0 && completedTopicsCount === totalTopicsCount;

                        // Update prevModuleCompleted for the next module in sequence
                        prevModuleCompleted = isModuleUnlocked && (totalTopicsCount === 0 || completedTopicsCount === totalTopicsCount);

                        if (isModuleUnlocked) {
                          lastUnlockedIndex = index;
                        }

                        return {
                          ...mod,
                          isUnlocked: isModuleUnlocked,
                          isCompleted,
                          completedCount: completedTopicsCount,
                          totalCount: totalTopicsCount
                        };
                      });

                      const moduleColors = [
                        { bg: 'bg-[#003F87]', text: 'text-white', border: 'border-[#003F87]', pillText: 'text-[#003F87]' },
                        { bg: 'bg-[#E25C24]', text: 'text-white', border: 'border-[#E25C24]', pillText: 'text-[#E25C24]' },
                        { bg: 'bg-[#0D9488]', text: 'text-white', border: 'border-[#0D9488]', pillText: 'text-[#0D9488]' },
                        { bg: 'bg-[#7C3AED]', text: 'text-white', border: 'border-[#7C3AED]', pillText: 'text-[#7C3AED]' },
                        { bg: 'bg-[#DB2777]', text: 'text-white', border: 'border-[#DB2777]', pillText: 'text-[#DB2777]' },
                      ];

                      return (
                        <div className="relative w-full max-w-[540px] mx-auto animate-in slide-in-from-top-2 fade-in duration-300 select-none my-8" style={{ height: `${svgHeight}px` }}>
                          
                          {/* SVG Curve Path Background */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 400 ${svgHeight}`} preserveAspectRatio="none">
                            {moduleStatus.map((mod, index) => {
                              if (index === totalModules - 1) return null;

                              const y1 = index * rowHeight + 80;
                              const x1 = index % 2 === 0 ? 100 : 300;
                              const y2 = (index + 1) * rowHeight + 80;
                              const x2 = (index + 1) % 2 === 0 ? 100 : 300;

                              const d = `M ${x1} ${y1} C ${x1} ${y1 + 80}, ${x2} ${y2 - 80}, ${x2} ${y2}`;

                              // Progress percentage based on completed submodules/topics in mod
                              const p = mod.isCompleted ? 100 : mod.isUnlocked && mod.totalCount > 0 ? (mod.completedCount / mod.totalCount) * 100 : 0;

                              return (
                                <g key={mod.id}>
                                  {/* Background Path (gray, dashed) */}
                                  <path 
                                    d={d} 
                                    fill="none" 
                                    stroke="#F1F5F9" 
                                    strokeWidth="8" 
                                    strokeLinecap="round" 
                                    strokeDasharray="16 12" 
                                  />
                                  
                                  {/* Active / Completed Colored Path (lit up proportionally) */}
                                  {p > 0 && (
                                    <path 
                                      d={d} 
                                      fill="none" 
                                      stroke="#003F87" 
                                      strokeWidth="8" 
                                      strokeLinecap="round" 
                                      pathLength="100"
                                      strokeDasharray={`${p} ${100 - p}`}
                                      className="transition-all duration-500 ease-out"
                                    />
                                  )}
                                </g>
                              );
                            })}
                          </svg>

                          {/* Nodes */}
                          {moduleStatus.map((mod, index) => {
                            const color = moduleColors[index % moduleColors.length];
                            const isLeft = index % 2 === 0;
                            const y = index * rowHeight + 80;
                            const xPercent = isLeft ? '25%' : '75%';

                            return (
                              <div 
                                key={mod.id} 
                                className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
                                style={{
                                  left: xPercent,
                                  top: `${y}px`
                                }}
                              >
                                {/* Circle Milestone Node */}
                                <div 
                                  onClick={() => {
                                    if (mod.isUnlocked) {
                                      setSelectedModule(mod);
                                    }
                                  }}
                                  className={`w-14 h-14 rounded-full flex items-center justify-center border-4 cursor-pointer transition-all duration-500 ${
                                    mod.isCompleted 
                                      ? 'bg-emerald-500 border-emerald-300 text-white shadow-lg shadow-emerald-500/30' 
                                      : mod.isUnlocked 
                                      ? `${color.bg} ${color.border} text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/10` 
                                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                  } hover:scale-110 active:scale-95`}
                                >
                                  {mod.isCompleted ? (
                                    <CheckCircle2 size={24} className="text-white" />
                                  ) : mod.isUnlocked ? (
                                    <span className="text-[16px] font-black">{index + 1}</span>
                                  ) : (
                                    <LockKeyhole size={18} className="text-slate-400" />
                                  )}
                                </div>

                                {/* Pill Card Label */}
                                <div 
                                  onClick={() => {
                                    if (mod.isUnlocked) {
                                      setSelectedModule(mod);
                                    }
                                  }}
                                  className={`absolute whitespace-nowrap cursor-pointer px-5 py-3 rounded-2xl border transition-all duration-300 flex flex-col items-start gap-0.5 shadow-sm hover:scale-105 active:scale-95 ${
                                    isLeft 
                                      ? 'left-18 items-start' 
                                      : 'right-18 items-end'
                                  } ${
                                    mod.isCompleted
                                      ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                                      : mod.isUnlocked
                                      ? 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:shadow-md'
                                      : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                                  }`}
                                  style={{
                                    width: '180px'
                                  }}
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
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}</div>
      )}
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-8 right-8 z-[9999] px-6 py-4 rounded-xl shadow-2xl font-bold text-sm transform transition-all duration-300 flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-800 text-white'}`}>
          {toast.type === 'error' ? <X size={18} /> : <CheckCircle size={18} className="text-green-400" />}
          {toast.message}
        </div>
      )}

      {/* Module Drawer/Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedModule(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 flex flex-col animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                  Module Topics
                </span>
                <h2 className="text-xl font-black text-slate-800">{selectedModule.title}</h2>
              </div>
              <button onClick={() => setSelectedModule(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto flex flex-col gap-4">
              {/* Progress Summary */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-500">Progress</span>
                  <p className="text-lg font-black text-slate-800 mt-1">
                    {selectedModule.submodules.filter(sub => {
                      return sub.course_tasks && sub.course_tasks.length > 0
                        ? (progressData[sub.id] !== undefined ? progressData[sub.id] : sub.course_tasks.every(t => completedTasks.has(t.id)))
                        : !!progressData[sub.id];
                    }).length} / {selectedModule.submodules.length} Topics Completed
                  </p>
                </div>
                <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden shrink-0">
                  <div 
                    className="h-full bg-[#003F87] rounded-full transition-all duration-500"
                    style={{
                      width: selectedModule.submodules.length > 0
                        ? `${(selectedModule.submodules.filter(sub => {
                            return sub.course_tasks && sub.course_tasks.length > 0
                              ? (progressData[sub.id] !== undefined ? progressData[sub.id] : sub.course_tasks.every(t => completedTasks.has(t.id)))
                              : !!progressData[sub.id];
                          }).length / selectedModule.submodules.length) * 100}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>

              {/* Topics List */}
              <div className="flex flex-col gap-3">
                {selectedModule.submodules.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No topics in this module.</p>
                ) : (
                  selectedModule.submodules.map((sub) => {
                    const isSubCompleted = sub.course_tasks && sub.course_tasks.length > 0
                      ? (progressData[sub.id] !== undefined ? progressData[sub.id] : sub.course_tasks.every(t => completedTasks.has(t.id)))
                      : !!progressData[sub.id];
                    return (
                      <div key={sub.id} className={`flex flex-col gap-2 p-4 border rounded-2xl transition-colors duration-200 ${
                        isSubCompleted ? 'bg-emerald-50/20 border-emerald-100' : 'bg-white border-slate-200 hover:border-blue-100'
                      }`}>
                        <div className="flex justify-between items-start gap-4">
                          <div 
                            className="flex items-start gap-3 cursor-pointer group flex-1"
                            onClick={() => toggleSubmodule(sub, isSubCompleted)}
                          >
                            <div className={`w-5.5 h-5.5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              isSubCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-[#003F87]'
                            }`}>
                              {isSubCompleted && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                            <div>
                               <span className={`font-bold text-sm transition-colors ${
                                 isSubCompleted ? 'text-slate-500' : 'text-slate-800'
                               }`}>
                                {sub.title}
                              </span>
                              {sub.description && (
                                <p className={`text-xs mt-1 leading-relaxed ${isSubCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {sub.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Tasks */}
                        {sub.course_tasks && sub.course_tasks.length > 0 && (
                          <div className={`mt-3 pl-8 space-y-2 ${isSubCompleted ? 'opacity-60' : 'opacity-100'}`}>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tasks</span>
                            <div className="grid grid-cols-1 gap-2">
                              {sub.course_tasks.sort((a,b)=>a.sequence_order - b.sequence_order).map(t => {
                                const tDone = completedTasks.has(t.id);
                                return (
                                  <div 
                                    key={t.id} 
                                    className="text-xs flex items-center justify-between gap-3 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:border-[#003F87] transition-all group/task"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedModule(null);
                                      navigate('/student/tasks', { 
                                        state: { 
                                          targetTaskId: t.id, 
                                          targetSubmoduleId: sub.id, 
                                          targetModuleId: selectedModule.id 
                                        } 
                                      });
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      {tDone ? (
                                        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                                      ) : (
                                        <div className="w-2 h-2 rounded-full bg-[#003F87] shrink-0" />
                                      )}
                                      <span className={`font-semibold group-hover/task:text-[#003F87] group-hover/task:underline ${tDone ? 'text-slate-500' : 'text-slate-700'}`}>
                                        {t.title}
                                      </span>
                                    </div>
                                    {tDone ? (
                                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">Completed</span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-white border border-slate-100 px-2 py-0.5 rounded-md group-hover/task:border-blue-200 group-hover/task:text-[#003F87]">View Task</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setSelectedModule(null)} 
                className="px-6 py-2.5 bg-[#003F87] text-white rounded-xl text-sm font-bold shadow-md shadow-blue-900/10 hover:bg-[#002B5E] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAcademicJourney;
