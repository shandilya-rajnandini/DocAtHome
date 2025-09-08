import axios from 'axios';


//const API_URL = 'https://docathome-backend.onrender.com/api'; // Hardcode the live Render URL


//const API_URL = 'http://localhost:5000/api'; // Local backend server


// This hardcoded URL is the most reliable way to ensure the live frontend
// talks to the live backend. Replace with your actual Render/Fly.io URL.
const API_URL = 'https://docathome-backend.onrender.com/api';

// Create a configured instance of Axios with the correct, full base URL

const API = axios.create({ baseURL: API_URL });

// This interceptor automatically adds the user's JWT token to every secure request.
// It runs before any API call is sent.
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});


// --- API Function Exports (Consolidated from ALL Features) ---

// === Authentication & User Routes ===
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (emailData) => API.post('/auth/forgot-password', emailData);
export const resetPassword = (token, passwordData) => API.post(`/auth/reset-password/${token}`, passwordData);

// === Two-Factor Authentication (2FA) Routes ===
export const setupTwoFactorAuth = () => API.post('/twofactor/setup');
export const verifyTwoFactorAuth = (token) => API.post('/twofactor/verify', { token });
export const loginWithTwoFactor = (credentials) => API.post('/auth/2fa/login', credentials);

// === Admin Routes ===
export const getPendingUsers = () => API.get('/admin/pending');
export const approveUser = (id) => API.put(`/admin/approve/${id}`);

// === Professional Search & Profile Routes ===
const getProfessionalById = (id) => API.get(`/profile/${id}`);
export const searchDoctors = (params) => API.get('/doctors', { params });
export const getDoctorById = (id) => getProfessionalById(id);
export const searchNurses = (params) => API.get('/nurses', { params });
export const getNurseById = (id) => getProfessionalById(id);
export const getProfileById = (id) => getProfessionalById(id); // Alias for components

// === Logged-in User Profile Routes ===
export const getMyProfile = () => API.get('/profile/me');
export const updateMyProfile = (profileData) => API.put('/profile/me', profileData);
export const updateProfile = updateMyProfile; // Alias for components

// === Appointment Routes ===
export const bookAppointment = (appointmentData) => API.post('/appointments', appointmentData);
export const getMyAppointments = () => API.get('/appointments/my-appointments');
export const updateAppointmentStatus = (id, statusData) => API.put(`/appointments/${id}`, statusData);
export const scheduleFollowUp = (appointmentId, followUpData) => API.post(`/appointments/${appointmentId}/schedule-follow-up`, followUpData);
export const getAppointmentSummary = (id) => API.get(`/appointments/${id}/summary`);
export const saveAppointmentVoiceNote = (appointmentId, voiceNoteUrl) => API.post(`/appointments/${appointmentId}/voicenote`, { voiceNoteUrl });
export const updateRelayNote = (appointmentId, relayNote) => API.put(`/appointments/${appointmentId}/relay`, { relayNote });

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
export const createProSubscription = createSubscription; // Alias
export const verifySubscription = (paymentData) => API.post('/subscription/verify', paymentData);

// === Announcement Routes ===
export const getActiveAnnouncements = () => API.get('/announcements/active');
export const getAnnouncements = () => API.get('/announcements');
export const createAnnouncement = (announcementData) => API.post('/announcements', announcementData);
export const deleteAnnouncement = (id) => API.delete(`/announcements/${id}`);

// === Quest Routes ===
export const getQuests = () => API.get('/quests');
export const acceptQuest = (questId) => API.post(`/quests/${questId}/accept`);
export const logQuestProgress = (userQuestId) => API.post(`/quests/${userQuestId}/log`);