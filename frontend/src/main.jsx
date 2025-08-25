import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Import the providers we need for the whole application
import { Toaster } from "react-hot-toast"; // For pop-up notifications

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Toaster allows any component to show notifications like "Login successful!" */}
    <Toaster position="top-center" />

    <App />
  </React.StrictMode>,
);
