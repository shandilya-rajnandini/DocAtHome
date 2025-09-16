import React, { useState, useEffect } from 'react';
import { FaFileMedical, FaClock, FaUserMd, FaCheckCircle, FaHourglassHalf, FaPlayCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const MySecondOpinions = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyRequests();
  }, [filter]);

  const fetchMyRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const response = await fetch(`/api/second-opinions/my-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch requests');

      const data = await response.json();
      setRequests(data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load your second opinion requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in-review': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaHourglassHalf className="h-4 w-4" />;
      case 'assigned': return <FaUserMd className="h-4 w-4" />;
      case 'in-review': return <FaFileMedical className="h-4 w-4" />;
      case 'completed': return <FaCheckCircle className="h-4 w-4" />;
      default: return <FaClock className="h-4 w-4" />;
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

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Second Opinions</h1>
          <p className="text-gray-600">
            Track your second opinion requests and view specialist responses.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Requests' },
                { key: 'pending', label: 'Pending' },
                { key: 'assigned', label: 'Assigned' },
                { key: 'in-review', label: 'In Review' },
                { key: 'completed', label: 'Completed' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FaFileMedical className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No second opinion requests yet' : `No ${filter} requests`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all'
                ? 'Request your first second opinion to get expert analysis from top specialists.'
                : `You don't have any ${filter} requests at the moment.`
              }
            </p>
            {filter === 'all' && (
              <a
                href="/second-opinion-request"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Request Second Opinion
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {request.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {request.description}
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="capitalize">{request.status.replace('-', ' ')}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaUserMd className="h-4 w-4 mr-2" />
                    <span className="capitalize">{request.specialty.replace('-', ' ')}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="h-4 w-4 mr-2" />
                    <span>{formatDeadline(request.deadline)}</span>
                  </div>

                  {request.specialistId && (
                    <div className="flex items-center text-sm text-gray-500">
                      <FaUserMd className="h-4 w-4 mr-2" />
                      <span>Dr. {request.specialistId.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-blue-600">
                    ₹{request.price}
                  </div>

                  <div className="flex space-x-2">
                    {request.status === 'completed' && (
                      <button className="inline-flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors">
                        <FaPlayCircle className="mr-1" />
                        View Report
                      </button>
                    )}

                    {request.status === 'pending' && request.paymentStatus !== 'paid' && (
                      <button className="inline-flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>

                {request.currentDiagnosis && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600">
                      <strong>Current Diagnosis:</strong> {request.currentDiagnosis}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySecondOpinions;