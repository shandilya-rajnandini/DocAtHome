import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-secondary-dark p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={user && user.role === 'patient' ? '/dashboard' : (user ? '/doctor/dashboard' : '/')} className="text-2xl font-bold text-accent-blue">
          Doc@Home
        </Link>
        <div className="space-x-4 md:space-x-6 flex items-center text-primary-text font-semibold">
          
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;