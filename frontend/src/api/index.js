import axios from 'axios';

// --- Smart API URL Configuration ---
// This automatically selects the correct backend URL based on the environment.
const API_URL = import.meta.env.PROD 
    ? 'https://docathome-backend.onrender.com/api' // Your LIVE backend URL from Render
    : 'http://localhost:5000/api';                // Your LOCAL backend URL for development

// Create a configured instance of Axios
const API = axios.create({ baseURL: API_URL });

// Interceptor to automatically add the JWT token to every secure request
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});


// api/prescriptions.js (frontend)
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
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (emailData) => API.post('/auth/forgot-password', emailData);
export const resetPassword = (token, passwordData) => API.post(`/auth/reset-password/${token}`, passwordData);

// === Admin Routes ===
export const getPendingUsers = () => API.get('/admin/pending');
export const approveUser = (id) => API.put(`/admin/approve/${id}`);

// === Generic Profile Fetching ===
const getProfessionalById = (id) => API.get(`/profile/${id}`);

// === Doctor Routes ===
export const searchDoctors = (params) => API.get('/doctors', { params });
export const getDoctorById = (id) => getProfessionalById(id);

// === Nurse Routes ===
export const searchNurses = (params) => API.get('/nurses', { params });
export const getNurseById = (id) => getProfessionalById(id);

// === Logged-in User Profile Routes ===
export const getMyProfile = () => API.get('/profile/me');
export const updateMyProfile = (profileData) => API.put('/profile/me', profileData);

// === Appointment Routes ===
export const bookAppointment = (appointmentData) => API.post('/appointments', appointmentData);
export const getMyAppointments = () => API.get('/appointments/my-appointments');
export const updateAppointmentStatus = (id, updateData) => API.put(`/appointments/${id}`, updateData);
export const getAppointmentSummary = (id) => API.get(`/appointments/${id}/summary`);

// === Care Circle Routes ===
export const getMyCareCircle = () => API.get('/profile/my-care-circle');
export const inviteToCareCircle = (inviteData) => API.post('/profile/my-care-circle/invite', inviteData);

// === Lab Test Routes ===
export const bookLabTest = (testData) => API.post('/lab-tests', testData);

// === Payment Routes ===
export const createRazorpayOrder = (orderData) => API.post('/payment/create-order', orderData);
export const verifyRazorpayPayment = (paymentData) => API.post('/payment/verify', paymentData);

// === Quest Routes ===
export const getQuests = () => API.get('/quests');
export const acceptQuest = (questId) => API.post(`/quests/${questId}/accept`);
export const logQuestProgress = (userQuestId) => API.post(`/quests/${userQuestId}/log`);