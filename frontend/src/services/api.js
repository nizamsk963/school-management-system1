import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (userId, password) => api.post('/auth/login', { userId, password }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export const studentService = {
  getAll: () => api.get('/students'),
  getByParent: () => api.get('/students/parent'),
  getById: (id) => api.get(`/students/${id}`),
  getByUserId: (userId) => api.get(`/students/user/${userId}`),
  add: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getByClass: (classId) => api.get(`/students/class/${classId}`),
};

export const teacherService = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  getByUserId: (userId) => api.get(`/teachers/user/${userId}`),
  add: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
  assignClass: (data) => api.post('/teachers/assign-class', data),
};

export const marksService = {
  getAll: () => api.get('/marks'),
  getByStudent: (studentId) => api.get(`/marks/student/${studentId}`),
  getByClass: (classId) => api.get(`/marks/class/${classId}`),
  add: (data) => api.post('/marks', data),
  update: (id, data) => api.put(`/marks/${id}`, data),
  delete: (id) => api.delete(`/marks/${id}`),
};

export const attendanceService = {
  getAll: () => api.get('/attendance'),
  getByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
  getByClass: (classId) => api.get(`/attendance/class/${classId}`),
  mark: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
};

export const homeworkService = {
  getAll: () => api.get('/homework'),
  getByClass: (classId) => api.get(`/homework/class/${classId}`),
  getBySubject: (subjectId) => api.get(`/homework/subject/${subjectId}`),
  getByStudent: (studentId) => api.get(`/homework/student/${studentId}`),
  add: (data) => api.post('/homework', data),
  update: (id, data) => api.put(`/homework/${id}`, data),
  delete: (id) => api.delete(`/homework/${id}`),
  submit: (id, data) => api.post(`/homework/${id}/submit`, data),
  review: (id, data) => api.put(`/homework/${id}/review`, data),
};

export const remarkService = {
  getAll: () => api.get('/remarks'),
  getByStudent: (studentId) => api.get(`/remarks/student/${studentId}`),
  getByClass: (classId) => api.get(`/remarks/class/${classId}`),
  add: (data) => api.post('/remarks', data),
  update: (id, data) => api.put(`/remarks/${id}`, data),
  delete: (id) => api.delete(`/remarks/${id}`),
};

export const examService = {
  getAll: () => api.get('/exams'),
  getById: (id) => api.get(`/exams/${id}`),
  getByClass: (classId) => api.get(`/exams/class/${classId}`),
  add: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
};

export const eventService = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  add: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

export const feeService = {
  getAll: () => api.get('/fees'),
  getByParent: () => api.get('/fees/parent'),
  getByStudent: (studentId) => api.get(`/fees/student/${studentId}`),
  getPending: () => api.get('/fees/pending'),
  add: (data) => api.post('/fees', data),
  pay: (data) => api.post('/fees/pay', data),
  update: (id, data) => api.put(`/fees/${id}`, data),
  delete: (id) => api.delete(`/fees/${id}`),
};

export const classService = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  assignTeacher: (data) => api.post('/classes/assign-teacher', data),
  getStats: () => api.get('/classes/stats/dashboard'),
  getSubjects: () => api.get('/classes/subjects'),
};

export default api;
