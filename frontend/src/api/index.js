import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

// === Smart Stock: Take Dose ===
export const takeDose = async (prescriptionId, medicineIndex) => {
  try {
    const response = await API.post(
      `/prescriptions/${prescriptionId}/take-dose`,
      { medicineIndex }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to record dose';
  }
};

// === Authentication Routes ===
export const getMe = () => API.get('/auth/me');
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);

// === Doctor & Nurse Routes ===
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

// === Prescription Routes ===
export const getMyPrescriptions = () => API.get('/prescriptions/my-prescriptions');

// === Lab Test ===
export const bookLabTest = (testData) => API.post('/lab-tests', testData);

// === Password Reset ===
export const forgotPassword = (email) => API.post('/auth/forgot-password', email);
export const resetPassword = (token, password) => API.post(`/auth/reset-password/${token}`, { password });

// === Admin ===
export const getPendingUsers = () => API.get('/admin/pending-users');
export const approveUser = (id) => API.put(`/admin/approve-user/${id}`);

// === Profile & Care Circle ===
export const getMyProfile = () => API.get('/profile/me');
export const updateMyProfile = (profileData) => API.put('/profile/me', profileData);
export const getMyCareCircle = () => API.get('/profile/my-care-circle');
export const inviteToCareCircle = (email) => API.post('/profile/my-care-circle/invite', email);

// === Quest System ===
export const getQuests = () => API.get('/quests');
export const acceptQuest = (id) => API.post(`/quests/${id}/accept`);
export const logQuestProgress = (id, progress) => API.post(`/quests/${id}/progress`, { progress });

export default API;
