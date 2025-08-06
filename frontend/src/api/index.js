import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

export const getMe = () => API.get('/auth/me');
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const getDoctorById = (id) => API.get(`/doctors/${id}`);
export const bookAppointment = (appointmentData) => API.post('/appointments', appointmentData);
export const getMyAppointments = () => API.get('/appointments/my-appointments');
export const getMyPrescriptions = () => API.get('/prescriptions/my-prescriptions');
export const bookLabTest = (testData) => API.post('/lab-tests', testData);
export const getNurseById = (id) => API.get(`/nurses/${id}`);
export const forgotPassword = (email) => API.post('/auth/forgot-password', email);
export const resetPassword = (token, password) => API.post(`/auth/reset-password/${token}`, { password });
export const searchDoctors = (params) => API.get('/doctors/search', { params });
export const searchNurses = (params) => API.get('/nurses/search', { params });
export const getPendingUsers = () => API.get('/admin/pending-users');
export const approveUser = (id) => API.put(`/admin/approve-user/${id}`);
export const getMyCareCircle = () => API.get('/profile/my-care-circle');
export const inviteToCareCircle = (email) => API.post('/profile/my-care-circle/invite', email);
export const getDoctorAppointments = () => API.get('/appointments/doctor-appointments');
export const updateAppointmentStatus = (id, status) => API.put(`/appointments/${id}/status`, { status });
export const getAppointmentSummary = () => API.get('/appointments/summary');
export const getMyProfile = () => API.get('/profile/me');
export const updateMyProfile = (profileData) => API.put('/profile/me', profileData);
export const getQuests = () => API.get('/quests');
export const acceptQuest = (id) => API.post(`/quests/${id}/accept`);
export const logQuestProgress = (id, progress) => API.post(`/quests/${id}/progress`, { progress });


export default API;
