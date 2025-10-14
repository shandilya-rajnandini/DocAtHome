import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookDischargeConcierge } from '../api';
import { FaHospital, FaHome, FaHeartbeat, FaShieldAlt, FaClock, FaCheckCircle, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BookDischargeConciergePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospital: '',
    dischargeDate: '',
    medicationsOld: [{ name: '', dosage: '' }],
    medicationsNew: [{ name: '', dosage: '' }],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    specialInstructions: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [name]: value
      }
    }));
  };

  const handleMedicationChange = (type, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const addMedication = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { name: '', dosage: '' }]
    }));
  };

  const removeMedication = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty medications
      const filteredData = {
        ...formData,
        medicationsOld: formData.medicationsOld.filter(med => med.name.trim() || med.dosage.trim()),
        medicationsNew: formData.medicationsNew.filter(med => med.name.trim() || med.dosage.trim()),
        patientId: user._id
      };

      const response = await bookDischargeConcierge(filteredData);

      toast.success(response.data.message || 'Discharge Concierge booking submitted successfully! Our team will contact you within 1 hour.');
      navigate('/my-appointments');
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit booking. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const serviceFeatures = [
    {
      icon: <FaHospital className="text-2xl text-accent-blue" />,
      title: "Hospital Coordination",
      description: "Seamless pickup from hospital discharge area"
    },
    {
      icon: <FaHeartbeat className="text-2xl text-accent-blue" />,
      title: "Medication Review",
      description: "Expert reconciliation of new and existing medications"
    },
    {
      icon: <FaHome className="text-2xl text-accent-blue" />,
      title: "Home Safety Check",
      description: "Comprehensive assessment of home environment"
    },
    {
      icon: <FaShieldAlt className="text-2xl text-accent-blue" />,
      title: "Vital Monitoring",
      description: "First post-discharge health assessment"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white dark:from-primary-dark dark:to-secondary-dark py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Book <span className="text-accent-blue">Discharge Concierge</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ensure a safe and smooth transition home with our expert post-discharge care service.
          </p>
        </div>

        {/* Service Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {serviceFeatures.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-secondary-dark p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex justify-center mb-3">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Booking Form */}
        <div className="bg-white dark:bg-secondary-dark rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hospital Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaHospital className="mr-2 text-accent-blue" />
                Hospital Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    id="hospital"
                    name="hospital"
                    required
                    value={formData.hospital}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                    placeholder="Enter hospital name"
                  />
                </div>
                <div>
                  <label htmlFor="dischargeDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discharge Date *
                  </label>
                  <input
                    type="date"
                    id="dischargeDate"
                    name="dischargeDate"
                    required
                    value={formData.dischargeDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Medications */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaHeartbeat className="mr-2 text-accent-blue" />
                Medication Information
              </h2>

              {/* Existing Medications */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Current Medications</h3>
                {formData.medicationsOld.map((med, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Medication name"
                      value={med.name}
                      onChange={(e) => handleMedicationChange('medicationsOld', index, 'name', e.target.value)}
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange('medicationsOld', index, 'dosage', e.target.value)}
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                    />
                    {formData.medicationsOld.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication('medicationsOld', index)}
                        className="p-3 text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addMedication('medicationsOld')}
                  className="flex items-center text-accent-blue hover:text-accent-blue-hover mt-2"
                >
                  <FaPlus className="mr-1" /> Add Medication
                </button>
              </div>

              {/* New Medications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">New Medications from Hospital</h3>
                {formData.medicationsNew.map((med, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Medication name"
                      value={med.name}
                      onChange={(e) => handleMedicationChange('medicationsNew', index, 'name', e.target.value)}
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange('medicationsNew', index, 'dosage', e.target.value)}
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                    />
                    {formData.medicationsNew.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication('medicationsNew', index)}
                        className="p-3 text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addMedication('medicationsNew')}
                  className="flex items-center text-accent-blue hover:text-accent-blue-hover mt-2"
                >
                  <FaPlus className="mr-1" /> Add Medication
                </button>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaShieldAlt className="mr-2 text-accent-blue" />
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    id="emergencyName"
                    name="name"
                    required
                    value={formData.emergencyContact.name}
                    onChange={handleEmergencyContactChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Relationship *
                  </label>
                  <select
                    id="relationship"
                    name="relationship"
                    required
                    value={formData.emergencyContact.relationship}
                    onChange={handleEmergencyContactChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    name="phone"
                    required
                    value={formData.emergencyContact.phone}
                    onChange={handleEmergencyContactChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaClock className="mr-2 text-accent-blue" />
                Special Instructions
              </h2>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                placeholder="Any special requirements, mobility issues, or additional information our nurse should know..."
              />
            </div>

            {/* Pricing and Submit */}
            <div className="bg-amber-50 dark:bg-primary-dark p-6 rounded-lg border border-amber-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Service Fee</span>
                <span className="text-2xl font-bold text-accent-blue">$299</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Includes: Hospital pickup, medication reconciliation, home safety assessment, 72-hour support hotline
              </div>
              <div className="flex items-center text-green-600 dark:text-green-400 mb-4">
                <FaCheckCircle className="mr-2" />
                <span className="text-sm">Payment due upon service completion</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-blue hover:bg-accent-blue-hover disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2"
            >
              {loading ? 'Submitting...' : 'Book Discharge Concierge - $299'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookDischargeConciergePage;