import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && user.role !== 'admin') {
      return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;