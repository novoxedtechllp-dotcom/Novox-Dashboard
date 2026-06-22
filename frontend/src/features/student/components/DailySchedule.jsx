import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronDown, MessageSquare, BookOpen, Send, Layers, CheckSquare, List, CalendarDays, ChevronLeft, ChevronRight, LayoutList, X, CheckCircle } from "lucide-react";
import CustomSelect from "../../../components/CustomSelect";

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
  const datePickerRef = useRef(null);
  const [dailyPlan, setDailyPlan] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);
  const [expandedSubmodule, setExpandedSubmodule] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

  const [reviewModals, setReviewModals] = useState({});
  const [reviewInput, setReviewInput] = useState({ review_text: '', rating: 0 });
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
      
      const submodules = data.data || [];
      
      submodules.sort((a, b) => {
         const aSeq = a.course_modules?.sequence_order || 0;
         const bSeq = b.course_modules?.sequence_order || 0;
         if (aSeq !== bSeq) return aSeq - bSeq;
         return (a.sequence_order || 0) - (b.sequence_order || 0);
      });

      // Sort tasks within submodules
      submodules.forEach(sm => {
        if (sm.course_tasks && Array.isArray(sm.course_tasks)) {
          sm.course_tasks.sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));
          sm.course_tasks.forEach(task => {
            if (task.course_task_subtasks && Array.isArray(task.course_task_subtasks)) {
              task.course_task_subtasks.sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));
            }
          });
        }
      });
      
      setDailyPlan(submodules);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (submoduleId) => {
    setReviewModals({ ...reviewModals, [submoduleId]: true });
    setReviewInput({ review_text: '', rating: 0 });
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

      const payload = {
        review_text: reviewInput.review_text,
        suggestion_text: `RATING:${reviewInput.rating}`
      };

      const res = await fetch(`/api/v1/courses/${courseId}/modules/${moduleId}/submodules/${submoduleId}/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
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
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Action Plan</h1>
          <p className="text-slate-500 mt-1">View assigned topics and provide feedback.</p>
        </div>

        <div className="bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-start gap-8 mb-8 w-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <BookOpen size={18} className="text-[#003F87]" /> Course
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center">
              <CustomSelect 
                value={selectedCourse}
                onChange={setSelectedCourse}
                options={[
                  { value: 'ALL', label: 'All Courses' },
                  ...Array.from(new Set(dailyPlan.map(sm => sm.course_modules?.courses?.name).filter(Boolean))).map(c => ({ value: c, label: c }))
                ]}
                className="w-[200px]"
                selectClassName="w-full bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer relative"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CalendarDays size={18} className="text-[#003F87]" /> Date
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <button onClick={handlePrevDay} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:text-[#003F87] hover:shadow-sm border border-slate-200 transition-all active:scale-95">
                <ChevronLeft size={18} />
              </button>
              
              <div className="relative inline-flex items-center bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                <DatePicker
                  ref={datePickerRef}
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="bg-transparent text-slate-800 text-sm font-bold outline-none cursor-pointer w-[125px] text-center pr-6"
                  showMonthDropdown
                  showYearDropdown
                  scrollableYearDropdown
                  dropdownMode="scroll"
                />
                <CalendarDays 
                  size={16} 
                  className="text-[#003F87] cursor-pointer absolute right-3" 
                  onClick={() => datePickerRef.current?.setFocus()} 
                />
              </div>

              <button onClick={handleNextDay} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:text-[#003F87] hover:shadow-sm border border-slate-200 transition-all active:scale-95">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-[#003F87] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Loading schedule...</p>
          </div>
        ) : dailyPlan.filter(sm => selectedCourse === 'ALL' || sm.course_modules?.courses?.name === selectedCourse).length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 font-medium shadow-sm flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
              <BookOpen size={40} className="opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">A Clear Day</h3>
            <p className="text-sm">You do not have any tasks or topics scheduled for this date matching the selected filter.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {dailyPlan.filter(sm => selectedCourse === 'ALL' || sm.course_modules?.courses?.name === selectedCourse).map((submodule, index, arr) => (
              <div key={submodule.id} className="relative pl-6 md:pl-10">
                {/* Timeline Line */}
                {index !== arr.length - 1 && <div className="absolute left-3 md:left-[19px] top-8 bottom-[-24px] w-[2px] bg-slate-200"></div>}
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-[10px] top-5 w-6 h-6 rounded-full bg-white border-[3px] border-[#003F87] shadow-sm z-10 flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#003F87] rounded-full"></div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
                  {/* Card Header */}
                  <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#003F87] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {submodule.course_modules?.courses?.name}
                        </span>
                        <span className="text-slate-400 text-xs font-bold">Mod {submodule.course_modules?.title}</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-800 leading-tight">
                        {submodule.title}
                      </h4>
                      {submodule.description && (
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-2xl">{submodule.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Card Body (Tasks) */}
                  <div className="p-6 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle size={14} className="text-slate-400" /> Tasks & Homework
                      </h5>
                      <button 
                        onClick={() => handleOpenReview(submodule.id)}
                        className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${reviewModals[submodule.id] ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-white border border-slate-200 text-[#003F87] hover:border-[#003F87] hover:bg-blue-50'}`}
                      >
                        <MessageSquare size={14} /> Rate & Review
                      </button>
                    </div>

                    {/* Review Inline Modal */}
                    {reviewModals[submodule.id] && (
                      <div className="mb-6 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <MessageSquare size={16} className="text-[#003F87]"/> Your Feedback
                          </h4>
                          <button onClick={() => setReviewModals({...reviewModals, [submodule.id]: false})} className="text-slate-400 hover:text-slate-600">
                            <X size={16} />
                          </button>
                        </div>
                        
                        <div className="flex gap-1 mb-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 w-fit">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button 
                              key={star}
                              onClick={() => setReviewInput({...reviewInput, rating: star})}
                              className="focus:outline-none hover:scale-110 transition-transform"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={star <= reviewInput.rating ? "#f59e0b" : "none"} stroke={star <= reviewInput.rating ? "#f59e0b" : "#d1d5db"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                            </button>
                          ))}
                          {reviewInput.rating > 0 && (
                            <span className="ml-3 text-xs font-black text-amber-600 uppercase tracking-widest bg-amber-100 px-2 py-1 rounded-md">
                              {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewInput.rating - 1]}
                            </span>
                          )}
                        </div>

                        <textarea 
                          placeholder="What did you think of this topic?"
                          value={reviewInput.review_text}
                          onChange={e => setReviewInput({...reviewInput, review_text: e.target.value})}
                          className="w-full text-sm p-4 border border-slate-200 rounded-xl outline-none focus:border-[#003F87] focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 focus:bg-white resize-none"
                          rows="3"
                        />
                        <div className="flex justify-end mt-4">
                          <button disabled={submittingReview} onClick={() => handleSubmitReview(submodule.course_modules.course_id, submodule.module_id, submodule.id)} className="px-6 py-2.5 text-sm font-bold bg-[#003F87] text-white rounded-xl hover:bg-[#002B5E] active:scale-95 transition-all flex items-center gap-2 shadow-md">
                            {submittingReview ? 'Submitting...' : <><Send size={16} /> Submit Feedback</>}
                          </button>
                        </div>
                      </div>
                    )}

                    {!submodule.course_tasks || submodule.course_tasks.length === 0 ? (
                      <div className="py-4 px-4 bg-white border border-dashed border-slate-200 rounded-xl flex items-center gap-3 text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0"><CheckCircle size={14} /></div>
                        <p className="text-sm font-medium">No specific tasks defined.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {submodule.course_tasks.map(task => (
                          <div key={task.id} className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center shrink-0 bg-slate-50 text-slate-300 cursor-pointer hover:border-emerald-500 hover:text-emerald-500 transition-colors">
                                <CheckSquare size={16} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="text-base font-bold text-slate-800">{task.title}</span>
                                  {task.task_type === 'EXTRA' && (
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">Bonus</span>
                                  )}
                                </div>
                                {task.description && <div className="text-sm text-slate-500 mt-1 font-medium">{task.description}</div>}
                              </div>
                            </div>
                            {/* Subtasks */}
                            {task.course_task_subtasks && task.course_task_subtasks.length > 0 && (
                              <div className="ml-12 flex flex-col gap-2 pl-4 border-l-2 border-slate-100">
                                {task.course_task_subtasks.map(st => (
                                  <div key={st.id} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <List size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                      <div className="text-xs font-bold text-slate-700">{st.title}</div>
                                      {st.description && <div className="text-[11px] text-slate-500 mt-0.5">{st.description}</div>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
