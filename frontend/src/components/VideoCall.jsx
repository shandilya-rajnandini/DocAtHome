// components/VideoCall.jsx
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { joinVideoCall, endVideoCall } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VideoCall = ({ callId, patientId, onCallEnd }) => {
  const { user } = useAuth();
  const [stream, setStream] = useState(null);
  const [call, setCall] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();

  useEffect(() => {
    initializeCall();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get user media
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setStream(mediaStream);

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = mediaStream;
      }

      // Join the call
      const { data } = await joinVideoCall(callId);
      setCall(data.call);
      setParticipants(data.call.participants);

      // Initialize WebRTC peer
      const peer = new Peer({
        initiator: data.call.professional.toString() === user.id, // Professional initiates
        trickle: false,
        stream: mediaStream
      });

      peerRef.current = peer;

      peer.on('signal', (signalData) => {
        // Send signaling data to server
        console.log('Signal data:', signalData);
      });

      peer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setIsConnected(true);
      });

      peer.on('connect', () => {
        setIsConnected(true);
        toast.success('Connected to call!');
      });

      peer.on('close', () => {
        setIsConnected(false);
        toast.info('Call ended');
        onCallEnd();
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        toast.error('Connection error');
      });

    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleEndCall = async () => {
    try {
      await endVideoCall(callId);
      cleanup();
      onCallEnd();
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-secondary-dark rounded-lg p-6 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            Family Bridge Call
          </h2>
          <button
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            End Call
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* My Video */}
          <div className="relative">
            <video
              ref={myVideoRef}
              autoPlay
              muted
              className="w-full h-64 bg-gray-800 rounded-lg object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              You ({isMuted ? 'Muted' : 'Unmuted'})
            </div>
          </div>

          {/* Remote Video */}
          <div className="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              className="w-full h-64 bg-gray-800 rounded-lg object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              {call?.professional?.name || 'Professional'}
            </div>
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                  <p>Connecting...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`px-4 py-2 rounded-lg font-medium ${
              isMuted
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {isMuted ? '🔇 Unmute' : '🎤 Mute'}
          </button>

          <button
            onClick={toggleVideo}
            className={`px-4 py-2 rounded-lg font-medium ${
              isVideoOff
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {isVideoOff ? '📹 Turn On Video' : '📷 Turn Off Video'}
          </button>
        </div>

        {/* Participants List */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
            Participants ({participants.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {participants.map((participant, index) => (
              <div
                key={index}
                className="bg-gray-100 dark:bg-primary-dark px-3 py-1 rounded-full text-sm"
              >
                {participant.user?.name || 'Unknown'} ({participant.role})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;