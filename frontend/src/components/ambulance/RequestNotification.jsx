import React from 'react';
import PropTypes from 'prop-types';

const RequestNotification = ({ request, onAccept, onDecline, loading }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 animate-bounce-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-600">Emergency Ambulance Request</h2>
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
            {request.emergencyType || 'General'}
          </div>
        </div>
        
        <div className="border-t border-b border-gray-200 py-4 my-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Patient</h3>
              <p className="font-bold">{request.patientName}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="font-bold">{request.address}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Request Time</h3>
              <p className="font-bold">
                {new Date(request.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={onAccept}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Accepting...' : 'Accept'}
          </button>
          
          <button
            onClick={onDecline}
            disabled={loading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Decline
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-red-500">
            This request will expire in 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

RequestNotification.propTypes = {
  request: PropTypes.shape({
    requestId: PropTypes.string.isRequired,
    patientName: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    emergencyType: PropTypes.string,
    timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]).isRequired
  }).isRequired,
  onAccept: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

RequestNotification.defaultProps = {
  loading: false
};

export default RequestNotification;
