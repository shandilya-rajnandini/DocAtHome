import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi, getMe } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// --- Predefined Options for Dropdowns ---
const doctorSpecialties = [
  "Cardiologist",
  "Dermatologist",
  "Gynecologist",
  "Dentist",
  "Pediatrician",
  "General Physician",
];
const nurseCategories = [
  "Elder Care",
  "Child Care",
  "Post-Operative Care",
  "General Nursing (GNM)",
  "Auxiliary Nursing (ANM)",
];
const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Pune",
  "Patna",
  "Kolkata",
  "Chennai",
];
const experienceLevels = Array.from({ length: 30 }, (_, i) => i + 1); // Creates an array [1, 2, ..., 30]

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // Added for password confirmation
    role: "patient",
    specialty: "",
    city: "",
    experience: "",
    licenseNumber: "",
    govId: "",
    certificationId: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const { role, password, confirmPassword } = formData;
  const isProfessional = role === "doctor" || role === "nurse";

  //Password strength checking by regex
  const weakRegex = /^[a-zA-Z0-9]+$/; // only letters and numbers
  const mediumRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // letters + numbers
  const strongRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  //VAlidation of password and email is done here
  const validateField = (name, value, allFormData = formData) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required.";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format.";
        break;
      case "password":
        if (strongRegex.test(value)) {
          return ""; // no error
        } else if (mediumRegex.test(value)) {
          return "Password is okay, but consider adding uppercase, symbols for better security.";
        } else if (weakRegex.test(value)) {
          return "Password is weak. Use a mix of uppercase, numbers, and special characters.";
        }

        return "Password is very weak. Try mixing uppercase, lowercase, numbers, and symbols.";

      case "confirmPassword":
        if (value.length < 8) return "Password must be at least 8 characters.";
        if (allFormData.password !== value) return "Passwords do not match.";
        break;
      default:
        break;
    }
    return "";
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    // If the password is changed, re-validate confirmPassword
    if (name === "password") {
      const confirmPasswordError = validateField(
        "confirmPassword",
        confirmPassword
      );
      setErrors((prev) => ({ ...prev, confirmPassword: confirmPasswordError }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Final validation check before submission
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

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
      if (role === "technician") {
        payload.certificationId = formData.certificationId;
      }

      const { data } = await registerApi(payload);
      localStorage.setItem("token", data.token);

      const { data: userData } = await getMe();
      login(userData);

      toast.success("Registration successful!");

      // Redirect based on role
      if (userData.role === "patient") {
        navigate("/dashboard"); // <-- Redirect patients to the dashboard
      } else {
        // Professionals will see a "pending approval" message when they try to log in,
        // so we can just redirect them to the homepage for now.
        toast.success("Your account is pending admin approval.");
        navigate("/");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Registration failed. Please try again."
      );
    }
  };
  const getRequiredFields = (role) => {
    if (role === "technician") {
      return ["name", "email", "password", "certificationId"];
    } else if (role === "doctor" || role === "nurse") {
      return [
        "name",
        "email",
        "password",
        "specialty",
        "city",
        "experience",
        "licenseNumber",
        "govId",
      ];
    } else if (role === "ambulance") {
      return [
        "name",
        "email",
        "password",
        "driverLicenseNumber",
        "vehicleRegistrationNumber",
      ];
    } else {
      return ["name", "email", "password"];
    }
  };

  const requiredFields = getRequiredFields(formData.role);

  const isFormInvalid =
    Object.values(errors).some((err) => err) ||
    requiredFields.some((field) => !formData[field]);

  return (
    <div className="flex justify-center items-center mt-10 mb-20">
      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-secondary-dark p-8 rounded-lg shadow-lg w-full max-w-2xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">
          Create Your Account
        </h2>

        {/* --- Core Fields --- */}
        <div className="mb-4">
          <label className="block text-slate-700 dark:text-secondary-text mb-2">
            I am a...
          </label>
          <select
            name="role"
            value={role}
            onChange={onChange}
            className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded text-black dark:text-white border-gray-700"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="technician">Lab Technician</option> {/* Added */}
            <option value="ambulance">Ambulance Driver</option> {/* Added */}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-slate-700 dark:text-secondary-text mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
              className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border  border-gray-700 text-black dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-slate-700 dark:text-secondary-text mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              required
              className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border border-gray-700 text-black dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-slate-700 dark:text-secondary-text mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              required
              minLength="8"
              className={`w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border text-black dark:text-white  ${
                errors.password ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <label className="block text-slate-700 dark:text-secondary-text mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={onChange}
              required
              minLength="8"
              className={`w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border text-black dark:text-white ${
                errors.confirmPassword ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* --- Professional Fields (Conditional) --- */}
        {isProfessional && (
          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-xl font-semibold text-accent-blue mb-4">
              Professional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Specialty Dropdown */}
              <div className="mb-4">
                <label className="block text-slate-700 dark:text-secondary-text mb-2">
                  {role === "doctor" ? "Specialty" : "Nurse Category"}
                </label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={onChange}
                  required
                  className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700"
                >
                  <option value="">Select an option</option>
                  {(role === "doctor"
                    ? doctorSpecialties
                    : nurseCategories
                  ).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Dropdown */}
              <div className="mb-4">
                <label className="block text-slate-700 dark:text-secondary-text mb-2">
                  City
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={onChange}
                  required
                  className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700"
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Dropdown */}
              <div className="mb-4">
                <label className="block text-slate-700 dark:text-secondary-text mb-2">
                  Experience (Years)
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={onChange}
                  required
                  className="w-full p-3 bg-gray-200 dark:bg-primary-dark text-black dark:text-white rounded border-gray-700 "
                >
                  <option value="">Select Years</option>
                  {experienceLevels.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>

              {/* License Number Input */}
              <div className="mb-4">
                <label className="block text-slate-700 dark:text-secondary-text mb-2">
                  Medical License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={onChange}
                  required
                  className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border-gray-700 text-black dark:text-white"
                />
              </div>

              {/* Government ID Input */}
              <div className="mb-4 md:col-span-2">
                <label className="block text-slate-700 dark:text-secondary-text mb-2">
                  Aadhaar / Voter ID / Government ID Number
                </label>
                <input
                  type="text"
                  name="govId"
                  value={formData.govId}
                  onChange={onChange}
                  required
                  className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border-gray-700 text-black dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
        {role === "technician" && (
          <div className="mb-4">
            <label className="block text-slate-700 dark:text-secondary-text mb-2">
              Certification ID
            </label>
            <input
              type="text"
              name="certificationId"
              value={formData.certificationId || ""}
              onChange={onChange}
              required
              className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border-gray-700 text-black dark:text-white"
            />
          </div>
        )}
        {role === "ambulance" && (
          <>
            <div className="mb-4">
              <label className="block text-slate-700 dark:text-secondary-text mb-2">
                Driver's License No.
              </label>
              <input
                type="text"
                name="driverLicenseNumber"
                value={formData.driverLicenseNumber || ""}
                onChange={onChange}
                required
                className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border-gray-700 text-black dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-slate-700 dark:text-secondary-text mb-2">
                Vehicle Registration No.
              </label>
              <input
                type="text"
                name="vehicleRegistrationNumber"
                value={formData.vehicleRegistrationNumber || ""}
                onChange={onChange}
                required
                className="w-full p-3 bg-gray-200 dark:bg-primary-dark rounded border-gray-700 text-black dark:text-white"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isFormInvalid}
          className={`p-3 w-full rounded ${
            isFormInvalid
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white"
          }`}
        >
          Register
        </button>

        <p className="text-center mt-4 text-secondary-text">
          Already have an account?{" "}
          <Link to="/login" className="text-accent-blue hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
