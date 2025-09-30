import React, { useState } from 'react';
import { FaFileUpload, FaFileMedical, FaClock, FaUserMd, FaRupeeSign } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SecondOpinionRequest = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    medicalHistory: '',
    currentDiagnosis: '',
    urgencyLevel: 'routine',
    specialty: '',
    responseType: 'written'
  });

  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const specialties = [
    { value: 'cardiology', label: 'Cardiology', price: 2999 },
    { value: 'neurology', label: 'Neurology', price: 2999 },
    { value: 'oncology', label: 'Oncology', price: 3499 },
    { value: 'orthopedics', label: 'Orthopedics', price: 2499 },
    { value: 'dermatology', label: 'Dermatology', price: 1999 },
    { value: 'endocrinology', label: 'Endocrinology', price: 2499 },
    { value: 'gastroenterology', label: 'Gastroenterology', price: 2799 },
    { value: 'hematology', label: 'Hematology', price: 2999 },
    { value: 'nephrology', label: 'Nephrology', price: 2799 },
    { value: 'pulmonology', label: 'Pulmonology', price: 2499 },
    { value: 'rheumatology', label: 'Rheumatology', price: 2699 },
    { value: 'urology', label: 'Urology', price: 2499 },
    { value: 'gynecology', label: 'Gynecology', price: 2299 },
    { value: 'pediatrics', label: 'Pediatrics', price: 2199 },
    { value: 'psychiatry', label: 'Psychiatry', price: 2499 },
    { value: 'radiology', label: 'Radiology', price: 3199 },
    { value: 'pathology', label: 'Pathology', price: 2399 },
    { value: 'emergency-medicine', label: 'Emergency Medicine', price: 2999 },
    { value: 'internal-medicine', label: 'Internal Medicine', price: 2299 },
    { value: 'surgery', label: 'Surgery', price: 3499 }
  ];

  const urgencyLevels = [
    { value: 'routine', label: 'Routine (48 hours)', multiplier: 1 },
    { value: 'urgent', label: 'Urgent (24 hours)', multiplier: 1.5 },
    { value: 'critical', label: 'Critical (12 hours)', multiplier: 2 }
  ];

  const responseTypes = [
    { value: 'written', label: 'Written Report Only' },
    { value: 'video', label: 'Video Consultation' },
    { value: 'both', label: 'Both Written & Video' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 50 * 1024 * 1024; // 50MB

      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid file type. Please upload PDF, images, or documents.`);
        return false;
      }

      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum file size is 50MB.`);
        return false;
      }

      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const calculatePrice = () => {
    const specialty = specialties.find(s => s.value === formData.specialty);
    const urgency = urgencyLevels.find(u => u.value === formData.urgencyLevel);

    if (!specialty || !urgency) return 0;

    return Math.round(specialty.price * urgency.multiplier);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.specialty) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (files.length === 0) {
      toast.error('Please upload at least one medical report or document');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create second opinion request
      const response = await fetch('/api/second-opinions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          price: calculatePrice()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create second opinion request');
      }

      const result = await response.json();
      const secondOpinionId = result.data._id;

      // Upload files
      const failedUploads = [];
      for (const file of files) {
        try {
          const fileFormData = new FormData();
          fileFormData.append('file', file);
          fileFormData.append('category', 'medical-report');

          const uploadResponse = await fetch(`/api/second-opinions/${secondOpinionId}/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: fileFormData
          });

          if (!uploadResponse.ok) {
            console.error('Failed to upload file:', file.name);
            failedUploads.push(file.name);
          }
        } catch (error) {
          console.error('Network error uploading file:', file.name, error);
          failedUploads.push(file.name);
        }
      }

      // Show warning for failed uploads
      if (failedUploads.length > 0) {
        toast.warning(`Some files failed to upload: ${failedUploads.join(', ')}`);
      }

      toast.success('Second opinion request submitted successfully!');
      // Reset form
      setFormData({
        title: '',
        description: '',
        medicalHistory: '',
        currentDiagnosis: '',
        urgencyLevel: 'routine',
        specialty: '',
        responseType: 'written'
      });
      setFiles([]);

    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit second opinion request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Second Opinion</h1>
          <p className="text-gray-600">
            Get expert analysis from top specialists within 48 hours. Upload your medical reports and receive comprehensive written reports or video consultations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Second opinion for cardiac evaluation"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your symptoms, concerns, and what you're looking for in a second opinion..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Specialty *
                </label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Specialty</option>
                  {specialties.map(specialty => (
                    <option key={specialty.value} value={specialty.value}>
                      {specialty.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  name="urgencyLevel"
                  value={formData.urgencyLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {urgencyLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Type
                </label>
                <select
                  name="responseType"
                  value={formData.responseType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {responseTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Diagnosis (if known)
                </label>
                <input
                  type="text"
                  name="currentDiagnosis"
                  value={formData.currentDiagnosis}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Hypertension, Diabetes, etc."
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical History
              </label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Relevant medical history, allergies, medications, etc."
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Reports & Documents</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <FaFileUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="mb-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">Upload files</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  PDF, Images, Word documents up to 50MB each
                </p>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <FaFileMedical className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-medium">
                  ₹{specialties.find(s => s.value === formData.specialty)?.price || 0}
                </span>
              </div>

              {formData.urgencyLevel !== 'routine' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Urgency Multiplier:</span>
                  <span className="font-medium">
                    {urgencyLevels.find(u => u.value === formData.urgencyLevel)?.multiplier}x
                  </span>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Price:</span>
                  <span className="text-blue-600">₹{calculatePrice()}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <div className="flex items-center">
                <FaClock className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm text-blue-700">
                  Response within {formData.urgencyLevel === 'urgent' ? '24' : formData.urgencyLevel === 'critical' ? '12' : '48'} hours
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FaUserMd className="mr-2" />
                  Request Second Opinion - ₹{calculatePrice()}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecondOpinionRequest;