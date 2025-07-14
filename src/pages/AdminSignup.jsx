import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiArrowLeft, FiShield, FiBriefcase } = FiIcons;

// Team ID options
const TEAM_IDS = [
  { id: 'emd_rodriguez', name: 'EMD Rodriguez' },
  { id: 'md_garcia', name: 'MD Garcia' },
  { id: 'md_samaniego', name: 'MD Samaniego' }
];

// This is the access code to create admin users
// In a production environment, this would be stored securely, not in code
const ADMIN_ACCESS_CODE = 'ProsperityAdmin2024';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'admin', // Default to admin
    teamId: '',
    agentCode: '',
    accessCode: '',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [accessVerified, setAccessVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Verify access code
  const verifyAccessCode = () => {
    if (formData.accessCode === ADMIN_ACCESS_CODE) {
      setAccessVerified(true);
      setError('');
    } else {
      setError('Invalid access code. Please try again.');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email is invalid');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!formData.teamId) {
      setError('Please select a team');
      return false;
    }
    
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate agent code if not provided
      let agentCode = formData.agentCode;
      if (!agentCode) {
        const prefix = formData.role === 'admin' ? 'ADM' : formData.role === 'manager' ? 'MGR' : 'FP';
        agentCode = `${prefix}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      }
      
      // 1. Register the user with Supabase Auth using snake_case for metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            role: formData.role,
            team_id: formData.teamId, // Changed to snake_case
            agent_code: agentCode    // Changed to snake_case
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData?.user) {
        // 2. Create the user profile in the database with snake_case field names
        const { error: profileError } = await supabase
          .from('users_pf')
          .insert({
            id: authData.user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            team_id: formData.teamId,        // Changed to snake_case
            agent_code: agentCode,          // Changed to snake_case
            status: 'active',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
            created_at: new Date().toISOString()
          });
          
        if (profileError) throw profileError;
        
        // Success
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-3xl font-heading font-bold text-gray-900">
              Admin Signup
            </h2>
            <SafeIcon icon={FiShield} className="w-6 h-6 text-primary-600" />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Create an administrator account for ProsperityFIN™
          </p>
        </div>

        {!accessVerified ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-medium"
          >
            <div className="space-y-4">
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <SafeIcon icon={FiShield} className="w-5 h-5 mr-2" />
                  <p>This page is protected. Please enter the admin access code to continue.</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Access Code *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiLock} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="accessCode"
                    name="accessCode"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.accessCode}
                    onChange={handleInputChange}
                    className="form-input pl-10 pr-10"
                    placeholder="Enter admin access code"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={verifyAccessCode}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <span>Verify Access</span>
              </button>
            </div>
            
            <div className="text-center">
              <Link to="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                <SafeIcon icon={FiArrowLeft} className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-medium"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg">
                Admin account created successfully! Redirecting to login...
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiUser} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiMail} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input pl-10"
                    placeholder="Enter your email"
                  />
                </div>
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
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiLock} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input pl-10 pr-10"
                    placeholder="Create a password (min. 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiLock} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input pl-10 pr-10"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-2">
                  Team *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiBriefcase} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    id="teamId"
                    name="teamId"
                    value={formData.teamId}
                    onChange={handleInputChange}
                    className="form-input pl-10"
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
              </div>
              
              <div>
                <label htmlFor="agentCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Code (Optional)
                </label>
                <div className="relative">
                  <SafeIcon icon={FiUser} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="agentCode"
                    name="agentCode"
                    type="text"
                    value={formData.agentCode}
                    onChange={handleInputChange}
                    className="form-input pl-10"
                    placeholder="Leave blank to auto-generate"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  If left blank, an agent code will be automatically generated.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || success}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : success ? (
                  'Account Created!'
                ) : (
                  'Create Admin Account'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                <SafeIcon icon={FiArrowLeft} className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default AdminSignup;