import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, BookOpen, CheckCircle, Plus, LayoutList } from 'lucide-react';

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
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [topicLoading, setTopicLoading] = useState(false);
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
      setSelectedTopicId(topics[0]?.id || '');
    } catch (error) {
      console.error('Error fetching available topics:', error);
      setAvailableTopics([]);
      setSelectedTopicId('');
    }
  };

  const handleAddTopicToDay = async (e) => {
    e.preventDefault();
    if (!selectedTopicId) return;
    if (isWeekendDate(selectedDate)) {
      alert('Topics can only be added to Monday-Friday workdays.');
      return;
    }

    setTopicLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`/api/v1/employees/${userId}/topics/${selectedTopicId}/schedule`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ scheduled_date: selectedDate })
      });

      await parseApiResponse(response);
      alert('Topic added to the day successfully!');
      await fetchDailyPlan();
      await fetchAvailableTopics();
    } catch (error) {
      console.error('Error adding topic to day:', error);
      alert(error.message || 'Failed to add topic to the day');
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
          <form onSubmit={handleAddTopicToDay} className="mt-6 pt-5 border-t border-slate-200 flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Add Topic to Day</h3>
              <p className="text-xs text-slate-500 mt-1">Use when there is extra teaching time available.</p>
            </div>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={availableTopics.length === 0 || isWeekendDate(selectedDate)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] bg-white disabled:bg-slate-100 disabled:text-slate-400"
            >
              {availableTopics.length === 0 ? (
                <option value="">No topics available</option>
              ) : (
                availableTopics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.course_modules?.courses?.name} - {topic.title}
                  </option>
                ))
              )}
            </select>
            <button
              type="submit"
              disabled={!selectedTopicId || topicLoading || isWeekendDate(selectedDate)}
              className="w-full py-2 bg-[#003F87] hover:bg-[#002B5E] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 text-white text-sm font-bold rounded-lg cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={14} /> {topicLoading ? 'Adding...' : 'Add Topic'}
            </button>
          </form>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          Curriculum for {formatWeekday(selectedDate)}, {formatDateDDMMYYYY(selectedDate)}
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#003F87] border-t-transparent rounded-full"></div>
          </div>
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
    </div>
  );
};

export default DailyPlan;
