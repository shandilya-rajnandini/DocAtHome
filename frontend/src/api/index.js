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
export const searchDoctors = (params) => API.get('/doctors', { params });
// ... include ALL your other exports here ...
export const getMyAppointments = () => API.get('/appointments/my-appointments');
// ...etc.