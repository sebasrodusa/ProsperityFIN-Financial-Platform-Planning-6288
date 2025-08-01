import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../contexts/DataContext';
import { uploadFile } from '../services/publitio';
import { getProfileImageUrl } from '../utils/profileImage';
import { DEFAULT_AVATAR_URL } from '../utils/constants';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiSearch, FiEdit, FiTrash2, FiMail, FiCalendar, FiUser, FiUpload } = FiIcons;

// Team ID options
const TEAM_IDS = [
  { id: 'emd_rodriguez', name: 'EMD Rodriguez' },
  { id: 'md_garcia', name: 'MD Garcia' },
  { id: 'md_samaniego', name: 'MD Samaniego' }
];

const UserManagement = () => {
  const { user } = useAuth();
  const { users, addUser, updateUser, deleteUser, addDocument } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    teamId: '',
    agentCode: '',
    avatar: '',
    profileImageId: '',
    profileImageUrl: '',
    status: 'active'
  });
  const [imagePreview, setImagePreview] = useState(null);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.agentCode || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (user?.role === 'manager') {
      return matchesSearch && (u.teamId === user.teamId || u.role === 'client');
    }
    return matchesSearch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate a default agent code if needed for non-client roles
    let agentCode = formData.agentCode;
    if (formData.role !== 'client' && !agentCode) {
      const prefix = formData.role === 'admin' ? 'ADM' : 
                    formData.role === 'manager' ? 'MGR' : 'FP';
      agentCode = `${prefix}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      team_id: formData.teamId,
      agent_code: agentCode,
      status: formData.status
    };

    if (formData.profileImageId || formData.profileImageUrl) {
      userData.profileImageId = formData.profileImageId;
      userData.profileImageUrl = formData.profileImageUrl;
      userData.avatar = null;
    } else {
      userData.avatar = formData.avatar || DEFAULT_AVATAR_URL;
    }

    if (selectedUser) {
      updateUser(selectedUser.id, userData);
      setIsEditModalOpen(false);
    } else {
      addUser(userData);
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      teamId: '',
      agentCode: '',
      avatar: '',
      profileImageId: '',
      profileImageUrl: '',
      status: 'active'
    });
    setImagePreview(null);
    setSelectedUser(null);
  };

  const handleEdit = (userToEdit) => {
    setSelectedUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role,
      teamId: userToEdit.teamId || '',
      agentCode: userToEdit.agentCode || '',
      avatar: userToEdit.avatar,
      profileImageId: userToEdit.profileImageId || '',
      profileImageUrl: userToEdit.profileImageUrl || '',
      status: userToEdit.status || 'active'
    });
    setImagePreview(userToEdit.profileImageUrl || userToEdit.avatar);
    setIsEditModalOpen(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'advisor': return 'Advisor';
      case 'client': return 'Client';
      default: return role;
    }
  };

  const canEditUser = (userToEdit) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'manager') {
      return userToEdit.teamId === user.teamId || userToEdit.role === 'client';
    }
    return false;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const upload = await uploadFile(file, 'avatars');
      setImagePreview(upload.url);
      setFormData(prev => ({
        ...prev,
        profileImageId: upload.public_id,
        profileImageUrl: upload.url,
        avatar: ''
      }));
      await addDocument({ name: file.name, clientId: null, publitioId: upload.public_id, url: upload.url });
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage system users and their access permissions</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
              <span>Add User</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="table-container"
        >
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Agent Code</th>
                <th>Team</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((userItem) => (
                <tr key={userItem.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <img
                        src={getProfileImageUrl(userItem)}
                        alt={userItem.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{userItem.name}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiMail} className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{userItem.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                      {getRoleDisplayName(userItem.role)}
                    </span>
                  </td>
                  <td>
                    {userItem.agentCode && (
                      <span className="text-gray-600">{userItem.agentCode}</span>
                    )}
                  </td>
                  <td>
                    {userItem.teamId && (
                      <span className="px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full text-xs font-medium">
                        {TEAM_IDS.find(team => team.id === userItem.teamId)?.name || userItem.teamId}
                      </span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={userItem.status} />
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiCalendar} className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{userItem.createdAt}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      {canEditUser(userItem) && (
                        <button
                          onClick={() => handleEdit(userItem)}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <SafeIcon icon={FiEdit} className="w-4 h-4" />
                        </button>
                      )}
                      {canEditUser(userItem) && userItem.id !== user.id && (
                        <button
                          onClick={() => handleDelete(userItem.id)}
                          className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Add/Edit User Modal */}
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            resetForm();
          }}
          title={selectedUser ? 'Edit User' : 'Add New User'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <img
                  src={imagePreview || getProfileImageUrl(formData)}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                  <SafeIcon icon={FiUpload} className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500">Click the upload button to change profile picture</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-input"
              >
                <option value="">Select role</option>
                {user?.role === 'admin' && (
                  <>
                    <option value="admin">Administrator</option>
                    <option value="manager">Manager</option>
                  </>
                )}
                <option value="advisor">Advisor</option>
                <option value="client">Client</option>
              </select>
            </div>

            {/* Agent Code - Only for admin, manager, and financial professional */}
            {formData.role && formData.role !== 'client' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Code
                </label>
                <input
                  type="text"
                  value={formData.agentCode}
                  onChange={(e) => setFormData({ ...formData, agentCode: e.target.value })}
                  className="form-input"
                  placeholder="Enter agent code (optional - will be auto-generated if empty)"
                />
              </div>
            )}

            {/* Team Selection - Only for admin, manager, and financial professional */}
            {formData.role && formData.role !== 'client' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team *
                </label>
                <select
                  required
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  className="form-input"
                >
                  <option value="">Select team</option>
                  {TEAM_IDS.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {selectedUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default UserManagement;