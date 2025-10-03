import axios from "axios";


// // This hardcoded URL is the most reliable way to ensure the live frontend
// // talks to the live backend. Replace with your actual Render/Fly.io URL.
// const API_URL = 'https://docathome-backend.onrender.com/api';
// This line now reads the URL from your .env file for local development,
// but provides a fallback for the live production build.
//const API_URL = import.meta.env.VITE_API_BASE_URL;

// Environment-aware API URL configuration with fallback
const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://docathome-backend.onrender.com/api";


// Debug logging for development
if (import.meta.env.DEV) {
  console.log("API Configuration:", {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    Final_API_URL: API_URL,
    Environment: import.meta.env.MODE,
  });
}

// Create a configured instance of Axios with enhanced configuration
const API = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 second timeout for potentially slow connections
  withCredentials: true, // Include credentials for CORS
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for adding auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error logging for debugging
    if (import.meta.env.DEV) {
      console.error("API Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          method: error.config?.method,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        },
      });
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else if (
      error.code === "NETWORK_ERROR" ||
      error.message.includes("Network Error")
    ) {
      console.error(
        "Network error - check if backend is running and CORS is configured"
      );
    } else if (error.message.includes("CORS")) {
      console.error(
        "CORS error - backend needs to allow this origin:",
        window.location.origin
      );
    }

    return Promise.reject(error);
  }
);

// --- API Function Exports (Consolidated from ALL Features) ---

// === Authentication & User Routes ===
export const login = (formData) => API.post("/auth/login", formData);
export const register = (formData) => API.post("/auth/register", formData);
export const getMe = () => API.get("/auth/me");
export const forgotPassword = (emailData) =>
  API.post("/auth/forgot-password", emailData);
export const resetPassword = (token, passwordData) =>
  API.post(`/auth/reset-password/${token}`, passwordData);

// === Two-Factor Authentication (2FA) Routes ===
export const setupTwoFactorAuth = () => API.post("/twofactor/setup");
export const verifyTwoFactorAuth = (token) =>
  API.post("/twofactor/verify", { token });
export const loginWithTwoFactor = (credentials) =>
  API.post("/auth/2fa/login", credentials);

// === Admin Routes ===
export const getPendingUsers = () => API.get("/admin/pending");
export const approveUser = (id) => API.put(`/admin/approve/${id}`);

// === Professional Search & Profile Routes ===
const getProfessionalById = (id) => API.get(`/profile/${id}`);
export const searchDoctors = (params) => API.get("/doctors", { params });
export const getDoctorById = (id) => getProfessionalById(id);
export const searchNurses = (params) => API.get("/nurses", { params });
export const getNurseById = (id) => getProfessionalById(id);
export const getProfileById = (id) => getProfessionalById(id); // Alias for components

// === Logged-in User Profile Routes ===
export const getMyProfile = () => API.get("/profile/me");
export const updateMyProfile = (profileData) =>
  API.put("/profile/me", profileData);
export const updateProfile = updateMyProfile; // Alias for components

// === Appointment Routes ===
export const bookAppointment = (appointmentData) =>
  API.post("/appointments", appointmentData);
export const getMyAppointments = () => API.get("/appointments/my-appointments");
export const updateAppointmentStatus = (id, statusData) =>
  API.put(`/appointments/${id}`, statusData);
export const scheduleFollowUp = (appointmentId, followUpData) =>
  API.post(`/appointments/${appointmentId}/schedule-follow-up`, followUpData);
export const getAppointmentSummary = (id) =>
  API.get(`/appointments/${id}/summary`);
export const saveAppointmentVoiceNote = (appointmentId, voiceNoteUrl) =>
  API.post(`/appointments/${appointmentId}/voicenote`, { voiceNoteUrl });
export const updateRelayNote = (appointmentId, relayNote) =>
  API.put(`/appointments/${appointmentId}/relay`, { relayNote });

// === Availability Routes ===
export const getAvailability = (professionalId) =>
  API.get(`/availability/${professionalId}`);
export const updateAvailability = (availabilityData) =>
  API.post("/availability", availabilityData);

// === Care Circle & Care Fund Routes ===
export const getMyCareCircle = () => API.get("/profile/my-care-circle");
export const inviteToCareCircle = (inviteData) =>
  API.post("/profile/my-care-circle/invite", inviteData);
export const getMyCareFund = () => API.get("/care-fund/my-fund");
export const getCareFundPublic = (slugOrId) =>
  API.get(`/care-fund/public/${slugOrId}`);
export const createDonationOrder = (donationData) =>
  API.post("/care-fund/donate", donationData);

// === Lab Test & Ambulance Routes ===
export const bookLabTest = (testData) => API.post("/lab-tests", testData);
export const getTechnicianLabTests = () => API.get("/lab-tests/technician");
export const bookAmbulance = (bookingData) =>
  API.post("/ambulance/book", bookingData);
export const updateDriverStatus = (statusData) =>
  API.put("/profile/me/driver-status", statusData);
export const respondToAmbulanceRequest = (response) =>
  API.post("/ambulance/respond", response);

// === Payment & Subscription Routes ===
export const createRazorpayOrder = (orderData) =>
  API.post("/payment/create-order", orderData);
export const verifyRazorpayPayment = (paymentData) =>
  API.post("/payment/verify", paymentData);
export const getPaymentHistory = () => API.get("/payment/my-history");
export const getSubscriptionStatus = () => API.get("/subscription/status");
export const createSubscription = (planId) =>
  API.post("/subscription/create", { planId });
export const createProSubscription = createSubscription; // Alias
export const verifySubscription = (paymentData) =>
  API.post("/subscription/verify", paymentData);

