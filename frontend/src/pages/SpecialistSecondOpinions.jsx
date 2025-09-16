import React, { useState, useEffect, useCallback } from 'react';
import { FaFileMedical, FaClock, FaUserMd, FaCheckCircle, FaEye, FaDownload, FaPlayCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SpecialistSecondOpinions = () => {
  const [availableCases, setAvailableCases] = useState([]);
  const [myCases, setMyCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCaseModal, setShowCaseModal] = useState(false);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);

      if (activeTab === 'available') {
        const response = await fetch('/api/second-opinions/available', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch available cases');

        const data = await response.json();
        setAvailableCases(data.data);
      } else {
        // Fetch assigned cases - this would need a new API endpoint
        // For now, we'll show a placeholder
        setMyCases([]);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCases();
  }, [activeTab, fetchCases]);

  const handleAcceptCase = async (caseId) => {
    try {
      const response = await fetch(`/api/second-opinions/${caseId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to accept case');

      toast.success('Case accepted successfully!');
      fetchCases(); // Refresh the list
    } catch (error) {
      console.error('Error accepting case:', error);
      toast.error('Failed to accept case');
    }
  };

  const handleViewCase = async (caseData) => {
    try {
      // Fetch case files
      const filesResponse = await fetch(`/api/second-opinions/${caseData._id}/files`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        caseData.files = filesData.data;
      }

      setSelectedCase(caseData);
      setShowCaseModal(true);
    } catch (error) {
      console.error('Error fetching case files:', error);
      setSelectedCase(caseData);
      setShowCaseModal(true);
    }
  };

  const formatDeadline = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffHours = Math.floor((deadlineDate - now) / (1000 * 60 * 60));

    if (diffHours < 0) {
      return 'Overdue';
    } else if (diffHours < 24) {
      return `${diffHours} hours remaining`;
    } else {
      return `${Math.floor(diffHours / 24)} days remaining`;
    }
  };

  const getUrgencyColor = (urgencyLevel) => {
    switch (urgencyLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'routine': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Second Opinion Cases</h1>
          <p className="text-gray-600">
            Review patient cases and provide expert second opinions within the specified timeframe.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('available')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Cases ({availableCases.length})
              </button>
              <button
                onClick={() => setActiveTab('my-cases')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-cases'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Cases ({myCases.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Cases Grid */}
        {activeTab === 'available' && (
          <>
            {availableCases.length === 0 ? (
              <div className="text-center py-12">
                <FaFileMedical className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No available cases</h3>
                <p className="text-gray-500">
                  There are currently no second opinion cases matching your specialty.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCases.map((caseData) => (
                  <div key={caseData._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                          {caseData.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                          {caseData.description}
                        </p>
                      </div>
                      <div className={`px-2 py-1 text-xs rounded-full border ${getUrgencyColor(caseData.urgencyLevel)}`}>
                        {caseData.urgencyLevel}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaUserMd className="h-4 w-4 mr-2" />
                        <span className="capitalize">{caseData.specialty.replace('-', ' ')}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <FaClock className="h-4 w-4 mr-2" />
                        <span>{formatDeadline(caseData.deadline)}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <span>Patient: {caseData.patientId?.name || 'Anonymous'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-blue-600">
                        ₹{caseData.price}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewCase(caseData)}
                          className="inline-flex items-center px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <FaEye className="mr-1" />
                          View
                        </button>

                        <button
                          onClick={() => handleAcceptCase(caseData._id)}
                          className="inline-flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <FaCheckCircle className="mr-1" />
                          Accept
                        </button>
                      </div>
                    </div>

                    {caseData.currentDiagnosis && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-md">
                        <p className="text-xs text-gray-600">
                          <strong>Current Diagnosis:</strong> {caseData.currentDiagnosis}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'my-cases' && (
          <div className="text-center py-12">
            <FaFileMedical className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">My Assigned Cases</h3>
            <p className="text-gray-500">
              Cases you've accepted will appear here for review and response.
            </p>
          </div>
        )}

        {/* Case Detail Modal */}
        {showCaseModal && selectedCase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCase.title}</h2>
                  <button
                    onClick={() => setShowCaseModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Case Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Specialty:</strong> {selectedCase.specialty.replace('-', ' ')}</p>
                      <p><strong>Urgency:</strong> {selectedCase.urgencyLevel}</p>
                      <p><strong>Deadline:</strong> {formatDeadline(selectedCase.deadline)}</p>
                      <p><strong>Price:</strong> ₹{selectedCase.price}</p>
                      {selectedCase.currentDiagnosis && (
                        <p><strong>Current Diagnosis:</strong> {selectedCase.currentDiagnosis}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedCase.patientId?.name || 'Anonymous'}</p>
                      <p><strong>Response Type:</strong> {selectedCase.responseType}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700">{selectedCase.description}</p>
                </div>

                {selectedCase.medicalHistory && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical History</h3>
                    <p className="text-gray-700">{selectedCase.medicalHistory}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Files</h3>
                  {selectedCase.files && selectedCase.files.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCase.files.map((file) => (
                        <div key={file._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <FaFileMedical className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                              <p className="text-xs text-gray-500">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {file.category}
                              </p>
                            </div>
                          </div>
                          <button className="inline-flex items-center px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                            <FaDownload className="mr-1" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No files uploaded yet.</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCaseModal(false)}
                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleAcceptCase(selectedCase._id)}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Accept Case
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialistSecondOpinions;