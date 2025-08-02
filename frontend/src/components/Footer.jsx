<<<<<<< HEAD
import React from 'react';
import { Link } from 'react-router-dom'; 
=======
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
>>>>>>> 7895a1ac95dd9ec20f9eac1f2bc3740396ee7f69

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    console.log("Newsletter subscription:", email);
    setEmail("");
    alert("Thank you for subscribing to our newsletter!");
  };

  return (
    <footer className="bg-black  border-blue">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className=" text-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">Doc@Home</h3>
            <p className="dark:text-gray-300 text-sm mb-4 leading-relaxed">
              Bringing quality healthcare to your doorstep. Professional medical
              services with the comfort and convenience of home care.
            </p>
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-300 transition-colors duration-200"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="https://github.com/shandilya-rajnandini/DocAtHome"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-300 transition-colors duration-200"
                aria-label="GitHub"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-300 transition-colors duration-200"
                aria-label="Discord"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Contents */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contents</h4>
            <div className="space-y-3">
              <a
                href="/about"
                className="block text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                About
              </a>
              <a
                href="/services"
                className="block text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                Services
              </a>
              <a
                href="/testimonials"
                className="block text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                Testimonials
              </a>
              <a
                href="/contact"
                className="block text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Products</h4>
            <div className="space-y-3">
              <a
                href="/frontend/src/pages/PatientDashboard.jsx"
                className="block text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                Dashboard
              </a>
              <a
                href="/frontend/src/pages/SearchDoctorsPage.jsx"
                className="block text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                Search Doctors
              </a>
              <a
                href="/frontend/src/pages/BookAmbulancePage.jsx"
                className="block text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                Ambulance
              </a>
              <a
                href="/frontend/src/pages/MyAppointmentsPage.jsx"
                className="block text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                My Appointments
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Newsletter
            </h4>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-l-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
                >
                  Subscribe
                </button>
              </div>
            </form>

            {/* Additional Links */}
            <div className="mt-4 space-y-2">
              <a className="block text-sm text-gray-300 transition-colors duration-200">
                v1.1.0
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-blue">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm text-gray-300">
              © {currentYear}{" "}
              <span className="font-semibold text-white">Doc@Home</span>. All
              rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex space-x-6">
              <a
                href="/privacy-policy"
                className="text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                className="text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="/license"
                className="text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                License
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
