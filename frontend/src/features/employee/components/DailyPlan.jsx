import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, BookOpen, CheckCircle, Plus, LayoutList, X, ChevronDown, ChevronRight, ChevronLeft, CalendarDays, Clock, User, MessageSquare } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

const getAuthHeaders = () => {
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
  if (!userInfo?.token) return null;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userInfo.token}`
  };
};

const parseApiResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const formatDateDDMMYYYY = (value) => {
  if (!value) return '';
  const [year, month, day] = String(value).split('T')[0].split('-');
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year}`;
};

const formatWeekday = (value) => {
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return '';
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'long' });
};

const isWeekendDate = (value) => {
  const [year, month, day] = String(value || '').split('-').map(Number);
  if (!year || !month || !day) return false;
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

const getLocalDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DailyPlan = ({ userType, userId }) => {
  const [toast, setToast] = useState(null);
  const alert = (message) => {
    const isError = typeof message === 'string' && (message.toLowerCase().includes('failed') || message.toLowerCase().includes('error'));
    setToast({ message, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [dailyPlan, setDailyPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTaskVisible, setNewTaskVisible] = useState(null); 
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [availableTopics, setAvailableTopics] = useState([]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedAdminEmployeeId, setSelectedAdminEmployeeId] = useState('');
  const [reviews, setReviews] = useState([]);

  // Date array for custom date selector (3 days before, today, 3 days after)
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    // Generate dates around selected date
    const centerDate = new Date(selectedDate);
    const range = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(centerDate);
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      range.push({
        dateString: `${year}-${month}-${day}`,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        isToday: `${year}-${month}-${day}` === getLocalDateString()
      });
    }
    setDateRange(range);
  }, [selectedDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  useEffect(() => {
    if (userType === 'ADMIN') {
      const fetchEmployees = async () => {
        try {
          const headers = getAuthHeaders();
          if (!headers) return;
          const response = await fetch('/api/v1/employees', { headers });
          const resData = await parseApiResponse(response);
          const emps = resData.data?.employees || resData.data || [];
          setEmployeesList(emps);
          if (emps.length > 0) setSelectedAdminEmployeeId(emps[0].id);
        } catch (error) {
           console.error('Error fetching employees:', error);
        }
      };
      fetchEmployees();
    }
  }, [userType]);

  useEffect(() => {
    fetchDailyPlan();
    fetchAvailableTopics();
    if (userType === 'ADMIN' || userType === 'EMPLOYEE') fetchReviews();
  }, [selectedDate, userType, userId, selectedAdminEmployeeId]);

  const fetchReviews = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/v1/courses/daily-plan/reviews', { headers });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDailyPlan = async () => {
    if (!userId && userType !== 'ADMIN') return;
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      let endpoint = '';
      if (userType === 'STUDENT') {
        endpoint = `/api/v1/students/${userId}/daily-plan?date=${selectedDate}`;
      } else if (userType === 'ADMIN') {
        if (!selectedAdminEmployeeId) {
          setDailyPlan([]);
          setLoading(false);
          return;
        }
        endpoint = `/api/v1/employees/${selectedAdminEmployeeId}/daily-plan?date=${selectedDate}`;
      } else {
        endpoint = `/api/v1/employees/${userId}/daily-plan?date=${selectedDate}`;
      }

      const response = await fetch(endpoint, { headers });
      const resData = await parseApiResponse(response);
      setDailyPlan(resData.data || []);
    } catch (error) {
      console.error('Error fetching daily plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTopics = async () => {
    if (userType !== 'EMPLOYEE' || !userId) return;
    if (isWeekendDate(selectedDate)) {
      setAvailableTopics([]);
      return;
    }
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`/api/v1/employees/${userId}/available-topics?date=${selectedDate}`, { headers });
      const resData = await parseApiResponse(response);
      const topics = resData.data || [];
      setAvailableTopics(topics);
    } catch (error) {
      console.error('Error fetching available topics:', error);
      setAvailableTopics([]);
    }
  };

  const handleToggleTopic = async (topicId, isScheduled) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/v1/employees/${userId}/topics/${topicId}/schedule`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ scheduled_date: isScheduled ? selectedDate : null })
      });
      await parseApiResponse(response);
      setAvailableTopics(prev => prev.map(t => t.id === topicId ? { ...t, scheduled_date: isScheduled ? selectedDate : null } : t));
    } catch (error) {
      console.error('Error updating topic:', error);
      throw error;
    }
  };

  const handleToggleModule = async (moduleId, isScheduled) => {
    const submodules = availableTopics.filter(t => t.module_id === moduleId);
    if (submodules.length === 0) return;
    setTopicLoading(true);
    try {
      await Promise.all(submodules.map(t => handleToggleTopic(t.id, isScheduled)));
      await fetchDailyPlan();
    } catch (error) {
      alert('Failed to update some topics in module');
    } finally {
      setTopicLoading(false);
    }
  };

  const handleToggleSingleTopic = async (topicId, isScheduled) => {
    setTopicLoading(true);
    try {
      await handleToggleTopic(topicId, isScheduled);
      await fetchDailyPlan();
    } catch (error) {
      alert('Failed to update topic schedule');
    } finally {
      setTopicLoading(false);
    }
  };

  const handleAddExtraTask = async (e, moduleId, submoduleId) => {
    e.preventDefault();
    if (!newTask.title) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const submodule = dailyPlan.find(sm => sm.id === submoduleId);
      if (!submodule) return;
      const courseId = submodule.course_modules.course_id;

      const response = await fetch(`/api/v1/courses/${courseId}/modules/${moduleId}/submodules/${submoduleId}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          sequence_order: 99,
          task_type: 'EXTRA',
          due_date: selectedDate
        })
      });
      
      await parseApiResponse(response);
      alert('Extra task added successfully!');
      setNewTask({ title: '', description: '' });
      setNewTaskVisible(null);
      fetchDailyPlan(); 
    } catch (error) {
      console.error('Error adding extra task:', error);
      alert(error.message || 'Failed to add extra task');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 h-full bg-[#FAFBFC] relative overflow-hidden">
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[9999] px-6 py-4 rounded-xl shadow-2xl font-bold text-sm transform transition-all duration-300 flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-800 text-white'}`}>
          {toast.type === 'error' ? <X size={18} /> : <CheckCircle size={18} className="text-green-400" />}
          {toast.message}
        </div>
      )}

      {/* Header & Date Navigation Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Action Plan</h2>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <CalendarDays size={14} /> Plan and manage your curriculum seamlessly.
          </p>
        </div>

        {/* Custom Date Navigator */}
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <button onClick={handlePrevDay} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-600 hover:text-[#003F87] hover:shadow-sm border border-slate-200 transition-all active:scale-95">
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex gap-2">
            {dateRange.map((d, i) => (
              <button 
                key={i}
                onClick={() => setSelectedDate(d.dateString)}
                className={`
                  flex flex-col items-center justify-center w-12 h-14 rounded-xl transition-all
                  ${d.dateString === selectedDate 
                    ? 'bg-[#003F87] text-white shadow-md scale-105 font-bold border border-blue-600' 
                    : 'bg-transparent text-slate-600 hover:bg-white hover:shadow-sm font-medium border border-transparent hover:border-slate-200'
                  }
                `}
              >
                <span className={`text-[10px] uppercase ${d.dateString === selectedDate ? 'text-blue-200' : 'text-slate-400'}`}>{d.dayName}</span>
                <span className="text-lg leading-none mt-1">{d.dayNumber}</span>
                {d.isToday && <span className={`w-1 h-1 rounded-full mt-1 ${d.dateString === selectedDate ? 'bg-white' : 'bg-[#003F87]'}`}></span>}
              </button>
            ))}
          </div>

          <button onClick={handleNextDay} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-600 hover:text-[#003F87] hover:shadow-sm border border-slate-200 transition-all active:scale-95">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100%-120px)]">
        {/* Left Sidebar (Controls) */}
        {(userType === 'ADMIN' || userType === 'EMPLOYEE') && (
          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
            
            {userType === 'ADMIN' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <User size={14} />
                  </div>
                  <h3 className="font-bold text-slate-800">Select Staff</h3>
                </div>
                <div className="relative">
                  <select
                    value={selectedAdminEmployeeId}
                    onChange={(e) => setSelectedAdminEmployeeId(e.target.value)}
                    className="w-full p-3.5 pl-4 pr-10 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#003F87] focus:ring-4 focus:ring-[#003F87]/10 bg-slate-50 appearance-none cursor-pointer transition-all hover:bg-slate-100"
                  >
                    {employeesList.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {userType === 'EMPLOYEE' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors z-0"></div>
                <div className="relative z-10 flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#003F87] to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/20 mb-2">
                    <LayoutList size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">Manage Curriculum</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Add or remove topics for the selected day.</p>
                  </div>
                  <button
                    onClick={() => setIsCurriculumModalOpen(true)}
                    disabled={isWeekendDate(selectedDate)}
                    className="w-full py-3.5 mt-2 bg-[#003F87] hover:bg-[#002B5E] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 text-white text-sm font-bold rounded-xl cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-blue-900/10"
                  >
                    <Plus size={18} /> Edit Topics
                  </button>
                  {isWeekendDate(selectedDate) && (
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Weekends are disabled</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Curriculum Area */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {formatWeekday(selectedDate)}'s Schedule
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{formatDateDDMMYYYY(selectedDate)}</p>
            </div>
            {isWeekendDate(selectedDate) && (
              <div className="px-4 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200 flex items-center gap-1.5">
                <Clock size={12} /> Weekend Mode
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
            {loading ? (
              <div className="h-full flex items-center justify-center"><LoadingSpinner text="Fetching schedule..." /></div>
            ) : dailyPlan.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-10 text-center max-w-sm mx-auto">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-slate-300 shadow-sm border border-slate-100">
                  <BookOpen size={40} className="opacity-50" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">A Clear Day</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">You have no topics or tasks scheduled for this date.</p>
                {userType === 'EMPLOYEE' && !isWeekendDate(selectedDate) && (
                  <button onClick={() => setIsCurriculumModalOpen(true)} className="px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-[#003F87] hover:text-[#003F87] transition-colors">
                    Add Topics Now
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                {dailyPlan.map((submodule, index) => (
                  <div key={submodule.id} className="relative pl-6 md:pl-10">
                    {/* Timeline Line */}
                    {index !== dailyPlan.length - 1 && <div className="absolute left-3 md:left-[19px] top-8 bottom-[-24px] w-[2px] bg-slate-200"></div>}
                    {/* Timeline Dot */}
                    <div className="absolute left-0 md:left-[10px] top-5 w-6 h-6 rounded-full bg-white border-[3px] border-[#003F87] shadow-sm z-10 flex items-center justify-center">
                      <div className="w-2 h-2 bg-[#003F87] rounded-full"></div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
                      {/* Card Header */}
                      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white relative overflow-hidden">
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
                      <div className="p-5 bg-slate-50/50">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle size={14} className="text-slate-400" /> Tasks & Homework
                          </h5>
                          {(userType === 'EMPLOYEE' || userType === 'ADMIN') && (
                            <button 
                              onClick={() => setNewTaskVisible(newTaskVisible === submodule.id ? null : submodule.id)}
                              className={`
                                text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all
                                ${newTaskVisible === submodule.id ? 'bg-slate-200 text-slate-700' : 'bg-white border border-slate-200 text-[#003F87] hover:border-blue-300 hover:bg-blue-50'}
                              `}
                            >
                              {newTaskVisible === submodule.id ? <X size={14} /> : <Plus size={14} />} 
                              {newTaskVisible === submodule.id ? 'Cancel' : 'Add Task'}
                            </button>
                          )}
                        </div>

                        {!submodule.course_tasks || submodule.course_tasks.length === 0 ? (
                          <div className="py-4 px-4 bg-white border border-dashed border-slate-200 rounded-xl flex items-center gap-3 text-slate-400">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0"><CheckCircle size={14} /></div>
                            <p className="text-sm font-medium">No specific tasks defined.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {submodule.course_tasks.map(task => (
                              <div key={task.id} className="flex gap-4 items-center p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
                                <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center shrink-0 bg-slate-50 text-transparent hover:border-green-500 hover:text-green-500 cursor-pointer transition-colors">
                                  <CheckCircle size={14} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-slate-800">{task.title}</span>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${task.task_type === 'EXTRA' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                      {task.task_type}
                                    </span>
                                  </div>
                                  {task.description && <div className="text-xs text-slate-500 mt-1 font-medium">{task.description}</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline Add Task Form */}
                        {newTaskVisible === submodule.id && (
                          <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl animate-in slide-in-from-top-2 opacity-100 duration-200">
                            <form onSubmit={(e) => handleAddExtraTask(e, submodule.module_id, submodule.id)} className="flex flex-col md:flex-row gap-3">
                              <input 
                                type="text" 
                                placeholder="What needs to be done?" 
                                required 
                                value={newTask.title} 
                                onChange={e => setNewTask({...newTask, title: e.target.value})} 
                                className="flex-1 text-sm font-medium p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:font-normal" 
                              />
                              <button type="submit" className="px-6 py-3 bg-[#003F87] text-white text-sm font-bold rounded-xl hover:bg-[#002B5E] active:scale-95 transition-all shadow-md flex justify-center items-center gap-2 shrink-0">
                                <Plus size={16} /> Save Task
                              </button>
                            </form>
                          </div>
                        )}
                        {/* Submodule Reviews */}
                        {(() => {
                          const submoduleReviews = reviews.filter(r => r.submodule_id === submodule.id);
                          if (submoduleReviews.length === 0) return null;
                          return (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <MessageSquare size={14} className="text-slate-400" /> Student Feedback
                              </h5>
                              <div className="flex flex-col gap-3">
                                {submoduleReviews.map(review => (
                                  <div key={review.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-[10px]">
                                        {review.students?.first_name?.[0]}{review.students?.last_name?.[0]}
                                      </div>
                                      <span className="text-xs font-bold text-slate-800">{review.students?.first_name} {review.students?.last_name}</span>
                                    </div>
                                    {review.review_text && (
                                      <div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Review</div>
                                        <p className="text-xs text-slate-700 leading-relaxed">{review.review_text}</p>
                                      </div>
                                    )}
                                    {review.suggestion_text && (
                                      <div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Suggestion</div>
                                        <p className="text-xs text-slate-700 leading-relaxed">{review.suggestion_text}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


      {isCurriculumModalOpen && (
        <CurriculumSelectorModal
          isOpen={isCurriculumModalOpen}
          onClose={() => setIsCurriculumModalOpen(false)}
          selectedDate={selectedDate}
          topics={availableTopics}
          onToggleTopic={handleToggleSingleTopic}
          onToggleModule={handleToggleModule}
          topicLoading={topicLoading}
        />
      )}
    </div>
  );
};

const CurriculumSelectorModal = ({ isOpen, onClose, selectedDate, topics, onToggleTopic, onToggleModule, topicLoading }) => {
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  if (!isOpen) return null;

  const tree = {};
  topics.forEach(topic => {
    const courseId = topic.course_modules?.course_id || 'unknown';
    const courseName = topic.course_modules?.courses?.name || 'Unknown Course';
    const moduleId = topic.module_id || 'unknown';
    const moduleTitle = topic.course_modules?.title || 'Unknown Module';

    if (!tree[courseId]) tree[courseId] = { name: courseName, modules: {} };
    if (!tree[courseId].modules[moduleId]) tree[courseId].modules[moduleId] = { title: moduleTitle, submodules: [] };
    tree[courseId].modules[moduleId].submodules.push(topic);
  });

  const toggleExpand = (setter, id) => {
    setter(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6 md:px-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 relative">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Assign Topics</h2>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
              <CalendarDays size={14} /> Scheduling for <span className="text-[#003F87] font-bold">{formatDateDDMMYYYY(selectedDate)}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAFBFC]">
          {Object.keys(tree).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <BookOpen size={32} />
              </div>
              <h3 className="font-bold text-lg text-slate-700">No Courses Available</h3>
              <p className="text-sm text-slate-500 mt-1">You are not assigned to any courses with topics to schedule.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {Object.entries(tree).map(([courseId, courseData]) => {
                const isCourseExpanded = expandedCourses[courseId] !== false;
                return (
                  <div key={courseId} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div 
                      className="bg-slate-50 border-b border-slate-200 p-4 px-5 flex justify-between items-center cursor-pointer select-none group transition-colors hover:bg-blue-50/50"
                      onClick={() => toggleExpand(setExpandedCourses, courseId)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#003F87] transition-colors">
                          <BookOpen size={14} />
                        </div>
                        <span className="font-black text-slate-800 text-[15px]">{courseData.name}</span>
                      </div>
                      <div className="text-slate-400 group-hover:text-[#003F87] transition-colors">
                        {isCourseExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </div>
                    
                    {isCourseExpanded && (
                      <div className="flex flex-col">
                        {Object.entries(courseData.modules).map(([moduleId, moduleData]) => {
                          const isModuleExpanded = expandedModules[moduleId] !== false;
                          const allScheduled = moduleData.submodules.every(sm => sm.scheduled_date === selectedDate);
                          const someScheduled = moduleData.submodules.some(sm => sm.scheduled_date === selectedDate);
                          
                          return (
                            <div key={moduleId} className="border-b border-slate-100 last:border-0 bg-white">
                              <div className="p-3 pl-6 pr-5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                                <button 
                                  className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors" 
                                  onClick={() => toggleExpand(setExpandedModules, moduleId)}
                                >
                                  {isModuleExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                                
                                <div className="flex-1 flex justify-between items-center">
                                  <span className="text-sm font-bold text-slate-700">Module: {moduleData.title}</span>
                                  
                                  {/* Beautiful Toggle for Entire Module */}
                                  <button
                                    onClick={() => onToggleModule(moduleId, !allScheduled)}
                                    disabled={topicLoading}
                                    className={`
                                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 border-2
                                      ${allScheduled ? 'bg-[#003F87] border-[#003F87]' : someScheduled ? 'bg-blue-300 border-blue-300' : 'bg-slate-200 border-slate-200'}
                                    `}
                                  >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allScheduled || someScheduled ? 'translate-x-6' : 'translate-x-1'}`} />
                                  </button>
                                </div>
                              </div>
                              
                              {isModuleExpanded && (
                                <div className="py-2 bg-slate-50/30">
                                  {moduleData.submodules.map(sm => {
                                    const isScheduled = sm.scheduled_date === selectedDate;
                                    const isScheduledElsewhere = sm.scheduled_date && sm.scheduled_date !== selectedDate;
                                    
                                    return (
                                      <div key={sm.id} className="group flex items-center justify-between py-2.5 px-6 md:pl-16 md:pr-6 hover:bg-blue-50/40 transition-colors">
                                        <div className="flex flex-col">
                                          <span className={`text-sm font-semibold transition-colors ${isScheduled ? 'text-[#003F87]' : 'text-slate-600 group-hover:text-slate-800'}`}>{sm.title}</span>
                                          {isScheduledElsewhere && !isScheduled && (
                                            <span className="text-[10px] font-bold text-amber-600 mt-0.5">
                                              Scheduled on {formatDateDDMMYYYY(sm.scheduled_date)}
                                            </span>
                                          )}
                                        </div>
                                        
                                        {/* Individual Topic Toggle */}
                                        <button
                                          onClick={() => onToggleTopic(sm.id, !isScheduled)}
                                          disabled={topicLoading}
                                          className={`
                                            relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 border-2 ml-4
                                            ${isScheduled ? 'bg-[#003F87] border-[#003F87]' : 'bg-slate-200 border-slate-200'}
                                          `}
                                        >
                                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isScheduled ? 'translate-x-4' : 'translate-x-1'}`} />
                                        </button>
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
                );
              })}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-[#003F87] text-white text-sm font-bold rounded-xl hover:bg-[#002B5E] active:scale-95 transition-all shadow-md"
          >
            Done Scheduling
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyPlan;
