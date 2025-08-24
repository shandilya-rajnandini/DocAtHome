import React, { useState } from "react";
import { bookAmbulance } from "../../api";

import useAuthStore from "../store/useAuthStore";

// Phone number constant for consistency
const EMERGENCY_PHONE = "+919700001298";
const EMERGENCY_PHONE_DISPLAY = "+91 9700 001298";

// Updated steps for API-based booking
// Updated steps for API-based booking
const steps = [
  {
    icon: "📱",
    icon: "📱",
    title: "Step 1",
    text: "Fill out the form with patient and location details.",
    text: "Fill out the form with patient and location details.",
  },
  {
    icon: "📍",
    title: "Step 2",
    text: "Submit the request to find available ambulances.",
    text: "Submit the request to find available ambulances.",
  },
  {
    icon: "🚑",
    title: "Step 3",
    text: "An ambulance driver accepts your request.",
    text: "An ambulance driver accepts your request.",
  },
  {
    icon: "🏥",
    title: "Step 4",
    text: "Ambulance arrives at your location within minutes.",
    text: "Ambulance arrives at your location within minutes.",
  },
];

const BookingProcess = () => {
  const { user } = useAuthStore();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientName: user?.name || '',
    contactNumber: '',
    address: '',
    city: '',
    emergencyType: 'General',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Add mock coordinates (in real app, would use geolocation or maps API)
      const bookingWithCoordinates = {
        ...formData,
        coordinates: [72.8777, 19.0760] // Mumbai coordinates as example
      };
      
      const response = await bookAmbulance(bookingWithCoordinates);
      setBookingStatus(response.data);
      setIsBookingOpen(false);
      // Reset form
      setFormData({
        patientName: user?.name || '',
        contactNumber: '',
        address: '',
        city: '',
        emergencyType: 'General',
        notes: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to book ambulance');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-800 via-gray-900 to-slate-800 text-white">
      <div className="container mx-auto text-center max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-16">
          PROCESS TO BOOK <span className="text-red-500">AN AMBULANCE</span>
        </h2>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-center items-center gap-4 lg:gap-8">
          {steps.map((step, index) => {
            // Define common class names for maintainability
            const stepCircleClasses = [
              "relative w-28 h-28 rounded-full border-3 border-green-500",
              "flex items-center justify-center text-4xl mb-6",
              "bg-green-500/10 backdrop-blur-sm",
              "group-hover:border-green-400 group-hover:bg-green-500/20",
              "group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-green-500/20",
              "transition-all duration-300 ease-in-out",
            ].join(" ");

            return (
              <React.Fragment key={step.title}>
                <div className="flex flex-col items-center group">
                  {/* Step Icon Circle */}
                  <div className={stepCircleClasses}>
                    <span className="group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </span>

                    {/* Step Number Badge */}
                    <div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full 
                                  flex items-center justify-center text-white text-sm font-bold
                                  group-hover:bg-red-400 transition-colors duration-300"
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3
                    className="text-xl font-bold text-red-500 mb-3 
                               group-hover:text-red-400 transition-colors duration-300"
                  >
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p
                    className="text-gray-300 max-w-xs leading-relaxed text-sm
                               group-hover:text-gray-200 transition-colors duration-300"
                  >
                    {step.text}
                  </p>
                </div>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="flex flex-col items-center mx-2 lg:mx-4">
                    <div className="text-green-500 text-3xl lg:text-4xl animate-pulse">
                      →
                    </div>
                    <div className="w-12 lg:w-16 h-0.5 bg-gradient-to-r from-green-500 to-green-400 mt-2"></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="flex items-start gap-6">
                {/* Step Icon Circle */}
                <div
                  className="relative flex-shrink-0 w-20 h-20 rounded-full border-2 border-green-500 
                                flex items-center justify-center text-3xl
                                bg-green-500/10 backdrop-blur-sm"
                >
                  <span>{step.icon}</span>

                  {/* Step Number Badge */}
                  <div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full 
                                  flex items-center justify-center text-white text-xs font-bold"
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-red-500 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {step.text}
                  </p>
                </div>
              </div>

              {/* Vertical connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-10 top-20 w-0.5 h-8 bg-gradient-to-b from-green-500 to-green-400"></div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div
          className="mt-16 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10
                        hover:bg-white/10 hover:border-white/20 transition-all duration-300"
        >
          <h3 className="text-xl font-bold mb-3 text-green-400">
            Ready to Book?
          </h3>
          
          {bookingStatus ? (
            <div className="bg-green-900/30 p-4 rounded-lg text-left mb-4">
              <h4 className="font-bold text-green-400">Ambulance Request Sent!</h4>
              <p className="text-gray-200 mt-2">{bookingStatus.data.message}</p>
              <button 
                onClick={() => setBookingStatus(null)}
                className="mt-4 px-4 py-2 bg-green-600 rounded-md hover:bg-green-700"
              >
                Book Another
              </button>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 p-4 rounded-lg text-left mb-4">
              <h4 className="font-bold text-red-400">Booking Failed</h4>
              <p className="text-gray-200 mt-2">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-4 px-4 py-2 bg-red-600 rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : isBookingOpen ? (
            <form onSubmit={handleSubmit} className="text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 mb-1">Patient Name</label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">City</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  >
                    <option value="">Select a city</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Emergency Type</label>
                  <select
                    name="emergencyType"
                    value={formData.emergencyType}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  >
                    <option value="General">General</option>
                    <option value="Critical">Critical</option>
                    <option value="Non-Emergency">Non-Emergency</option>
                    <option value="Trauma">Trauma</option>
                    <option value="Cardiac">Cardiac</option>
                    <option value="Respiratory">Respiratory</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-1">Notes (optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                    rows="2"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg transition-all duration-300"
                >
                  {loading ? 'Processing...' : 'Book Ambulance Now'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-gray-300 mb-4">
                Emergency? Don't wait - book an ambulance immediately!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 
                          text-white font-bold py-3 px-6 rounded-lg 
                          transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <span className="text-xl">🚑</span>
                  Book Online
                </button>
                <a
                  href={`tel:${EMERGENCY_PHONE}`}
                  className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 
                          text-white font-bold py-3 px-6 rounded-lg 
                          transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <span className="text-xl">📞</span>
                  Call {EMERGENCY_PHONE_DISPLAY}
                </a>
              </div>
            </>
          )}
          
          {bookingStatus ? (
            <div className="bg-green-900/30 p-4 rounded-lg text-left mb-4">
              <h4 className="font-bold text-green-400">Ambulance Request Sent!</h4>
              <p className="text-gray-200 mt-2">{bookingStatus.data.message}</p>
              <button 
                onClick={() => setBookingStatus(null)}
                className="mt-4 px-4 py-2 bg-green-600 rounded-md hover:bg-green-700"
              >
                Book Another
              </button>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 p-4 rounded-lg text-left mb-4">
              <h4 className="font-bold text-red-400">Booking Failed</h4>
              <p className="text-gray-200 mt-2">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-4 px-4 py-2 bg-red-600 rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : isBookingOpen ? (
            <form onSubmit={handleSubmit} className="text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 mb-1">Patient Name</label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">City</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  >
                    <option value="">Select a city</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Emergency Type</label>
                  <select
                    name="emergencyType"
                    value={formData.emergencyType}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                  >
                    <option value="General">General</option>
                    <option value="Critical">Critical</option>
                    <option value="Non-Emergency">Non-Emergency</option>
                    <option value="Trauma">Trauma</option>
                    <option value="Cardiac">Cardiac</option>
                    <option value="Respiratory">Respiratory</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-1">Notes (optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                    rows="2"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg transition-all duration-300"
                >
                  {loading ? 'Processing...' : 'Book Ambulance Now'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-gray-300 mb-4">
                Emergency? Don't wait - book an ambulance immediately!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 
                          text-white font-bold py-3 px-6 rounded-lg 
                          transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <span className="text-xl">🚑</span>
                  Book Online
                </button>
                <a
                  href={`tel:${EMERGENCY_PHONE}`}
                  className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 
                          text-white font-bold py-3 px-6 rounded-lg 
                          transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <span className="text-xl">📞</span>
                  Call {EMERGENCY_PHONE_DISPLAY}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingProcess;