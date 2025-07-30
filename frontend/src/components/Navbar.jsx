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
    const html = document.getElementById('html');
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
    <nav className="bg-amber-100 text-black dark:bg-secondary-dark dark:text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={user && user.role === 'patient' ? '/dashboard' : (user ? '/doctor/dashboard' : '/')} className="text-2xl font-bold text-accent-blue">
          Doc@Home
        </Link>
        <div className="space-x-4 md:space-x-6 flex items-center text-black dark:text-primary-text font-semibold">
          
          <Link to="/search" className="hover:text-accent-blue transition-colors">Search Doctors</Link>
          
          {/* --- THIS IS THE NEW LINK --- */}
          <Link to="/book-ambulance" className="hover:text-accent-blue transition-colors">Ambulance</Link>
          
          {user ? (
            <>
              <span className="hidden md:inline">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-accent-blue transition-colors">Login</Link>
              <Link to="/register" className="bg-accent-blue px-4 py-2 rounded hover:bg-accent-blue-hover transition-colors">
                Register
              </Link>
            </>
          )}
        <div className='text-white hover:cursor-pointer' onClick={toggleTheme}>
           {theme === 'light' ? <BsFillMoonStarsFill className='text-xl text-accent-blue'/> : <IoSunnySharp className='text-xl text-accent-blue'/>}


        </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;