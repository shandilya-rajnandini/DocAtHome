import axios from 'axios';

// This hardcoded URL is the most reliable way to ensure the live frontend
// talks to the live backend.
const API_URL = 'https://docathome-backend.onrender.com/api';

const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

// --- Export all your API functions ---
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
// ... and all the other functions we have created ...
export const getMyAppointments = () => API.get('/appointments/my-appointments');
export const updateAppointmentStatus = (id, statusData) => API.put(`/appointments/${id}`, statusData);
// ... etc.
export const downloadIntakeForm = (id) => {
  // We don't use axios here because we want to handle the PDF blob and include auth header
  const token = localStorage.getItem('token');
  return fetch(`${API_URL}/appointments/${id}/intake-form`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const getIntakeFormLogs = (page = 1, limit = 20) => API.get(`/admin/intake-form-logs?page=${page}&limit=${limit}`);
export const getIntakeFormLogsWithFilters = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return API.get(`/admin/intake-form-logs?${query}`);
};

// Search functions
export const searchDoctors = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return API.get(`/doctors?${query}`);
};

export const searchNurses = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return API.get(`/nurses?${query}`);
};