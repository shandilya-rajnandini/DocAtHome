import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { IoSunnySharp } from "react-icons/io5";
import { BsFillMoonStarsFill } from "react-icons/bs";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("pagemode") || "light";
  });
  const [isOpen, setIsOpen] = useState(false);

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
          {user && user.role === 'admin' && (
            <Link to="/admin/intake-logs" className="hover:text-accent-blue relative group transition">
              Intake Logs
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
