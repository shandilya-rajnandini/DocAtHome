import React, { useState, useEffect } from 'react';
import {
  getAllSupportGroups,
  createSupportGroup,
  updateSupportGroup,
  deleteSupportGroup,
  getGroupMembers,
  removeGroupMember,
  getFlaggedMessages,
  moderateMessage
} from '../api';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaFlag, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Modal from './Modal';

const NurseModerationDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('groups');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isActive: true
  });

  useEffect(() => {
    loadGroups();
    loadFlaggedMessages();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await getAllSupportGroups();
      setGroups(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load support groups');
      setLoading(false);
    }
  };

  const loadFlaggedMessages = async () => {
    try {
      const response = await getFlaggedMessages();
      setFlaggedMessages(response.data);
    } catch (error) {
      console.error('Error loading flagged messages:', error);
    }
  };

  const loadGroupMembers = async (groupId) => {
    try {
      const response = await getGroupMembers(groupId);
      setGroupMembers(response.data);
    } catch (error) {
      console.error('Error loading group members:', error);
      toast.error('Failed to load group members');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await createSupportGroup(formData);
      toast.success('Support group created successfully!');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', category: '', isActive: true });
      loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create support group');
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    try {
      await updateSupportGroup(selectedGroup._id, formData);
      toast.success('Support group updated successfully!');
      setShowEditModal(false);
      setSelectedGroup(null);
      setFormData({ name: '', description: '', category: '', isActive: true });
      loadGroups();
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update support group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this support group? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteSupportGroup(groupId);
      toast.success('Support group deleted successfully!');
      loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete support group');
    }
  };

  const handleRemoveMember = async (groupId, memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the group?')) {
      return;
    }

    try {
      await removeGroupMember(groupId, memberId);
      toast.success('Member removed successfully!');
      loadGroupMembers(groupId);
      loadGroups();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleModerateMessage = async (messageId, action) => {
    try {
      await moderateMessage(messageId, action);
      toast.success(`Message ${action === 'approve' ? 'approved' : 'removed'} successfully!`);
      loadFlaggedMessages();
    } catch (error) {
      console.error('Error moderating message:', error);
      toast.error('Failed to moderate message');
    }
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      category: group.category,
      isActive: group.isActive
    });
    setShowEditModal(true);
  };

  const openMembersModal = (group) => {
    setSelectedGroup(group);
    loadGroupMembers(group._id);
    setShowMembersModal(true);
  };

  const categories = [
    'Chronic Pain',
    'Mental Health',
    'Diabetes',
    'Heart Disease',
    'Cancer',
    'Arthritis',
    'Respiratory Conditions',
    'Neurological Disorders',
    'Autoimmune Diseases',
    'General Health'
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nurse Moderation Dashboard</h1>
          <p className="text-gray-600">
            Manage support groups and moderate community content to ensure a safe environment.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('groups')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'groups'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Groups ({groups.length})
              </button>
              <button
                onClick={() => setActiveTab('moderation')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'moderation'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Content Moderation ({flaggedMessages.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Create Group Button */}
        {activeTab === 'groups' && (
          <div className="mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Create New Group
            </button>
          </div>
        )}

        {/* Groups Management */}
        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div key={group._id} className="bg-white rounded-lg shadow-md p-6">
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
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {group.category}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    group.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {group.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openMembersModal(group)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      title="View Members"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => openEditModal(group)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      title="Edit Group"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group._id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                      title="Delete Group"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Moderation */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            {flaggedMessages.length === 0 ? (
              <div className="text-center py-12">
                <FaFlag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flagged messages</h3>
                <p className="text-gray-500">All community content is currently appropriate.</p>
              </div>
            ) : (
              flaggedMessages.map((message) => (
                <div key={message._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {message.sender.displayName}
                        </span>
                        <span className="text-xs text-gray-500">
                          in {message.group.name}
                        </span>
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          Flagged
                        </span>
                      </div>
                      <p className="text-gray-700">{message.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleModerateMessage(message._id, 'approve')}
                      className="inline-flex items-center px-3 py-1 text-sm text-green-600 border border-green-600 rounded-md hover:bg-green-50 transition-colors"
                    >
                      <FaCheck className="mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerateMessage(message._id, 'remove')}
                      className="inline-flex items-center px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <FaTimes className="mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Group Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setFormData({ name: '', description: '', category: '', isActive: true });
          }}
          title="Create Support Group"
        >
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active (visible to patients)
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ name: '', description: '', category: '', isActive: true });
                }}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Group
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Group Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedGroup(null);
            setFormData({ name: '', description: '', category: '', isActive: true });
          }}
          title="Edit Support Group"
        >
          <form onSubmit={handleUpdateGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="editIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="editIsActive" className="ml-2 text-sm text-gray-700">
                Active (visible to patients)
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedGroup(null);
                  setFormData({ name: '', description: '', category: '', isActive: true });
                }}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Group
              </button>
            </div>
          </form>
        </Modal>

        {/* Group Members Modal */}
        <Modal
          isOpen={showMembersModal}
          onClose={() => {
            setShowMembersModal(false);
            setSelectedGroup(null);
            setGroupMembers([]);
          }}
          title={`Members of ${selectedGroup?.name}`}
        >
          <div className="space-y-4">
            {groupMembers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No members in this group yet.</p>
            ) : (
              groupMembers.map((member) => (
                <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900">{member.displayName}</p>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(selectedGroup._id, member._id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                    title="Remove member"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default NurseModerationDashboard;