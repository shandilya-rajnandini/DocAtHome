import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi, getMe } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const { email, password } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginApi(formData);
      localStorage.setItem('token', data.token);
      
      const { data: userData } = await getMe();
      login(userData);
      
      toast.success('Login successful!');

      // Final redirect logic based on user's role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'patient') {
        navigate('/dashboard');
      } else if (userData.role === 'doctor' || userData.role === 'nurse') {
        // Redirect both doctors and nurses to the professional dashboard
        navigate('/doctor/dashboard');
      } else {
        // Default fallback to the homepage
        navigate('/');
      }

    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex justify-center items-center mt-20">
      <form onSubmit={onSubmit} className="bg-secondary-dark p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Login to Your Account
        </h2>
        
        <div className="mb-4">
          <label className="block text-secondary-text mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            className="w-full p-3 bg-primary-dark rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>

        <div className="mb-6">
          <label className="block text-secondary-text mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            className="w-full p-3 bg-primary-dark rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover transition duration-300"
        >
          Login
        </button>

        <p className="text-center mt-4 text-secondary-text">
            Don't have an account? <Link to="/register" className="text-accent-blue hover:underline">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;