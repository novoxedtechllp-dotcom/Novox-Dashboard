import { useState, useMemo } from 'react';

const formatPrice = (price) => {
  const numStr = String(price).replace(/[^\d.]/g, '');
  return numStr ? `₹${numStr}/-` : 'Free';
};
import { Clock, Plus, X, Upload, BookOpen, User, Trash2, Pencil, Calendar, LayoutList, Layers } from 'lucide-react';

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
  if (!response.ok) throw new Error(data.message || 'Course request failed');
  return data;
};

const getInstructorProfile = (course) => {
  const instructor = course.course_instructors?.[0];
  return instructor?.employee_profiles || null;
};

const getInitials = (name) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'U';
  return words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : words[0][0].toUpperCase();
};

const mapCourseFromApi = (course, fallback = {}) => {
  const instructorProfile = getInstructorProfile(course);
  const mentorName = instructorProfile
    ? `${instructorProfile.first_name || ''} ${instructorProfile.last_name || ''}`.trim()
    : fallback.mentorName || 'Unassigned';

  return {
    ...course,
    title: course.name || course.title || '',
    category: course.track || course.category || 'DEVELOPMENT',
    price: fallback.price || course.price || '₹0.00',
    mentorId: instructorProfile?.id || fallback.mentorId || '',
    mentorName,
    mentorInitials: getInitials(mentorName),
    imgUrl: fallback.imgUrl || course.imgUrl || null
  };
};

const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

