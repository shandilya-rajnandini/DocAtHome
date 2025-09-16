import React, { useState, useEffect } from 'react';
import { getSupportGroups, getMySupportGroups, joinSupportGroup, leaveSupportGroup } from '../api';
import { FaUsers, FaHeart, FaComment, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SupportCommunity = () => {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');

  useEffect(() => {
    loadGroups();
    loadMyGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await getSupportGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Error loading support groups:', error);
      toast.error('Failed to load support groups');
    }
  };

  const loadMyGroups = async () => {
    try {
      const response = await getMySupportGroups();
      setMyGroups(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading my groups:', error);
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await joinSupportGroup(groupId);
      toast.success('Successfully joined the support group!');
      loadMyGroups();
      loadGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join the group');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await leaveSupportGroup(groupId);
      toast.success('Successfully left the support group');
      loadMyGroups();
      loadGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave the group');
    }
  };

  const isJoined = (groupId) => {
    return myGroups.some(group => group._id === groupId);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Community</h1>
          <p className="text-gray-600">
            Connect anonymously with others facing similar health challenges. All conversations are moderated by healthcare professionals.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'browse'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Browse Groups
              </button>
              <button
                onClick={() => setActiveTab('my-groups')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-groups'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Groups ({myGroups.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div key={group._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{group.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <FaUsers className="mr-1" />
                    {group.memberCount || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaHeart className="mr-1 text-red-500" />
                    {group.category}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaComment className="mr-1" />
                    {group.messageCount || 0} messages
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    group.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {group.isActive ? 'Active' : 'Inactive'}
                  </span>

                  {isJoined(group._id) ? (
                    <button
                      onClick={() => handleLeaveGroup(group._id)}
                      className="flex items-center px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Leave Group
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(group._id)}
                      className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus className="mr-2" />
                      Join Group
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'my-groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No groups joined yet</h3>
                <p className="text-gray-500 mb-4">Join a support group to connect with others and share your experiences.</p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="inline-flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Groups
                </button>
              </div>
            ) : (
              myGroups.map((group) => (
                <div key={group._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{group.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <FaUsers className="mr-1" />
                      {group.memberCount || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaHeart className="mr-1 text-red-500" />
                      {group.category}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaComment className="mr-1" />
                      {group.messageCount || 0} messages
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                    <button
                      onClick={() => handleLeaveGroup(group._id)}
                      className="flex items-center px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Leave Group
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportCommunity;