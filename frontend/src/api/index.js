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
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (emailData) => API.post('/auth/forgot-password', emailData);
export const resetPassword = (token, passwordData) => API.post(`/auth/reset-password/${token}`, passwordData);
export const searchDoctors = (params) => API.get('/doctors', { params });
export const getActiveAnnouncements = () => API.get('/announcements/active');
// ... include ALL your other exports here ...
export const getMyAppointments = () => API.get('/appointments/my-appointments');
// ...etc.