const CoursesContent = ({ courses = [], setCourses, employees = [] }) => {
  const [toast, setToast] = useState(null);
  const alert = (message) => {
    const isError = typeof message === 'string' && (message.toLowerCase().includes('fail') || message.toLowerCase().includes('error'));
    setToast({ message, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [courseToEdit, setCourseToEdit] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const [modules, setModules] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [activeTab, setActiveTab] = useState('overview'); // overview, modules, schedule

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'DEVELOPMENT',
    duration_months: 1,
    capacity: 20,
    price: '',
    mentorId: employees[0]?.id || '',
    status: 'DRAFT',
    imgUrl: null
  });

  const [newModule, setNewModule] = useState({ title: '', description: '', sequence_order: 1 });
  const [newSchedule, setNewSchedule] = useState({ start_date: '', end_date: '', days_of_week: '', start_time: '', end_time: '' });

  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [expandedSubmoduleId, setExpandedSubmoduleId] = useState(null);
  const [submodules, setSubmodules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newSubmodule, setNewSubmodule] = useState({ title: '', sequence_order: 1 });
  const [newTask, setNewTask] = useState({ title: '', sequence_order: 1, task_type: 'PRE_PLANNED' });
  
  const [topicsPerDay, setTopicsPerDay] = useState(2);
  const [holidayDate, setHolidayDate] = useState('');
  const [moveTopic, setMoveTopic] = useState({ submoduleId: '', targetDate: '' });

  const getMentorName = (mentorId) => {
    const emp = employees.find(e => String(e.id) === String(mentorId));
    return emp ? emp.name : 'Unassigned';
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewCourse({ ...newCourse, imgUrl: url });
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.mentorId) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch('/api/v1/courses', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newCourse.title,
          description: newCourse.description,
          track: newCourse.category,
          duration_months: Number(newCourse.duration_months),
          capacity: Number(newCourse.capacity),
          status: newCourse.status,
          instructor_id: newCourse.mentorId
        })
      });
      const resData = await parseApiResponse(response);
      const mentorName = getMentorName(newCourse.mentorId);
      const addedCourse = mapCourseFromApi(resData.data, {
        price: newCourse.price || '₹0.00',
        mentorId: newCourse.mentorId,
        mentorName,
        imgUrl: newCourse.imgUrl || null
      });

      setCourses([...courses, addedCourse]);
      setIsModalOpen(false);
      setNewCourse({ title: '', description: '', category: 'DEVELOPMENT', duration_months: 1, capacity: 20, price: '', mentorId: employees[0]?.id || '', status: 'DRAFT', imgUrl: null });
    } catch (error) {
      console.error('Error adding course:', error);
      alert(error.message || 'Failed to add course');
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`/api/v1/courses/${id}`, {
        method: 'DELETE',
        headers
      });
      await parseApiResponse(response);

      setCourses(courses.filter(c => c.id !== id));
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(error.message || 'Failed to delete course');
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`/api/v1/courses/${courseToEdit.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: courseToEdit.title,
          description: courseToEdit.description,
          track: courseToEdit.category,
          duration_months: Number(courseToEdit.duration_months),
          capacity: Number(courseToEdit.capacity),
          status: courseToEdit.status,
          instructor_id: courseToEdit.mentorId
        })
      });
      const resData = await parseApiResponse(response);
      const mentorName = getMentorName(courseToEdit.mentorId);
      const updatedCourse = mapCourseFromApi(resData.data, {
        ...courseToEdit,
        mentorName,
        mentorId: courseToEdit.mentorId
      });

      setCourses(courses.map(c => c.id === courseToEdit.id ? updatedCourse : c));
      if (selectedCourse?.id === courseToEdit.id) setSelectedCourse(updatedCourse);
      setCourseToEdit(null);
    } catch (error) {
      console.error('Error updating course:', error);
      alert(error.message || 'Failed to update course');
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModule.title) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`/api/v1/courses/${selectedCourse.id}/modules`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newModule.title,
          description: newModule.description,
          sequence_order: Number(newModule.sequence_order)
        })
      });
      const resData = await parseApiResponse(response);
      const addedModule = resData.data;

      setModules([...modules, addedModule].sort((a, b) => a.sequence_order - b.sequence_order));
      setNewModule({ title: '', description: '', sequence_order: modules.filter(m => m.course_id === selectedCourse.id).length + 2 });
    } catch (error) {
      console.error('Error adding module:', error);
      alert(error.message || 'Failed to add module');
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!newSchedule.start_date || !newSchedule.end_date || !newSchedule.days_of_week || !newSchedule.start_time || !newSchedule.end_time) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`/api/v1/courses/${selectedCourse.id}/schedules`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newSchedule)
      });
      const resData = await parseApiResponse(response);

      setSchedules([...schedules, resData.data]);
      setNewSchedule({ start_date: '', end_date: '', days_of_week: '', start_time: '', end_time: '' });
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert(error.message || 'Failed to add schedule');
    }
  };

  const openCourseDetails = async (course) => {
    setSelectedCourse(course);
    setActiveTab('overview');

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`/api/v1/courses/${course.id}`, { headers });
      const resData = await parseApiResponse(response);
      const detailedCourse = mapCourseFromApi(resData.data, course);

      setSelectedCourse(detailedCourse);
      
      const fetchedModules = resData.data.course_modules || [];
      setModules(prev => [...prev.filter(m => m.course_id !== course.id), ...fetchedModules]);
      setSchedules(prev => [...prev.filter(s => s.course_id !== course.id), ...(resData.data.course_schedules || [])]);
      
      const allSubmodules = [];
      const allTasks = [];
      fetchedModules.forEach(m => {
        if (m.course_submodules) {
          allSubmodules.push(...m.course_submodules);
          m.course_submodules.forEach(sm => {
             if (sm.course_tasks) allTasks.push(...sm.course_tasks);
          });
        }
      });
      setSubmodules(prev => {
        const other = prev.filter(s => !fetchedModules.some(m => m.id === s.module_id));
        return [...other, ...allSubmodules];
      });
      setTasks(prev => {
        const other = prev.filter(t => !allSubmodules.some(sm => sm.id === t.submodule_id));
        return [...other, ...allTasks];
      });
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const handleAddSubmodule = async (e, moduleId) => {
    e.preventDefault();
    if (!newSubmodule.title) return;
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/v1/courses/${selectedCourse.id}/modules/${moduleId}/submodules`, {
        method: 'POST', headers,
        body: JSON.stringify({ title: newSubmodule.title, sequence_order: Number(newSubmodule.sequence_order) })
      });
      const resData = await parseApiResponse(response);
      setSubmodules([...submodules, resData.data]);
      setNewSubmodule({ title: '', sequence_order: submodules.filter(s => s.module_id === moduleId).length + 2 });
    } catch (error) {
      alert(error.message || 'Failed to add submodule');
    }
  };

  const handleAddTask = async (e, moduleId, submoduleId) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/v1/courses/${selectedCourse.id}/modules/${moduleId}/submodules/${submoduleId}/tasks`, {
        method: 'POST', headers,
        body: JSON.stringify({ title: newTask.title, sequence_order: Number(newTask.sequence_order), task_type: newTask.task_type })
      });
      const resData = await parseApiResponse(response);
      setTasks([...tasks, resData.data]);
      setNewTask({ title: '', sequence_order: tasks.filter(t => t.submodule_id === submoduleId).length + 2, task_type: 'PRE_PLANNED' });
    } catch (error) {
      alert(error.message || 'Failed to add task');
    }
  };

  const handleAutoSchedule = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/v1/courses/${selectedCourse.id}/auto-schedule`, {
        method: 'POST', headers,
        body: JSON.stringify({ topics_per_day: Number(topicsPerDay) })
      });
      await parseApiResponse(response);
      alert('Schedule generated successfully');
      openCourseDetails(selectedCourse); // Refresh
    } catch (error) {
      alert(error.message || 'Failed to generate schedule');
    }
  };

  const handleAddHoliday = async () => {
    if (!holidayDate) return;
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/v1/courses/${selectedCourse.id}/reschedule`, {
        method: 'POST', headers,
        body: JSON.stringify({ holiday_date: holidayDate })
      });
      await parseApiResponse(response);
      alert('Plan rescheduled successfully');
      openCourseDetails(selectedCourse); // Refresh
    } catch (error) {
      alert(error.message || 'Failed to reschedule plan');
    }
  };

  const handleMoveTopic = async () => {
    if (!moveTopic.submoduleId || !moveTopic.targetDate) return;
    try {
      const headers = getAuthHeaders();
      const sub = submodules.find(s => String(s.id) === moveTopic.submoduleId);
      if (!sub) return;
      const response = await fetch(`/api/v1/courses/${selectedCourse.id}/modules/${sub.module_id}/submodules/${sub.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ scheduled_date: moveTopic.targetDate })
      });
      await parseApiResponse(response);
      alert('Topic moved successfully');
      openCourseDetails(selectedCourse); // Refresh
      setMoveTopic({ submoduleId: '', targetDate: '' });
    } catch (error) {
      alert(error.message || 'Failed to move topic');
    }
  };

  const filteredCourses = useMemo(() => {
    const normalizedCourses = courses.map(course => mapCourseFromApi(course));
    if (categoryFilter === 'All Categories') return normalizedCourses;
    return normalizedCourses.filter(c => c.category === categoryFilter);
  }, [courses, categoryFilter]);

  const uniqueCategories = ['All Categories', 'DEVELOPMENT', 'MARKETING', 'DESIGN'];

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative">
      {toast && (
        <div className={`absolute top-[24px] right-[24px] z-[100] px-6 py-3 rounded shadow-lg font-bold text-sm ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {toast.message}
        </div>
      )}
      
      {/* Top Filter */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[8px] p-[24px] flex flex-col sm:flex-row gap-[24px] items-center justify-between">
        <div className="flex-1 w-full max-w-[240px]">
          <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Category Filter</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px] text-[13px] text-slate-800 outline-none"
          >
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#003F87] text-white px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold flex items-center gap-[8px] hover:bg-[#002B5E] transition-colors"
        >
          <Plus size={16} /> Add Course
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px]">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col h-[260px] relative group hover:border-[#003F87] transition-colors">

            <div className="absolute top-[16px] right-[16px] flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={(e) => { e.stopPropagation(); setCourseToEdit(course); }} className="text-[#C2C6D4] hover:text-[#003F87]">
                <Pencil size={16} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setCourseToDelete(course.id); }} className="text-[#C2C6D4] hover:text-[#D80000]">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-start gap-4 mb-auto">
              <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
                {course.imgUrl ? (
                  <img src={course.imgUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={24} className="text-slate-400" />
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#003F87] border-[2px] border-white rounded-full"></div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block bg-[#E5F0FF] text-[#003F87] text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase">{course.category}</span>
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase ${course.status === 'PUBLISHED' ? 'bg-[#E5F6EB] text-[#008A2E]' : course.status === 'ARCHIVED' ? 'bg-slate-200 text-slate-600' : 'bg-[#FFF4E5] text-[#B26E00]'}`}>{course.status || 'DRAFT'}</span>
                </div>
                <h3 className="text-[16px] font-bold text-slate-900 leading-tight line-clamp-2">{course.title}</h3>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-4 mb-4">
              <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
                <Clock size={14} /> Duration: {course.duration_months ? `${course.duration_months} Months` : course.duration}
              </div>
              <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
                <User size={14} /> Instructor: {course.mentorName}
              </div>
              <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
                <Layers size={14} /> Capacity: {course.capacity || 'N/A'} Students
              </div>
            </div>

            <div className="border-t border-dashed border-[#C2C6D4] pt-4 flex justify-between items-center">
              <div className="text-[11px] font-semibold text-[#555F6B]">
                Price: <span className="font-bold text-[#008A2E]">{formatPrice(course.price)}</span>
              </div>
              <button
                onClick={() => openCourseDetails(course)}
                className="text-[11px] text-[#003F87] font-bold hover:underline"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        <div onClick={() => setIsModalOpen(true)} className="bg-white rounded-[8px] border border-dashed border-[#C2C6D4] p-[24px] flex flex-col items-center justify-center h-[260px] cursor-pointer hover:bg-slate-50 text-center">
          <div className="w-[40px] h-[40px] rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#555F6B] mb-3"><Plus size={20} /></div>
          <h3 className="text-[14px] font-bold text-slate-900">Create New Course</h3>
        </div>
      </div>

      {/* Add Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Create New Course</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCourse} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="flex items-center gap-4">
                <div className="w-[64px] h-[64px] rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {newCourse.imgUrl ? <img src={newCourse.imgUrl} className="w-full h-full object-cover" /> : <BookOpen size={24} className="text-slate-400" />}
                </div>
                <div>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded inline-flex items-center gap-2 border border-slate-200">
                    <Upload size={14} /> Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                <input type="text" required value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[#003F87]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea rows="3" value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[#003F87]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Track</label>
                  <select value={newCourse.category} onChange={e => setNewCourse({ ...newCourse, category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-[#003F87]">
                    <option value="DEVELOPMENT">DEVELOPMENT</option>
                    <option value="MARKETING">MARKETING</option>
                    <option value="DESIGN">DESIGN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select value={newCourse.status} onChange={e => setNewCourse({ ...newCourse, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-[#003F87]">
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (Months)</label>
                  <input type="number" min="1" value={newCourse.duration_months} onChange={e => setNewCourse({ ...newCourse, duration_months: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[#003F87]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capacity</label>
                  <input type="number" min="1" value={newCourse.capacity} onChange={e => setNewCourse({ ...newCourse, capacity: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[#003F87]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instructor (Employee)</label>
                  <select value={newCourse.mentorId} onChange={e => setNewCourse({ ...newCourse, mentorId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-[#003F87]">
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price</label>
                  <input type="text" value={newCourse.price} onChange={e => setNewCourse({ ...newCourse, price: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[#003F87]" placeholder="₹0.00" />
                </div>
              </div>

              <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {courseToEdit && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Edit Course</h2>
              <button onClick={() => setCourseToEdit(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateCourse} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                <input type="text" required value={courseToEdit.title} onChange={e => setCourseToEdit({ ...courseToEdit, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[#003F87]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea rows="3" value={courseToEdit.description || ''} onChange={e => setCourseToEdit({ ...courseToEdit, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[#003F87]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Track</label>
                  <select value={courseToEdit.category} onChange={e => setCourseToEdit({ ...courseToEdit, category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-[#003F87]">
                    <option value="DEVELOPMENT">DEVELOPMENT</option>
                    <option value="MARKETING">MARKETING</option>
                    <option value="DESIGN">DESIGN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select value={courseToEdit.status || 'DRAFT'} onChange={e => setCourseToEdit({ ...courseToEdit, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-[#003F87]">
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (Months)</label>
                  <input type="number" min="1" value={courseToEdit.duration_months || 1} onChange={e => setCourseToEdit({ ...courseToEdit, duration_months: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[#003F87]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capacity</label>
                  <input type="number" min="1" value={courseToEdit.capacity || 20} onChange={e => setCourseToEdit({ ...courseToEdit, capacity: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[#003F87]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instructor</label>
                  <select value={courseToEdit.mentorId || employees[0]?.id} onChange={e => setCourseToEdit({ ...courseToEdit, mentorId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-[#003F87]">
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price</label>
                  <input type="text" value={courseToEdit.price} onChange={e => setCourseToEdit({ ...courseToEdit, price: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[#003F87]" />
                </div>
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {courseToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-sm text-slate-600">Are you sure you want to delete this course?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCourseToDelete(null)} className="px-4 py-2 border rounded-md text-sm font-semibold">Cancel</button>
              <button onClick={() => { handleDeleteCourse(courseToDelete); setCourseToDelete(null); }} className="px-4 py-2 bg-[#D80000] text-white rounded-md text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Command Center */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/50 z-[40] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col h-[90vh]">
            {/* Header */}
            <div className="relative h-[120px] w-full shrink-0 bg-slate-100 flex items-end p-6 border-b border-slate-200">
              <div className="absolute inset-0 z-0 opacity-20">
                {selectedCourse.imgUrl ? <img src={selectedCourse.imgUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#003F87]"></div>}
              </div>
              <div className="relative z-10 w-full flex justify-between items-end">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="bg-black/80 text-white text-[10px] font-bold px-[12px] py-[4px] rounded-full uppercase">{selectedCourse.category}</span>
                    <span className="bg-white/80 text-slate-900 text-[10px] font-bold px-[12px] py-[4px] rounded-full uppercase">{selectedCourse.status || 'DRAFT'}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedCourse.title}</h2>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-600">Price</div>
                  <div className="text-xl font-black text-[#008A2E]">{formatPrice(selectedCourse.price)}</div>
                </div>
              </div>
              <button onClick={() => setSelectedCourse(null)} className="absolute top-[16px] right-[16px] w-8 h-8 bg-black/20 text-slate-900 rounded-full flex items-center justify-center hover:bg-black/40 z-20">
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-6 shrink-0 bg-slate-50">
              {['overview', 'modules', 'schedule'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === tab ? 'border-[#003F87] text-[#003F87]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Description</h3>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedCourse.description || 'No description provided.'}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Duration</div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-2"><Clock size={16} className="text-[#003F87]" /> {selectedCourse.duration_months ? `${selectedCourse.duration_months} Months` : selectedCourse.duration}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Capacity</div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-2"><Layers size={16} className="text-[#003F87]" /> {selectedCourse.capacity || 'N/A'} Seats</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 col-span-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Assigned Instructor</div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-2"><User size={16} className="text-[#003F87]" /> {selectedCourse.mentorName}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modules Tab */}
              {activeTab === 'modules' && (
                <div className="flex flex-col gap-6">
                  {/* Scheduling Command Center */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col gap-4">
                    <div className="flex gap-4 items-end border-b border-slate-200 pb-4">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Topics Per Day</label>
                        <input type="number" min="1" max="5" value={topicsPerDay} onChange={e => setTopicsPerDay(e.target.value)} className="w-[100px] px-3 py-2 border rounded text-sm" />
                      </div>
                      <button onClick={handleAutoSchedule} className="px-4 py-2 bg-[#008A2E] text-white text-sm font-bold rounded">
                        Auto-Schedule
                      </button>
                    </div>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Reschedule from Date</label>
                        <input type="date" value={holidayDate} onChange={e => setHolidayDate(e.target.value)} className="w-full max-w-[200px] px-3 py-2 border rounded text-sm" />
                      </div>
                      <button onClick={handleAddHoliday} className="px-4 py-2 bg-[#D80000] text-white text-sm font-bold rounded">
                        Shift Schedule
                      </button>
                    </div>
                    <div className="flex gap-4 items-end border-t border-slate-200 pt-4">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Target Topic</label>
                        <select 
                          value={moveTopic.submoduleId} 
                          onChange={e => setMoveTopic({...moveTopic, submoduleId: e.target.value})} 
                          className="w-full max-w-[250px] px-3 py-2 border border-slate-200 rounded text-sm bg-white outline-none focus:border-[#003F87]"
                        >
                          <option value="">Select Topic</option>
                          {modules
                            .filter(m => m.course_id === selectedCourse.id)
                            .sort((a, b) => a.sequence_order - b.sequence_order)
                            .map(m => {
                              const moduleSubmodules = submodules
                                .filter(sm => sm.module_id === m.id)
                                .sort((a, b) => a.sequence_order - b.sequence_order);
                              
                              if (moduleSubmodules.length === 0) return null;

                              return (
                                <optgroup key={m.id} label={`${m.sequence_order}. ${m.title}`}>
                                  {moduleSubmodules.map(sm => (
                                    <option key={sm.id} value={sm.id}>
                                      {m.sequence_order}.{sm.sequence_order} {sm.title}
                                    </option>
                                  ))}
                                </optgroup>
                              );
                            })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">New Date</label>
                        <input type="date" value={moveTopic.targetDate} onChange={e => setMoveTopic({...moveTopic, targetDate: e.target.value})} className="w-[150px] px-3 py-2 border rounded text-sm outline-none focus:border-[#003F87]" />
                      </div>
                      <button onClick={handleMoveTopic} className="px-4 py-2 bg-[#003F87] text-white text-sm font-bold rounded">
                        Move Topic
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 shrink-0">
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><LayoutList size={16} /> Add Module</h3>
                        <form onSubmit={handleAddModule} className="flex flex-col gap-3">
                          <div><input type="text" placeholder="Module Title" required value={newModule.title} onChange={e => setNewModule({ ...newModule, title: e.target.value })} className="w-full text-xs p-2 border rounded" /></div>
                          <div><textarea placeholder="Description" rows="2" value={newModule.description} onChange={e => setNewModule({ ...newModule, description: e.target.value })} className="w-full text-xs p-2 border rounded" /></div>
                          <div><input type="number" placeholder="Sequence (e.g. 1)" required value={newModule.sequence_order} onChange={e => setNewModule({ ...newModule, sequence_order: e.target.value })} className="w-full text-xs p-2 border rounded" /></div>
                          <button type="submit" className="w-full py-2 bg-[#003F87] text-white text-xs font-bold rounded">Save Module</button>
                        </form>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Curriculum</h3>
                      {modules.filter(m => m.course_id === selectedCourse.id).length === 0 ? (
                        <p className="text-sm text-slate-500 italic">No modules defined.</p>
                      ) : (
                        modules.filter(m => m.course_id === selectedCourse.id).sort((a, b) => a.sequence_order - b.sequence_order).map(m => (
                          <div key={m.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-2">
                            <div 
                              className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                              onClick={() => setExpandedModuleId(expandedModuleId === m.id ? null : m.id)}
                            >
                              <div className="flex gap-4">
                                <div className="w-[32px] h-[32px] rounded-full bg-[#E5F0FF] text-[#003F87] font-bold flex items-center justify-center shrink-0">{m.sequence_order}</div>
                                <div>
                                  <div className="text-sm font-bold text-slate-800">{m.title}</div>
                                  <div className="text-xs text-slate-600 mt-1">{m.description}</div>
                                </div>
                              </div>
                              <div className="text-slate-400 font-bold text-xs">
                                {expandedModuleId === m.id ? 'CLOSE' : 'OPEN'}
                              </div>
                            </div>
                            
                            {expandedModuleId === m.id && (
                              <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col gap-3">
                                {/* ADD SUBMODULE FORM */}
                                <form onSubmit={(e) => handleAddSubmodule(e, m.id)} className="flex gap-2 items-start border-b border-slate-200 pb-3 mb-2">
                                  <div className="flex-1 flex flex-col gap-2">
                                    <input type="text" placeholder="Sub-module Title (Topic)" required value={newSubmodule.title} onChange={e => setNewSubmodule({...newSubmodule, title: e.target.value})} className="w-full text-xs p-2 border rounded" />
                                  </div>
                                  <div className="w-[80px]">
                                    <input type="number" placeholder="Seq" required value={newSubmodule.sequence_order} onChange={e => setNewSubmodule({...newSubmodule, sequence_order: e.target.value})} className="w-full text-xs p-2 border rounded" />
                                  </div>
                                  <button type="submit" className="py-2 px-3 bg-[#003F87] text-white text-[11px] font-bold rounded cursor-pointer active:scale-95 transition-all duration-200">Add Topic</button>
                                </form>

                                {/* LIST OF SUBMODULES */}
                                {submodules.filter(sm => sm.module_id === m.id).length === 0 ? (
                                  <p className="text-xs text-slate-500 italic mb-2">No sub-modules added yet.</p>
                                ) : (
                                  submodules.filter(sm => sm.module_id === m.id).sort((a,b) => a.sequence_order - b.sequence_order).map(sm => (
                                    <div key={sm.id} className="bg-white border border-slate-200 rounded text-sm mb-2 shadow-sm">
                                      <div 
                                        className="flex justify-between items-center p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => setExpandedSubmoduleId(expandedSubmoduleId === sm.id ? null : sm.id)}
                                      >
                                        <div className="flex gap-3 items-center">
                                          <div className="text-[#003F87] font-bold w-6">{m.sequence_order}.{sm.sequence_order}</div>
                                          <div>
                                            <div className="font-semibold text-slate-800 flex gap-2 items-center">
                                              {sm.title}
                                            </div>
                                            {sm.scheduled_date && <div className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 mt-1 rounded inline-block">Scheduled: {formatDateToDDMMYYYY(sm.scheduled_date)}</div>}
                                          </div>
                                        </div>
                                        <div className="text-slate-400 font-bold text-xs">
                                          {expandedSubmoduleId === sm.id ? 'HIDE TASKS' : 'SHOW TASKS'}
                                        </div>
                                      </div>
                                      
                                      {/* TASKS INSIDE SUBMODULE */}
                                      {expandedSubmoduleId === sm.id && (
                                        <div className="p-3 border-t border-slate-100 bg-slate-50 flex flex-col gap-2">
                                          <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tasks (Homework)</h5>
                                          {tasks.filter(t => t.submodule_id === sm.id).length === 0 ? (
                                            <p className="text-xs text-slate-400 italic">No tasks assigned.</p>
                                          ) : (
                                            <div className="flex flex-col gap-2 mb-2">
                                              {tasks.filter(t => t.submodule_id === sm.id).sort((a,b) => a.sequence_order - b.sequence_order).map(t => (
                                                <div key={t.id} className="bg-white border border-slate-200 p-2 rounded flex gap-2 items-center">
                                                  <div className="text-slate-400 text-xs font-bold w-4">{t.sequence_order}.</div>
                                                  <div className="flex-1 text-xs font-semibold text-slate-700">{t.title}</div>
                                                  <div className="text-[9px] font-bold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{t.task_type}</div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          
                                          <form onSubmit={(e) => handleAddTask(e, m.id, sm.id)} className="flex gap-2 items-start mt-2">
                                            <input type="text" placeholder="New Task" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="flex-1 text-[11px] p-1.5 border rounded outline-none focus:border-[#003F87]" />
                                            <select value={newTask.task_type} onChange={e => setNewTask({...newTask, task_type: e.target.value})} className="w-[90px] text-[11px] p-1.5 border rounded outline-none focus:border-[#003F87]">
                                              <option value="PRE_PLANNED">Planned</option>
                                              <option value="EXTRA">Extra</option>
                                            </select>
                                            <input type="number" placeholder="Seq" required value={newTask.sequence_order} onChange={e => setNewTask({...newTask, sequence_order: e.target.value})} className="w-[50px] text-[11px] p-1.5 border rounded outline-none focus:border-[#003F87]" />
                                            <button type="submit" className="py-1.5 px-2 bg-[#008A2E] text-white text-[11px] font-bold rounded cursor-pointer active:scale-95 transition-all duration-200">Add</button>
                                          </form>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Schedules Tab */}
              {activeTab === 'schedule' && (
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-[40%] shrink-0">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Calendar size={16} /> Add Schedule</h3>
                      <form onSubmit={handleAddSchedule} className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Start Date</label>
                            <input type="date" required value={newSchedule.start_date} onChange={e => setNewSchedule({ ...newSchedule, start_date: e.target.value })} className="w-full text-xs p-2 border rounded" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">End Date</label>
                            <input type="date" required value={newSchedule.end_date} onChange={e => setNewSchedule({ ...newSchedule, end_date: e.target.value })} className="w-full text-xs p-2 border rounded" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Days of Week (e.g. Mon, Wed)</label>
                          <input type="text" value={newSchedule.days_of_week} onChange={e => setNewSchedule({ ...newSchedule, days_of_week: e.target.value })} className="w-full text-xs p-2 border rounded" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Start Time</label>
                            <input type="time" value={newSchedule.start_time} onChange={e => setNewSchedule({ ...newSchedule, start_time: e.target.value })} className="w-full text-xs p-2 border rounded" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">End Time</label>
                            <input type="time" value={newSchedule.end_time} onChange={e => setNewSchedule({ ...newSchedule, end_time: e.target.value })} className="w-full text-xs p-2 border rounded" />
                          </div>
                        </div>
                        <button type="submit" className="w-full py-2 bg-[#003F87] text-white text-xs font-bold rounded mt-2">Save Schedule</button>
                      </form>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-3">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Active Schedules</h3>
                    {schedules.filter(s => s.course_id === selectedCourse.id).length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No schedules defined.</p>
                    ) : (
                      <div className="grid gap-3">
                        {schedules.filter(s => s.course_id === selectedCourse.id).map(s => (
                          <div key={s.id} className="p-4 border border-slate-200 rounded-lg flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-[#003F87]">
                              <Calendar size={16} /> {new Date(s.start_date).toLocaleDateString()} — {new Date(s.end_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-600 font-semibold mt-1">
                              <div>Days: <span className="text-slate-800">{s.days_of_week || 'N/A'}</span></div>
                              <div>Time: <span className="text-slate-800">{s.start_time || 'N/A'} to {s.end_time || 'N/A'}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesContent;
