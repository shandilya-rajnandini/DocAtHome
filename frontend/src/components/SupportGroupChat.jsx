import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroupMessages, sendGroupMessage, getMyAnonymousProfile } from '../api';
import { FaArrowLeft, FaPaperPlane, FaUserCircle, FaFlag } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SupportGroupChat = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [anonymousProfile, setAnonymousProfile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadAnonymousProfile();
    loadMessages();
  }, [groupId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadAnonymousProfile = async () => {
    try {
      const response = await getMyAnonymousProfile();
      setAnonymousProfile(response.data);
    } catch (error) {
      console.error('Error loading anonymous profile:', error);
    }
  };

  const loadMessages = useCallback(async () => {
    try {
      const response = await getGroupMessages(groupId);
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
      setLoading(false);
    }
  }, [groupId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await sendGroupMessage(groupId, { content: newMessage.trim() });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/support-community')}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Support Group Chat</h1>
                <p className="text-sm text-gray-500">
                  {anonymousProfile ? `Posting as ${anonymousProfile.displayName}` : 'Anonymous'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {messages.length} messages
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6" style={{ height: 'calc(100vh - 200px)' }}>
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="text-center py-12">
              <FaUserCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-500">Be the first to share your thoughts and experiences.</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="text-center my-4">
                  <span className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                    {date}
                  </span>
                </div>
                {dateMessages.map((message) => (
                  <div key={message._id} className="mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <FaUserCircle className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {message.sender.displayName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.createdAt)}
                          </span>
                          {message.isModerated && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Moderated
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-700 bg-white rounded-lg px-3 py-2 shadow-sm">
                          {message.content}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Report message"
                        >
                          <FaFlag className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your thoughts and experiences..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
                maxLength="1000"
              />
              <div className="text-xs text-gray-500 mt-1">
                {newMessage.length}/1000 characters
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <FaPaperPlane className="mr-2" />
                  Send
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportGroupChat;