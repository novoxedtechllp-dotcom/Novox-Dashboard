import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, BookOpen, CheckCircle, Plus, LayoutList, X, ChevronDown, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

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

const getLocalDateString = () => {
  const d = new Date();
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
  const [newTaskVisible, setNewTaskVisible] = useState(null); // stores submodule ID
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [availableTopics, setAvailableTopics] = useState([]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedAdminEmployeeId, setSelectedAdminEmployeeId] = useState('');

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
  }, [selectedDate, userType, userId, selectedAdminEmployeeId]);

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
      setSelectedTopicId('');
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

      // We need courseId. We can get it from the submodule data.
      const submodule = dailyPlan.find(sm => sm.id === submoduleId);
      if (!submodule) return;

      const courseId = submodule.course_modules.course_id;

      const response = await fetch(`/api/v1/courses/${courseId}/modules/${moduleId}/submodules/${submoduleId}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          sequence_order: 99, // push to end
          task_type: 'EXTRA',
          due_date: selectedDate
        })
      });
      
      await parseApiResponse(response);
      alert('Extra task added successfully!');
      setNewTask({ title: '', description: '' });
      setNewTaskVisible(null);
      fetchDailyPlan(); // Refresh
    } catch (error) {
      console.error('Error adding extra task:', error);
      alert(error.message || 'Failed to add extra task');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 h-full bg-slate-50 relative">
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl font-bold text-sm transform transition-all duration-300 translate-y-0 opacity-100 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {toast.message}
        </div>
      )}
      {/* Sidebar / Date Selector */}
      <div className="w-full md:w-64 shrink-0 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CalendarIcon size={20} className="text-[#003F87]" />
          Daily Schedule
        </h2>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Select Date</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-semibold outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87]"
          />
        </div>
        <div className="mt-6">
          <button 
            onClick={() => setSelectedDate(getLocalDateString())}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 transition-all duration-200 text-slate-700 text-sm font-bold rounded-lg cursor-pointer active:scale-95"
          >
            Today
          </button>
        </div>

        {userType === 'ADMIN' && (
          <div className="flex flex-col gap-2 mt-6 pt-5 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-500 uppercase">Select Employee</label>
            <select
              value={selectedAdminEmployeeId}
              onChange={(e) => setSelectedAdminEmployeeId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-semibold outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] bg-white"
            >
              {employeesList.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
              ))}
            </select>
          </div>
        )}

        {userType === 'EMPLOYEE' && (
          <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Curriculum</h3>
              <p className="text-xs text-slate-500 mt-1">Manage topics taught on this day.</p>
            </div>
            <button
              onClick={() => setIsCurriculumModalOpen(true)}
              disabled={isWeekendDate(selectedDate)}
              className="w-full py-2 bg-[#003F87] hover:bg-[#002B5E] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 text-white text-sm font-bold rounded-lg cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <LayoutList size={16} /> Manage Topics
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          Curriculum for {formatWeekday(selectedDate)}, {formatDateDDMMYYYY(selectedDate)}
        </h3>

        {loading ? (
          <LoadingSpinner text="Loading curriculum..." />
        ) : dailyPlan.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <BookOpen size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-700 mb-1">No Topics Scheduled</h4>
            <p className="text-sm text-slate-500">There are no sub-modules or tasks scheduled for this date.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {dailyPlan.map((submodule) => (
              <div key={submodule.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-[#f8fafc] p-4 border-b border-slate-200 flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-bold text-[#003F87] uppercase tracking-wider mb-1">
                      {submodule.course_modules?.courses?.name} • Module {submodule.course_modules?.title}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <LayoutList size={18} className="text-[#008A2E]" />
                      {submodule.title}
                    </h4>
                    {submodule.description && (
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{submodule.description}</p>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tasks & Homework</h5>
                    {(userType === 'EMPLOYEE' || userType === 'ADMIN') && (
                      <button 
                        onClick={() => setNewTaskVisible(newTaskVisible === submodule.id ? null : submodule.id)}
                        className="text-xs font-bold text-[#003F87] hover:underline flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
                      >
                        <Plus size={14} /> Add Extra Task
                      </button>
                    )}
                  </div>

                  {!submodule.course_tasks || submodule.course_tasks.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No tasks assigned for this topic.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {submodule.course_tasks.map(task => (
                        <div key={task.id} className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-100 rounded-lg">
                          <CheckCircle size={18} className="text-slate-300 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-slate-800">{task.title}</span>
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${task.task_type === 'EXTRA' ? 'bg-purple-100 text-purple-800' : 'bg-[#E5F0FF] text-[#003F87]'}`}>
                                {task.task_type}
                              </span>
                            </div>
                            {task.description && <div className="text-xs text-slate-600">{task.description}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {newTaskVisible === submodule.id && (
                    <form onSubmit={(e) => handleAddExtraTask(e, submodule.module_id, submodule.id)} className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex flex-col gap-2">
                      <div className="text-xs font-bold text-[#003F87] mb-1">Add Extra Task</div>
                      <input 
                        type="text" 
                        placeholder="Task Title" 
                        required 
                        value={newTask.title} 
                        onChange={e => setNewTask({...newTask, title: e.target.value})} 
                        className="w-full text-xs p-2 border border-slate-200 rounded outline-none focus:border-[#003F87]" 
                      />
                      <textarea 
                        placeholder="Description (Optional)" 
                        rows="2" 
                        value={newTask.description} 
                        onChange={e => setNewTask({...newTask, description: e.target.value})} 
                        className="w-full text-xs p-2 border border-slate-200 rounded outline-none focus:border-[#003F87]" 
                      />
                      <div className="flex justify-end">
                        <button type="submit" className="px-4 py-1.5 bg-[#003F87] text-white text-xs font-bold rounded cursor-pointer active:scale-95 transition-transform">Assign Task</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Curriculum Topics</h2>
            <p className="text-xs text-slate-500">Select topics to schedule for {selectedDate}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5">
          {Object.keys(tree).length === 0 ? (
            <div className="text-center text-slate-500 py-10">No courses assigned.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(tree).map(([courseId, courseData]) => {
                const isCourseExpanded = expandedCourses[courseId] !== false;
                return (
                  <div key={courseId} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div 
                      className="bg-[#003F87] text-white p-3 flex items-center gap-2 cursor-pointer select-none"
                      onClick={() => toggleExpand(setExpandedCourses, courseId)}
                    >
                      {isCourseExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      <span className="font-bold text-sm">{courseData.name}</span>
                    </div>
                    
                    {isCourseExpanded && (
                      <div className="flex flex-col">
                        {Object.entries(courseData.modules).map(([moduleId, moduleData]) => {
                          const isModuleExpanded = expandedModules[moduleId] !== false;
                          const allScheduled = moduleData.submodules.every(sm => sm.scheduled_date === selectedDate);
                          const someScheduled = moduleData.submodules.some(sm => sm.scheduled_date === selectedDate);
                          
                          return (
                            <div key={moduleId} className="border-t border-slate-100 last:border-b-0">
                              <div className="bg-slate-50 p-3 flex items-center gap-3">
                                <div 
                                  className="cursor-pointer text-slate-500 hover:text-slate-700" 
                                  onClick={() => toggleExpand(setExpandedModules, moduleId)}
                                >
                                  {isModuleExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer flex-1 select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={allScheduled}
                                    ref={el => { if (el) el.indeterminate = someScheduled && !allScheduled }}
                                    onChange={(e) => onToggleModule(moduleId, e.target.checked)}
                                    disabled={topicLoading}
                                    className="w-4 h-4 text-[#003F87] rounded border-slate-300 focus:ring-[#003F87] disabled:opacity-50"
                                  />
                                  <span className="text-sm font-bold text-slate-700">Module: {moduleData.title}</span>
                                </label>
                              </div>
                              
                              {isModuleExpanded && (
                                <div className="pl-12 pr-4 py-2 flex flex-col gap-1 bg-white">
                                  {moduleData.submodules.map(sm => {
                                    const isScheduled = sm.scheduled_date === selectedDate;
                                    const isScheduledElsewhere = sm.scheduled_date && sm.scheduled_date !== selectedDate;
                                    return (
                                      <div key={sm.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded px-2">
                                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                                          <input 
                                            type="checkbox" 
                                            checked={isScheduled}
                                            onChange={(e) => onToggleTopic(sm.id, e.target.checked)}
                                            disabled={topicLoading}
                                            className="w-4 h-4 text-[#003F87] rounded border-slate-300 focus:ring-[#003F87] disabled:opacity-50"
                                          />
                                          <div className="flex flex-col">
                                            <span className={`text-sm ${isScheduled ? 'font-bold text-[#003F87]' : 'text-slate-600'}`}>{sm.title}</span>
                                            {isScheduledElsewhere && !isScheduled && (
                                              <span className="text-[10px] text-amber-600 font-semibold">
                                                Currently scheduled for: {sm.scheduled_date} (Ticking will move it to today)
                                              </span>
                                            )}
                                          </div>
                                        </label>
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
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#003F87] text-white text-sm font-bold rounded-lg hover:bg-[#002B5E] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyPlan;
