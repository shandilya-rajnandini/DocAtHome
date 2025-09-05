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
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => API.post('/auth/reset-password', { token, password });

// User/Profile functions
export const getMyProfile = () => API.get('/profile/me');
export const updateMyProfile = (profileData) => API.put('/profile/me', profileData);

// Doctor/Nurse functions
export const getDoctorById = (id) => API.get(`/doctors/${id}`);
export const getNurseById = (id) => API.get(`/nurses/${id}`);
export const getAvailability = (id) => API.get(`/availability/${id}`);
export const updateAvailability = (availabilityData) => API.put('/availability/me', availabilityData);

// Appointment functions
export const getMyAppointments = () => API.get('/appointments/my-appointments');
export const getDoctorAppointments = () => API.get('/appointments/doctor');
export const updateAppointmentStatus = (id, statusData) => API.put(`/appointments/${id}`, statusData);
export const bookAppointment = (appointmentData) => API.post('/appointments', appointmentData);
export const getAppointmentSummary = (id) => API.get(`/appointments/${id}/summary`);
export const saveAppointmentVoiceNote = (id, voiceNoteUrl) => API.post(`/appointments/${id}/voice-note`, { voiceNoteUrl });
export const updateRelayNote = (id, relayNote) => API.put(`/appointments/${id}/relay-note`, { relayNote });
export const scheduleFollowUp = (id, followUpData) => API.post(`/appointments/${id}/follow-up`, followUpData);

// Subscription functions
export const createProSubscription = (subscriptionData) => API.post('/subscriptions/create', subscriptionData);
export const verifySubscription = (paymentId) => API.post('/subscriptions/verify', { paymentId });
export const getSubscriptionStatus = () => API.get('/subscriptions/status');

// Payment functions
export const getPaymentHistory = () => API.get('/payments/history');

// Quest functions
export const getQuests = () => API.get('/quests');
export const acceptQuest = (questId) => API.post(`/quests/${questId}/accept`);
export const logQuestProgress = (questId, progressData) => API.post(`/quests/${questId}/progress`, progressData);

// Driver functions
export const updateDriverStatus = (statusData) => API.put('/driver/status', statusData);
export const respondToAmbulanceRequest = (requestId, responseData) => API.post(`/ambulance/${requestId}/respond`, responseData);
export const bookAmbulance = (bookingData) => API.post('/ambulance/book', bookingData);
// ... etc.
export const downloadIntakeForm = (id) => {
  // We don't use axios here because we want to handle the PDF blob and include auth header
  const token = localStorage.getItem('token');
  return fetch(`${API_URL}/appointments/${id}/intake-form`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

// Review functions
export const getReviewsForDoctor = (doctorId) => API.get(`/reviews/doctor/${doctorId}`);
export const createReview = (reviewData) => API.post('/reviews', reviewData);

// Appointment functions (additional)
export const createAppointment = (appointmentData) => API.post('/appointments', appointmentData);

// Care Circle functions
export const getMyCareCircle = () => API.get('/care-circle/me');
export const inviteToCareCircle = (inviteData) => API.post('/care-circle/invite', inviteData);

// Lab Test functions
export const bookLabTest = (labTestData) => API.post('/lab-tests/book', labTestData);

// Admin functions
export const getProfileById = (id) => API.get(`/profile/${id}`);
export const updateProfile = (id, profileData) => API.put(`/profile/${id}`, profileData);

// Two-Factor Authentication functions
export const disableTwoFactor = () => API.post('/twofactor/disable');

// Account functions
export const deactivateAccount = () => API.delete('/profile/me');

// AI functions
export const suggestSpecialty = (symptomsData) => API.post('/ai/suggest-specialty', symptomsData);
export const getPendingUsers = () => API.get('/admin/pending-users');
export const approveUser = (userId) => API.put(`/admin/approve-user/${userId}`);

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

// Export the axios instance as default for components that need direct API access
export default API;