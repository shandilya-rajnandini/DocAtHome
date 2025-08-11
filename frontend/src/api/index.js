import axios from 'axios';

// --- Smart API URL Configuration ---
const API_URL = import.meta.env.PROD
  ? 'https://docathome-backend.onrender.com/api' // LIVE backend
  : 'http://localhost:5000/api'; // Local backend for development

// Create configured Axios instance
const API = axios.create({ baseURL: API_URL });

// Add JWT token automatically to requests
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

// --- API Function Exports ---

// === Smart Stock Routes ===
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
export const getMyPrescriptions = () => API.get('/prescriptions/my-prescriptions');

// === Authentication Routes ===
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (emailData) => API.post('/auth/forgot-password', emailData);
export const resetPassword = (token, passwordData) => API.post(`/auth/reset-password/${token}`, passwordData);

// === Admin Routes ===
export const getPendingUsers = () => API.get('/admin/pending'); // Unified endpoint name
export const approveUser = (id) => API.put(`/admin/approve/${id}`);

// === Generic Profile Fetching ===
const getProfessionalById = (id) => API.get(`/profile/${id}`);

// === Doctor & Nurse Routes ===
export const searchDoctors = (params) => API.get('/doctors', { params });
export const getDoctorById = (id) => getProfessionalById(id);
export const searchNurses = (params) => API.get('/nurses', { params });
export const getNurseById = (id) => getProfessionalById(id);

// === Logged-in User Profile Routes ===
export const getMyProfile = () => API.get('/profile/me');
export const updateMyProfile = (profileData) => API.put('/profile/me', profileData);

// === Care Circle Routes ===
export const getMyCareCircle = () => API.get('/profile/my-care-circle');
export const inviteToCareCircle = (inviteData) => API.post('/profile/my-care-circle/invite', inviteData);

// === Appointment Routes ===
export const bookAppointment = (appointmentData) => API.post('/appointments', appointmentData);
export const getMyAppointments = () => API.get('/appointments/my-appointments');
export const getDoctorAppointments = () => API.get('/appointments/doctor-appointments');
export const updateAppointmentStatus = (id, status) => API.put(`/appointments/${id}/status`, { status });
export const getAppointmentSummary = (id) => API.get(`/appointments/${id}/summary`);

// === Lab Test Routes ===
export const bookLabTest = (testData) => API.post('/lab-tests', testData);

// === Payment Routes ===
export const createRazorpayOrder = (orderData) => API.post('/payment/create-order', orderData);
export const verifyRazorpayPayment = (paymentData) => API.post('/payment/verify', paymentData);
export const getPaymentHistory = () => API.get('/payment/my-history');

// === Quest Routes ===
export const getQuests = () => API.get('/quests');
export const acceptQuest = (questId) => API.post(`/quests/${questId}/accept`);
export const logQuestProgress = (questId, progress) => API.post(`/quests/${questId}/progress`, { progress });
// === Voice Note Routes ===
export const saveAppointmentVoiceNote = (appointmentId, voiceUrl) =>
  API.post(`/appointments/${appointmentId}/voicenote`, { voiceUrl });

// Export Axios instance if needed
export default API;

