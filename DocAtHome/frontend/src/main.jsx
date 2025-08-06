import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Import the providers we need for the whole application
import { AuthProvider } from './context/AuthContext.jsx'; // For user login state
import { Toaster } from 'react-hot-toast'; // For pop-up notifications

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider makes user data available to all components */}
    <AuthProvider>
      {/* Toaster allows any component to show notifications like "Login successful!" */}
      <Toaster position="top-center" />
      
      {/* App is your main application component */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);