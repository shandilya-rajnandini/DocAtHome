import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AnimatedPage from "./AnimatedPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

// --- All Page Components ---
// Public Pages
import HomePage from "../pages/HomePage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";
import SearchDoctorsPage from "../pages/SearchDoctorsPage.jsx";
import SearchNursesPage from "../pages/SearchNursesPage.jsx";
import DoctorProfilePage from "../pages/DoctorProfilePage.jsx";
import NurseProfilePage from "../pages/NurseProfilePage.jsx";
import BookAmbulancePage from "../pages/BookAmbulancePage.jsx";
import FollowUpRedirectPage from "../pages/FollowUpRedirectPage.jsx";

// Imported About, Services, Testimonials, Contact Page
import About from "./About.jsx";
import Services from "./Services.jsx";
import Testimonials from "./Testimonials.jsx";
import Contact from "./Contact.jsx";
import DischargeConcierge from "./DischargeConcierge.jsx";

// Protected Patient Pages
import PatientDashboard from "../pages/PatientDashboard.jsx";
import CareCirclePage from "../pages/CareCirclePage.jsx";
import BookLabTestPage from "../pages/BookLabTestPage.jsx";
import VideoConsultPage from "../pages/VideoConsultPage.jsx";
import MyAppointmentsPage from "../pages/MyAppointmentsPage.jsx";
import MyPrescriptionsPage from "../pages/MyPrescriptionsPage.jsx";
import MyHealthRecordsPage from "../pages/MyHealthRecordsPage.jsx";
import HealthQuestsPage from "../pages/HealthQuestsPage.jsx";
import PaymentHistoryPage from "../pages/PaymentHistoryPage.jsx";
import CareNavigatorPage from "../pages/CareNavigatorPage.jsx";
import CareFundPage from "../pages/CareFundPage.jsx";
import PublicDonationPage from "../pages/PublicDonationPage.jsx";
import BookDischargeConciergePage from "../pages/BookDischargeConciergePage.jsx";

// Protected Professional Pages
import DoctorDashboard from "../pages/DoctorDashboard.jsx";
import NurseDashboard from "../pages/NurseDashboard.jsx";
import TechnicianDashboard from "../pages/TechnicianDashboard.jsx";
import DriverDashboard from "../pages/DriverDashboard.jsx";
import DoctorEditProfilePage from "../pages/DoctorEditProfilePage.jsx";
import NurseEditProfilePage from "../pages/NurseEditProfilePage.jsx";
import AdminEditProfilePage from "../pages/AdminEditProfilePage.jsx";
import DoctorAppointmentsPage from "../pages/DoctorAppointmentsPage.jsx";
import ProfessionalAvailabilityPage from "../pages/ProfessionalAvailabilityPage.jsx";
import ProUpgradePage from "../pages/ProUpgradePage.jsx";
import DemandHotspotPage from "../pages/DemandHotspotPage.jsx";

// Protected Admin Page
import AdminDashboard from "../pages/AdminDashboard.jsx";
import TwoFactorAuthPage from "../pages/TwoFactorAuthPage.jsx";

// 404 Not Found Page
import NotFoundPage from "../pages/NotFoundPage.jsx";
import ScrollToUp from "./ScrollToUp.jsx";

// Support Community Pages
import SupportCommunity from "../pages/SupportCommunity.jsx";
import SupportGroupChat from "../components/SupportGroupChat.jsx";
import NurseModerationDashboard from "../components/NurseModerationDashboard.jsx";

// Second Opinion Pages
import SecondOpinionRequest from "../pages/SecondOpinionRequest.jsx";
import MySecondOpinions from "../pages/MySecondOpinions.jsx";
import SpecialistSecondOpinions from "../pages/SpecialistSecondOpinions.jsx";

