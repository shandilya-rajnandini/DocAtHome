import React from 'react';
import { Link } from 'react-router-dom'; 

const Footer = () => {
  return (
    <footer className="bg-accent-cream text-primary-dark p-8 text-center">
        <h3 className="text-3xl font-bold mb-4">DocAtHome</h3>
        <div className="flex justify-center space-x-6 mb-6">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/about" className="hover:underline">About</Link>
            <Link to="/services" className="hover:underline">Services</Link>
            <Link to="/testimonials" className="hover:underline">Testimonials</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
        </div>
        <p>Copyright © {new Date().getFullYear()} All rights reserved</p>
    </footer>
  );
};

export default Footer;