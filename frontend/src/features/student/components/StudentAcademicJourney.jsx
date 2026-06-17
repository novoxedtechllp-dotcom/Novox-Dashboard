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
          return {
            id: course.id,
            name: course.name || course.title,
            modules: (course.course_modules || []).sort((a,b)=>a.sequence_order - b.sequence_order).map(mod => {
              return {
                id: mod.id,
                title: mod.title,
                submodules: (mod.course_submodules || []).sort((a,b)=>a.sequence_order - b.sequence_order)
              };
            })
          };
        });

        setCourses(combined);
        const initialExpanded = {};
        if (combined.length > 0) {
          initialExpanded[combined[0].id] = true;
        }
        setExpandedCourses(initialExpanded);
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
      const promises = submodules.map(sub => 
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
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Header - Pinned at top */}
      <div className="shrink-0 p-6 md:px-8 md:pt-8 md:pb-6 border-b border-slate-200 bg-white z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Academic Journey</h1>
          <p className="text-slate-500 text-sm mt-1">Track your progress and complete topics sequentially</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
        <div className="max-w-4xl mx-auto w-full">

      {courses.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-slate-500 text-sm">You are not enrolled in any active courses yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10 pb-20">
          {courses.map(course => {
            const isCourseExpanded = expandedCourses[course.id];
            return (
              <div key={course.id} className="flex flex-col gap-6">
                {/* Course Accordion Header */}
                <div 
                  className="flex items-center gap-3 cursor-pointer select-none group border-b border-slate-100 pb-3"
                  onClick={() => toggleCourse(course.id)}
                >
                  <BookOpen size={20} className="text-[#003F87] group-hover:scale-110 transition-transform duration-300" />
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-[#003F87] transition-colors flex-1">
                    {course.name}
                  </h2>
                  <div className={`p-1 rounded bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#003F87] transition-all duration-300 ${isCourseExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} />
                  </div>
                </div>

                {isCourseExpanded && (
                  <div className="relative pl-4 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-100 rounded-full"></div>

              <div className="flex flex-col gap-8">
                {course.modules.map((mod, index) => {
                  
                  // Module is unlocked if it's the first module, OR if the previous module's submodules are ALL completed.
                  let isModuleUnlocked = false;
                  if (index === 0) {
                    isModuleUnlocked = true;
                  } else {
                    const prevMod = course.modules[index - 1];
                    const prevModSubmodules = prevMod.submodules || [];
                    if (prevModSubmodules.length === 0) {
                       isModuleUnlocked = true; // no topics to complete, so unlocked
                    } else {
                       const completedCount = prevModSubmodules.filter(sub => progressData[sub.id]).length;
                       isModuleUnlocked = completedCount === prevModSubmodules.length;
                    }
                  }

                  const currentModSubmodules = mod.submodules || [];
                  const completedTopicsCount = currentModSubmodules.filter(sub => progressData[sub.id]).length;
                  const totalTopicsCount = currentModSubmodules.length;
                  const isCompleted = isModuleUnlocked && totalTopicsCount > 0 && completedTopicsCount === totalTopicsCount;

                  return (
                    <div key={mod.id} className="relative flex items-start gap-4 group/mod">
                      {/* Minimalist Checkbox Dot */}
                      <div 
                        className={`relative z-10 w-5 h-5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-all duration-300 ${isModuleUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'} ${
                          isCompleted ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/20' : 
                          isModuleUnlocked ? 'border-slate-300 bg-white group-hover/mod:border-[#003F87]' : 
                          'border-slate-200 bg-slate-50'
                        }`}
                        onClick={() => {
                           if (isModuleUnlocked) {
                             toggleModule(currentModSubmodules, isCompleted);
                           }
                        }}
                      >
                        {isCompleted && <CheckCircle2 size={14} className="text-white" />}
                      </div>

                      {/* Minimalist content card */}
                      <div className={`flex-1 rounded-xl border p-5 transition-all duration-300 ${
                        isCompleted
                          ? 'border-emerald-100 bg-white shadow-sm'
                          : isModuleUnlocked 
                          ? 'border-blue-100 bg-white shadow-md shadow-blue-900/5' 
                          : 'border-slate-100 bg-slate-50 opacity-70'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 border-b border-slate-100 pb-4">
                          <div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                              isCompleted ? 'text-emerald-500' : isModuleUnlocked ? 'text-[#003F87]' : 'text-slate-400'
                            }`}>
                              Module {index + 1}
                            </span>
                            <h3 className={`text-lg font-bold ${isModuleUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                              {mod.title}
                            </h3>
                          </div>
                          
                          {isModuleUnlocked ? (
                            isCompleted ? (
                              <div className="text-emerald-600 flex items-center gap-1.5 text-sm font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shrink-0">
                                <CheckCircle2 size={16} /> Module Completed
                              </div>
                            ) : (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-semibold text-slate-500">
                                  {completedTopicsCount} / {totalTopicsCount} Topics Completed
                                </span>
                                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-[#003F87]'}`} 
                                    style={{ width: totalTopicsCount > 0 ? `${(completedTopicsCount / totalTopicsCount) * 100}%` : '0%' }}
                                  />
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="text-slate-400 flex items-center gap-1.5 text-xs font-semibold bg-slate-100 px-3 py-1.5 rounded-lg shrink-0">
                              <Lock size={12} /> Locked
                            </div>
                          )}
                        </div>

                        {/* Submodules list */}
                        {isModuleUnlocked && (
                          <div className="flex flex-col gap-3">
                            {currentModSubmodules.length === 0 ? (
                              <p className="text-xs text-slate-400 font-medium italic">No topics in this module.</p>
                            ) : (
                              currentModSubmodules.map((sub) => {
                                const isSubCompleted = !!progressData[sub.id];

                                return (
                                  <div key={sub.id} className={`flex flex-col gap-2 p-3.5 border rounded-lg transition-colors duration-200 ${
                                    isSubCompleted ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-slate-200 hover:border-blue-200'
                                  }`}>
                                    <div className="flex justify-between items-start gap-4">
                                      <div 
                                        className="flex items-start gap-3 cursor-pointer group flex-1"
                                        onClick={() => toggleSubmodule(sub, isSubCompleted)}
                                      >
                                        <div className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                          isSubCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-[#003F87]'
                                        }`}>
                                          {isSubCompleted && <CheckCircle2 size={14} className="text-white" />}
                                        </div>
                                        <div>
                                          <span className={`font-semibold text-sm transition-colors ${
                                            isSubCompleted ? 'text-slate-500 line-through' : 'text-slate-800'
                                          }`}>
                                            {sub.title}
                                          </span>
                                          {sub.description && (
                                            <p className={`text-xs mt-1 ${isSubCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                                              {sub.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Submodule Tasks */}
                                    {sub.course_tasks && sub.course_tasks.length > 0 && (
                                      <div className={`mt-3 pl-8 space-y-2 ${isSubCompleted ? 'opacity-50' : 'opacity-100'}`}>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasks</span>
                                        {sub.course_tasks.sort((a,b)=>a.sequence_order - b.sequence_order).map(t => {
                                          const tDone = completedTasks.has(t.id);
                                          return (
                                            <div 
                                              key={t.id} 
                                              className="text-xs flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 cursor-pointer hover:border-[#003F87] transition-all group/task"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                navigate('/student/tasks', { 
                                                  state: { 
                                                    targetTaskId: t.id, 
                                                    targetSubmoduleId: sub.id, 
                                                    targetModuleId: mod.id 
                                                  } 
                                                });
                                              }}
                                            >
                                              <div className={`w-2 h-2 rounded-full shrink-0 ${tDone ? 'bg-emerald-500' : 'bg-[#003F87]'}`} /> 
                                              <span className={`font-medium group-hover/task:text-[#003F87] group-hover/task:underline ${tDone ? 'line-through text-slate-400 group-hover/task:text-slate-500' : ''}`}>
                                                {t.title}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                        
                        {!isModuleUnlocked && (
                          <p className="text-xs text-slate-400 font-medium italic mt-2">
                            Complete the previous module to unlock these topics.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </div>
          );
        })}
        </div>
      )}
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-8 right-8 z-[9999] px-6 py-4 rounded-xl shadow-2xl font-bold text-sm transform transition-all duration-300 flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-800 text-white'}`}>
          {toast.type === 'error' ? <X size={18} /> : <CheckCircle size={18} className="text-green-400" />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default StudentAcademicJourney;
