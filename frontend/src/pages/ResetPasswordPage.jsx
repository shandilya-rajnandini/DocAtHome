import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    setLoading(true);
    try {
      await resetPassword(token, { password });
      toast.success('Password has been reset successfully.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-20">
      <form onSubmit={onSubmit} className="bg-secondary-dark p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Reset Password
        </h2>
        
        <div className="mb-4">
          <label className="block text-secondary-text mb-2">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            className="w-full p-3 bg-primary-dark rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>

        <div className="mb-6">
          <label className="block text-secondary-text mb-2">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="6"
            className="w-full p-3 bg-primary-dark rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover transition duration-300 disabled:bg-gray-500"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
