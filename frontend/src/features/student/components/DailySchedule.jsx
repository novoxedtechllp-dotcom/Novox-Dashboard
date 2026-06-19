import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronDown, MessageSquare, BookOpen, Send, Layers, CheckSquare, List, CalendarDays, ChevronLeft, ChevronRight, LayoutList, X, CheckCircle } from "lucide-react";

const getLocalDateString = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DailySchedule = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyPlan, setDailyPlan] = useState([]);
  
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);
  const [expandedSubmodule, setExpandedSubmodule] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

  const [reviewModals, setReviewModals] = useState({});
  const [reviewInput, setReviewInput] = useState({ review_text: '', suggestion_text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, isError = false) => {
    setToast({ message, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchDailyPlan();
  }, [selectedDate]);

  const fetchDailyPlan = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const studentId = userInfo?.student_profile_id;
      const token = userInfo?.token;
      
      if (!studentId || !token) return;

      const dateStr = getLocalDateString(selectedDate);
      const headers = { Authorization: `Bearer ${token}` };
      
      const res = await fetch(`/api/v1/students/${studentId}/daily-plan?date=${dateStr}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch daily plan');
      const data = await res.json();
      
      // Group the returned submodules by course and module
      const grouped = {};
      const submodules = data.data || [];
      
      submodules.forEach(sm => {
        const courseId = sm.course_modules?.course_id;
        const courseName = sm.course_modules?.courses?.name;
        const moduleId = sm.course_modules?.id;
        const moduleTitle = sm.course_modules?.title;
        const moduleSequence = sm.course_modules?.sequence_order || 0;
        
        // Sort tasks within this submodule
        if (sm.course_tasks && Array.isArray(sm.course_tasks)) {
          sm.course_tasks.sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));
          // Also sort subtasks
          sm.course_tasks.forEach(task => {
            if (task.course_task_subtasks && Array.isArray(task.course_task_subtasks)) {
              task.course_task_subtasks.sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));
            }
          });
        }
        
        if (!grouped[courseId]) {
          grouped[courseId] = { id: courseId, name: courseName, modules: {} };
        }
        if (!grouped[courseId].modules[moduleId]) {
          grouped[courseId].modules[moduleId] = { 
            id: moduleId, 
            title: moduleTitle, 
            sequence_order: moduleSequence,
            submodules: [] 
          };
        }
        grouped[courseId].modules[moduleId].submodules.push(sm);
      });
      
      setDailyPlan(Object.values(grouped).map(c => ({
        ...c,
        modules: Object.values(c.modules).sort((a, b) => a.sequence_order - b.sequence_order)
      })));
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (submoduleId) => {
    setReviewModals({ ...reviewModals, [submoduleId]: true });
    setReviewInput({ review_text: '', suggestion_text: '' });
  };

  const handleSubmitReview = async (courseId, moduleId, submoduleId) => {
    if (!reviewInput.review_text.trim()) return showToast("Review text is required", true);
    
    setSubmittingReview(true);
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const headers = { 
        Authorization: `Bearer ${userInfo?.token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`/api/v1/courses/${courseId}/modules/${moduleId}/submodules/${submoduleId}/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reviewInput)
      });
      
      if (!res.ok) throw new Error("Failed to submit review");
      
      showToast("Review submitted successfully!");
      setReviewModals({ ...reviewModals, [submoduleId]: false });
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 bg-[#FAFBFC] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Action Plan</h1>
            <p className="text-slate-500 mt-1">View your assigned topics and tasks for the day, and provide feedback on your modules.</p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between mb-8">
          <button onClick={handlePrevDay} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-[#003F87] hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <CalendarDays size={20} className="text-[#003F87]" />
            <div className="relative inline-flex items-center">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="MMMM d, yyyy"
                className="bg-transparent text-slate-800 text-lg font-bold outline-none cursor-pointer w-[160px] text-center"
              />
            </div>
          </div>

          <button onClick={handleNextDay} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-[#003F87] hover:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-[#003F87] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Loading schedule...</p>
          </div>
        ) : dailyPlan.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 font-medium shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <LayoutList size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Topics Scheduled</h3>
            <p className="text-sm">You do not have any tasks or topics scheduled for this date.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dailyPlan.map(course => (
              <div key={course.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Course Header */}
                <div 
                  className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-[#003F87] rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 leading-tight">{course.name}</h2>
                    </div>
                  </div>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform ${expandedCourse === course.id ? 'rotate-180' : ''}`} />
                </div>

                {/* Modules */}
                {expandedCourse === course.id && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-6 flex flex-col gap-4">
                    {course.modules.map(m => (
                      <div key={m.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-blue-200 transition-colors">
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50" onClick={() => setExpandedModule(expandedModule === m.id ? null : m.id)}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#003F87] font-black flex items-center justify-center text-sm">M</div>
                            <div>
                              <h3 className="text-base font-bold text-slate-800">{m.title}</h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <ChevronDown size={18} className={`text-slate-400 transition-transform ${expandedModule === m.id ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* Submodules */}
                        {expandedModule === m.id && (
                          <div className="border-t border-slate-100 p-4 bg-slate-50 flex flex-col gap-3">
                            {m.submodules.sort((a,b)=>a.sequence_order - b.sequence_order).map(sm => (
                              <div key={sm.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50" onClick={() => setExpandedSubmodule(expandedSubmodule === sm.id ? null : sm.id)}>
                                  <div className="flex items-center gap-3">
                                    <Layers size={16} className="text-[#003F87]" />
                                    <div className="text-sm font-semibold text-slate-700">{sm.title}</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleOpenReview(sm.id); }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#003F87] text-[10px] font-bold rounded hover:bg-blue-100 transition-colors"
                                    >
                                      <MessageSquare size={12} /> Review & Suggest
                                    </button>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${expandedSubmodule === sm.id ? 'rotate-180' : ''}`} />
                                  </div>
                                </div>

                                {/* Review Modal inline */}
                                {reviewModals[sm.id] && (
                                  <div className="p-3 border-t border-blue-100 bg-blue-50/30 flex flex-col gap-2">
                                    <h4 className="text-xs font-bold text-[#003F87] mb-1">Submit Feedback for {sm.title}</h4>
                                    <textarea 
                                      placeholder="Write your review here..."
                                      value={reviewInput.review_text}
                                      onChange={e => setReviewInput({...reviewInput, review_text: e.target.value})}
                                      className="w-full text-xs p-2 border border-blue-200 rounded outline-none focus:border-[#003F87] bg-white resize-none"
                                      rows="2"
                                    />
                                    <textarea 
                                      placeholder="Any suggestions for improvement?"
                                      value={reviewInput.suggestion_text}
                                      onChange={e => setReviewInput({...reviewInput, suggestion_text: e.target.value})}
                                      className="w-full text-xs p-2 border border-blue-200 rounded outline-none focus:border-[#003F87] bg-white resize-none"
                                      rows="2"
                                    />
                                    <div className="flex justify-end gap-2 mt-1">
                                      <button onClick={() => setReviewModals({...reviewModals, [sm.id]: false})} className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded transition-colors">Cancel</button>
                                      <button disabled={submittingReview} onClick={() => handleSubmitReview(course.id, m.id, sm.id)} className="px-3 py-1.5 text-[10px] font-bold bg-[#003F87] text-white rounded hover:bg-[#002B5E] transition-colors flex items-center gap-1">
                                        {submittingReview ? 'Submitting...' : <><Send size={12} /> Submit Feedback</>}
                                      </button>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Tasks */}
                                {expandedSubmodule === sm.id && (
                                  <div className="border-t border-slate-100 p-3 bg-slate-50 pl-8 flex flex-col gap-2">
                                    {sm.course_tasks?.length === 0 ? (
                                      <p className="text-xs italic text-slate-400">No tasks assigned for today.</p>
                                    ) : (
                                      sm.course_tasks?.sort((a,b)=>a.sequence_order - b.sequence_order).map(t => (
                                        <div key={t.id} className="bg-white border border-slate-200 rounded-md overflow-hidden">
                                          <div className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50" onClick={() => setExpandedTask(expandedTask === t.id ? null : t.id)}>
                                            <div className="flex items-center gap-2">
                                              <CheckSquare size={14} className="text-emerald-600" />
                                              <div className="text-xs font-semibold text-slate-800">{t.title}</div>
                                              {t.task_type === 'EXTRA' && <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-100 text-amber-700 uppercase">Bonus</span>}
                                            </div>
                                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${expandedTask === t.id ? 'rotate-180' : ''}`} />
                                          </div>
                                          
                                          {/* Subtasks */}
                                          {expandedTask === t.id && (
                                            <div className="border-t border-slate-100 p-2.5 bg-slate-50 pl-6 flex flex-col gap-1.5">
                                              {t.course_task_subtasks?.length === 0 ? (
                                                <p className="text-[10px] italic text-slate-400">No specific steps.</p>
                                              ) : (
                                                t.course_task_subtasks?.sort((a,b)=>a.sequence_order - b.sequence_order).map(st => (
                                                  <div key={st.id} className="flex items-start gap-2 bg-white p-2 rounded border border-slate-100">
                                                    <List size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                                    <div>
                                                      <div className="text-[11px] font-bold text-slate-700 leading-tight">{st.title}</div>
                                                      {st.description && <div className="text-[10px] text-slate-500 mt-0.5">{st.description}</div>}
                                                    </div>
                                                  </div>
                                                ))
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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

export default DailySchedule;
