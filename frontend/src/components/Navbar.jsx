import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IoSunnySharp } from "react-icons/io5";
import { BsFillMoonStarsFill } from "react-icons/bs";
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

// Initialize socket connection once (adjust backend URL)
const socket = io("http://localhost:5001");

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Notification states
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("pagemode") || "light";
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user || !user.id) return;

    socket.emit("join_user_room", user.id);

    socket.on("new_notification", () => {
      setHasNewNotification(true);
      fetchNotifications();
    });
  
    // Initial fetch of unread notifications
    fetchNotifications();

    // Cleanup on unmount
    return () => {
      socket.off("new_notification");
    };
  }, [user]);

  // Fetch unread notifications from your backend API
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/unread", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // adjust as per your auth
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setHasNewNotification(data.notifications.length > 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  // Mark a notification as read and navigate
  const handleNotificationClick = async (notification) => {
    try {
      const res = await fetch(`/api/notifications/${notification._id}/mark-read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // adjust accordingly
        },
      });
      if (res.ok) {
        // Remove from unread list
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notification._id)
        );
        if (notifications.length === 1) setHasNewNotification(false);

        // Navigate to the link
        navigate(notification.link);
        setDropdownOpen(false);
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  // Toggle dropdown and reset red dot if opening
  const toggleDropdown = () => {
    if (!dropdownOpen) {
      setHasNewNotification(false);
    }
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  useEffect(() => {
    const html = document.documentElement;
    theme === "dark"
      ? html.classList.add("dark")
      : html.classList.remove("dark");
    localStorage.setItem("pagemode", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };


  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-[#0d172a]/70 dark:bg-secondary-dark/70 shadow-lg transition-colors mb-20">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={
            user && user.role === "patient"
              ? "/dashboard"
              : user
              ? "/doctor/dashboard"
              : "/"
          }
          className="text-2xl font-bold text-accent-blue tracking-wide hover:scale-105 transition-transform"
        >
          Doc@Home
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 font-medium ml-auto">
          <Link
            to="/search"
            className="hover:text-accent-blue relative group transition"
          >
            Search Doctors
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-accent-blue transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            to="/book-ambulance"
            className="hover:text-accent-blue relative group transition"
          >
            Ambulance
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-accent-blue transition-all duration-300 group-hover:w-full"></span>
          </Link>
          {user && user.role === "patient" && (
            <Link
              to="/health-quests"
              className="hover:text-accent-blue relative group transition"
            >
              Health Quests
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-accent-blue transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}
          {user ? (
            <>
            <span className="text-white">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition-colors text-white dark:text-black"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-accent-blue relative group transition"
              >
                Login
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-accent-blue transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                to="/register"
                className="bg-blue-400 dark:bg-accent-blue px-4 py-2 rounded hover:bg-accent-blue-hover dark:hover:bg-accent-blue-hover transition-colors"
              >
                Register
              </Link>
            </>
          )}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
            className="ml-4 border border-black p-2 rounded-full bg-slate-800 dark:bg-amber-200 hover:bg-slate-600 dark:hover:bg-amber-400 transition-colors"
          >
            {theme === "light" ? (
              <BsFillMoonStarsFill className="text-2xl text-cyan-200" />
            ) : (
              <IoSunnySharp className="text-2xl text-black" />
            )}
          </button>
        </div>

        {/* Notification Bell */}
        {user && (
          <div className="relative ml-4" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              aria-label="Toggle notifications"
              className="relative text-white focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {hasNewNotification && (
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-600"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-md bg-white shadow-lg dark:bg-gray-800 z-50">
                <div className="p-3 font-semibold border-b dark:border-gray-700">
                  Notifications
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-gray-500">No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className="cursor-pointer hover:bg-accent-blue hover:text-white px-4 py-3 border-b dark:border-gray-700"
                    >
                      <div className="font-medium">{notif.message}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Mobile Hamburger */}
        <div className="md:hidden ml-auto">
          <button
            onClick={toggleMenu}
            className="relative w-8 h-8 flex flex-col justify-between items-center focus:outline-none"
            aria-label="Toggle Menu"
          >
            <span
              className={`block h-0.5 w-full bg-white transform transition duration-300 ${
                isOpen ? "rotate-45 translate-y-3.5" : ""
              }`}
            ></span>
            <span
              className={`block h-0.5 w-full bg-white transition duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`block h-0.5 w-full bg-white transform transition duration-300 ${
                isOpen ? "-rotate-45 -translate-y-3.5" : ""
              }`}
            ></span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden overflow-hidden bg-[#0d172a]/95 dark:bg-secondary-dark/95 transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col items-start px-6 py-4 space-y-4">
          {[
            { to: "/search", label: "Search Doctors" },
            { to: "/book-ambulance", label: "Ambulance" },
            ...(user && user.role === "patient"
              ? [{ to: "/health-quests", label: "Health Quests" }]
              : []),
            ...(user
              ? []
              : [
                  { to: "/login", label: "Login" },
                  {
                    to: "/register",
                    label: "Register",
                    isRegister: true, // Mark register button
                  },
                ]),
          ].map((item, i) => (
            <li
              key={item.to}
              className={`w-full transform transition-all duration-500 ease-in-out ${
                isOpen
                  ? `translate-y-0 opacity-100 delay-[${i * 100}ms]`
                  : "-translate-y-5 opacity-0"
              }`}
            >
              <Link
                to={item.to}
                className={`block px-4 py-2 rounded-md transition-all duration-300 hover:scale-[1.02] ${
                  item.isRegister
                    ? "bg-blue-400 dark:bg-accent-blue text-center w-full hover:bg-accent-blue-hover dark:hover:bg-accent-blue-hover active:bg-accent-blue"
                    : "hover:bg-blue-500/20"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {user && (
            <li
              className={`transform transition-all duration-500 ease-in-out ${
                isOpen
                  ? "translate-y-0 opacity-100 delay-[300ms]"
                  : "-translate-y-5 opacity-0"
              }`}
            >
              <button
                onClick={handleLogout}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition-colors text-white dark:text-black w-full"
              >
                Logout
              </button>
            </li>
          )}

          {/* Theme Toggle in mobile */}
          <li
            className={`transform transition-all duration-500 ease-in-out ${
              isOpen
                ? "translate-y-0 opacity-100 delay-[400ms]"
                : "-translate-y-5 opacity-0"
            }`}
          >
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${
                theme === "light" ? "dark" : "light"
              } mode`}
              className="border border-black p-2 rounded-full bg-slate-800 dark:bg-amber-200 hover:bg-slate-600 dark:hover:bg-amber-400 transition-colors"
            >
              {theme === "light" ? (
                <BsFillMoonStarsFill className="text-2xl text-cyan-200" />
              ) : (
                <IoSunnySharp className="text-2xl text-black" />
              )}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
