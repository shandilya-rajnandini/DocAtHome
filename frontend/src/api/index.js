import axios from 'axios';

// We are hardcoding the live backend URL to guarantee the connection.
const API_URL = 'https://docathome-backend.onrender.com/api';

const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

// Export all your API functions

// === Authentication Routes ===
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (emailData) => API.post('/auth/forgot-password', emailData);
export const resetPassword = (token, passwordData) => API.post(`/auth/reset-password/${token}`, passwordData);

// === Admin Routes ===
export const getPendingUsers = () => API.get('/admin/pending');
export const approveUser = (id) => API.put(`/admin/approve/${id}`);

// === Generic Professional Profile Fetching ===
const getProfessionalById = (id) => API.get(`/profile/${id}`);

// === Doctor & Nurse Search Routes (INCLUDES THE MISSING searchNurses) ===
export const searchDoctors = (params) => API.get('/doctors', { params });
export const getDoctorById = (id) => getProfessionalById(id);
export const searchNurses = (params) => API.get('/nurses', { params }); // <-- MISSING FUNCTION ADDED
export const getNurseById = (id) => getProfessionalById(id);         // <-- MISSING FUNCTION ADDED

// === Logged-in User Profile Routes ===
export const getMyProfile = () => API.get('/profile/me');
export const updateMyProfile = (profileData) => API.put('/profile/me', profileData);

// === Appointment Routes ===
export const bookAppointment = (appointmentData) => API.post('/appointments', appointmentData);
export const getMyAppointments = () => API.get('/appointments/my-appointments');
export const updateAppointmentStatus = (id, statusData) => API.put(`/appointments/${id}`, statusData);
export const getAppointmentSummary = (id) => API.get(`/appointments/${id}/summary`);

// === Care Circle Routes ===
export const getMyCareCircle = () => API.get('/profile/my-care-circle');
export const inviteToCareCircle = (inviteData) => API.post('/profile/my-care-circle/invite', inviteData);

// === Lab Test Routes ===
export const bookLabTest = (testData) => API.post('/lab-tests', testData);

// === Payment Routes ===
export const createRazorpayOrder = (orderData) => API.post('/payment/create-order', orderData);
export const verifyRazorpayPayment = (paymentData) => API.post('/payment/verify', paymentData);

// === Announcement Routes ===
export const getActiveAnnouncements = () => API.get('/announcements/active');