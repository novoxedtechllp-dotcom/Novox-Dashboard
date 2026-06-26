import { apiClient } from '../../../lib/apiClient';

export const getEmployees = async () => {
  const response = await apiClient('/employees');
  return response.data || [];
};

export const getAttendanceLogs = async () => {
  const response = await apiClient('/attendance?limit=1000');
  return response.data || [];
};

export const getMonthlyAttendance = async (userId, type, from, to) => {
  const response = await apiClient(`/attendance?userId=${userId}&type=${type}&from=${from}&to=${to}`);
  return response.data || [];
};

export const getLeaderboard = async () => {
  const response = await apiClient('/leaderboard');
  return response.data?.leaderboard || response.data || [];
};

export const getRecruitmentCandidates = async () => {
  const response = await apiClient('/recruitment');
  return response.data?.candidates || response.data || [];
};

export const getCurriculum = async () => {
  const response = await apiClient('/curriculum');
  return response.data?.curriculum || response.data || {};
};

// Gallery Endpoints
export const getGalleryWebsites = async () => {
  const response = await apiClient('/gallery/websites');
  return response.data || response;
};

export const getGalleryCategories = async (websiteId) => {
  const response = await apiClient(`/gallery/categories?website_id=${websiteId}`);
  return response.data || response;
};

export const deleteGalleryCategory = async (id) => {
  const response = await apiClient(`/gallery/categories/${id}`, { method: 'DELETE' });
  return response.data || response;
};

export const createGalleryWebsite = async (payload) => {
  const response = await apiClient('/gallery/websites', { method: 'POST', body: JSON.stringify(payload) });
  return response.data || response;
};

export const deleteGalleryWebsite = async (id) => {
  const response = await apiClient(`/gallery/websites/${id}`, { method: 'DELETE' });
  return response.data || response;
};

export const createGalleryCategory = async (payload) => {
  const response = await apiClient('/gallery/categories', { method: 'POST', body: JSON.stringify(payload) });
  return response.data || response;
};

export const getGalleryImages = async (websiteId) => {
  const response = await apiClient(`/gallery?t=${Date.now()}&website_id=${websiteId}`);
  return response.data || response;
};

export const getGalleryStorageUsage = async () => {
  const response = await apiClient('/gallery/storage-usage');
  return response.data || response;
};

