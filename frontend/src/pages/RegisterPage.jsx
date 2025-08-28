import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi, getMe } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// --- Predefined Options ---
const doctorSpecialties = ['Cardiologist', 'Dermatologist', 'Gynecologist', 'Dentist', 'Pediatrician', 'General Physician'];
const nurseCategories = ['Elder Care', 'Child Care', 'Post-Operative Care', 'General Nursing'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Patna', 'Kolkata', 'Chennai'];
const experienceLevels = Array.from({ length: 30 }, (_, i) => i + 1);

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'patient',
        specialty: '', city: '', experience: '', licenseNumber: '', govId: '', vehicleRegistrationNumber: ''
    });
    const navigate = useNavigate();
    const { login } = useAuth();

    const { role } = formData;
    const isProfessional = role === 'doctor' || role === 'nurse' || role === 'technician' || role === 'ambulance';

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!isProfessional) {
                // Remove professional fields if registering as a patient
                delete payload.specialty;
                delete payload.city;
                delete payload.experience;
                delete payload.licenseNumber;
                delete payload.govId;
                delete payload.vehicleRegistrationNumber;
            }

            const { data } = await registerApi(payload);
            localStorage.setItem('token', data.token);
            const { data: userData } = await getMe();
            login(userData);
            toast.success('Registration successful!');

            // Redirect logic
            if (userData.role === 'patient') navigate('/dashboard');
            else if (userData.role === 'doctor') navigate('/doctor/dashboard');
            else if (userData.role === 'nurse') navigate('/nurse/dashboard');
            else {
                toast.success('Your account is pending admin approval.');
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Registration failed.');
        }
    };

    return (
        <div className="flex justify-center items-center mt-10 mb-20">
            <form onSubmit={onSubmit} className="bg-secondary-dark p-8 rounded-lg shadow-lg w-full max-w-2xl">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Create Your Account</h2>
                
                {/* Role Selection */}
                <div className="mb-4">
                    <label className="block text-secondary-text mb-2">I am a...</label>
                    <select name="role" value={role} onChange={onChange} className="w-full p-3 bg-primary-dark rounded border-gray-700">
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="nurse">Nurse</option>
                        <option value="technician">Lab Technician</option>
                        <option value="ambulance">Ambulance Driver</option>
                    </select>
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-secondary-text mb-2">Full Name</label>
                        <input type="text" name="name" onChange={onChange} required className="w-full p-3 bg-primary-dark rounded"/>
                    </div>
                    <div>
                        <label className="block text-secondary-text mb-2">Email Address</label>
                        <input type="email" name="email" onChange={onChange} required className="w-full p-3 bg-primary-dark rounded"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-secondary-text mb-2">Password</label>
                        <input type="password" name="password" onChange={onChange} required minLength="6" className="w-full p-3 bg-primary-dark rounded"/>
                    </div>
                    <div>
                        <label className="block text-secondary-text mb-2">Confirm Password</label>
                        <input type="password" name="confirmPassword" onChange={onChange} required className="w-full p-3 bg-primary-dark rounded"/>
                    </div>
                </div>

                {/* Professional Fields */}
                {isProfessional && (
                    <div className="border-t border-gray-700 pt-6 mt-6">
                        <h3 className="text-xl font-semibold text-accent-blue mb-4">Professional Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            { (role === 'doctor' || role === 'nurse') && <>
                                <div>
                                    <label className="block text-secondary-text mb-2">{role === 'doctor' ? 'Specialty' : 'Care Category'}</label>
                                    <select name="specialty" onChange={onChange} required className="w-full p-3 bg-primary-dark rounded">
                                        <option value="">Select an option</option>
                                        {(role === 'doctor' ? doctorSpecialties : nurseCategories).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-secondary-text mb-2">City</label>
                                    <select name="city" onChange={onChange} required className="w-full p-3 bg-primary-dark rounded">
                                        <option value="">Select City</option>
                                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-secondary-text mb-2">Experience (Years)</label>
                                    <select name="experience" onChange={onChange} required className="w-full p-3 bg-primary-dark rounded">
                                        <option value="">Select Years</option>
                                        {experienceLevels.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-secondary-text mb-2">Medical License No.</label>
                                    <input type="text" name="licenseNumber" onChange={onChange} required className="w-full p-3 bg-primary-dark rounded"/>
                                </div>
                            </> }

                            { role === 'technician' && <>
                                <div>
                                    <label className="block text-secondary-text mb-2">Certification ID</label>
                                    <input type="text" name="licenseNumber" onChange={onChange} required className="w-full p-3 bg-primary-dark rounded"/>
                                </div>
                                <div>
                                    <label className="block text-secondary-text mb-2">City</label>
                                    <select name="city" onChange={onChange} required className="w-full p-3 bg-primary-dark rounded">
                                        <option value="">Select City</option>
                                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                                    </select>
                                </div>
                            </> }

                            { role === 'ambulance' && <>
                                <div>
                                    <label className="block text-secondary-text mb-2">Driver's License No.</label>
                                    <input type="text" name="licenseNumber" onChange={onChange} required className="w-full p-3 bg-primary-dark rounded"/>
                                </div>
                                <div>
                                    <label className="block text-secondary-text mb-2">Vehicle Registration No.</label>
                                    <input type="text" name="vehicleRegistrationNumber" onChange={onChange} required className="w-full p-3 bg-primary-dark rounded"/>
                                </div>
                            </> }

                            <div className="md:col-span-2">
                                <label className="block text-secondary-text mb-2">Government ID (Aadhaar, etc.)</label>
                                <input type="text" name="govId" onChange={onChange} required className="w-full p-3 bg-primary-dark rounded"/>
                            </div>
                        </div>
                    </div>
                )}
                <button type="submit" className="w-full bg-accent-blue text-white p-3 rounded font-bold hover:bg-accent-blue-hover mt-6">Register</button>
                <p className="text-center mt-4 text-secondary-text">Already have an account? <Link to="/login" className="text-accent-blue hover:underline">Login here</Link></p>
            </form>
        </div>
    );
};

export default RegisterPage;