import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-accent-cream dark:bg-primary-dark">
      <div className="text-center max-w-md w-full bg-white dark:bg-secondary-dark rounded-xl shadow-lg overflow-hidden p-8">
        <div className="mb-6">
          {/* A simple 404 icon/illustration */}
          <div className="flex justify-center">
            <svg className="w-24 h-24 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6m0-6l6 6" />
            </svg>
          </div>
          
          {/* 404 message */}
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mt-6 mb-2">404 - Page Not Found</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Oops! We couldn’t find that page — but here are some helpful links to get you back on track
          </p>
          
          {/* Back to home button */}
          <Link 
            to="/" 
            className="inline-block bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Back to Homepage
          </Link>
        </div>
        
        {/* Additional helpful links */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You might want to check these pages instead:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/search" className="text-accent-blue hover:text-accent-blue-hover dark:text-blue-400">
              Find a Doctor
            </Link>
            <Link to="/search-nurses" className="text-accent-blue hover:text-accent-blue-hover dark:text-blue-400">
              Find a Nurse
            </Link>
            <Link to="/book-ambulance" className="text-accent-blue hover:text-accent-blue-hover dark:text-blue-400">
              Book Ambulance
            </Link>
            <Link to="/contact" className="text-accent-blue hover:text-accent-blue-hover dark:text-blue-400">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
