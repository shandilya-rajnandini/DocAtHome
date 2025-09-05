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


// --- API Function Exports (Consolidated from ALL Merged PRs & Features) ---

// === Auth & User Routes ===
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (emailData) => API.post('/auth/forgot-password', emailData);
export const resetPassword = (token, passwordData) => API.post(`/auth/reset-password/${token}`, passwordData);

// === Admin Routes ===
export const getPendingUsers = () => API.get('/admin/pending');
export const approveUser = (id) => API.put(`/admin/approve/${id}`);

// === Professional Search & Profile Routes ===
const getProfessionalById = (id) => API.get(`/profile/${id}`);
export const searchDoctors = (params) => API.get('/doctors', { params });
export const getDoctorById = (id) => getProfessionalById(id);
export const searchNurses = (params) => API.get('/nurses', { params });
export const getNurseById = (id) => getProfessionalById(id);
export const getProfileById = (id) => getProfessionalById(id); // Alias for components that need it

// === Logged-in User Profile Routes ===
export const getMyProfile = () => API.get('/profile/me');
export const updateMyProfile = (profileData) => API.put('/profile/me', profileData);

// === Appointment Routes (THE FIX) ===
export const bookAppointment = (appointmentData) => API.post('/appointments', appointmentData);
export const getMyAppointments = () => API.get('/appointments/my-appointments');
export const updateAppointmentStatus = (id, statusData) => API.put(`/appointments/${id}`, statusData);
export const getAppointmentSummary = (id) => API.get(`/appointments/${id}/summary`);
export const scheduleFollowUp = (appointmentId, followUpData) => API.post(`/appointments/${appointmentId}/schedule-follow-up`, followUpData); // <-- MISSING FUNCTION ADDED

// === Availability Routes ===
export const getAvailability = (professionalId) => API.get(`/availability/${professionalId}`);
export const updateAvailability = (availabilityData) => API.post('/availability', availabilityData);

// === Care Circle & Care Fund Routes ===
export const getMyCareCircle = () => API.get('/profile/my-care-circle');
export const inviteToCareCircle = (inviteData) => API.post('/profile/my-care-circle/invite', inviteData);
export const getMyCareFund = () => API.get('/care-fund/my-fund');
export const createDonationOrder = (donationData) => API.post('/care-fund/donate', donationData);

// === Lab Test & Ambulance Routes ===
export const bookLabTest = (testData) => API.post('/lab-tests', testData);
export const bookAmbulance = (bookingData) => API.post('/ambulance/book', bookingData);
export const updateDriverStatus = (statusData) => API.put('/profile/me/driver-status', statusData);
export const respondToAmbulanceRequest = (response) => API.post('/ambulance/respond', response);

// === Payment & Subscription Routes ===
export const createRazorpayOrder = (orderData) => API.post('/payment/create-order', orderData);
export const verifyRazorpayPayment = (paymentData) => API.post('/payment/verify', paymentData);
export const getPaymentHistory = () => API.get('/payment/my-history');
export const getSubscriptionStatus = () => API.get('/subscription/status');
export const createSubscription = (planId) => API.post('/subscription/create', { planId });

// === Announcement Routes ===
export const getActiveAnnouncements = () => API.get('/announcements/active');

// === Quest Routes ===
export const getQuests = () => API.get('/quests');
export const acceptQuest = (questId) => API.post(`/quests/${questId}/accept`);
export const logQuestProgress = (userQuestId) => API.post(`/quests/${userQuestId}/log`);