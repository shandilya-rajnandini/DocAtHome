import { BrowserRouter as Router } from "react-router-dom";

// --- Core Layout and Auth Components ---
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import BackToTopButton from "./components/BackToTopButton.jsx";
import AnnouncementBanner from "./components/AnnouncementBanner.jsx";
import AnimatedRoutes from "./components/AnimatedRoutes.jsx";

function App() {
  return (
    <Router>
      <div className="!bg-amber-200 dark:!bg-primary-dark min-h-screen text-primary-text flex flex-col">
        <Navbar />
        <AnnouncementBanner />

        <main className="flex-grow">
          <AnimatedRoutes />
        </main>

        {/* scroll-to-to (absolute) */}
        <Footer />
        <BackToTopButton />
      </div>
    </Router>
  );
}

export default App;
