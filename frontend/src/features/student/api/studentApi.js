import { apiClient } from '../../../lib/apiClient';

export const getStudentAttendance = async () => {
  const response = await apiClient('/attendance?type=student');
  return response.data || [];
};

export const getLeaves = async () => {
  const response = await apiClient('/leaves');
  return response.data || [];
};

export const createLeave = async (payload) => {
  const response = await apiClient('/leaves', { method: 'POST', body: JSON.stringify(payload) });
  return response.data || response;
};

export const deleteLeave = async (id) => {
  const response = await apiClient(`/leaves/${id}`, { method: 'DELETE' });
  return response.data || response;
};

export const getStudentProfile = async (studentProfileId) => {
  const response = await apiClient(`/students/${studentProfileId}`);
  return response.data;
};

export const getStudentTasks = async (studentProfileId) => {
  const response = await apiClient(`/students/${studentProfileId}/tasks`);
  return response.data || [];
};

export const getCourseDetails = async (courseId) => {
  const response = await apiClient(`/courses/${courseId}`);
  return response.data;
};

export const getStudentDailyPlan = async (studentProfileId, dateStr) => {
  const response = await apiClient(`/students/${studentProfileId}/daily-plan?date=${dateStr}`);
  return response.data || [];
};

export const getProfileMe = async () => {
  const response = await apiClient('/profile/me');
  return response.data;
};

export const getFeesBalances = async () => {
  const response = await apiClient('/fees/balances');
  return response.data;
};

export const getStudentFees = async (studentId) => {
  const response = await apiClient(`/fees/students/${studentId}`);
  return response.data || response;
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

export const createStudent = async (payload) => {
  const response = await apiClient('/students', { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};

export const updateStudent = async (id, payload) => {
  const response = await apiClient(`/students/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await apiClient(`/students/${id}`, { method: 'DELETE' });
  return response.data;
};

export const getStudentProgress = async (studentId) => {
  const response = await apiClient(`/students/${studentId}/progress`);
  return response.data;
};

export const getStudentSubmoduleProgress = async (studentId) => {
  const response = await apiClient(`/students/${studentId}/progress/submodules`);
  return response.data || response;
};

export const updateSubmoduleProgress = async (studentId, submoduleId, payload) => {
  const response = await apiClient(`/students/${studentId}/progress/submodules/${submoduleId}`, { method: 'POST', body: JSON.stringify(payload) });
  return response.data || response;
};

export const getStudentDocumentsList = async (studentId) => {
  const response = await apiClient(`/students/${studentId}/documents`);
  return response.data;
};

export const getStudentTasksList = async (studentId) => {
  const response = await apiClient(`/students/${studentId}/tasks`);
  return response.data;
};

export const enrollStudentCourse = async (studentId, courseId) => {
  const response = await apiClient(`/students/${studentId}/courses`, { method: 'POST', body: JSON.stringify({ course_id: courseId }) });
  return response.data;
};

export const unenrollStudentCourse = async (studentId, courseId) => {
  const response = await apiClient(`/students/${studentId}/courses/${courseId}`, { method: 'DELETE' });
  return response.data;
};

export const uploadStudentDocument = async (studentId, payload) => {
  const response = await apiClient(`/students/${studentId}/documents`, { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};

export const deleteStudentDocument = async (studentId, documentId) => {
  const response = await apiClient(`/students/${studentId}/documents/${documentId}`, { method: 'DELETE' });
  return response.data;
};

export const updateStudentTask = async (studentId, taskId, payload) => {
  const response = await apiClient(`/students/${studentId}/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(payload) });
  return response.data;
};

export const submitStudentTask = async (studentId, taskId, payload) => {
  const response = await apiClient(`/students/${studentId}/tasks/${taskId}/submit`, { method: 'POST', body: JSON.stringify(payload) });
  return response.data;
};

export const submitJobApplication = async (payload) => {
  const response = await apiClient('/applications', { method: 'POST', body: JSON.stringify(payload) });
  return response.data || response;
};

export const parseResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient('/parse-resume', { method: 'POST', body: formData });
  return response.data || response;
};

export const getJobs = async () => {
  const response = await apiClient('/jobs');
  return response.data || response;
};

export const scrapeJobs = async (formData, signal) => {
  const response = await apiClient('/jobs', { method: 'POST', body: formData, signal });
  return response.data || response;
};

export const getJobDetails = async (url, source) => {
  const response = await apiClient(`/job-details?url=${encodeURIComponent(url)}&source=${encodeURIComponent(source)}`);
  return response.data || response;
};

export const getDailyPlan = async (studentId, dateStr) => {
  const response = await apiClient(`/students/${studentId}/daily-plan?date=${dateStr}`);
  return response.data || [];
};

export const submitSubmoduleReview = async (courseId, moduleId, submoduleId, payload) => {
  const response = await apiClient(`/courses/${courseId}/modules/${moduleId}/submodules/${submoduleId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return response.data || response;
};

export const getAllStudents = async (instructorId, department) => {
  let url = '/students?limit=1000';
  if (instructorId) url += `&instructorId=${instructorId}`;
  if (department && department !== 'All Departments') url += `&department=${department}`;
  const response = await apiClient(url);
  return response.data;
};
