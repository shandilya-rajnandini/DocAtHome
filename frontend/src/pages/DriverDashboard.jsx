import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { updateDriverStatus, respondToAmbulanceRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import RequestNotification from '../components/ambulance/RequestNotification';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user || user.role !== 'ambulance') return;

    // Create socket connection
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    socketRef.current = io(API_URL, {
      auth: { token }
    });

    // Socket event listeners
    socketRef.current.on('connect', () => {
      console.log('Socket connected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    socketRef.current.on('new_ambulance_request', (request) => {
      console.log('New ambulance request:', request);
      // Play a notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(err => console.error('Error playing notification:', err));
      
      setIncomingRequest(request);
    });

    socketRef.current.on('request_taken', ({ requestId }) => {
      // Remove from incoming if it's the current one
      setIncomingRequest(prev => 
        prev && prev.requestId === requestId ? null : prev
      );
    });

    // Clean up socket connection
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  // Toggle online status
  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      await updateDriverStatus({ isOnline: newStatus });
      
      // Update socket status
      if (socketRef.current) {
        socketRef.current.emit('update_status', { isOnline: newStatus });
      }
      
      setIsOnline(newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Handle accept/decline request
  const handleRequestResponse = async (requestId, action) => {
    setLoading(true);
    try {
      if (action === 'accept') {
        const response = await respondToAmbulanceRequest(requestId, { action: 'accept' });
        setActiveRequests(prev => [...prev, response.data.data]);
      } else {
        await respondToAmbulanceRequest(requestId, { action: 'decline' });
      }
      
      // Clear incoming request
      setIncomingRequest(null);
    } catch (error) {
      console.error('Failed to respond to request:', error);
      // Show error toast or notification here
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'ambulance') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="mt-2">Only ambulance drivers can access this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Ambulance Driver Dashboard</h1>
            <div className="flex items-center">
              <span className={`h-3 w-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>{isOnline ? 'Online' : 'Offline'}</span>
              <button
                onClick={toggleOnlineStatus}
                className={`ml-4 px-4 py-2 rounded-md ${
                  isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-100 p-4 rounded-md">
              <h3 className="font-bold">City</h3>
              <p>{user.city || 'Not set'}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-md">
              <h3 className="font-bold">License</h3>
              <p>{user.licenseNumber || 'Not set'}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-md">
              <h3 className="font-bold">Active Trips</h3>
              <p>{activeRequests.length}</p>
            </div>
          </div>
        </div>
        
        {/* Active requests */}
        {activeRequests.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Active Requests</h2>
            <div className="space-y-4">
              {activeRequests.map(request => (
                <div key={request._id} className="border border-gray-200 p-4 rounded-md">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold">{request.patientName}</p>
                      <p className="text-sm text-gray-600">{request.pickupLocation?.address}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        {request.emergencyType}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Instructions when online but no active requests */}
        {isOnline && activeRequests.length === 0 && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-8 text-center">
            <div className="text-5xl mb-4">🚑</div>
            <h2 className="text-xl font-bold mb-2">You're Online!</h2>
            <p className="text-gray-600">
              You'll be notified when there's an ambulance request in your city.
            </p>
          </div>
        )}
        
        {/* Instructions when offline */}
        {!isOnline && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-8 text-center">
            <div className="text-5xl mb-4">😴</div>
            <h2 className="text-xl font-bold mb-2">You're Offline</h2>
            <p className="text-gray-600">
              Go online to receive ambulance requests in your city.
            </p>
          </div>
        )}
      </div>
      
      {/* Incoming request notification */}
      {incomingRequest && (
        <RequestNotification
          request={incomingRequest}
          onAccept={() => handleRequestResponse(incomingRequest.requestId, 'accept')}
          onDecline={() => handleRequestResponse(incomingRequest.requestId, 'decline')}
          loading={loading}
        />
      )}
    </div>
  );
};

export default DriverDashboard;
