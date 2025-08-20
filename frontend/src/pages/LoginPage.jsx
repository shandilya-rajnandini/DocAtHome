import { useState } from 'react';

import { useNavigate, Link, useLocation } from 'react-router-dom';

import API, { login as loginApi, getMe } from '../api';

import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  
  const { login } = useAuthStore();
  const location = useLocation();
  
  const { email, password } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginApi(formData);
      if (data.twoFactorRequired) {
        setTwoFactorRequired(true);
        setUserId(data.userId);
      } else {
        localStorage.setItem('token', data.token);
        
        const { data: userData } = await getMe();
        login(userData);
        
        toast.success('Login successful!');

        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');
        const from = redirect || '/dashboard';
        // Final redirect logic based on user's role
        if (userData.role === 'admin') {
          navigate('/admin');
        } else if (userData.role === 'patient') {
          navigate(from, { replace: true });
        } else if (userData.role === 'doctor' || userData.role === 'nurse') {
          // Redirect both doctors and nurses to the professional dashboard
          navigate('/doctor/dashboard');
        } else {
          // Default fallback to the homepage
          navigate('/');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed. Please check your credentials.');
    }
  };

  const on2FASubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/2fa/login', { userId, token });
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
      toast.error(err.response?.data?.message || 'Invalid 2FA token.');
    }
  };

  return (
    <div className="bg-amber-200 dark:!bg-primary-dark flex justify-center items-center mt-20 mb-20">
      {twoFactorRequired ? (
        <form onSubmit={on2FASubmit} className="bg-white dark:bg-secondary-dark p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">
            Enter 2FA Code
          </h2>
          <div className="mb-4">
            <label className="block text-slate-700 dark:text-secondary-text mb-2">Authenticator Code</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border  border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue text-black dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover transition duration-300"
          >
            Verify
          </button>
        </form>
      ) : (
        <form onSubmit={onSubmit} className="bg-white dark:bg-secondary-dark p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">
            Login to Your Account
          </h2>
          
          <div className="mb-4">
            <label className="block text-slate-700 dark:text-secondary-text mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border  border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue text-black dark:text-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-700 dark:text-secondary-text mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue text-black dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover transition duration-300"
          >
            Login
          </button>

          <div className="text-center mt-4 text-secondary-text">
            <Link to="/forgot-password" className="text-sm text-accent-blue hover:underline">
              Forgot Password?
            </Link>
          </div>

          <p className="text-center mt-4 text-secondary-text">
              Don't have an account? <Link to="/register" className="text-accent-blue hover:underline">Register here</Link>
          </p>
        </form>
      )}
    </div>
  );
};

export default LoginPage;
