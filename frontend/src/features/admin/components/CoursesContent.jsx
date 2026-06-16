import { useState, useMemo } from 'react';
import { Clock, Plus, X, Upload, BookOpen, User, Trash2, Pencil, Calendar, LayoutList, Layers, Eye, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';

const formatPrice = (price) => {
  const numStr = String(price).replace(/[^\d.]/g, '');
  return numStr ? `₹${numStr}/-` : 'Free';
};

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
    price: course.total_fee ? formatPrice(course.total_fee) : (fallback.price || course.price || '₹0.00'),
    mentorId: instructorProfile?.id || fallback.mentorId || '',
    mentorName,
    mentorInitials: getInitials(mentorName),
    imgUrl: course.thumbnail_url || fallback.imgUrl || course.imgUrl || null,
    enrollmentCount: course.enrollment_count || 0
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

const getCourseGradient = (category) => {
  switch(category) {
    case 'DEVELOPMENT': return 'bg-gradient-to-br from-blue-50/80 to-white border border-blue-100/50 border-l-4 border-l-blue-500 hover:border-blue-300';
    case 'MARKETING': return 'bg-gradient-to-br from-purple-50/80 to-white border border-purple-100/50 border-l-4 border-l-purple-500 hover:border-purple-300';
    case 'DESIGN': return 'bg-gradient-to-br from-rose-50/80 to-white border border-rose-100/50 border-l-4 border-l-rose-500 hover:border-rose-300';
    default: return 'bg-gradient-to-br from-slate-50/80 to-white border border-slate-100 border-l-4 border-l-slate-400 hover:border-slate-300';
  }
};

const CoursesContent = ({ courses = [], setCourses, employees = [], searchQuery = '' }) => {
  const [toast, setToast] = useState(null);
  const alert = (message) => {
    const isError = typeof message === 'string' && (message.toLowerCase().includes('fail') || message.toLowerCase().includes('error'));
    setToast({ message, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [courseToEdit, setCourseToEdit] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const [modules, setModules] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [activeTab, setActiveTab] = useState('overview'); // overview, modules, schedule

  const [newCourse, setNewCourse] = useState({
    title: '', description: '', category: 'DEVELOPMENT', duration_months: 1, capacity: 20, price: '', mentorId: employees[0]?.id || '', status: 'DRAFT', imgUrl: null
  });

  const [newModule, setNewModule] = useState({ title: '', description: '', sequence_order: 1 });
  const [newSchedule, setNewSchedule] = useState({ start_date: '', end_date: '', days_of_week: '', start_time: '', end_time: '' });

  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [expandedSubmoduleId, setExpandedSubmoduleId] = useState(null);
  const [submodules, setSubmodules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newSubmodule, setNewSubmodule] = useState({ title: '', sequence_order: 1 });
  const [newTask, setNewTask] = useState({ title: '', sequence_order: 1, task_type: 'PRE_PLANNED' });
  const [subtasks, setSubtasks] = useState([]);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '', sequence_order: 1 });
  
  const [topicsPerDay, setTopicsPerDay] = useState(2);
  const [holidayDate, setHolidayDate] = useState('');
  const [moveTopic, setMoveTopic] = useState({ submoduleId: '', targetDate: '' });
  const [schedulePreview, setSchedulePreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applyingSchedule, setApplyingSchedule] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [assigningStudents, setAssigningStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isAddingModule, setIsAddingModule] = useState(false);

  const handleDragStart = (e, type, id) => {
    e.stopPropagation();
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('id', String(id));
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = async (e, type, targetId, parentId = null) => {
    e.stopPropagation();
    e.preventDefault();
    const draggedType = e.dataTransfer.getData('type');
    const draggedId = e.dataTransfer.getData('id');

    if (draggedType !== type || String(draggedId) === String(targetId)) return;

    let items = [];
    let setItems = null;
    let endpoint = '';
    
    if (type === 'Module') {
      items = modules.filter(m => m.course_id === selectedCourse.id).sort((a,b) => a.sequence_order - b.sequence_order);
      setItems = (newItems) => setModules(prev => [...prev.filter(m => m.course_id !== selectedCourse.id), ...newItems]);
      endpoint = `/api/v1/courses/${selectedCourse.id}/modules/reorder`;
    } else if (type === 'Submodule') {
      items = submodules.filter(sm => sm.module_id === parentId).sort((a,b) => a.sequence_order - b.sequence_order);
      setItems = (newItems) => setSubmodules(prev => [...prev.filter(sm => sm.module_id !== parentId), ...newItems]);
      endpoint = `/api/v1/courses/${selectedCourse.id}/modules/${parentId}/submodules/reorder`;
    } else if (type === 'Task') {
      items = tasks.filter(t => t.submodule_id === parentId).sort((a,b) => a.sequence_order - b.sequence_order);
      setItems = (newItems) => setTasks(prev => [...prev.filter(t => t.submodule_id !== parentId), ...newItems]);
      const sm = submodules.find(s => s.id === parentId);
      endpoint = `/api/v1/courses/${selectedCourse.id}/modules/${sm?.module_id}/submodules/${parentId}/tasks/reorder`;
    } else if (type === 'Subtask') {
      items = subtasks.filter(st => st.task_id === parentId).sort((a,b) => a.sequence_order - b.sequence_order);
      setItems = (newItems) => setSubtasks(prev => [...prev.filter(st => st.task_id !== parentId), ...newItems]);
      const t = tasks.find(x => x.id === parentId);
      const sm = submodules.find(x => x.id === t?.submodule_id);
      endpoint = `/api/v1/courses/${selectedCourse.id}/modules/${sm?.module_id}/submodules/${sm?.id}/tasks/${parentId}/subtasks/reorder`;
    }

    const draggedIndex = items.findIndex(item => String(item.id) === String(draggedId));
    const targetIndex = items.findIndex(item => String(item.id) === String(targetId));
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);
    const reordered = newItems.map((item, index) => ({ ...item, sequence_order: index + 1 }));

    setItems(reordered);
    try {
      const headers = getAuthHeaders();
      await fetch(endpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ order: reordered.map(i => ({ id: i.id, sequence_order: i.sequence_order })) })
      });
    } catch (err) {
      alert('Failed to save reorder');
    }
  };

  const getMentorName = (mentorId) => {
    const emp = employees.find(e => String(e.id) === String(mentorId));
    return emp ? emp.name : 'Unassigned';
  };

  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (isEdit) {
        setCourseToEdit({ ...courseToEdit, imgUrl: previewUrl });
      } else {
        setNewCourse({ ...newCourse, imgUrl: previewUrl });
      }
      
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const headers = getAuthHeaders();
        delete headers['Content-Type'];
        
        const response = await fetch('/api/v1/upload', {
          method: 'POST',
          headers,
          body: formData
        });
        const resData = await response.json();
        if (response.ok && resData.data?.url) {
          if (isEdit) {
            setCourseToEdit(prev => ({ ...prev, imgUrl: resData.data.url }));
          } else {
            setNewCourse(prev => ({ ...prev, imgUrl: resData.data.url }));
          }
        }
      } catch (err) {
        console.error('Upload failed', err);
        alert('Image upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title) return alert("Course title is required.");
    if (!newCourse.mentorId) return alert("Please select an instructor/mentor for this course.");

    try {
      setIsSubmitting(true);
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch('/api/v1/courses', {
        method: 'POST', headers,
        body: JSON.stringify({
          name: newCourse.title, description: newCourse.description, track: newCourse.category,
          duration_months: Number(newCourse.duration_months), capacity: Number(newCourse.capacity),
          status: newCourse.status, instructor_id: newCourse.mentorId,
          thumbnail_url: newCourse.imgUrl?.startsWith('http') ? newCourse.imgUrl : null
        })
      });
      const resData = await parseApiResponse(response);
      const mentorName = getMentorName(newCourse.mentorId);
      const addedCourse = mapCourseFromApi(resData.data, {
        price: newCourse.price || '₹0.00', mentorId: newCourse.mentorId, mentorName, imgUrl: newCourse.imgUrl || null
      });

      setCourses([...courses, addedCourse]);
      setIsModalOpen(false);
      setNewCourse({ title: '', description: '', category: 'DEVELOPMENT', duration_months: 1, capacity: 20, price: '', mentorId: employees[0]?.id || '', status: 'DRAFT', imgUrl: null });
    } catch (error) {
      alert(error.message || 'Failed to add course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      setIsDeleting(true);
      const headers = getAuthHeaders();
      if (!headers) return;
      const response = await fetch(`/api/v1/courses/${id}`, { method: 'DELETE', headers });
      await parseApiResponse(response);
      setCourses(courses.filter(c => c.id !== id));
      setSelectedCourse(null);
      setCourseToDelete(null);
    } catch (error) {
      alert(error.message || 'Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!courseToEdit.mentorId) return alert("Please select an instructor/mentor for this course.");
    try {
      setIsSubmitting(true);
      const headers = getAuthHeaders();
      if (!headers) return;
      const response = await fetch(`/api/v1/courses/${courseToEdit.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({
          name: courseToEdit.title, description: courseToEdit.description, track: courseToEdit.category,
          duration_months: Number(courseToEdit.duration_months), capacity: Number(courseToEdit.capacity),
          status: courseToEdit.status, instructor_id: courseToEdit.mentorId,
          thumbnail_url: courseToEdit.imgUrl?.startsWith('http') ? courseToEdit.imgUrl : null
        })
      });
      const resData = await parseApiResponse(response);
      const mentorName = getMentorName(courseToEdit.mentorId);
      const updatedCourse = mapCourseFromApi(resData.data, { ...courseToEdit, mentorName, mentorId: courseToEdit.mentorId });
      setCourses(courses.map(c => c.id === courseToEdit.id ? updatedCourse : c));
      if (selectedCourse?.id === courseToEdit.id) setSelectedCourse(updatedCourse);
      setCourseToEdit(null);
    } catch (error) {
      alert(error.message || 'Failed to update course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModule.title) return;
    try {
      setIsAddingModule(true);
      const headers = getAuthHeaders();
      const response = await fetch(`/api/v1/courses/${selectedCourse.id}/modules`, {
        method: 'POST', headers,
        body: JSON.stringify({ title: newModule.title, description: newModule.description, sequence_order: Number(newModule.sequence_order) })
      });
      const resData = await parseApiResponse(response);
      setModules([...modules, resData.data].sort((a, b) => a.sequence_order - b.sequence_order));
      setNewModule({ title: '', description: '', sequence_order: modules.filter(m => m.course_id === selectedCourse.id).length + 2 });
    } catch (error) {
      alert(error.message || 'Failed to add module');
    } finally {
      setIsAddingModule(false);
    }
  };

  const openCourseDetails = async (course) => {
    setSelectedCourse(course);
    setActiveTab('overview');
    try {
      setIsFetchingDetails(true);
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
      const allSubtasks = [];
      fetchedModules.forEach(m => {
        if (m.course_submodules) {
          allSubmodules.push(...m.course_submodules);
          m.course_submodules.forEach(sm => {
             if (sm.course_tasks) {
               allTasks.push(...sm.course_tasks);
               sm.course_tasks.forEach(t => {
                 if (t.course_task_subtasks) allSubtasks.push(...t.course_task_subtasks);
               });
             }
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
      setSubtasks(prev => {
        const other = prev.filter(st => !allTasks.some(t => t.id === st.task_id));
        return [...other, ...allSubtasks];
      });
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleAddSubmodule = async (e, moduleId) => {
    e.preventDefault();
    if (!newSubmodule.title) return;
    try {
      setIsAddingModule(true);
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
    } finally {
      setIsAddingModule(false);
    }
  };

  const handleAddTask = async (e, moduleId, submoduleId) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      setIsAddingModule(true);
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
    } finally {
      setIsAddingModule(false);
    }
  };

  const handleAddSubtask = async (e, moduleId, submoduleId, taskId) => {
    e.preventDefault();
    if (!newSubtask.title) return;
    try {
      setIsAddingModule(true);
      const headers = getAuthHeaders();
      const response = await fetch(`/api/v1/courses/${selectedCourse.id}/modules/${moduleId}/submodules/${submoduleId}/tasks/${taskId}/subtasks`, {
        method: 'POST', headers,
        body: JSON.stringify({ title: newSubtask.title, description: newSubtask.description, sequence_order: Number(newSubtask.sequence_order) })
      });
      const resData = await parseApiResponse(response);
      setSubtasks([...subtasks, resData.data]);
      setNewSubtask({ title: '', description: '', sequence_order: subtasks.filter(st => st.task_id === taskId).length + 2 });
    } catch (error) {
      alert(error.message || 'Failed to add subtask');
    } finally {
      setIsAddingModule(false);
    }
  };

  const handleToggleModuleStatus = async (moduleId, currentStatus) => {
    try {
      const headers = getAuthHeaders();
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const response = await fetch(`/api/v1/courses/${selectedCourse.id}/modules/${moduleId}/status`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ status: newStatus })
      });
      await parseApiResponse(response);
      setModules(modules.map(m => m.id === moduleId ? { ...m, status: newStatus } : m));
    } catch (error) {
      alert(error.message || 'Failed to update module status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const { type, moduleId, submoduleId, taskId, subtaskId } = itemToDelete;
    setIsDeleting(true);
    try {
      const headers = getAuthHeaders();
      let url = `/api/v1/courses/${selectedCourse.id}/modules/${moduleId}`;
      if (type === 'Submodule') url += `/submodules/${submoduleId}`;
      if (type === 'Task') url += `/submodules/${submoduleId}/tasks/${taskId}`;
      if (type === 'Subtask') url += `/submodules/${submoduleId}/tasks/${taskId}/subtasks/${subtaskId}`;

      const response = await fetch(url, { method: 'DELETE', headers });
      await parseApiResponse(response);

      if (type === 'Module') setModules(modules.filter(m => m.id !== moduleId));
      if (type === 'Submodule') setSubmodules(submodules.filter(s => s.id !== submoduleId));
      if (type === 'Task') setTasks(tasks.filter(t => t.id !== taskId));
      if (type === 'Subtask') setSubtasks(subtasks.filter(st => st.id !== subtaskId));
      
      setItemToDelete(null);
    } catch (error) {
      alert(error.message || `Failed to delete ${type.toLowerCase()}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePreviewSchedule = async () => {
    setPreviewLoading(true);
    setSchedulePreview(null);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/v1/courses/${selectedCourse.id}/schedule-plan/preview`, {
        method: 'POST', headers,
        body: JSON.stringify({ topics_per_day: Number(topicsPerDay) })
      });
      const resData = await parseApiResponse(response);
      setSchedulePreview(resData.data);
    } catch (error) {
      alert(error.message || 'Failed to preview schedule');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleAutoSchedule = async () => {
    setApplyingSchedule(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/v1/courses/${selectedCourse.id}/schedule-plan`, {
        method: 'POST', headers,
        body: JSON.stringify({ topics_per_day: Number(topicsPerDay) })
      });
      await parseApiResponse(response);
      alert('Schedule generated successfully');
      setSchedulePreview(null);
      openCourseDetails(selectedCourse);
    } catch (error) {
      alert(error.message || 'Failed to generate schedule');
    } finally {
      setApplyingSchedule(false);
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
      openCourseDetails(selectedCourse); 
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
      openCourseDetails(selectedCourse); 
      setMoveTopic({ submoduleId: '', targetDate: '' });
    } catch (error) {
      alert(error.message || 'Failed to move topic');
    }
  };

  const loadStudentsForAssignment = async () => {
    setIsStudentsLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/v1/students?limit=1000`, { headers });
      const resData = await parseApiResponse(response);
      setAllStudents(resData.data.students || []);
    } catch (error) {
      alert(error.message || 'Failed to fetch students');
    } finally {
      setIsStudentsLoading(false);
    }
  };

  const handleBatchAssignStudents = async () => {
    if (selectedStudentIds.length === 0) return;
    setAssigningStudents(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/v1/courses/${selectedCourse.id}/students/batch-assign`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ studentIds: selectedStudentIds })
      });
      await parseApiResponse(response);
      alert('Students assigned successfully!');
      setSelectedStudentIds([]);
      openCourseDetails(selectedCourse);
    } catch (error) {
      alert(error.message || 'Failed to assign students');
    } finally {
      setAssigningStudents(false);
    }
  };

  const filteredCourses = useMemo(() => {
    let normalizedCourses = courses.map(course => mapCourseFromApi(course));
    
    if (categoryFilter !== 'All Categories') {
      normalizedCourses = normalizedCourses.filter(c => c.category === categoryFilter);
    }
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      normalizedCourses = normalizedCourses.filter(c => 
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.track && c.track.toLowerCase().includes(q)) ||
        (c.cid && c.cid.toLowerCase().includes(q))
      );
    }
    
    return normalizedCourses;
  }, [courses, categoryFilter, employees, searchQuery]);

  const uniqueCategories = ['All Categories', 'DEVELOPMENT', 'MARKETING', 'DESIGN'];

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full relative bg-[#FAFBFC] min-h-full">
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[9999] px-6 py-4 rounded-xl shadow-2xl font-bold text-sm transform transition-all duration-300 flex items-center gap-3 ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-white'}`}>
          {toast.type === 'error' ? <X size={18} /> : <Zap size={18} className="text-emerald-400" />}
          {toast.message}
        </div>
      )}
      
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <CustomSelect
              options={uniqueCategories.map(cat => ({ value: cat, label: cat }))}
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              placeholder="Category"
            />
          </div>

        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-[#003F87] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#002B5E] shadow-md shadow-blue-900/10 transition-all active:scale-95"
        >
          <Plus size={18} /> Add Course
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Create Course Card */}
        <div 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-50/40 rounded-2xl border-2 border-dashed border-blue-200 p-6 flex flex-col items-center justify-center h-[280px] cursor-pointer hover:bg-blue-50/80 hover:border-[#003F87]/40 transition-all group shadow-sm hover:shadow-md"
        >
          <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-400 group-hover:text-[#003F87] group-hover:scale-110 mb-4 transition-all">
            <Plus size={28} />
          </div>
          <h3 className="text-lg font-black text-slate-800 leading-tight">Create New Course</h3>
          <p className="text-xs font-medium text-slate-500 mt-2 text-center px-4 leading-relaxed">Add a new training program to the curriculum.</p>
        </div>

        {filteredCourses.map(course => (
          <div key={course.id} onClick={() => openCourseDetails(course)} className={`cursor-pointer rounded-2xl p-6 flex flex-col h-[280px] relative group transition-all shadow-sm hover:shadow-xl overflow-hidden ${getCourseGradient(course.category)}`}>

            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10 translate-x-2 group-hover:translate-x-0">
              <button onClick={(e) => { e.stopPropagation(); setCourseToEdit(course); }} className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:bg-blue-50 hover:text-[#003F87] hover:border-blue-200 flex items-center justify-center transition-all" title="Edit Course">
                <Pencil size={14} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setCourseToDelete(course.id); }} className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all" title="Delete Course">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex flex-col mb-auto pt-2">
              <div className="flex gap-4 items-center mb-5">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center shadow-sm border border-slate-200">
                  {course.imgUrl ? (
                    <img src={course.imgUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={24} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-black text-slate-900 leading-tight line-clamp-1 mb-1.5">{course.title}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block bg-[#E5F0FF] text-[#003F87] text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">{course.category}</span>
                    <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${course.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : course.status === 'ARCHIVED' ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>{course.status || 'DRAFT'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 px-1">
                <div className="flex items-center gap-3 text-slate-500 text-[13px] font-medium">
                  <Clock size={16} className="text-slate-400 shrink-0" /> <span>{course.duration_months ? `${course.duration_months} Months` : course.duration}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-[13px] font-medium">
                  <User size={16} className="text-slate-400 shrink-0" /> <span className="truncate">{course.mentorName}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-[13px] font-medium">
                  <User size={16} className="text-slate-400 shrink-0" /> <span><span className="font-bold text-slate-700">{course.enrollmentCount}</span> Enrolled</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-auto flex items-center justify-between border-t border-slate-100 relative z-20">
              <span className="font-black text-[#008A2E] text-[15px]">{formatPrice(course.price)}</span>
              <button
                onClick={(e) => { e.stopPropagation(); openCourseDetails(course); }}
                className="px-4 py-2 bg-blue-50 text-[#003F87] text-[12px] font-bold rounded-lg group-hover:bg-[#003F87] group-hover:text-white transition-colors duration-300 shadow-sm"
              >
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Course Modal */}
      {(isModalOpen || courseToEdit) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => { setIsModalOpen(false); setCourseToEdit(null); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-800">{courseToEdit ? 'Edit Course' : 'Create New Course'}</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">{courseToEdit ? 'Update the details for this course.' : 'Provide the necessary information to create a new curriculum.'}</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setCourseToEdit(null); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={courseToEdit ? handleUpdateCourse : handleAddCourse} className="p-8 flex flex-col gap-8 overflow-y-auto bg-slate-50/50">
              
              {/* Thumbnail Section */}
              <div className="flex flex-col sm:flex-row gap-6 items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-32 h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative group">
                  {(courseToEdit ? courseToEdit.imgUrl : newCourse.imgUrl) ? (
                    <img src={courseToEdit ? courseToEdit.imgUrl : newCourse.imgUrl} className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : ''}`} />
                  ) : (
                    <BookOpen size={32} className="text-slate-300" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                      <div className="w-5 h-5 border-2 border-[#003F87] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-800 mb-1">Course Thumbnail</h3>
                  <p className="text-sm font-medium text-slate-500 mb-3">Upload a 16:9 high-resolution image to make your course stand out visually.</p>
                  <label className={`cursor-pointer bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2 border border-slate-200 shadow-sm transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload size={14} /> {(courseToEdit ? courseToEdit.imgUrl : newCourse.imgUrl) ? 'Change Image' : 'Upload Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, !!courseToEdit)} disabled={isUploading} />
                  </label>
                </div>
              </div>

              {/* Core Details */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2"><BookOpen size={16} className="text-[#003F87]" /> Core Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Course Title *</label>
                    <input type="text" required placeholder="e.g., Advanced Full Stack Development" value={courseToEdit ? courseToEdit.title : newCourse.title} onChange={e => courseToEdit ? setCourseToEdit({ ...courseToEdit, title: e.target.value }) : setNewCourse({ ...newCourse, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
                    <CustomSelect
                      options={[{ value: 'DEVELOPMENT', label: 'DEVELOPMENT' }, { value: 'MARKETING', label: 'MARKETING' }, { value: 'DESIGN', label: 'DESIGN' }]}
                      value={courseToEdit ? courseToEdit.category : newCourse.category}
                      onChange={val => courseToEdit ? setCourseToEdit({ ...courseToEdit, category: val }) : setNewCourse({ ...newCourse, category: val })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
                    <CustomSelect
                      options={[{ value: 'DRAFT', label: 'DRAFT' }, { value: 'PUBLISHED', label: 'PUBLISHED' }, { value: 'ARCHIVED', label: 'ARCHIVED' }]}
                      value={courseToEdit ? (courseToEdit.status || 'DRAFT') : newCourse.status}
                      onChange={val => courseToEdit ? setCourseToEdit({ ...courseToEdit, status: val }) : setNewCourse({ ...newCourse, status: val })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea rows="3" placeholder="Describe the curriculum..." value={courseToEdit ? (courseToEdit.description || '') : newCourse.description} onChange={e => courseToEdit ? setCourseToEdit({ ...courseToEdit, description: e.target.value }) : setNewCourse({ ...newCourse, description: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all resize-none" />
                </div>
              </div>

              {/* Logistics */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2"><LayoutList size={16} className="text-[#003F87]" /> Logistics & Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Duration (Months)</label>
                    <input type="number" min="1" value={courseToEdit ? (courseToEdit.duration_months || 1) : newCourse.duration_months} onChange={e => courseToEdit ? setCourseToEdit({ ...courseToEdit, duration_months: e.target.value }) : setNewCourse({ ...newCourse, duration_months: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Capacity</label>
                    <input type="number" min="1" value={courseToEdit ? (courseToEdit.capacity || 20) : newCourse.capacity} onChange={e => courseToEdit ? setCourseToEdit({ ...courseToEdit, capacity: e.target.value }) : setNewCourse({ ...newCourse, capacity: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Instructor *</label>
                    <CustomSelect
                      options={employees.map(emp => ({ value: emp.id, label: `${emp.name} (${emp.position || emp.department})` }))}
                      value={courseToEdit ? courseToEdit.mentorId : newCourse.mentorId}
                      onChange={val => courseToEdit ? setCourseToEdit({ ...courseToEdit, mentorId: val }) : setNewCourse({ ...newCourse, mentorId: val })}
                      searchable={true}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Price (e.g. ₹500.00)</label>
                    <input type="text" value={courseToEdit ? courseToEdit.price : newCourse.price} onChange={e => courseToEdit ? setCourseToEdit({ ...courseToEdit, price: e.target.value }) : setNewCourse({ ...newCourse, price: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all" placeholder="Leave blank for free" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-2">
                <button type="button" onClick={() => { setIsModalOpen(false); setCourseToEdit(null); }} className="px-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading || isSubmitting} className={`px-8 py-3 bg-[#003F87] rounded-xl text-sm font-bold text-white shadow-md shadow-blue-900/10 active:scale-95 transition-all ${isUploading || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#002B5E]'}`}>
                  {isSubmitting ? 'Saving...' : (courseToEdit ? 'Save Changes' : 'Create Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setCourseToDelete(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col gap-4 text-center animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-rose-50 border-4 border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Delete Course?</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">This permanently removes the course, all modules, and schedules. This cannot be undone.</p>
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={() => setCourseToDelete(null)} className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors flex-1">
                Cancel
              </button>
              <button onClick={() => handleDeleteCourse(courseToDelete)} disabled={isDeleting} className={`px-6 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all flex-1 ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-rose-700'}`}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Curriculum Item Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setItemToDelete(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col gap-4 text-center animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-rose-50 border-4 border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Delete {itemToDelete.type}?</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">
              Are you sure you want to delete <span className="font-bold text-slate-700">{itemToDelete.title}</span>? This permanently removes it and all its contents. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={() => setItemToDelete(null)} className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors flex-1">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} disabled={isDeleting} className={`px-6 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all flex-1 ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-rose-700'}`}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Command Center Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in duration-200" onClick={() => setSelectedCourse(null)}>
          <div className="bg-[#FAFBFC] rounded-3xl shadow-2xl w-full max-w-5xl h-full sm:h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="bg-white px-8 py-8 border-b border-slate-100 flex items-start justify-between shrink-0 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 relative z-10 w-full pr-8 sm:pr-12">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedCourse.imgUrl ? (
                    <img src={selectedCourse.imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={40} className="text-[#003F87]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest">{selectedCourse.category}</span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest ${selectedCourse.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : selectedCourse.status === 'ARCHIVED' ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>{selectedCourse.status || 'DRAFT'}</span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2 line-clamp-2">{selectedCourse.title}</h2>
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                    <div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> <span>{selectedCourse.duration_months ? `${selectedCourse.duration_months} Months` : selectedCourse.duration}</span></div>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <div className="flex items-center gap-1.5"><User size={14} className="text-slate-400" /> <span>{selectedCourse.mentorName}</span></div>
                  </div>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Price</div>
                  <div className="text-2xl font-black text-[#008A2E]">{formatPrice(selectedCourse.price)}</div>
                </div>
              </div>

              <button onClick={() => setSelectedCourse(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors relative z-10">
                <X size={20} />
              </button>
            </div>

            {/* Pill Navigation Tabs */}
            <div className="px-8 py-6 border-b border-slate-100 bg-white shrink-0 overflow-x-auto hide-scrollbar">
              <div className="flex gap-2">
                {[
                  { id: 'overview', icon: <BookOpen size={16} />, label: 'Overview' },
                  { id: 'students', icon: <User size={16} />, label: 'Students' },
                  { id: 'modules', icon: <LayoutList size={16} />, label: 'Curriculum Builder' }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)} 
                    className={`
                      px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all whitespace-nowrap
                      ${activeTab === tab.id 
                        ? 'bg-[#003F87] text-white shadow-md shadow-blue-900/10' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                      }
                    `}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Content Area */}
            <div className="p-8 overflow-y-auto flex-1">
              {isFetchingDetails ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-8 h-8 border-4 border-[#003F87] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium mt-4 text-sm">Loading course details...</p>
                </div>
              ) : (
                <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300 fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Course Description</h3>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedCourse.description || 'No detailed description has been provided for this course yet.'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003F87] flex items-center justify-center shrink-0 border border-blue-100"><Clock size={20} /></div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</div>
                        <div className="text-[15px] font-bold text-slate-800">{selectedCourse.duration_months ? `${selectedCourse.duration_months} Months` : selectedCourse.duration}</div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100"><User size={20} /></div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Enrolled Students</div>
                        <div className="text-[15px] font-bold text-slate-800"><span className="text-emerald-600 font-black">{selectedCourse.enrollmentCount}</span></div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100"><User size={20} /></div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Instructor</div>
                        <div className="text-[15px] font-bold text-slate-800 truncate">{selectedCourse.mentorName}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Students Tab */}
              {activeTab === 'students' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300 fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Assign Students</h3>
                      <p className="text-sm text-slate-500 mt-1">Select students to enroll them in {selectedCourse.title}</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={loadStudentsForAssignment}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Refresh List
                      </button>
                      <button 
                        onClick={handleBatchAssignStudents}
                        disabled={selectedStudentIds.length === 0 || assigningStudents}
                        className="px-6 py-2 bg-[#003F87] rounded-xl text-sm font-bold text-white hover:bg-[#002B5E] shadow-md shadow-blue-900/10 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {assigningStudents ? 'Assigning...' : `Assign ${selectedStudentIds.length} Student${selectedStudentIds.length !== 1 ? 's' : ''}`}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {isStudentsLoading ? (
                      <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading students...</div>
                    ) : allStudents.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm font-medium">No students found. Click Refresh List.</div>
                    ) : (
                      <div className="max-h-[50vh] overflow-y-auto">
                        <table className="w-full text-center border-collapse">
                          <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                              <th className="py-4 px-6 border-b border-slate-200 w-12 text-center">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 rounded border-slate-300 text-[#003F87] focus:ring-[#003F87] cursor-pointer inline-block align-middle"
                                  onChange={(e) => setSelectedStudentIds(e.target.checked ? allStudents.map(s => s.id) : [])}
                                  checked={selectedStudentIds.length === allStudents.length && allStudents.length > 0}
                                />
                              </th>
                              <th className="py-4 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">Student Name</th>
                              <th className="py-4 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">Code</th>
                              <th className="py-4 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">Phone</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allStudents.map(student => (
                              <tr key={student.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors group">
                                <td className="py-4 px-6 text-center">
                                  <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-slate-300 text-[#003F87] focus:ring-[#003F87] cursor-pointer inline-block align-middle"
                                    checked={selectedStudentIds.includes(student.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, student.id]);
                                      else setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                                    }}
                                  />
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <div className="flex items-center justify-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#E5F0FF] text-[#003F87] flex items-center justify-center font-black text-xs shadow-inner group-hover:bg-[#003F87] group-hover:text-white transition-colors">
                                      {student.first_name?.[0] || 'U'}{student.last_name?.[0] || ''}
                                    </div>
                                    <span className="font-bold text-slate-800 text-sm">{student.first_name} {student.last_name}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-sm font-bold text-slate-500">{student.student_code}</td>
                                <td className="py-4 px-6 text-sm font-medium text-slate-500">{student.phone || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modules Tab - Curriculum Builder */}
              {activeTab === 'modules' && (
                <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-300 fade-in">
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Add Module Sidebar */}
                    <div className="w-full lg:w-[320px] shrink-0 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-0">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2"><LayoutList size={18} className="text-[#003F87]" /> New Module</h3>
                      <form onSubmit={handleAddModule} className="flex flex-col gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Module Title</label>
                          <input type="text" required value={newModule.title} onChange={e => setNewModule({ ...newModule, title: e.target.value })} className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description (Optional)</label>
                          <textarea rows="2" value={newModule.description} onChange={e => setNewModule({ ...newModule, description: e.target.value })} className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 transition-all resize-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sequence Order</label>
                          <input type="number" required value={newModule.sequence_order} onChange={e => setNewModule({ ...newModule, sequence_order: e.target.value })} className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 transition-all" />
                        </div>
                        <button type="submit" disabled={isAddingModule} className={`w-full py-3 mt-2 bg-[#003F87] text-white text-sm font-bold rounded-xl shadow-sm active:scale-95 transition-all ${isAddingModule ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#002B5E]'}`}>
                          {isAddingModule ? 'Adding...' : 'Create Module'}
                        </button>
                      </form>
                    </div>

                    {/* Curriculum List */}
                    <div className="flex-1 w-full flex flex-col gap-4">
                      {modules.filter(m => m.course_id === selectedCourse.id).length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                          <LayoutList size={48} className="mx-auto text-slate-200 mb-4" />
                          <h4 className="text-lg font-bold text-slate-700">Empty Curriculum</h4>
                          <p className="text-sm text-slate-500 mt-1">Start building the course by adding modules from the left panel.</p>
                        </div>
                      ) : (
                        modules.filter(m => m.course_id === selectedCourse.id).sort((a, b) => a.sequence_order - b.sequence_order).map(m => (
                          <div key={m.id} draggable onDragStart={(e) => handleDragStart(e, 'Module', m.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'Module', m.id)} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden group cursor-move">
                            
                            {/* Module Header */}
                            <div 
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 cursor-pointer hover:bg-blue-50/30 transition-colors"
                              onClick={() => setExpandedModuleId(expandedModuleId === m.id ? null : m.id)}
                            >
                              <div className="flex gap-4 items-start sm:items-center flex-1">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003F87] font-black flex items-center justify-center shrink-0 border border-blue-100 text-lg group-hover:bg-[#003F87] group-hover:text-white transition-colors">{m.sequence_order}</div>
                                <div>
                                  <div className="text-base font-black text-slate-900">{m.title}</div>
                                  {m.description && <div className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-2 sm:line-clamp-1">{m.description}</div>}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end w-full sm:w-auto">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleModuleStatus(m.id, m.status); }}
                                  className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-md tracking-wider border transition-colors ${m.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                                >
                                  {m.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setItemToDelete({ type: 'Module', moduleId: m.id, title: m.title }); }}
                                  className="w-8 h-8 rounded-md flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                  title="Delete Module"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${expandedModuleId === m.id ? 'bg-[#003F87] text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-[#003F87] group-hover:text-white'}`}>
                                  <ChevronDown size={18} />
                                </div>
                              </div>
                            </div>
                            
                            {/* Submodules Content */}
                            {expandedModuleId === m.id && (
                              <div className="bg-[#FAFBFC] border-t border-slate-100 p-5 pl-16">
                                
                                {/* Add Topic Inline Form */}
                                <form onSubmit={(e) => handleAddSubmodule(e, m.id)} className="flex flex-wrap sm:flex-nowrap gap-3 items-center mb-6 bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                  <input type="text" placeholder="New Topic Title..." required value={newSubmodule.title} onChange={e => setNewSubmodule({...newSubmodule, title: e.target.value})} className="flex-1 text-sm p-2 bg-transparent outline-none font-medium placeholder-slate-400" />
                                  <div className="w-[80px] shrink-0 border-l border-slate-100 pl-3">
                                    <input type="number" placeholder="Seq" required value={newSubmodule.sequence_order} onChange={e => setNewSubmodule({...newSubmodule, sequence_order: e.target.value})} className="w-full text-sm p-2 bg-transparent outline-none text-center font-bold text-[#003F87] placeholder-slate-400" />
                                  </div>
                                  <button type="submit" disabled={isAddingModule} className={`py-2.5 px-5 bg-[#003F87] text-white text-xs font-bold rounded-lg cursor-pointer shadow-sm active:scale-95 transition-all shrink-0 ${isAddingModule ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#002B5E]'}`}>
                                    {isAddingModule ? '...' : <Plus size={16} />}
                                  </button>
                                </form>

                                {/* Topics List */}
                                <div className="flex flex-col gap-3">
                                  {submodules.filter(sm => sm.module_id === m.id).length === 0 ? (
                                    <p className="text-sm font-medium text-slate-400 italic py-2">No topics defined in this module yet.</p>
                                  ) : (
                                    submodules.filter(sm => sm.module_id === m.id).sort((a,b) => a.sequence_order - b.sequence_order).map(sm => (
                                      <div key={sm.id} draggable onDragStart={(e) => handleDragStart(e, 'Submodule', sm.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'Submodule', sm.id, m.id)} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.01)] hover:border-blue-200 transition-colors cursor-move">
                                        <div 
                                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors gap-3"
                                          onClick={() => setExpandedSubmoduleId(expandedSubmoduleId === sm.id ? null : sm.id)}
                                        >
                                          <div className="flex gap-4 items-center flex-1">
                                            <div className="text-[#003F87] font-black text-sm w-8 text-center bg-blue-50 py-1 rounded">{m.sequence_order}.{sm.sequence_order}</div>
                                            <div className="font-bold text-slate-800 text-sm">
                                              {sm.title}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
                                            {sm.scheduled_date && <div className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md uppercase tracking-wider">Plan: {formatDateToDDMMYYYY(sm.scheduled_date)}</div>}
                                            <div className="text-[#003F87] font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                                              {expandedSubmoduleId === sm.id ? 'Hide Tasks' : 'Tasks'} <ChevronDown size={14} className={expandedSubmoduleId === sm.id ? 'rotate-180' : ''} />
                                            </div>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); setItemToDelete({ type: 'Submodule', moduleId: m.id, submoduleId: sm.id, title: sm.title }); }}
                                              className="w-6 h-6 rounded flex items-center justify-center text-red-300 hover:bg-red-50 hover:text-red-500 transition-colors ml-2"
                                              title="Delete Topic"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </div>
                                        
                                        {/* Tasks Panel */}
                                        {expandedSubmoduleId === sm.id && (
                                          <div className="p-4 border-t border-slate-100 bg-[#FAFBFC] border-l-[3px] border-l-[#003F87]">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Homework & Tasks</h5>
                                            
                                            <div className="flex flex-col gap-2 mb-4">
                                              {tasks.filter(t => t.submodule_id === sm.id).length === 0 ? (
                                                <p className="text-xs font-medium text-slate-400 italic">No tasks assigned to this topic.</p>
                                              ) : (
                                                tasks.filter(t => t.submodule_id === sm.id).sort((a,b) => a.sequence_order - b.sequence_order).map(t => (
                                                  <div key={t.id} draggable onDragStart={(e) => handleDragStart(e, 'Task', t.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'Task', t.id, sm.id)} className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col cursor-move">
                                                    <div className="py-2.5 px-4 flex flex-wrap sm:flex-nowrap gap-3 items-center cursor-pointer hover:bg-slate-50" onClick={() => setExpandedTaskId(expandedTaskId === t.id ? null : t.id)}>
                                                      <div className="w-5 h-5 rounded bg-slate-100 text-slate-500 text-[10px] font-black flex items-center justify-center shrink-0">{t.sequence_order}</div>
                                                      <div className="flex-1 text-sm font-semibold text-slate-700 min-w-[150px]">{t.title}</div>
                                                      <div className={`text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-wider ml-auto sm:ml-0 ${t.task_type === 'EXTRA' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-[#003F87]'}`}>{t.task_type === 'EXTRA' ? 'Bonus' : 'Required'}</div>
                                                      <button
                                                        onClick={(e) => { e.stopPropagation(); setItemToDelete({ type: 'Task', moduleId: m.id, submoduleId: sm.id, taskId: t.id, title: t.title }); }}
                                                        className="w-6 h-6 rounded flex items-center justify-center text-red-300 hover:bg-red-50 hover:text-red-500 transition-colors ml-1"
                                                        title="Delete Task"
                                                      >
                                                        <Trash2 size={14} />
                                                      </button>
                                                    </div>
                                                    
                                                    {expandedTaskId === t.id && (
                                                      <div className="bg-slate-50 border-t border-slate-100 p-3 pl-12 flex flex-col gap-2">
                                                        <h6 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Subtasks (Steps)</h6>
                                                        {subtasks.filter(st => st.task_id === t.id).sort((a,b) => a.sequence_order - b.sequence_order).map(st => (
                                                          <div key={st.id} draggable onDragStart={(e) => handleDragStart(e, 'Subtask', st.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'Subtask', st.id, t.id)} className="flex gap-2 items-start bg-white p-2 rounded border border-slate-100 cursor-move">
                                                            <div className="text-[10px] font-bold text-[#003F87] w-4 mt-0.5">{st.sequence_order}.</div>
                                                            <div className="flex-1">
                                                              <div className="text-xs font-bold text-slate-700">{st.title}</div>
                                                              {st.description && <div className="text-[10px] text-slate-500 mt-0.5">{st.description}</div>}
                                                            </div>
                                                            <button
                                                              onClick={(e) => { e.preventDefault(); setItemToDelete({ type: 'Subtask', moduleId: m.id, submoduleId: sm.id, taskId: t.id, subtaskId: st.id, title: st.title }); }}
                                                              className="w-6 h-6 rounded flex items-center justify-center text-red-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                              title="Delete Step"
                                                            >
                                                              <Trash2 size={12} />
                                                            </button>
                                                          </div>
                                                        ))}
                                                        
                                                        <form onSubmit={(e) => handleAddSubtask(e, m.id, sm.id, t.id)} className="flex flex-col gap-2 mt-2 bg-white p-2 rounded border border-blue-100">
                                                          <div className="flex gap-2">
                                                            <input type="text" placeholder="Subtask title..." required value={newSubtask.title} onChange={e => setNewSubtask({...newSubtask, title: e.target.value})} className="flex-1 text-xs p-1.5 bg-slate-50 border border-slate-100 rounded outline-none focus:border-[#003F87]" />
                                                            <input type="number" placeholder="Seq" required value={newSubtask.sequence_order} onChange={e => setNewSubtask({...newSubtask, sequence_order: e.target.value})} className="w-12 text-xs p-1.5 bg-slate-50 border border-slate-100 rounded outline-none focus:border-[#003F87] text-center" />
                                                          </div>
                                                          <div className="flex gap-2">
                                                            <input type="text" placeholder="Description (optional)" value={newSubtask.description} onChange={e => setNewSubtask({...newSubtask, description: e.target.value})} className="flex-1 text-[10px] p-1.5 bg-slate-50 border border-slate-100 rounded outline-none focus:border-[#003F87]" />
                                                            <button type="submit" disabled={isAddingModule} className="px-3 py-1 bg-[#008A2E] text-white text-[10px] font-bold rounded uppercase tracking-wider hover:bg-[#006E24] disabled:opacity-50">Add Step</button>
                                                          </div>
                                                        </form>
                                                      </div>
                                                    )}
                                                  </div>
                                                ))
                                              )}
                                            </div>
                                            
                                            <form onSubmit={(e) => handleAddTask(e, m.id, sm.id)} className="flex flex-wrap sm:flex-nowrap gap-2 items-center bg-white p-2 rounded-lg border border-slate-200">
                                              <input type="text" placeholder="Add a new task..." required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="flex-1 text-xs p-2 outline-none font-medium placeholder-slate-400" />
                                              <div className="h-4 w-px bg-slate-200"></div>
                                              <select value={newTask.task_type} onChange={e => setNewTask({...newTask, task_type: e.target.value})} className="w-[100px] text-xs p-2 outline-none text-slate-600 font-bold bg-transparent cursor-pointer">
                                                <option value="PRE_PLANNED">Required</option>
                                                <option value="EXTRA">Bonus</option>
                                              </select>
                                              <div className="h-4 w-px bg-slate-200"></div>
                                              <input type="number" placeholder="Seq" required value={newTask.sequence_order} onChange={e => setNewTask({...newTask, sequence_order: e.target.value})} className="w-[50px] text-xs p-2 outline-none text-center font-bold text-[#003F87]" />
                                              <button type="submit" disabled={isAddingModule} className={`py-2 px-4 bg-[#008A2E] text-white text-[10px] uppercase tracking-widest font-black rounded-md transition-colors shadow-sm ${isAddingModule ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#006E24]'}`}>
                                                {isAddingModule ? '...' : <Plus size={14} />}
                                              </button>
                                            </form>
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesContent;
