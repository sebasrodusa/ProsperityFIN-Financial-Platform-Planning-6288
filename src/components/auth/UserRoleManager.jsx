import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../ui/LoadingSpinner';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiUsers, FiShield, FiBriefcase, FiSave, FiAlertTriangle } = FiIcons;

// Team ID options
const TEAM_IDS = [
  { id: 'emd_rodriguez', name: 'EMD Rodriguez' },
  { id: 'md_garcia', name: 'MD Garcia' },
  { id: 'md_samaniego', name: 'MD Samaniego' }
];

const ROLES = [
  { id: 'admin', name: 'Administrator', icon: FiShield },
  { id: 'manager', name: 'Manager', icon: FiUsers },
  { id: 'financial_pro', name: 'Financial Professional', icon: FiBriefcase },
  { id: 'client', name: 'Client', icon: FiUser }
];

const UserRoleManager = ({ userId }) => {
  const { user: currentUser } = useUser();
  const { users } = useClerk();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    role: '',
    teamId: ''
  });

  // Check if current user is admin
  const isAdmin = currentUser?.publicMetadata?.role === 'admin';

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !isAdmin) return;
      
      setLoading(true);
      try {
        const userDetails = await users.getUser(userId);
        setUser(userDetails);
        
        // Set form data from user metadata
        setFormData({
          role: userDetails.publicMetadata?.role || 'client',
          teamId: userDetails.publicMetadata?.teamId || ''
        });
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId, users, isAdmin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setError('Only administrators can update user roles');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Update user metadata
      await users.updateUser(userId, {
        publicMetadata: {
          role: formData.role,
          ...(formData.teamId && { teamId: formData.teamId })
        }
      });
      
      setSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.message || 'Failed to update user role');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-danger-600" />
          <p className="text-danger-700">Only administrators can manage user roles</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-danger-600" />
          <p className="text-danger-700">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-soft border border-gray-100 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage User Role</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-danger-600" />
            <p className="text-danger-700">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg">
          <p className="text-success-700">User role updated successfully</p>
        </div>
      )}
      
      <div className="flex items-center space-x-4 mb-6">
        <img 
          src={user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=random`} 
          alt={user.firstName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-medium text-gray-900">{user.firstName} {user.lastName}</h3>
          <p className="text-gray-600">{user.emailAddresses[0]?.emailAddress}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            User Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="form-input"
            required
          >
            {ROLES.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        
        {(formData.role === 'manager' || formData.role === 'financial_pro') && (
          <div>
            <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-2">
              Team
            </label>
            <select
              id="teamId"
              name="teamId"
              value={formData.teamId}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Select a team</option>
              {TEAM_IDS.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <><LoadingSpinner size="sm" /><span>Saving...</span></>
            ) : (
              <>
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default UserRoleManager;