import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// --- Core Layout and Auth Components ---
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// --- All Page Components ---
// Public Pages
import HomePage from "./pages/HomePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import SearchDoctorsPage from "./pages/SearchDoctorsPage.jsx";
import SearchNursesPage from "./pages/SearchNursesPage.jsx";
import DoctorProfilePage from "./pages/DoctorProfilePage.jsx";
import NurseProfilePage from "./pages/NurseProfilePage.jsx";
import BookAmbulancePage from "./pages/BookAmbulancePage.jsx";

//Imported About,Services,Testimonials,Contact Page
import About from "./components/About.jsx";
import Services from "./components/Services.jsx";
import Testimonials from "./components/Testimonials.jsx";
import Contact from "./components/Contact.jsx";

// Protected Patient Pages
import PatientDashboard from "./pages/PatientDashboard.jsx";
import CareCirclePage from "./pages/CareCirclePage.jsx";
import BookLabTestPage from "./pages/BookLabTestPage.jsx";
import VideoConsultPage from "./pages/VideoConsultPage.jsx";
import MyAppointmentsPage from "./pages/MyAppointmentsPage.jsx";
import MyPrescriptionsPage from "./pages/MyPrescriptionsPage.jsx";
import HealthQuestsPage from "./pages/HealthQuestsPage.jsx";
import CareNavigatorPage from "./pages/CareNavigatorPage.jsx";

// Protected Professional Pages
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import NurseDashboard from "./pages/NurseDashboard.jsx";
import DoctorEditProfilePage from "./pages/DoctorEditProfilePage.jsx";
import DoctorAppointmentsPage from "./pages/DoctorAppointmentsPage.jsx";
import ProfessionalAvailabilityPage from "./pages/ProfessionalAvailabilityPage.jsx";

// Protected Admin Page
import AdminDashboard from "./pages/AdminDashboard.jsx";
import BackToTopButton from "./components/BackToTopButton.jsx";

function App() {
  return (
    <Router>
      <div className="!bg-amber-200 dark:!bg-primary-dark min-h-screen text-primary-text flex flex-col">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route path="/search" element={<SearchDoctorsPage />} />
            <Route path="/search-nurses" element={<SearchNursesPage />} />
            <Route path="/doctors/:id" element={<DoctorProfilePage />} />
            <Route path="/nurses/:id" element={<NurseProfilePage />} />
            <Route path="/book-ambulance" element={<BookAmbulancePage />} />
            <Route path="/care-navigator" element={<CareNavigatorPage />} />
            <Route path="/care-circle" element={<CareCirclePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/contact" element={<Contact />} />
            {/* --- Protected Patient Routes --- */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/care-circle"
              element={
                <ProtectedRoute>
                  <CareCirclePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-lab-test"
              element={
                <ProtectedRoute>
                  <BookLabTestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video-consult"
              element={
                <ProtectedRoute>
                  <VideoConsultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-appointments"
              element={
                <ProtectedRoute>
                  <MyAppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-prescriptions"
              element={
                <ProtectedRoute>
                  <MyPrescriptionsPage />
                </ProtectedRoute>
              }
            />
            //{" "}
            <Route
              path="/health-quests"
              element={
                <ProtectedRoute>
                  <HealthQuestsPage />
                </ProtectedRoute>
              }
            />
            {/* --- Protected Professional (Doctor/Nurse) Routes --- */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse/dashboard"
              element={
                <ProtectedRoute>
                  <NurseDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/edit-profile"
              element={
                <ProtectedRoute>
                  <DoctorEditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse/edit-profile"
              element={
                <ProtectedRoute>
                  <DoctorEditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/appointments"
              element={
                <ProtectedRoute>
                  <DoctorAppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse/appointments"
              element={
                <ProtectedRoute>
                  <DoctorAppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/availability"
              element={
                <ProtectedRoute>
                  <ProfessionalAvailabilityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse/availability"
              element={
                <ProtectedRoute>
                  <ProfessionalAvailabilityPage />
                </ProtectedRoute>
              }
            />
            {/* --- Admin-Only Route --- */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* scroll-to-to (absolute) */}
        <Footer />
        <BackToTopButton />
      </div>
    </Router>
  );
}

export default App;
