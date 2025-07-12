import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiHome, FiUsers, FiFileText, FiSettings, FiLogOut, FiChevronDown, 
  FiEdit, FiBarChart2, FiActivity, FiList, FiUser, FiMail, FiPhone 
} = FiIcons;

// Team ID mapping
const TEAM_IDS = [
  { id: 'emd_rodriguez', name: 'EMD Rodriguez' },
  { id: 'md_garcia', name: 'MD Garcia' },
  { id: 'md_samaniego', name: 'MD Samaniego' }
];

// Default avatar placeholder
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Debug user data
  console.log('Current user data:', user);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'financial_professional': return 'Financial Professional';
      case 'client': return 'Client';
      default: return role;
    }
  };

  const getNavItems = () => {
    if (user?.role === 'client') {
      return [
        { path: '/client-portal', label: 'Dashboard', icon: FiHome },
        { path: '/client-financial-analysis', label: 'Financial Info', icon: FiActivity },
        { path: '/profile-settings', label: 'Settings', icon: FiSettings }
      ];
    }

    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: FiHome },
      { path: '/crm', label: 'CRM', icon: FiList },
      { path: '/clients', label: 'Clients', icon: FiUsers },
      { path: '/financial-analysis', label: 'Financial Analysis', icon: FiBarChart2 },
      { path: '/proposals', label: 'Projections', icon: FiFileText }
    ];

    if (user?.role === 'admin' || user?.role === 'manager') {
      commonItems.push({ path: '/users', label: 'Users', icon: FiSettings });
    }

    commonItems.push({ path: '/profile-settings', label: 'Settings', icon: FiSettings });

    return commonItems;
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user avatar with fallback
  const userAvatar = user?.avatar || DEFAULT_AVATAR;
  const userAgentCode = user?.agentCode || '';

  return (
    <nav className="bg-white shadow-soft border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to={user?.role === 'client' ? '/client-portal' : '/dashboard'} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-heading font-bold text-gray-900">ProsperityFIN™</h1>
                <p className="text-xs text-gray-500">Financial Analysis Platform</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <SafeIcon icon={item.icon} className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="relative group">
                <img
                  src={userAvatar}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
                <div className="absolute bottom-0 right-0 bg-primary-600 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <SafeIcon icon={FiEdit} className="w-3 h-3" />
                </div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role)}</p>
                {userAgentCode && (
                  <p className="text-xs text-primary-600">Agent: {userAgentCode}</p>
                )}
              </div>
              <SafeIcon icon={FiChevronDown} className="w-4 h-4 text-gray-400" />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-medium border border-gray-100 py-1 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <img
                        src={userAvatar}
                        alt={user?.name || 'User'}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = DEFAULT_AVATAR;
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        {userAgentCode && (
                          <p className="text-xs text-primary-600">Agent Code: {userAgentCode}</p>
                        )}
                        {user?.teamId && (
                          <p className="text-xs text-secondary-600">
                            Team: {TEAM_IDS.find(team => team.id === user?.teamId)?.name || user?.teamId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {user?.phone && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <SafeIcon icon={FiPhone} className="w-3 h-3" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  )}

                  {/* Profile Actions */}
                  <div className="py-1">
                    <Link
                      to="/profile-settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <SafeIcon icon={FiUser} className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>

                    {user?.role !== 'client' && (
                      <>
                        <Link
                          to="/financial-analysis"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <SafeIcon icon={FiBarChart2} className="w-4 h-4" />
                          <span>Financial Analysis</span>
                        </Link>
                        <Link
                          to="/proposals"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <SafeIcon icon={FiFileText} className="w-4 h-4" />
                          <span>Strategy Projections</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 w-full text-left"
                      >
                        <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-100">
        <div className="px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <SafeIcon icon={item.icon} className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;