import React, { useState, useEffect } from 'react';
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
  LayoutGrid
} from 'lucide-react';

const StudentTasks = ({ userInfo }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, HOMEWORK, QUIZ, PROJECT
  
  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Submit form state
  const [resourceType, setResourceType] = useState('LINK');
  const [resourceContent, setResourceContent] = useState('');
  const [resourceLabel, setResourceLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const studentId = userInfo?.student_profile_id || userInfo?.id;
  const token = userInfo?.token || sessionStorage.getItem('token');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`/api/v1/students/${studentId}/tasks`, { headers });
      
      if (res.ok) {
        const resData = await res.json();
        const apiTasks = resData.data || [];
        
        const formatted = apiTasks.map(t => {
          let columnStatus = 'NOT_STARTED';
          if (t.status === 'IN_PROGRESS') {
            columnStatus = 'IN_PROGRESS';
          } else if (t.status === 'PENDING_REVIEW') {
            columnStatus = 'PENDING_REVIEW';
          } else if (t.status === 'APPROVED') {
            columnStatus = 'APPROVED';
          } else if (t.status === 'PENDING') {
            columnStatus = 'NOT_STARTED';
          }

          // Format due text (e.g. calculation if due date exists)
          let dueText = 'No Date';
          let dueType = 'normal';
          if (t.course_tasks?.due_date) {
            const dueDate = new Date(t.course_tasks.due_date);
            const today = new Date();
            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
              dueText = 'Overdue';
              dueType = 'urgent';
            } else if (diffDays === 0) {
              dueText = 'Due Today';
              dueType = 'urgent';
            } else if (diffDays === 1) {
              dueText = 'Due Tomorrow';
              dueType = 'tomorrow';
            } else {
              dueText = `${diffDays} Days Left`;
              dueType = diffDays <= 2 ? 'urgent' : 'normal';
            }
          }

          return {
            id: t.id,
            title: t.course_tasks?.title || 'Untitled Task',
            description: t.course_tasks?.description || '',
            type: t.course_tasks?.task_type || 'HOMEWORK',
            status: columnStatus,
            dueText: dueText,
            dueType: dueType,
            dueDate: t.course_tasks?.due_date ? new Date(t.course_tasks.due_date).toLocaleDateString() : 'No Date',
            department: t.course_tasks?.course_submodules?.course_modules?.courses?.name || 'General',
            gradeValue: t.status === 'APPROVED' ? (t.review_comment ? 'Graded' : 'Approved') : null,
            feedback: t.review_comment || '',
            completion: t.status === 'APPROVED' ? 100 : (t.status === 'IN_PROGRESS' ? 75 : 0),
            isReal: true,
            raw: t
          };
        });
        setTasks(formatted);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId && token) {
      fetchTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [studentId, token]);

  const handleStartTask = async (e, task) => {
    e.stopPropagation();
    if (task.isReal) {
      try {
        const headers = { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        const res = await fetch(`/api/v1/students/${studentId}/tasks/${task.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status: 'IN_PROGRESS' })
        });
        
        if (res.ok) {
          fetchTasks();
        }
      } catch (error) {
        console.error('Failed to start task:', error);
      }
    }
  };

  const openSubmitModal = (e, task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setResourceContent('');
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
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!resourceContent.trim()) {
      setErrorMsg('Please provide submission link or note content.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const payload = {
      resources: [
        {
          resource_type: resourceType,
          content: resourceContent.trim(),
          label: resourceLabel.trim() || `${selectedTask.title} Submission`
        }
      ]
    };

    if (selectedTask.isReal) {
      try {
        const headers = { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        const res = await fetch(`/api/v1/students/${studentId}/tasks/${selectedTask.id}/submit`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          setIsSubmitModalOpen(false);
          setIsDetailsModalOpen(false);
          fetchTasks();
        } else {
          const errData = await res.json();
          setErrorMsg(errData.message || 'Submission failed.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Network error occurred.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const filteredTasks = tasks.filter(t => {
    return activeFilter === 'ALL' || t.type.toUpperCase() === activeFilter.toUpperCase();
  });

  const notStartedTasks = filteredTasks.filter(t => t.status === 'NOT_STARTED');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
  const submittedTasks = filteredTasks.filter(t => t.status === 'PENDING_REVIEW' || t.status === 'APPROVED');

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
      
      {/* Header & Tabs matching Figma dimensions (972 Fill x 96 Hug) */}
      <div className="max-w-7xl mx-auto w-full mb-6 border-b border-slate-100 pb-0 md:h-24 md:min-h-[96px] flex flex-col md:flex-row md:items-end justify-between">
        <div className="mb-4 md:mb-0 pb-3 flex flex-col justify-end h-full">
          <h1 className="text-[28px] font-extrabold text-[#003F87] leading-none mb-1.5 tracking-tight">Student Tasks</h1>
          <p className="text-slate-500 font-medium text-[13px] max-w-xl leading-relaxed">
            Manage your upcoming assignments, track project milestones, and review completed work feedback.
          </p>
        </div>
        
        {/* Right Aligned Tabs */}
        <div className="flex gap-6 shrink-0 pb-0">
          {[
            { id: 'ALL', label: 'All Tasks' },
            { id: 'QUIZ', label: 'Quiz' },
            { id: 'PROJECT', label: 'Project' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap outline-none
                ${activeFilter === tab.id 
                  ? 'text-[#003F87] font-black border-b-2 border-[#003F87]' 
                  : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Board Layout */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#003F87] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* COLUMN 1: Not Started */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
              <h2 className="text-sm font-bold text-slate-800">Not Started</h2>
              <span className="bg-slate-200/80 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {notStartedTasks.length}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {notStartedTasks.length === 0 ? (
                <div className="border border-dashed border-slate-200 bg-white/50 rounded-2xl p-8 text-center text-slate-400 font-medium text-xs">
                  No tasks here
                </div>
              ) : (
                notStartedTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => openDetailsModal(task)}
                    className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[190px] cursor-pointer group"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3.5">
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded
                          ${task.type === 'PROJECT' 
                            ? 'bg-[#E5F0FF] text-[#003F87]' 
                            : task.type === 'QUIZ' 
                              ? 'bg-purple-50 text-purple-700' 
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {task.type}
                        </span>
                        
                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          {task.dueType === 'urgent' ? (
                            <span className="text-rose-500 flex items-center gap-1">
                              <Clock size={12} className="animate-pulse" /> {task.dueText || '2 Days Left'}
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-1 font-semibold">
                              <Calendar size={12} /> {task.dueText || task.dueDate}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-[15px] font-extrabold text-slate-800 leading-snug mb-1 group-hover:text-[#003F87] transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed font-semibold mb-5 line-clamp-2">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-3.5 border-t border-slate-50">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center">
                        {renderDeptIcon(task.department)} {task.department}
                      </span>
                      <button 
                        onClick={(e) => handleStartTask(e, task)}
                        className="bg-[#003F87] hover:bg-[#002b5e] text-white text-[11px] font-extrabold px-4.5 py-1.5 rounded-lg transition-all shadow-sm active:scale-95"
                      >
                        Start Task
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: In Progress */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
              <h2 className="text-sm font-bold text-slate-800">In Progress</h2>
              <span className="bg-[#E5F0FF] text-[#003F87] text-xs font-bold px-2 py-0.5 rounded-full">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {inProgressTasks.length === 0 ? (
                <div className="border border-dashed border-slate-200 bg-white/50 rounded-2xl p-8 text-center text-slate-400 font-medium text-xs">
                  No tasks here
                </div>
              ) : (
                inProgressTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => openDetailsModal(task)}
                    className="bg-white rounded-2xl border-2 border-blue-100 p-5 shadow-[0_4px_15px_rgba(0,63,135,0.02)] hover:shadow-[0_12px_36px_rgba(0,63,135,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[210px] cursor-pointer group"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3.5">
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#003F87] text-white`}>
                          {task.type}
                        </span>
                        
                        <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 3v18h18" />
                            <path d="m19 9-5 5-4-4-3 3" />
                          </svg>
                          <span>{task.dueText || 'Due Tomorrow'}</span>
                        </div>
                      </div>

                      <h3 className="text-[15px] font-extrabold text-slate-800 leading-snug mb-1 group-hover:text-[#003F87] transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed font-semibold mb-4 line-clamp-2">
                        {task.description}
                      </p>

                      <div className="mb-5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase mb-1">
                          <span>Completion</span>
                          <span className="text-slate-600 font-extrabold">{task.completion || 75}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#003F87] h-full rounded-full transition-all duration-500"
                            style={{ width: `${task.completion || 75}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3.5 border-t border-slate-50">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center">
                        {renderDeptIcon(task.department)} {task.department}
                      </span>
                      <button 
                        onClick={(e) => openSubmitModal(e, task)}
                        className="bg-[#003F87] hover:bg-[#002b5e] text-white text-[11px] font-extrabold px-4.5 py-1.5 rounded-lg transition-all shadow-sm active:scale-95"
                      >
                        Submit Work
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: Submitted */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
              <h2 className="text-sm font-bold text-slate-800">Submitted</h2>
              <span className="bg-slate-200/80 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {submittedTasks.length}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {submittedTasks.length === 0 ? (
                <div className="border border-dashed border-slate-200 bg-white/50 rounded-2xl p-8 text-center text-slate-400 font-medium text-xs">
                  No submissions yet
                </div>
              ) : (
                submittedTasks.map(task => {
                  const isGraded = task.status === 'APPROVED' || task.gradeValue;
                  
                  return (
                    <div 
                      key={task.id} 
                      onClick={() => openDetailsModal(task)}
                      className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[170px] cursor-pointer group"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3.5">
                          <span className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded bg-slate-100 text-slate-400">
                            {task.type}
                          </span>
                          
                          <div className="flex items-center gap-1 text-[11px] font-bold">
                            {isGraded ? (
                              <span className="text-emerald-600 flex items-center gap-0.5">
                                <CheckCircle2 size={12} className="text-emerald-500" /> Graded
                              </span>
                            ) : (
                              <span className="text-amber-500 flex items-center gap-0.5">
                                <Clock size={12} className="text-amber-500" /> Pending Review
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-[15px] font-extrabold text-slate-800 leading-snug mb-1 group-hover:text-[#003F87] transition-colors">
                          {task.title}
                        </h3>
                        {!isGraded && (
                          <p className="text-slate-400 text-xs leading-relaxed font-semibold mb-4 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {isGraded && (
                          <div className="bg-[#E5F0FF]/50 border border-blue-50/20 rounded-xl p-3.5 mb-4 flex justify-between items-center">
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Grade</div>
                              <div className="text-sm font-extrabold text-[#003F87]">{task.gradeValue || 'A- (92%)'}</div>
                            </div>
                            <button 
                              onClick={(e) => openFeedbackModal(e, task)}
                              className="text-xs font-bold text-[#003F87] hover:underline flex items-center gap-0.5"
                            >
                              View Feedback <ArrowRight size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-3.5 border-t border-slate-50">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center">
                          {renderDeptIcon(task.department)} {task.department}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

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

              {selectedTask.status === 'IN_PROGRESS' && (
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                    <span>Task Completion</span>
                    <span className="text-slate-600 font-extrabold">{selectedTask.completion}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#003F87] h-full rounded-full" style={{ width: `${selectedTask.completion}%` }}></div>
                  </div>
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
                  {resourceType === 'LINK' ? 'URL Link *' : resourceType === 'NOTE' ? 'Detailed Note Content *' : 'File URL / Path *'}
                </label>
                {resourceType === 'NOTE' ? (
                  <textarea 
                    rows={4}
                    required
                    value={resourceContent}
                    onChange={e => setResourceContent(e.target.value)}
                    placeholder="Enter submission notes..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all resize-none"
                  />
                ) : (
                  <input 
                    type="url"
                    required
                    value={resourceContent}
                    onChange={e => setResourceContent(e.target.value)}
                    placeholder={resourceType === 'LINK' ? "https://github.com/..." : "https://cloudinary-file-link..."}
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
