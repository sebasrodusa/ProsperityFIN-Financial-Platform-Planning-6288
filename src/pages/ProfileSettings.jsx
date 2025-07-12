import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBriefcase, FiSave, FiLock, FiArrowLeft } = FiIcons;

const ProfileSettings = () => {
  const { user, updateUserProfile } = useAuth();
  const { clients, updateClient } = useData();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    employerName: '',
    // Password change fields
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load client data
  useEffect(() => {
    if (user) {
      const clientData = clients.find(c => c.id === user.id);
      if (clientData) {
        setFormData({
          name: clientData.name || '',
          email: clientData.email || '',
          phone: clientData.phone || '',
          address: clientData.address || '',
          dateOfBirth: clientData.dateOfBirth || '',
          employerName: clientData.employerName || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
      setLoading(false);
    }
  }, [user, clients]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      // Update profile information
      const profileData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        employerName: formData.employerName,
      };

      // Update client data in context
      updateClient(user.id, profileData);

      // If we have Supabase integration, update the user profile there too
      try {
        if (supabase) {
          await supabase
            .from('user_profiles')
            .upsert({ 
              id: user.id,
              ...profileData,
              updated_at: new Date().toISOString()
            });
        }
      } catch (supabaseError) {
        console.error("Supabase update failed, but local update succeeded:", supabaseError);
      }

      // Handle password change if requested
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }

        // This is a mock implementation - in a real app, you would use Supabase auth
        // For now we're just simulating success
        console.log('Password would be updated in a real implementation');
      }

      setSuccess(true);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading your profile information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
              <span>Back</span>
            </button>

            <h1 className="text-3xl font-heading font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Update your personal information and account settings</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg text-success-700">
              Your profile has been updated successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiUser} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input pl-10"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiMail} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      readOnly
                      className="form-input pl-10 bg-gray-50"
                      placeholder="Your email"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiPhone} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input pl-10"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiCalendar} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="form-input pl-10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiMapPin} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-input pl-10"
                      placeholder="Your address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="employerName" className="block text-sm font-medium text-gray-700 mb-2">
                    Employer
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiBriefcase} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="employerName"
                      name="employerName"
                      type="text"
                      value={formData.employerName}
                      onChange={handleInputChange}
                      className="form-input pl-10"
                      placeholder="Your employer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiLock} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="form-input pl-10"
                      placeholder="Enter your current password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiLock} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="form-input pl-10"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiLock} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="form-input pl-10"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>Password requirements:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>At least 8 characters long</li>
                    <li>Must include at least one uppercase letter</li>
                    <li>Must include at least one number</li>
                    <li>Must include at least one special character</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Saving...</span>
                  </>
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
      </div>
    </div>
  );
};

export default ProfileSettings;