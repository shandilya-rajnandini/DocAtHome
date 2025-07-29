import React from 'react';

import { NavLink } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navClass = ({ isActive }) =>{
      return isActive? "text-red-700 font-bold hover:scale-105 hover:transition-all hover:duration-100":"hover:text-blue-800 hover:scale-105 hover:transition-all hover:duration-100";
  }

  return (
    <footer className="bg-gradient-to-r from-blue-100 to-blue-200 text-primary-dark py-8 px-4 text-center border-t border-gray-300">
      {/* Logo / Title */}
      <h3 className="text-3xl font-extrabold mb-4 text-blue-900 ">DocAtHome</h3>
      
      {/* Navigation Links */}
      <nav className="flex flex-wrap justify-center gap-6 mb-6 text-xl">
        <NavLink to="/" className={navClass}>Home</NavLink>
        <NavLink to="/about" className={navClass}>About</NavLink>
        <NavLink to="/services" className={navClass}>Services</NavLink>
        <NavLink to="/testimonials" className={navClass}>Testimonials</NavLink>
        <NavLink to="/contact" className={navClass}>Contact</NavLink>
      </nav>

      {/* Copyright */}
      <p className="text-sm text-gray-600">
        &copy; {currentYear} <span className="font-semibold text-blue-800">DocAtHome</span>. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
