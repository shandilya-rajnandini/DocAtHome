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
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-accent-blue text-white p-2 z-50">Skip to main content</a>
        <Navbar />
        <AnnouncementBanner />

        <main id="main-content" tabIndex="-1" className="flex-grow">
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
