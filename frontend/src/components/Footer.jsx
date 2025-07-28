import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-blue-100 to-blue-200 text-primary-dark py-8 px-4 text-center border-t border-gray-300">
      {/* Logo / Title */}
      <h3 className="text-3xl font-extrabold mb-4 text-blue-900">DocAtHome</h3>
      
      {/* Navigation Links */}
      <nav className="flex flex-wrap justify-center gap-6 mb-6">
        <Link to="/" className="hover:text-blue-700 transition duration-300">Home</Link>
        <Link to="/about" className="hover:text-blue-700 transition duration-300">About</Link>
        <Link to="/services" className="hover:text-blue-700 transition duration-300">Services</Link>
        <Link to="/testimonials" className="hover:text-blue-700 transition duration-300">Testimonials</Link>
        <Link to="/contact" className="hover:text-blue-700 transition duration-300">Contact</Link>
      </nav>

      {/* Copyright */}
      <p className="text-sm text-gray-600">
        &copy; {currentYear} <span className="font-semibold text-blue-800">DocAtHome</span>. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
