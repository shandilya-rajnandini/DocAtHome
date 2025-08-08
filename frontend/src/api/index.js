import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

// === Auth Routes ===
export const getMe = () => API.get('/auth/me');
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const forgotPassword = (email) => API.post('/auth/forgot-password', email);
export const resetPassword = (token, password) => API.post(`/auth/reset-password/${token}`, { password });

// === Profile Routes ===
export const getMyProfile = () => API.get('/profile/me');
export const updateMyProfile = (profileData) => API.put('/profile/me', profileData);
export const getMyCareCircle = () => API.get('/profile/my-care-circle');
export const inviteToCareCircle = (email) => API.post('/profile/my-care-circle/invite', email);

// === Doctor/Nurse Routes ===
export const getDoctorById = (id) => API.get(`/doctors/${id}`);
export const getNurseById = (id) => API.get(`/nurses/${id}`);
export const searchDoctors = (params) => API.get('/doctors/search', { params });
export const searchNurses = (params) => API.get('/nurses/search', { params });

// === Appointment Routes ===
export const bookAppointment = (appointmentData) => API.post('/appointments', appointmentData);
export const getMyAppointments = () => API.get('/appointments/my-appointments');
export const getDoctorAppointments = () => API.get('/appointments/doctor-appointments');
export const updateAppointmentStatus = (id, status) => API.put(`/appointments/${id}/status`, { status });
export const getAppointmentSummary = () => API.get('/appointments/summary');

// === Prescription & Lab Test Routes ===
export const getMyPrescriptions = () => API.get('/prescriptions/my-prescriptions');
export const bookLabTest = (testData) => API.post('/lab-tests', testData);

// === Admin Routes ===
export const getPendingUsers = () => API.get('/admin/pending-users');
export const approveUser = (id) => API.put(`/admin/approve-user/${id}`);

// === Quest Routes ===
export const getQuests = () => API.get('/quests');
export const acceptQuest = (questId) => API.post(`/quests/${questId}/accept`);
export const logQuestProgress = (userQuestId, progress) => API.post(`/quests/${userQuestId}/progress`, { progress });

// === Payment Routes ===
export const getPaymentHistory = () => API.get('/payment/my-history');

export default API;
