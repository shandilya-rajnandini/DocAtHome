import React, { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log("Newsletter subscription:", email);
    setEmail("");
    alert("Thank you for subscribing to our newsletter!");
  };

  return (
    <footer className="bg-white text-black dark:bg-black dark:text-white border-t border-gray-300 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Socials */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4">Doc@Home</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">
              Bringing quality healthcare to your doorstep. Professional medical services with the comfort and convenience of home care.
            </p>
            <div className="flex space-x-4">
              {/* GitHub Link */}
              <a
                href="https://github.com/shandilya-rajnandini/DocAtHome"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 ..."/>
                </svg>
              </a>
              {/* Add more socials here if needed */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-3">
              <Link to="/" className="block text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-sm">Home</Link>
              <Link to="/search" className="block text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-sm">Find a Doctor</Link>
              <Link to="/search-nurses" className="block text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-sm">Find a Nurse</Link>
              <Link to="/book-ambulance" className="block text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-sm">Book Ambulance</Link>
            </div>
          </div>

          {/* Patient Portal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Patient Portal</h4>
            <div className="space-y-3">
              <Link to="/dashboard" className="block text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-sm">Dashboard</Link>
              <Link to="/search" className="block text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-sm">Search Doctors</Link>
              <Link to="/book-ambulance" className="block text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-sm">Ambulance</Link>
            </div>
          </div>

          {/* Manage Account */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Manage Account</h4>
            <div className="space-y-3">
              <Link to="/login" className="block text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-sm">Login</Link>
              <Link to="/register" className="block text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-sm">Register</Link>
              <Link to="/my-appointments" className="block text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-sm">My Appointments</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Stay Updated</h4>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Subscribe to our newsletter for the latest updates.
              </p>
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  aria-label="Email address for newsletter subscription"
                  className="flex-1 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-blue dark:bg-accent-blue-hover text-white text-sm font-medium rounded-r-md hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-300 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {currentYear} Doc@Home. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
