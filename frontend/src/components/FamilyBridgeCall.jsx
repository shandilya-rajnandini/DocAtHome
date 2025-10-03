// components/FamilyBridgeCall.jsx
import React, { useState, useEffect } from 'react';
import { startFamilyBridgeCall } from '../api';
import { getMyCareCircle } from '../api';
import toast from 'react-hot-toast';

const FamilyBridgeCall = ({ patientId, patientName, onCallStarted }) => {
  const [isStarting, setIsStarting] = useState(false);
  const [careCircle, setCareCircle] = useState(null);
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (patientId) {
      fetchCareCircle();
      getCurrentLocation();
    }
  }, [patientId]);

  const fetchCareCircle = async () => {
    try {
      const { data } = await getMyCareCircle();
      setCareCircle(data);
    } catch (error) {
      console.error('Error fetching care circle:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude]
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleStartCall = async () => {
    if (!location) {
      toast.error('Location access is required to start the call');
      return;
    }

    setIsStarting(true);
    try {
      const callData = {
        patientId,
        location,
        address: address || 'Patient\'s location'
      };

      const { data } = await startFamilyBridgeCall(callData);

      toast.success('Family Bridge Call started! Family members have been notified.');

      if (onCallStarted) {
        onCallStarted(data.call);
      }
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start Family Bridge Call');
    } finally {
      setIsStarting(false);
    }
  };

  const familyMembers = careCircle?.members?.filter(
    member => member.role === 'Family' && member.status === 'Active'
  ) || [];

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">Family Bridge Call</h3>
          <p className="text-blue-100">Connect family remotely during home visits</p>
        </div>
        <div className="text-right">
          <div className="text-2xl mb-1">👨‍👩‍👧‍👦</div>
          <div className="text-sm text-blue-100">
            {familyMembers.length} family member{familyMembers.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {familyMembers.length > 0 ? (
        <div className="mb-4">
          <p className="text-sm text-blue-100 mb-2">Family members who will be notified:</p>
          <div className="flex flex-wrap gap-2">
            {familyMembers.map((member, index) => (
              <span
                key={index}
                className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm"
              >
                {member.user?.name || member.email}
              </span>
            ))}
          </div>
          {patientName && (
            <p className="text-sm text-blue-100 mt-2">
              Call will be initiated for: <strong>{patientName}</strong>
            </p>
          )}
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-500 bg-opacity-20 rounded-lg">
          <p className="text-sm text-yellow-100">
            ⚠️ No active family members in Care Circle. Add family members first to use Family Bridge Call.
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-blue-100 mb-1">
          Address (optional)
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter patient's address"
          className="w-full px-3 py-2 bg-white bg-opacity-20 border border-blue-300 rounded-md text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
        />
      </div>

      <button
        onClick={handleStartCall}
        disabled={isStarting || familyMembers.length === 0}
        className={`w-full py-3 px-6 rounded-lg font-bold transition-colors ${
          isStarting || familyMembers.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-white text-blue-600 hover:bg-gray-100'
        }`}
      >
        {isStarting ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
            Starting Call...
          </span>
        ) : (
          '🚀 Start Family Bridge Call'
        )}
      </button>

      <p className="text-xs text-blue-100 mt-2 text-center">
        This will notify all family members and allow them to join the video call remotely
      </p>
    </div>
  );
};

export default FamilyBridgeCall;