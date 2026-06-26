import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from '../../../components/LoadingSpinner';
import CustomSelect from '../../../components/CustomSelect';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  BookOpen, 
  AlertCircle, 
  ArrowRight,
  FileText,
  Link as LinkIcon,
  X,
  Upload,
  Check,
  GraduationCap,
  Sparkles,
  LayoutGrid,
  CheckSquare,
  ChevronRight
} from 'lucide-react';
import { getStudentProfile, getCourseDetails, getStudentTasks, updateStudentTask, uploadFile, submitStudentTask } from '../api/studentApi';

const StudentTasks = ({ userInfo }) => {
  const location = useLocation();
  const [courseStructure, setCourseStructure] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, HOMEWORK, QUIZ, PROJECT
  const [expandedSections, setExpandedSections] = useState({});
  const toggleSection = (id) => setExpandedSections(p => ({ ...p, [id]: !p[id] }));
  const [activeSubmoduleId, setActiveSubmoduleId] = useState(null);
  
  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Submit form state
  const [resourceType, setResourceType] = useState('LINK');
  const [resourceContent, setResourceContent] = useState('');
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceLabel, setResourceLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const studentId = userInfo?.student_profile_id || userInfo?.id;
  const token = userInfo?.token || sessionStorage.getItem('token');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Student Details to get their courses
      const studentDataRes = await getStudentProfile(studentId).catch(() => null);
      if (!studentDataRes) throw new Error('Failed to fetch student details');
      const studentData = studentDataRes.data || studentDataRes;
      const courseIds = studentData?.student_courses?.map(sc => sc.course_id) || [];

      // 2. Fetch all courses
      const syllabusPromises = courseIds.map(cId => 
        getCourseDetails(cId).catch(() => null)
      );
      const syllabusResponses = await Promise.all(syllabusPromises);
      const courses = syllabusResponses.map(res => res?.data || res).filter(Boolean);

      // 3. Fetch Student Tasks for statuses using the resolved actual student ID
      const actualStudentId = studentData.id;
      const tasksDataRes = await getStudentTasks(actualStudentId).catch(() => null);
      let studentTasksList = [];
      if (tasksDataRes) {
        studentTasksList = tasksDataRes.data || tasksDataRes || [];
      }

      const tasksMap = {};
      studentTasksList.forEach(st => {
        tasksMap[st.task_id] = st;
      });

      // 4. Combine
      const combined = courses.map(course => {
        return {
          id: course.id,
          name: course.name,
          modules: (course.course_modules || [])
            .filter(mod => mod.status === 'PUBLISHED')
            .sort((a,b)=>a.sequence_order - b.sequence_order).map(mod => {
            return {
              id: mod.id,
              title: mod.title,
              submodules: (mod.course_submodules || []).sort((a,b)=>a.sequence_order - b.sequence_order).map(sub => {
                const subTasks = (sub.course_tasks || []).sort((a,b)=>a.sequence_order - b.sequence_order).map(ct => {
                  const st = tasksMap[ct.id];
                  
                  let columnStatus = 'NOT_STARTED';
                  let tStatus = st?.status || 'PENDING';
                  if (tStatus === 'IN_PROGRESS') columnStatus = 'IN_PROGRESS';
                  else if (tStatus === 'PENDING_REVIEW') columnStatus = 'PENDING_REVIEW';
                  else if (tStatus === 'APPROVED') columnStatus = 'APPROVED';

                  let dueText = 'No Date';
                  let dueType = 'normal';
                  if (ct.due_date) {
                    const dueDate = new Date(ct.due_date);
                    const today = new Date();
                    const diffTime = dueDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) { dueText = 'Overdue'; dueType = 'urgent'; }
                    else if (diffDays === 0) { dueText = 'Due Today'; dueType = 'urgent'; }
                    else if (diffDays === 1) { dueText = 'Due Tomorrow'; dueType = 'tomorrow'; }
                    else {
                      dueText = `${diffDays} Days Left`;
                      dueType = diffDays <= 2 ? 'urgent' : 'normal';
                    }
                  }

                  return {
                    id: st?.id || `virtual-${ct.id}`, // If not assigned, make a virtual ID
                    task_id: ct.id,
                    title: ct.title || 'Untitled Task',
                    description: ct.description || '',
                    type: ct.task_type || 'HOMEWORK',
                    status: columnStatus,
                    dueText: dueText,
                    dueType: dueType,
                    dueDate: ct.due_date ? new Date(ct.due_date).toLocaleDateString() : 'No Date',
                    department: course.name,
                    gradeValue: columnStatus === 'APPROVED' ? (st?.review_comment ? 'Graded' : 'Approved') : null,
                    feedback: st?.review_comment || '',
                    completion: columnStatus === 'APPROVED' ? 100 : (columnStatus === 'IN_PROGRESS' ? 75 : 0),
                    subtasks: ct.course_task_subtasks || [],
                    isReal: !!st,
                    raw: st || ct
                  };
                });
                return {
                  id: sub.id,
                  title: sub.title,
                  tasks: subTasks
                };
              })
            };
          })
        };
      });
      
      setCourseStructure(combined);

      // Check for redirect state from Academic Journey
      if (location.state?.targetTaskId) {
        const { targetModuleId, targetSubmoduleId, targetTaskId } = location.state;
        
        let foundTask = null;
        combined.forEach(course => {
          course.modules?.forEach(mod => {
            mod.submodules?.forEach(sub => {
              sub.tasks?.forEach(task => {
                if (task.task_id === targetTaskId) foundTask = task;
              });
            });
          });
        });

        if (foundTask) {
          setExpandedSections(prev => ({
            ...prev,
            [targetModuleId]: true,
            [foundTask.id]: true
          }));
          
          setActiveSubmoduleId(targetSubmoduleId);
          
          const isStarting = foundTask.status === 'NOT_STARTED';
          setSelectedTask({ ...foundTask, status: isStarting ? 'IN_PROGRESS' : foundTask.status });
          setIsDetailsModalOpen(true);
          
          if (isStarting) {
            handleStartTask(null, foundTask);
            foundTask.status = 'IN_PROGRESS';
          }
          
          setTimeout(() => {
            const el = document.getElementById(`task-${foundTask.id}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('ring-2', 'ring-[#003F87]', 'ring-offset-2');
              setTimeout(() => el.classList.remove('ring-2', 'ring-[#003F87]', 'ring-offset-2'), 2000);
            }
          }, 300);
        }
        
        window.history.replaceState({}, document.title);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setCourseStructure([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId && token) {
      fetchTasks();
    } else {
      setCourseStructure([]);
      setLoading(false);
    }
  }, [studentId, token]);

  const handleStartTask = async (e, task) => {
    if (e) e.stopPropagation();
    if (task.isReal) {
      try {
        await updateStudentTask(studentId, task.id, { status: 'IN_PROGRESS' });
        fetchTasks();
      } catch (error) {
        console.error('Failed to start task:', error);
      }
    }
  };

  const openSubmitModal = (e, task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setResourceContent('');
    setResourceFile(null);
    setResourceLabel('');
    setErrorMsg('');
    setIsSubmitModalOpen(true);
  };

  const openFeedbackModal = (e, task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsFeedbackModalOpen(true);
  };

  const openDetailsModal = (task) => {
    const isStarting = task.status === 'NOT_STARTED';
    setSelectedTask({ ...task, status: isStarting ? 'IN_PROGRESS' : task.status });
    setIsDetailsModalOpen(true);
    if (isStarting) {
      handleStartTask(null, task);
      
      // Optimistically update outer box
      setCourseStructure(prev => prev.map(course => ({
        ...course,
        modules: course.modules.map(mod => ({
          ...mod,
          submodules: mod.submodules.map(sub => ({
            ...sub,
            tasks: sub.tasks.map(t => t.id === task.id ? { ...t, status: 'IN_PROGRESS' } : t)
          }))
        }))
      })));
    }
  };


  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (resourceType !== 'FILE' && !resourceContent.trim()) {
      setErrorMsg('Please provide submission link or note content.');
      return;
    }
    if (resourceType === 'FILE' && !resourceFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    let finalContent = resourceContent.trim();

    if (resourceType === 'FILE' && resourceFile) {
      try {
        const uploadData = await uploadFile(resourceFile);
        if (uploadData?.url) {
          finalContent = uploadData.url;
        } else {
          throw new Error('File upload failed');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('File upload failed. Please try again.');
        setSubmitting(false);
        return;
      }
    }

    const payload = {
      resources: [
        {
          resource_type: resourceType,
          content: finalContent,
          label: resourceLabel.trim() || `${selectedTask.title} Submission`
        }
      ]
    };

    if (selectedTask.isReal) {
      try {
        await submitStudentTask(studentId, selectedTask.id, payload);

        // Optimistically update outer box to Submitted (PENDING_REVIEW)
        setCourseStructure(prev => prev.map(course => ({
          ...course,
          modules: course.modules.map(mod => ({
            ...mod,
            submodules: mod.submodules.map(sub => ({
              ...sub,
              tasks: sub.tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'PENDING_REVIEW' } : t)
            }))
          }))
        })));

        setIsSubmitModalOpen(false);
        setIsDetailsModalOpen(false);
        fetchTasks();
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'Submission failed.');
      } finally {
        setSubmitting(false);
      }
    }
  };


  const renderDeptIcon = (dept) => {
    const d = (dept || '').toLowerCase();
    if (d.includes('science')) return <FileText size={13} className="text-slate-400 mr-1.5" />;
    if (d.includes('humanities')) return <BookOpen size={13} className="text-slate-400 mr-1.5" />;
    if (d.includes('design')) return <Sparkles size={13} className="text-slate-400 mr-1.5" />;
    if (d.includes('math')) return <LayoutGrid size={13} className="text-slate-400 mr-1.5" />;
    return <GraduationCap size={13} className="text-slate-400 mr-1.5" />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFBFC] p-4 md:p-6 lg:p-8">
      
      <div className="max-w-7xl mx-auto w-full pb-10">
        
        {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Student Tasks</h1>
            <p className="text-slate-500 mt-1">Manage your upcoming assignments, track project milestones, and review completed work feedback.</p>
          </div>
        </div>


      {/* Board Layout */}
      {loading ? (
        <div className="flex-1 min-h-[300px] flex flex-col relative rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <LoadingSpinner text="Loading your tasks..." />
        </div>
      ) : (() => {
        const filteredCourseStructure = courseStructure.map(course => {
          let prevModuleCompleted = true;
          const mappedModules = course.modules.map((mod, index) => {
            const isModuleUnlocked = index === 0 ? true : prevModuleCompleted;
            
            let allSubmodulesCompleted = true;
            if (mod.submodules.length === 0) allSubmodulesCompleted = false;
            mod.submodules.forEach(sub => {
              const hasTasks = sub.tasks && sub.tasks.length > 0;
              if (hasTasks) {
                if (!sub.tasks.every(t => t.status === 'APPROVED' || t.status === 'PENDING_REVIEW' || t.gradeValue)) {
                  allSubmodulesCompleted = false;
                }
              }
            });
            prevModuleCompleted = isModuleUnlocked && allSubmodulesCompleted;

            return {
              ...mod,
              isUnlocked: isModuleUnlocked,
              submodules: mod.submodules.map(sub => ({
                ...sub,
                tasks: sub.tasks.filter(t => t.isReal)
              })).filter(sub => sub.tasks.length > 0)
            };
          });

          return {
            ...course,
            modules: mappedModules.filter(mod => mod.submodules.length > 0)
          };
        }).filter(course => course.modules.length > 0);

        return (
          <>
            {filteredCourseStructure.length === 0 ? (
            <div className="border border-dashed border-slate-200 bg-white/50 rounded-2xl p-8 text-center text-slate-400 font-medium text-sm">
              No tasks match the selected filter.
            </div>
          ) : (
            filteredCourseStructure.map(course => (
              <div key={course.id} className="mb-10">
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-4 ml-2 flex items-center gap-2">
                  <GraduationCap size={16} /> {course.name}
                </h3>
                
                {course.modules.length === 0 ? (
                  <div className="text-slate-400 font-medium text-sm italic ml-4">No modules available.</div>
                ) : (
                  course.modules.map(mod => (
                    <div key={mod.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
                      {/* Module Header */}
                      <div 
                        onClick={() => toggleSection(mod.id)}
                        className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 text-[#003F87] p-2 rounded-lg shrink-0">
                            <BookOpen size={18} />
                          </div>
                          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            {mod.title}
                            {!mod.isUnlocked && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">Locked</span>}
                          </h2>
                        </div>
                        <ChevronRight 
                          className={`text-slate-400 transition-transform duration-300 ${expandedSections[mod.id] ? 'rotate-90' : ''}`} 
                        />
                      </div>
                      
                      {/* Submodules & Tasks */}
                      {expandedSections[mod.id] && (
                        <div className="p-6 flex flex-col gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                          {mod.submodules.length === 0 ? (
                            <div className="text-slate-400 font-medium text-sm italic">No submodules available.</div>
                          ) : (
                            mod.submodules.map(sub => {
                              const filteredTasks = sub.tasks;
                              
                              return (
                                <div key={sub.id} className={`flex flex-col mb-4 rounded-xl border transition-all ${activeSubmoduleId === sub.id ? 'bg-slate-50/50 border-[#003F87]/10 shadow-sm' : 'bg-slate-50/70 border-slate-100 hover:border-[#003F87]/20 hover:bg-blue-50/30'}`}>
                                  <div 
                                    onClick={() => setActiveSubmoduleId(activeSubmoduleId === sub.id ? null : sub.id)}
                                    className="flex items-center justify-between cursor-pointer group p-3.5"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#003F87]">
                                        <LayoutGrid size={16} />
                                      </div>
                                      <h4 className="text-[13px] font-extrabold text-slate-700 uppercase tracking-wide group-hover:text-[#003F87] transition-colors m-0">
                                        {sub.title}
                                      </h4>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="text-[10px] font-bold text-slate-400 bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-100 uppercase tracking-wider">
                                        {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
                                      </span>
                                      <ChevronRight 
                                        className={`text-slate-300 group-hover:text-[#003F87] transition-transform duration-300 ${activeSubmoduleId === sub.id ? 'rotate-90' : ''}`} 
                                        size={18}
                                      />
                                    </div>
                                  </div>
                                  
                                  {activeSubmoduleId === sub.id && (
                                    <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-200/50 mt-1">
                                      {filteredTasks.length === 0 ? (
                                        <div className="text-slate-400 font-medium text-sm italic ml-2 py-2">No tasks found.</div>
                                      ) : (
                                        <div className="flex flex-col gap-3 animate-in fade-in duration-300 pt-3">
                                          {filteredTasks.map(task => {
                                            const isGraded = task.status === 'APPROVED' || task.gradeValue;
                                            const isSubmitted = task.status === 'PENDING_REVIEW' || isGraded;

                                            return (
                                              <div 
                                                key={task.id} 
                                                id={`task-${task.id}`}
                                                onClick={() => { if (mod.isUnlocked) toggleSection(task.id); }}
                                                className={`group flex flex-col p-4 rounded-xl border border-slate-100 bg-white ${mod.isUnlocked ? 'hover:border-[#003F87]/30 hover:shadow-sm cursor-pointer' : 'opacity-60 cursor-not-allowed'} transition-all scroll-mt-24`}
                                              >
                                                <div className="flex items-center justify-between gap-4">
                                                  <div className="flex items-center gap-4 flex-1">
                                                    <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center transition-colors ${task.type === 'PROJECT' ? 'bg-[#E5F0FF] text-[#003F87]' : 'bg-purple-50 text-purple-700'}`}>
                                                      {task.type === 'PROJECT' ? <FileText size={18} /> : <CheckSquare size={18} />}
                                                    </div>
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{task.type}</span>
                                                        
                                                        {task.status === 'NOT_STARTED' && (
                                                          <span className="text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Not Started</span>
                                                        )}
                                                        {task.status === 'IN_PROGRESS' && (
                                                          <span className="text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Started</span>
                                                        )}
                                                        {isSubmitted && !isGraded && (
                                                          <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                            <CheckCircle2 size={11} className="text-emerald-500" /> Completed
                                                          </span>
                                                        )}
                                                        {isGraded && (
                                                          <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                            <CheckCircle2 size={11} className="text-emerald-500" /> Graded
                                                          </span>
                                                        )}
                                                      </div>
                                                      <h5 className="font-bold text-slate-800 text-[15px] group-hover:text-[#003F87] transition-colors line-clamp-1">{task.title}</h5>
                                                    </div>
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-4 shrink-0">
                                                    {!mod.isUnlocked ? (
                                                      <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-md hidden sm:block">Locked</span>
                                                    ) : (
                                                      <>
                                                        {task.status === 'IN_PROGRESS' && (
                                                          <button 
                                                            onClick={(e) => { e.stopPropagation(); openSubmitModal(e, task); }}
                                                            className="bg-[#003F87] hover:bg-[#002b5e] text-white text-[11px] font-extrabold px-4 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 hidden sm:block"
                                                          >
                                                            Submit Work
                                                          </button>
                                                        )}
                                                        <button 
                                                          onClick={(e) => { e.stopPropagation(); openDetailsModal(task); }}
                                                          className="text-[11px] font-bold text-[#003F87] hover:underline hidden sm:block"
                                                        >
                                                          View Details
                                                        </button>
                                                      </>
                                                    )}
                                                    {isGraded && (
                                                      <div className="flex items-center gap-2 mr-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Grade</span>
                                                        <span className="text-xs font-black text-[#003F87] bg-[#E5F0FF] px-2 py-1 rounded-md">{task.gradeValue || 'A'}</span>
                                                      </div>
                                                    )}
                                                    <ChevronRight 
                                                      className={`text-slate-300 group-hover:text-[#003F87] transition-transform duration-300 ${expandedSections[task.id] ? 'rotate-90' : ''}`} 
                                                      size={20} 
                                                    />
                                                  </div>
                                                </div>

                                                {/* Expanded Details Row */}
                                                {expandedSections[task.id] && (
                                                  <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col gap-4 pl-[56px] pr-4 pb-2 animate-in fade-in slide-in-from-top-2 duration-300 cursor-default" onClick={(e) => e.stopPropagation()}>
                                                    <p className="text-sm text-slate-600 leading-relaxed">{task.description || "No description provided."}</p>
                                                    
                                                    {task.subtasks && task.subtasks.length > 0 && (
                                                      <div className="flex flex-col gap-2.5 mt-2">
                                                        <h5 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Subtasks</h5>
                                                        {task.subtasks.map(st => (
                                                          <div key={st.id} className="flex items-start gap-2.5 text-[13px] text-slate-500 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                                                            <span className="leading-snug">{st.title}</span>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
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
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ))
              )}
          </>
        );
        })()
      }
      </div>
      {/* Details Modal */}
      {isDetailsModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded
                  ${selectedTask.type === 'PROJECT' 
                    ? 'bg-[#E5F0FF] text-[#003F87]' 
                    : selectedTask.type === 'QUIZ' 
                      ? 'bg-purple-50 text-purple-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {selectedTask.type}
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-400 uppercase">{selectedTask.department}</span>
              </div>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
              <div>
                <h3 className="text-xl font-black text-slate-800 leading-snug mb-2">{selectedTask.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                  {selectedTask.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Status</span>
                  <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded w-fit block
                    ${selectedTask.status === 'NOT_STARTED' 
                      ? 'bg-slate-200 text-slate-600' 
                      : selectedTask.status === 'IN_PROGRESS' 
                        ? 'bg-blue-100 text-[#003F87]' 
                        : selectedTask.status === 'PENDING_REVIEW' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {selectedTask.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Due Date</span>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Calendar size={13} /> {selectedTask.dueText || selectedTask.dueDate}
                  </span>
                </div>
              </div>



              {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-3">Subtasks</span>
                  <ul className="flex flex-col gap-2">
                    {selectedTask.subtasks.sort((a, b) => a.sequence_order - b.sequence_order).map(st => (
                      <li key={st.id} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                        <div className="mt-1 w-4 h-4 rounded border-2 border-slate-300 shrink-0 flex items-center justify-center">
                          {/* Could be a checkbox if they are interactive */}
                        </div>
                        <span className="leading-snug">{st.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTask.feedback && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block mb-1">Teacher Remarks</span>
                  <p className="text-emerald-800 text-xs font-medium italic leading-relaxed">
                    "{selectedTask.feedback}"
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl text-sm transition-all"
                >
                  Close
                </button>
                {selectedTask.status === 'NOT_STARTED' && (
                  <button 
                    onClick={(e) => { handleStartTask(e, selectedTask); setIsDetailsModalOpen(false); }}
                    className="px-6 py-2.5 bg-[#003F87] hover:bg-[#002b5e] text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
                  >
                    Start Task Now
                  </button>
                )}
                {selectedTask.status === 'IN_PROGRESS' && (
                  <button 
                    onClick={(e) => { openSubmitModal(e, selectedTask); }}
                    className="px-6 py-2.5 bg-[#003F87] hover:bg-[#002b5e] text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
                  >
                    Submit Work
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {isSubmitModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800">Submit Your Work</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedTask.title}</p>
              </div>
              <button 
                onClick={() => setIsSubmitModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="p-6 flex flex-col gap-5">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Resource Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'LINK', label: 'Link', icon: LinkIcon },
                    { id: 'NOTE', label: 'Note/Text', icon: FileText },
                    { id: 'FILE', label: 'File/Image', icon: Upload }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setResourceType(item.id)}
                      className={`py-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all
                        ${resourceType === item.id 
                          ? 'border-[#003F87] bg-blue-50/30 text-[#003F87] font-black' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                        }`}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Label (Optional)</label>
                <input 
                  type="text" 
                  value={resourceLabel}
                  onChange={e => setResourceLabel(e.target.value)}
                  placeholder="e.g. GitHub Repository, Figma Design File"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  {resourceType === 'LINK' ? 'URL Link *' : resourceType === 'NOTE' ? 'Detailed Note Content *' : 'Upload File *'}
                </label>
                {resourceType === 'NOTE' ? (
                  <textarea 
                    rows={4}
                    required
                    value={resourceContent || ''}
                    onChange={e => setResourceContent(e.target.value)}
                    placeholder="Enter submission notes..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all resize-none"
                  />
                ) : resourceType === 'FILE' ? (
                  <input 
                    type="file"
                    required
                    onChange={e => setResourceFile(e.target.files[0])}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                ) : (
                  <input 
                    type="url"
                    required
                    value={resourceContent || ''}
                    onChange={e => setResourceContent(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#003F87] hover:bg-[#002b5e] text-white font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800">Review Feedback</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedTask.title}</p>
              </div>
              <button 
                onClick={() => setIsFeedbackModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100/10">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Final Grade</span>
                  <div className="text-xl font-black text-[#003F87] mt-0.5">{selectedTask.gradeValue || 'A- (92%)'}</div>
                </div>
                <div className="w-10 h-10 bg-[#003F87] rounded-xl flex items-center justify-center text-white">
                  <Check size={20} />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-2">Evaluator Remarks</span>
                <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 border border-slate-100 rounded-2xl p-4 font-medium italic">
                  "{selectedTask.feedback || 'Excellent submission! Well structure and thoroughly tested.'}"
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#003F87] hover:bg-[#002b5e] text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTasks;
