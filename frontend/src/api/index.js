import axios from 'axios';

// This hardcoded URL is the most reliable way to ensure the live frontend
// talks to the live backend.
const API_URL = 'http://localhost:5000/api';

const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});



// === API Function Exports ===

// === Authentication Routes ===
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (formData) => API.post('/auth/forgot-password', formData);
export const resetPassword = (formData) => API.post('/auth/reset-password', formData);
// Add other auth functions if you have them (forgotPassword, etc.)

// === Admin Routes ===
export const getPendingUsers = () => API.get('/admin/pending');
export const approveUser = (id) => API.put(`/admin/approve/${id}`);

// === Generic Profile Fetching ===
export const getProfileById = (id) => API.get(`/profile/${id}`);

// === Doctor & Nurse Search Routes ===
export const searchDoctors = (params) => API.get('/doctors', { params });
export const getDoctorById = (id) => getProfileById(id);
export const searchNurses = (params) => API.get('/nurses', { params });
export const getNurseById = (id) => getProfileById(id);
// export const getAvailability = (doctorId) => API.get(`/doctors/${doctorId}/availability`);

// === Logged-in User Profile Routes ===
export const getMyProfile = () => API.get('/profile/me');
export const updateMyProfile = (profileData) => API.put('/profile/me', profileData);

// === Appointment Routes ===
export const bookAppointment = (appointmentData) => API.post('/appointments', appointmentData);
export const getMyAppointments = () => API.get('/appointments/my-appointments');
export const getDoctorAppointments = () => API.get('/appointments/doctor-appointments');
export const updateAppointmentStatus = (id, statusData) => API.put(`/appointments/${id}`, statusData);
export const getAppointmentSummary = (id) => API.get(`/appointments/${id}/summary`);
export const saveAppointmentVoiceNote = (id, noteData) => API.post(`/appointments/${id}/voice-note`, noteData);
export const scheduleFollowUp = (id, followUpData) => API.post(`/appointments/${id}/schedule-follow-up`, followUpData);
// @route   PUT /:id/relay-note
export const updateRelayNote = (id, noteData) => API.put(`/appointments/${id}/relay-note`, noteData);


// === Care Circle Routes ===
export const getMyCareCircle = () => API.get('/profile/my-care-circle');
export const inviteToCareCircle = (inviteData) => API.post('/profile/my-care-circle/invite', inviteData);

// === Lab Test Routes ===
export const bookLabTest = (testData) => API.post('/lab-tests', testData);

// === Payment Routes ===
export const createRazorpayOrder = (orderData) => API.post('/payment/create-order', orderData);
export const verifyRazorpayPayment = (paymentData) => API.post('/payment/verify', paymentData);
export const getPaymentHistory = () => API.get('/payment/history');

// === Subscription Routes ===
export const createProSubscription = (testMode = '') => API.post(`/subscription/create-plan${testMode}`);
export const verifySubscription = (subscriptionData) => API.post('/subscription/verify', subscriptionData);
export const getSubscriptionStatus = () => API.get('/subscription/status');
export const cancelSubscription = () => API.post('/subscription/cancel');

// === Quest Routes ===
export const getQuests = () => API.get('/quests');
export const acceptQuest = (questId) => API.post(`/quests/${questId}/accept`);
export const logQuestProgress = (questId, progressData) => API.post(`/quests/${questId}/progress`, progressData);



// === Ambulance Routes ===
export const bookAmbulance = (bookingData) => API.post('/ambulance/book', bookingData);
export const respondToAmbulanceRequest = (requestId, responseData) => 
  API.put(`/ambulance/respond/${requestId}`, responseData);
export const updateDriverStatus = (statusData) => API.put('/ambulance/status', statusData);


// === Availability Routes ===
export const getAvailability = (professionalId) => 
  API.get(`/availability/${professionalId}`);

export const updateAvailability = (professionalId, availabilityData) => 
  API.post(`/availability/${professionalId}`, availabilityData);



// Export the API instance as default
export default API;