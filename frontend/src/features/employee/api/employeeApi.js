import { apiClient } from '../../../lib/apiClient';

export const getEmployeeAttendance = async () => {
  const response = await apiClient('/attendance?type=employee');
  return response.data || [];
};

export const getAttendanceRecords = async (type, from, to) => {
  let url = `/attendance?type=${type}`;
  if (from) url += `&from=${from}`;
  if (to) url += `&to=${to}`;
  const response = await apiClient(url);
  return response.data || [];
};

export const employeePunchIn = async () => {
  const response = await apiClient('/attendance/check-in', { method: 'POST' });
  return response.data;
};

export const employeePunchOut = async () => {
  const response = await apiClient('/attendance/check-out', { method: 'POST' });
  return response.data;
};

export const getEmployees = async () => {
  const response = await apiClient('/employees?limit=1000');
  return response.data?.employees || response.data || [];
};

export const getCourses = async () => {
  const response = await apiClient('/courses');
  return response.data?.courses || response.data || [];
};

export const getCourseDetails = async (id) => {
  const response = await apiClient(`/courses/${id}`);
  return response.data;
};

export const getStudents = async (instructorId = '') => {
  const query = instructorId ? `&instructorId=${instructorId}` : '';
  const response = await apiClient(`/students?limit=1000${query}`);
  return response.data?.students || response.data || [];
};

// export const getStudentAttendance = async () => {
//   const response = await apiClient('/attendance?type=student');
//   return response.data || [];
// };

// Mentoring Sessions Endpoints
export const getMentoringSessions = async (userId, date, userType) => {
  const typeStr = userType === 'STUDENT' ? 'students' : 'employees';
  const response = await apiClient(`/${typeStr}/${userId}/mentoring-sessions?date=${date}`);
  return response.data || [];
};

export const submitStudentReview = async (userId, sessionId, payload) => {
  const response = await apiClient(`/students/${userId}/mentoring-sessions/${sessionId}/review`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return response;
};

export const logMentoringSession = async (userId, payload) => {
  const response = await apiClient(`/employees/${userId}/mentoring-sessions`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return response;
};

export const getAvailableTopics = async (userId, date) => {
  const response = await apiClient(`/employees/${userId}/available-topics?date=${date}`);
  return response.data || [];
};

export const getStudentAttendance = async () => {
  const response = await apiClient('/attendance?type=student');
  return response.data || [];
};

export const getStudentSubmoduleProgress = async (studentId) => {
  const response = await apiClient(`/students/${studentId}/progress/submodules`);
  return response.data || [];
};

export const getStudentTasksProgress = async (studentId) => {
  const response = await apiClient(`/students/${studentId}/tasks`);
  return response.data || [];
};

// Work Reports Endpoints
export const getWorkReports = async () => {
  const response = await apiClient('/work-reports');
  return response.data || [];
};

export const submitWorkReport = async (payload) => {
  const response = await apiClient('/work-reports', { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};

// Leave Endpoints
export const getLeaves = async () => {
  const response = await apiClient('/leaves');
  return response.data || [];
};

export const createLeave = async (payload) => {
  const response = await apiClient('/leaves', { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};

export const updateLeaveStatus = async (id, status, adminMessage = '') => {
  const response = await apiClient(`/leaves/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, adminMessage })
  });
  return response.data;
};

export const deleteLeave = async (id) => {
  const response = await apiClient(`/leaves/${id}`, { method: 'DELETE' });
  return response.data;
};

// Payroll Endpoints
export const getEmployeePayslips = async (empId) => {
  const response = await apiClient(`/payroll/employee/${empId}`);
  return response.data || [];
};

// Profile Endpoints
export const getMyProfile = async () => {
  const response = await apiClient('/profile/me');
  return response;
};

export const updateMyProfile = async (formData) => {
  const response = await apiClient('/profile/me', {
    method: 'PUT',
    body: formData,
    
  });
  return response;
};

export const changePassword = async (payload) => {
  const response = await apiClient('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return response;
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

// CRM Leads Endpoints
export const getLeads = async () => {
  const response = await apiClient('/leads');
  return response.data || [];
};

export const getLeadSources = async () => {
  const response = await apiClient('/leads/sources');
  return response.data || [];
};

export const getLeadPerformance = async () => {
  const response = await apiClient('/leads/performance');
  return response.data || [];
};

export const createLead = async (payload) => {
  const response = await apiClient('/leads', { method: 'POST', body: JSON.stringify(payload) });
  return response;
};

export const updateLead = async (id, payload) => {
  const response = await apiClient(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  return response;
};

export const getLeadActivities = async (id) => {
  const response = await apiClient(`/leads/${id}/activities`);
  return response.data || [];
};

export const addLeadActivity = async (id, payload) => {
  const response = await apiClient(`/leads/${id}/activities`, { method: 'POST', body: JSON.stringify(payload) });
  return response;
};

// Blog Agent Endpoints
export const getBlogs = async (siteId = '') => {
  const query = siteId ? `?siteId=${siteId}` : '';
  const response = await apiClient(`/blogs${query}`);
  return response.data || response.posts || [];
};

export const getBlogConfig = async () => {
  const response = await apiClient('/blogs/config');
  return response.data;
};

export const getBlogDetails = async (id, siteId = '') => {
  const query = siteId ? `?siteId=${siteId}` : '';
  const response = await apiClient(`/blogs/${id}${query}`);
  return response.data;
};

export const deleteBlog = async (id, siteId) => {
  const response = await apiClient(`/blogs/${id}/delete`, {
    method: 'POST',
    headers: { 'x-site-id': siteId }
  });
  return response.data || response;
};

export const generateBlogImageOnly = async (payload, siteId) => {
  const response = await apiClient('/blogs/generate-image-only', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'x-site-id': siteId }
  });
  return response.data || response;
};

export const generateBlog = async (payload, siteId) => {
  const response = await apiClient('/blogs/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'x-site-id': siteId }
  });
  return response.data || response;
};

export const publishBlog = async (payload, siteId) => {
  const response = await apiClient('/blogs/publish', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'x-site-id': siteId }
  });
  return response.data || response;
};