// === Announcement Routes ===
export const getActiveAnnouncements = () => API.get("/announcements/active");
export const getAnnouncements = () => API.get("/announcements");
export const createAnnouncement = (announcementData) =>
  API.post("/announcements", announcementData);
export const updateAnnouncement = (id, announcementData) =>
  API.put(`/announcements/${id}`, announcementData);
export const deleteAnnouncement = (id) => API.delete(`/announcements/${id}`);

// === Video Call Routes ===
export const startFamilyBridgeCall = (callData) =>
  API.post("/video-calls/start-family-bridge", callData);
export const joinVideoCall = (callId) =>
  API.post(`/video-calls/${callId}/join`);
export const endVideoCall = (callId) => API.post(`/video-calls/${callId}/end`);
export const getCallHistory = (patientId, params) =>
  API.get(`/video-calls/history/${patientId}`, { params });
export const getActiveCall = (patientId) =>
  API.get(`/video-calls/active/${patientId}`);

// === Prescription Routes ===
export const getMyPrescriptions = () =>
  API.get("/prescriptions/my-prescriptions");
export const getPrescriptions = () => API.get("/prescriptions");
export const createPrescription = (prescriptionData) =>
  API.post("/prescriptions", prescriptionData);
export const takeDose = (prescriptionId, medicineIndex) =>
  API.post(`/prescriptions/${prescriptionId}/take-dose`, { medicineIndex });
export const logMedicationDose = (
  prescriptionId,
  medicineIndex,
  scheduledDate,
  notes
) =>
  API.post(`/prescriptions/${prescriptionId}/log-dose`, {
    medicineIndex,
    scheduledDate,
    notes,
  });
export const getAdherenceData = (days) =>
  API.get("/prescriptions/adherence", { params: { days } });

// === Support Community Routes ===
export const getSupportGroups = (params) =>
  API.get("/support/groups", { params });
export const getMySupportGroups = () => API.get("/support/my-groups");
export const joinSupportGroup = (groupId) =>
  API.post(`/support/groups/${groupId}/join`);
export const leaveSupportGroup = (groupId) =>
  API.post(`/support/groups/${groupId}/leave`);
export const getGroupMessages = (groupId, params) =>
  API.get(`/support/groups/${groupId}/messages`, { params });
export const sendGroupMessage = (groupId, messageData) =>
  API.post(`/support/groups/${groupId}/messages`, messageData);
export const getMyAnonymousProfile = () => API.get("/support/my-profile");
export const updateAnonymousProfile = (profileData) =>
  API.put("/support/my-profile", profileData);

// === Nurse Moderation Routes ===
export const getAllSupportGroups = () => API.get("/support/admin/groups");
export const createSupportGroup = (groupData) =>
  API.post("/support/admin/groups", groupData);
export const updateSupportGroup = (groupId, groupData) =>
  API.put(`/support/admin/groups/${groupId}`, groupData);
export const deleteSupportGroup = (groupId) =>
  API.delete(`/support/admin/groups/${groupId}`);
export const getGroupMembers = (groupId) =>
  API.get(`/support/admin/groups/${groupId}/members`);
export const removeGroupMember = (groupId, memberId) =>
  API.delete(`/support/admin/groups/${groupId}/members/${memberId}`);
export const getFlaggedMessages = () =>
  API.get("/support/admin/flagged-messages");
export const moderateMessage = (groupId, messageId, action) =>
  API.put(`/support/admin/groups/${groupId}/messages/${messageId}/moderate`, {
    action,
  });

// === Quest Routes ===
export const getQuests = () => API.get("/quests");
export const acceptQuest = (questId) => API.post(`/quests/${questId}/accept`);
export const logQuestProgress = (questId, progressData) =>
  API.post(`/quests/${questId}/progress`, progressData);

// === Second Opinion Routes ===
export const createSecondOpinion = (data) => API.post("/second-opinions", data);
export const getMySecondOpinions = (params) =>
  API.get("/second-opinions/my-requests", { params });
export const getAvailableSecondOpinions = (params) =>
  API.get("/second-opinions/available", { params });
export const assignSecondOpinion = (id) =>
  API.put(`/second-opinions/${id}/assign`);
export const uploadSecondOpinionFile = (id, fileData) =>
  API.post(`/second-opinions/${id}/upload`, fileData);
export const getSecondOpinionFiles = (id) =>
  API.get(`/second-opinions/${id}/files`);
export const createSecondOpinionPayment = (id) =>
  API.post(`/second-opinions/${id}/payment`);
export const verifySecondOpinionPayment = (id, paymentData) =>
  API.post(`/second-opinions/${id}/payment/verify`, paymentData);

// === Profile Routes ===
export const deleteMyProfile = () => API.delete("/profile/me");

// === Forum Routes ===
export const getForumQuestions = (params) =>
  API.get("/forum/questions", { params });
export const getForumQuestion = (questionId) =>
  API.get(`/forum/questions/${questionId}`);
export const createForumQuestion = (questionData) =>
  API.post("/forum/questions", questionData);
export const createForumAnswer = (questionId, answerData) =>
  API.post(`/forum/questions/${questionId}/answers`, answerData);
export const voteOnQuestion = (questionId, voteData) =>
  API.post(`/forum/questions/${questionId}/vote`, voteData);
export const voteOnAnswer = (answerId, voteData) =>
  API.post(`/forum/answers/${answerId}/vote`, voteData);
export const acceptAnswer = (answerId) =>
  API.post(`/forum/answers/${answerId}/accept`);

export { API };
