// components/CallNotification.jsx
import React, { useState, useEffect } from 'react';

const CallNotification = ({ call, onJoin, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to respond

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onDismiss();
    }
  }, [timeLeft, onDismiss]);

  const handleJoin = () => {
    onJoin(call.callId);
  };

  return (
    <div className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg">📹 Family Bridge Call</h3>
          <p className="text-blue-100 text-sm mb-2">
            {call.professional?.name} has started a call with {call.patient?.name}
          </p>
          <p className="text-xs text-blue-200">
            You can join to see and participate remotely
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-blue-200 hover:text-white ml-2"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={handleJoin}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          Join Call
        </button>
        <span className="text-xs text-blue-200">
          Auto-dismiss in {timeLeft}s
        </span>
      </div>
    </div>
  );
};

export default CallNotification;