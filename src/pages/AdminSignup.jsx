import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiArrowLeft, FiShield, FiBriefcase } = FiIcons;

// Team ID options
const TEAM_IDS = [
  { id: 'emd_rodriguez', name: 'EMD Rodriguez' },
  { id: 'md_garcia', name: 'MD Garcia' },
  { id: 'md_samaniego', name: 'MD Samaniego' }
];

// Access code configuration (in a real app, these would be securely stored)
const ACCESS_CODES = {
  admin: 'ADM001',
  manager: 'MGR001'
};

const AdminSignup = () => {
  const navigate = useNavigate();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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
  const [verificationStep, setVerificationStep] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Verify access code
  const verifyAccessCode = () => {
    const correctCode = ACCESS_CODES[formData.role];
    if (formData.accessCode === correctCode) {
      setAccessVerified(true);
      setError('');
    } else {
      setError(`Invalid access code for ${formData.role === 'admin' ? 'Administrator' : 'Manager'} role. Please try again.`);
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First and last name are required');
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
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
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
    
    if (!isLoaded) {
      setError('Authentication system is not ready yet. Please try again.');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate agent code if not provided
      let agentCode = formData.agentCode;
      if (!agentCode) {
        const prefix = formData.role === 'admin' ? 'ADM' : 'MGR';
        agentCode = `${prefix}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      }

      // Start the signup process with Clerk
      const result = await signUp.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        password: formData.password,
      });

      // Add user metadata
      await result.update({
        unsafeMetadata: {
          phone: formData.phone,
          agentCode: agentCode
        },
        publicMetadata: {
          role: formData.role,
          teamId: formData.teamId
        }
      });

      // Check if email needs verification
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setSuccess(true);
        
        // Redirect based on role
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      } else {
        // Email verification needed
        setVerificationStep(result.status);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
              {formData.role === 'admin' ? 'Admin Signup' : 'Manager Signup'}
            </h2>
            <SafeIcon icon={FiShield} className="w-6 h-6 text-primary-600" />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Create a {formData.role === 'admin' ? 'administrator' : 'manager'} account for ProsperityFIN™
          </p>
        </div>

        {verificationStep === 'needs_email_verification' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-medium"
          >
            <div className="text-center">
              <SafeIcon icon={FiMail} className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verify your email</h3>
              <p className="text-gray-600 mb-6">
                We've sent a verification email to <strong>{formData.email}</strong>. 
                Please check your inbox and follow the instructions to verify your account.
              </p>
              <button 
                onClick={() => window.location.href = '/login'} 
                className="btn-secondary"
              >
                Go to Login
              </button>
            </div>
          </motion.div>
        ) : !accessVerified ? (
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
                  <p>This page is protected. Please select a role and enter the corresponding access code to continue.</p>
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
                <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Access Code *
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
                    placeholder={`Enter ${formData.role} access code`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use <strong>{formData.role === 'admin' ? 'ADM001' : 'MGR001'}</strong> for testing.
                </p>
              </div>

              <button
                onClick={verifyAccessCode}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <span>Verify Access</span>
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
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
                Account created successfully! Redirecting to your dashboard...
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Last name"
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
                    placeholder="Create a password (min. 8 characters)"
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
                  required
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
                  <><LoadingSpinner size="sm" /><span>Creating account...</span></>
                ) : success ? (
                  'Account Created!'
                ) : (
                  `Create ${formData.role === 'admin' ? 'Admin' : 'Manager'} Account`
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
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