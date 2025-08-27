import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom"; // Use Link for internal navigation


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this to a backend API
    console.log("Newsletter subscription:", email);
    setEmail("");
    alert("Thank you for subscribing to our newsletter!");
  };

  return (
    <footer className="w-full bg-[#A6CFD5] dark:bg-secondary-dark text-black dark:text-primary-text py-4 px-2 shadow-lg transition-colors border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Socials */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-black dark:text-primary-text mb-4">Doc@Home</h3>
            <p className="text-black dark:text-primary-text text-sm mb-4 leading-relaxed">
              Bringing quality healthcare to your doorstep. Professional medical services with the comfort and convenience of home care.
            </p>
            <div className="flex space-x-4">
              {/* GitHub Link */}
              <a
                href="https://github.com/shandilya-rajnandini/DocAtHome"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
              {/* Add other social links like Twitter or Discord here if you have them */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-black dark:text-primary-text mb-4">Quick Links</h4>
            <div className="space-y-3">
              <Link to="/" className="block text-sm text-black dark:text-primary-text hover:text-black">Home</Link>
              <Link to="/search" className="block text-sm text-black dark:text-primary-text hover:text-black">Find a Doctor</Link>
              <Link to="/search-nurses" className="block text-sm text-black dark:text-primary-text hover:text-black">Find a Nurse</Link>
              <Link to="/book-ambulance" className="block text-sm text-black dark:text-primary-text hover:text-black">Book Ambulance</Link>
            </div>
          </div>

          {/* Patient Portal */}
          <div>
            <h4 className="text-lg font-semibold text-black dark:text-primary-text mb-4">Patient Portal</h4>
            <div className="space-y-3">
              <Link to="/dashboard" className="block text-sm text-black dark:text-primary-text hover:text-black">Dashboard</Link>
              <Link to="/search" className="block text-sm text-black dark:text-primary-text hover:text-black">Search Doctors</Link>
              <Link to="/book-ambulance" className="block text-sm text-black dark:text-primary-text hover:text-black">Ambulance</Link>
            </div>
          </div>

          {/* Manage Account */}
          <div>
            <h4 className="text-lg font-semibold text-black dark:text-primary-text mb-4">Manage Account</h4>
            <div className="space-y-3">
              <Link to="/login" className="block text-sm text-black dark:text-primary-text hover:text-black">Login</Link>
              <Link to="/register" className="block text-sm text-black dark:text-primary-text hover:text-black">Register</Link>

              <Link to="/my-appointments" className="block text-sm text-black dark:text-primary-text hover:text-black">My Appointments</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-black dark:text-primary-text mb-4">Stay Updated</h4>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <p className="text-sm text-black dark:text-primary-text">Subscribe to our newsletter for the latest updates.</p>
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-3 py-2 text-sm text-black dark:text-primary-text bg-white border border-gray-300 rounded-l-md"
                />
                <button type="submit" className="px-4 py-2 bg-accent-blue text-white text-sm font-medium rounded-r-md hover:bg-accent-blue-hover">
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-black dark:text-primary-text">
              © {currentYear} Doc@Home. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-sm text-black dark:text-primary-text hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-black dark:text-primary-text hover:text-white">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;