// Forum Pages
import ForumPage from "../pages/ForumPage.jsx";
import AskQuestionPage from "../pages/AskQuestionPage.jsx";
import QuestionDetailPage from "../pages/QuestionDetailPage.jsx";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {/* scroll to top on every navigation */}
      <ScrollToUp />
      <Routes location={location} key={location.pathname}>
        {/* --- Public Routes --- */}
        <Route
          path="/"
          element={
            <AnimatedPage>
              <HomePage />
            </AnimatedPage>
          }
        />
        <Route
          path="/register"
          element={
            <AnimatedPage>
              <RegisterPage />
            </AnimatedPage>
          }
        />
        <Route
          path="/login"
          element={
            <AnimatedPage>
              <LoginPage />
            </AnimatedPage>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AnimatedPage>
              <ForgotPasswordPage />
            </AnimatedPage>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <AnimatedPage>
              <ResetPasswordPage />
            </AnimatedPage>
          }
        />
        <Route
          path="/search"
          element={
            <AnimatedPage>
              <SearchDoctorsPage />
            </AnimatedPage>
          }
        />
        <Route
          path="/search-nurses"
          element={
            <AnimatedPage>
              <SearchNursesPage />
            </AnimatedPage>
          }
        />
        <Route
          path="/doctors/:id"
          element={
            <AnimatedPage>
              <ProtectedRoute patientOnly={true}>
                <DoctorProfilePage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/nurses/:id"
          element={
            <AnimatedPage>
              <NurseProfilePage />
            </AnimatedPage>
          }
        />
        <Route
          path="/book-ambulance"
          element={
            <AnimatedPage>
              <BookAmbulancePage />
            </AnimatedPage>
          }
        />
        <Route
          path="/follow-up/:id"
          element={
            <AnimatedPage>
              <FollowUpRedirectPage />
            </AnimatedPage>
          }
        />
        <Route
          path="/care-navigator"
          element={
            <AnimatedPage>
              <CareNavigatorPage />
            </AnimatedPage>
          }
        />
        <Route
          path="/care-circle"
          element={
            <AnimatedPage>
              <CareCirclePage />
            </AnimatedPage>
          }
        />
        <Route
          path="/about"
          element={
            <AnimatedPage>
              <About />
            </AnimatedPage>
          }
        />
        <Route
          path="/services"
          element={
            <AnimatedPage>
              <Services />
            </AnimatedPage>
          }
        />
        <Route
          path="/discharge-concierge"
          element={
            <AnimatedPage>
              <DischargeConcierge />
            </AnimatedPage>
          }
        />
        <Route
          path="/testimonials"
          element={
            <AnimatedPage>
              <Testimonials />
            </AnimatedPage>
          }
        />
        <Route
          path="/contact"
          element={
            <AnimatedPage>
              <Contact />
            </AnimatedPage>
          }
        />
        <Route
          path="/care-fund/:patientId"
          element={
            <AnimatedPage>
              <PublicDonationPage />
            </AnimatedPage>
          }
        />

        {/* --- Protected Patient Routes --- */}
        <Route
          path="/dashboard"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <PatientDashboard />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/care-circle"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <CareCirclePage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/book-lab-test"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <BookLabTestPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/book-discharge-concierge"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <BookDischargeConciergePage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/video-consult"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <VideoConsultPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <MyAppointmentsPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/my-prescriptions"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <MyPrescriptionsPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/my-health-records"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <MyHealthRecordsPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/payment-history"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <PaymentHistoryPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/care-fund"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <CareFundPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        {/* <Route path="/health-quests" element={<AnimatedPage><ProtectedRoute><HealthQuestsPage /></ProtectedRoute></AnimatedPage>} /> */}

        {/* --- Protected Professional (Doctor/Nurse/Ambulance) Routes --- */}
        <Route
          path="/doctor/dashboard"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <DoctorDashboard />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/nurse/dashboard"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <NurseDashboard />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/technician/dashboard"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <TechnicianDashboard />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/driver/dashboard"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <DriverDashboard />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/doctor/edit-profile"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <DoctorEditProfilePage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/nurse/edit-profile"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <NurseEditProfilePage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <DoctorAppointmentsPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/nurse/appointments"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <DoctorAppointmentsPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/upgrade-pro"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <ProUpgradePage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/demand-hotspot"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <DemandHotspotPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/doctor/availability"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <ProfessionalAvailabilityPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/nurse/availability"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <ProfessionalAvailabilityPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />

        {/* --- Admin-Only Routes --- */}
        <Route
          path="/admin"
          element={
            <AnimatedPage>
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/admin/edit-profile"
          element={
            <AnimatedPage>
              <ProtectedRoute adminOnly={true}>
                <AdminEditProfilePage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />

        {/* --- 2FA Route --- */}
        <Route
          path="/2fa-setup"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <TwoFactorAuthPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />

        {/* --- 404 Not Found Catch-all Route --- */}
        <Route
          path="*"
          element={
            <AnimatedPage>
              <NotFoundPage />
            </AnimatedPage>
          }
        />
        <Route
          path="/support-community"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <SupportCommunity />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/support-community/:groupId"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <SupportGroupChat />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/nurse/moderation"
          element={
            <AnimatedPage>
              <ProtectedRoute roles={["nurse", "admin"]}>
                <NurseModerationDashboard />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/second-opinion-request"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <SecondOpinionRequest />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/my-second-opinions"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <MySecondOpinions />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/specialist-second-opinions"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <SpecialistSecondOpinions />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/specialist/second-opinions"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <SpecialistSecondOpinions />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />

        {/* --- Forum Routes --- */}
        <Route
          path="/forum"
          element={
            <AnimatedPage>
              <ForumPage />
            </AnimatedPage>
          }
        />
        <Route
          path="/forum/ask"
          element={
            <AnimatedPage>
              <ProtectedRoute>
                <AskQuestionPage />
              </ProtectedRoute>
            </AnimatedPage>
          }
        />
        <Route
          path="/forum/question/:questionId"
          element={
            <AnimatedPage>
              <QuestionDetailPage />
            </AnimatedPage>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
