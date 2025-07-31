import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState,useEffect } from 'react';
import { IoSunnySharp } from "react-icons/io5";
import { BsFillMoonStarsFill } from "react-icons/bs";


const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  //Dark and Light Mode
  const [theme,setTheme] = useState(()=>{return localStorage.getItem('pagemode')||'light'});

  useEffect(() => {
    const html =  document.documentElement;
    if(theme==='dark'){
      html.classList.add('dark')
    }
    else{
      html.classList.remove('dark');
    }
    localStorage.setItem('pagemode',theme)
  
   
  }, [theme]);

  const toggleTheme = ()=>{
    setTheme((prev)=>(prev==='light'?'dark':'light'));
  }
  

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-amber-100 text-black dark:bg-secondary-dark dark:text-white p-4 shadow-lg sticky top-0 z-50 opacity-90">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={user && user.role === 'patient' ? '/dashboard' : (user ? '/doctor/dashboard' : '/')} className="text-2xl font-bold text-accent-blue">
          Doc@Home
        </Link>
        <div className=" space-x-4 md:space-x-6 flex items-center text-black dark:text-primary-text font-semibold">
          
          <Link to="/search" className="hover:text-accent-blue transition-colors">Search Doctors</Link>
          
          {/* --- THIS IS THE NEW LINK --- */}
          <Link to="/book-ambulance" className="hover:text-accent-blue transition-colors">Ambulance</Link>
          
          {user ? (
            <>
              <span className="hidden md:inline">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition-colors text-white dark:text-black"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-accent-blue transition-colors">Login</Link>
              <Link to="/register" className="bg-blue-400 dark:bg-accent-blue px-4 py-2 rounded hover:bg-accent-blue-hover dark:hover:bg-accent-blue-hover transition-colors">
                Register
              </Link>
            </>
          )}
       <button 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          className="border border-black p-2 rounded-full bg-slate-800 dark:bg-amber-200 hover:bg-slate-600 dark:hover:bg-amber-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue"
        >
          {theme === 'light' ? (
            <BsFillMoonStarsFill className="text-2xl text-cyan-200" />
          ) : (
            <IoSunnySharp className="text-2xl text-black" />
          )}
        </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;