export const bulkDeleteGalleryImages = async (ids) => {
  const response = await apiClient('/gallery/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) });
  return response.data || response;
};

export const updateGalleryImage = async (id, payload) => {
  const response = await apiClient(`/gallery/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  return response.data || response;
};

export const uploadGalleryImage = async (formData) => {
  const response = await apiClient('/gallery/upload', { method: 'POST', body: formData });
  return response.data || response;
};

export const getCourses = async () => {
  const response = await apiClient('/courses');
  return response.data || [];
};

export const getStudents = async () => {
  const response = await apiClient('/students?limit=1000');
  return response.data?.students || response.data || [];
};

// export const getEmployees = async () => {
//   const response = await apiClient('/employees?limit=1000');
//   return response.data?.employees || response.data || [];
// };

export const addEmployee = async (payload) => {
  const response = await apiClient('/employees', { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};

export const updateEmployee = async (id, payload) => {
  const response = await apiClient(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await apiClient(`/employees/${id}`, { method: 'DELETE' });
  return response.data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient('/upload', {
    method: 'POST',
    body: formData,
    
  });
  return response.data;
};

// Admin Course Endpoints
// export const getCourses = async () => {
//   const response = await apiClient('/courses');
//   return response.data?.courses || response.data || [];
// };

export const createCourse = async (payload) => {
  const response = await apiClient('/courses', { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};

export const updateCourse = async (id, payload) => {
  const response = await apiClient(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  return response.data;
};

export const deleteCourse = async (id) => {
  const response = await apiClient(`/courses/${id}`, { method: 'DELETE' });
  return response.data;
};

export const getCourseDetails = async (id) => {
  const response = await apiClient(`/courses/${id}`);
  return response.data;
};

export const reorderModules = async (courseId, payload) => {
  const response = await apiClient(`/courses/${courseId}/modules/reorder`, { method: 'PATCH', body: JSON.stringify(payload) });
  return response.data;
};

export const reorderSubmodules = async (courseId, moduleId, payload) => {
  const response = await apiClient(`/courses/${courseId}/modules/${moduleId}/submodules/reorder`, { method: 'PATCH', body: JSON.stringify(payload) });
  return response.data;
};

export const reorderTasks = async (courseId, moduleId, submoduleId, payload) => {
  const response = await apiClient(`/courses/${courseId}/modules/${moduleId}/submodules/${submoduleId}/tasks/reorder`, { method: 'PATCH', body: JSON.stringify(payload) });
  return response.data;
};

export const reorderSubtasks = async (courseId, moduleId, submoduleId, taskId, payload) => {
  const response = await apiClient(`/courses/${courseId}/modules/${moduleId}/submodules/${submoduleId}/tasks/${taskId}/subtasks/reorder`, { method: 'PATCH', body: JSON.stringify(payload) });
  return response.data;
};

export const addCourseModule = async (courseId, payload) => {
  const response = await apiClient(`/courses/${courseId}/modules`, { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};

export const addCourseSubmodule = async (courseId, moduleId, payload) => {
  const response = await apiClient(`/courses/${courseId}/modules/${moduleId}/submodules`, { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};

export const addCourseTask = async (courseId, moduleId, submoduleId, payload) => {
  const response = await apiClient(`/courses/${courseId}/modules/${moduleId}/submodules/${submoduleId}/tasks`, { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};

export const addCourseSubtask = async (courseId, moduleId, submoduleId, taskId, payload) => {
  const response = await apiClient(`/courses/${courseId}/modules/${moduleId}/submodules/${submoduleId}/tasks/${taskId}/subtasks`, { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};

export const updateModuleStatus = async (courseId, moduleId, status) => {
  const response = await apiClient(`/courses/${courseId}/modules/${moduleId}/status`, { method: 'PATCH', data: { status } });
  return response.data;
};

export const deleteCourseItem = async (url) => {
  const response = await apiClient(url, { method: 'DELETE' });
  return response.data;
};

export const previewCourseSchedule = async (courseId, topics_per_day) => {
  const response = await apiClient(`/courses/${courseId}/schedule-plan/preview`, { method: 'POST', data: { topics_per_day } });
  return response.data;
};

export const autoScheduleCourse = async (courseId, topics_per_day) => {
  const response = await apiClient(`/courses/${courseId}/schedule-plan`, { method: 'POST', data: { topics_per_day } });
  return response.data;
};

export const addCourseHoliday = async (courseId, holiday_date) => {
  const response = await apiClient(`/courses/${courseId}/reschedule`, { method: 'POST', data: { holiday_date } });
  return response.data;
};

export const moveCourseTopic = async (courseId, moduleId, submoduleId, scheduled_date) => {
  const response = await apiClient(`/courses/${courseId}/modules/${moduleId}/submodules/${submoduleId}`, { method: 'PUT', data: { scheduled_date } });
  return response.data;
};

export const batchAssignStudents = async (courseId, studentIds) => {
  const response = await apiClient(`/courses/${courseId}/students/batch-assign`, { method: 'POST', data: { studentIds } });
  return response.data;
};

// Fees Endpoints
export const getFeesSummary = async (month, year) => {
  const response = await apiClient(`/fees/summary?month=${month}&year=${year}`);
  return response.data;
};

export const getFeesBalances = async (month, year) => {
  const response = await apiClient(`/fees/balances?month=${month}&year=${year}`);
  return response.data || [];
};

export const getFeesPayments = async (month, year, limit = 1000) => {
  const response = await apiClient(`/fees/payments?month=${month}&year=${year}&limit=${limit}`);
  return response.data;
};

export const createFeePlan = async (payload) => {
  const response = await apiClient('/fees/plans', { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};

export const recordFeePayment = async (payload) => {
  const response = await apiClient('/fees/payments', { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};

export const deleteFeePayment = async (id) => {
  const response = await apiClient(`/fees/payments/${id}`, { method: 'DELETE' });
  return response.data;
};

export const updateFeePayment = async (id, payload) => {
  const response = await apiClient(`/fees/payments/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  return response.data;
};

export const updateFeePlanBillingDate = async (id, payload) => {
  const response = await apiClient(`/fees/plans/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  return response.data;
};

export const updateFeePlanDueDate = async (id, payload) => {
  const response = await apiClient(`/fees/plans/${id}/due-date`, { method: 'PUT', body: JSON.stringify(payload) });
  return response.data;
};

// Payroll Endpoints
export const getPayroll = async (month) => {
  const response = await apiClient(`/payroll?month=${month}`);
  return response;
};

export const processPayroll = async (payload) => {
  const response = await apiClient('/payroll/process', { method: 'POST', body: JSON.stringify(payload) });
  return response;
};

export const updateEmployeeSalary = async (id, salary) => {
  const response = await apiClient(`/employees/${id}`, { method: 'PUT', data: { salary } });
  return response;
};

// Admin Leave Endpoints
export const getLeaves = async () => {
  const response = await apiClient('/leaves');
  return response.data;
};

export const updateLeaveStatus = async (id, status, adminMessage = null) => {
  const data = { status };
  if (adminMessage) {
    data.adminMessage = adminMessage;
  }
  const response = await apiClient(`/leaves/${id}/status`, { method: 'PUT', data });
  return response.data;
};



export const getStudentAttendance = async () => {
  const response = await apiClient('/attendance?type=student');
  return response.data || [];
};

export const getEmployeeAttendance = async () => {
  const response = await apiClient('/attendance?type=employee');
  return response.data || [];
};

export const markAttendance = async (payload) => {
  const response = await apiClient('/attendance', { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};
