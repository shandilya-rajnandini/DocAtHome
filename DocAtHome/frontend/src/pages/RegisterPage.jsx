import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi, getMe } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// --- Predefined Options for Dropdowns ---
const doctorSpecialties = ['Cardiologist', 'Dermatologist', 'Gynecologist', 'Dentist', 'Pediatrician', 'General Physician'];
const nurseCategories = ['Elder Care', 'Child Care', 'Post-Operative Care', 'General Nursing (GNM)', 'Auxiliary Nursing (ANM)'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Patna', 'Kolkata', 'Chennai'];
const experienceLevels = Array.from({ length: 30 }, (_, i) => i + 1); // Creates an array [1, 2, ..., 30]

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'patient',
    specialty: '', city: '', experience: '', licenseNumber: '', govId: ''
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const { role } = formData;
  const isProfessional = role === 'doctor' || role === 'nurse';

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create a payload with only the necessary fields
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (isProfessional) {
        payload.specialty = formData.specialty;
        payload.city = formData.city;
        payload.experience = formData.experience;
        payload.licenseNumber = formData.licenseNumber;
        payload.govId = formData.govId;
      }

      const { data } = await registerApi(payload);
      localStorage.setItem('token', data.token);
      
      const { data: userData } = await getMe(); 
      login(userData);

      toast.success('Registration successful!');

      // Redirect based on role
      if (userData.role === 'patient') {
        navigate('/dashboard'); // <-- Redirect patients to the dashboard
      } else {
        // Professionals will see a "pending approval" message when they try to log in,
        // so we can just redirect them to the homepage for now.
        toast.success('Your account is pending admin approval.');
        navigate('/'); 
      }

    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center mt-10 mb-20">
      <form onSubmit={onSubmit} className="bg-secondary-dark p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Create Your Account</h2>
        
        {/* --- Core Fields --- */}
        <div className="mb-4">
          <label className="block text-secondary-text mb-2">I am a...</label>
          <select name="role" value={role} onChange={onChange} className="w-full p-3 bg-primary-dark rounded border-gray-700">
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
                <label className="block text-secondary-text mb-2">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={onChange} required className="w-full p-3 bg-primary-dark rounded border-gray-700" />
            </div>
            <div className="mb-4">
                <label className="block text-secondary-text mb-2">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={onChange} required className="w-full p-3 bg-primary-dark rounded border-gray-700" />
            </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-secondary-text mb-2">Password</label>
          <input type="password" name="password" value={formData.password} onChange={onChange} required minLength="6" className="w-full p-3 bg-primary-dark rounded border-gray-700" />
        </div>

        {/* --- Professional Fields (Conditional) --- */}
        {isProfessional && (
            <div className="border-t border-gray-700 pt-6 mt-6">
                <h3 className="text-xl font-semibold text-accent-blue mb-4">Professional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Specialty Dropdown */}
                    <div className="mb-4">
                        <label className="block text-secondary-text mb-2">{role === 'doctor' ? 'Specialty' : 'Nurse Category'}</label>
                        <select name="specialty" value={formData.specialty} onChange={onChange} required className="w-full p-3 bg-primary-dark rounded border-gray-700">
                            <option value="">Select an option</option>
                            {(role === 'doctor' ? doctorSpecialties : nurseCategories).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    {/* City Dropdown */}
                    <div className="mb-4">
                        <label className="block text-secondary-text mb-2">City</label>
                        <select name="city" value={formData.city} onChange={onChange} required className="w-full p-3 bg-primary-dark rounded border-gray-700">
                            <option value="">Select City</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>

                    {/* Experience Dropdown */}
                    <div className="mb-4">
                        <label className="block text-secondary-text mb-2">Experience (Years)</label>
                        <select name="experience" value={formData.experience} onChange={onChange} required className="w-full p-3 bg-primary-dark rounded border-gray-700">
                            <option value="">Select Years</option>
                            {experienceLevels.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                        </select>
                    </div>

                    {/* License Number Input */}
                    <div className="mb-4">
                        <label className="block text-secondary-text mb-2">Medical License Number</label>
                        <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={onChange} required className="w-full p-3 bg-primary-dark rounded border-gray-700" />
                    </div>

                    {/* Government ID Input */}
                    <div className="mb-4 md:col-span-2">
                        <label className="block text-secondary-text mb-2">Aadhaar / Voter ID / Government ID Number</label>
                        <input type="text" name="govId" value={formData.govId} onChange={onChange} required className="w-full p-3 bg-primary-dark rounded border-gray-700" />
                    </div>
                </div>
            </div>
        )}

        <button type="submit" className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover mt-6">
          Register
        </button>

        <p className="text-center mt-4 text-secondary-text">
            Already have an account? <Link to="/login" className="text-accent-blue hover:underline">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;