import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// This interceptor automatically adds the JWT token to every request header
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

// === Authentication Routes ===
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const getMe = () => API.get('/auth/me');

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
export const updateAppointmentStatus = (id, status) => API.put(`/appointments/${id}`, { status });

// === Care Circle Routes ===
export const getMyCareCircle = () => API.get('/profile/my-care-circle');
export const inviteToCareCircle = (inviteData) => API.post('/profile/my-care-circle/invite', inviteData);

// === Lab Test Routes ===
export const bookLabTest = (testData) => API.post('/lab-tests', testData);

// === Payment Routes ===
export const createRazorpayOrder = (orderData) => API.post('/payment/create-order', orderData);
export const verifyRazorpayPayment = (paymentData) => API.post('/payment/verify', paymentData);