import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMenu, FiX, FiUser, FiLogOut, FiChevronDown, FiFileText, FiBarChart2, FiEdit, FiActivity } = FiIcons;

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Different navigation items based on user role
  const getNavigationItems = () => {
    if (user?.role === 'client') {
      return [
        { name: 'My Dashboard', path: '/client-portal', roles: ['client'] },
        { name: 'Financial Report', path: `/clients/${user.id}/report`, roles: ['client'], icon: FiBarChart2 },
        { name: 'Update Financial Info', path: '/client-financial-analysis', roles: ['client'], icon: FiEdit }
      ];
    }

    return [
      { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'manager', 'financial_professional'] },
      { name: 'Clients', path: '/clients', roles: ['admin', 'manager', 'financial_professional'] },
      { name: 'Financial Analysis', path: '/financial-analysis', roles: ['admin', 'manager', 'financial_professional'] },
      { name: 'Proposals', path: '/proposals', roles: ['admin', 'manager', 'financial_professional'] },
      { name: 'Users', path: '/users', roles: ['admin', 'manager'] }
    ];
  };

  const navigationItems = getNavigationItems();
  const filteredNavItems = navigationItems.filter(item => item.roles.includes(user?.role));

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'financial_professional': return 'Financial Professional';
      case 'client': return 'Client';
      default: return role;
    }
  };

  return (
    <nav className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={user?.role === 'client' ? '/client-portal' : '/dashboard'} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-heading font-bold text-gray-900">
                ProsperityFIN™
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                  location.pathname === item.path
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                {item.icon && <SafeIcon icon={item.icon} className="w-4 h-4" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role)}</p>
              </div>
              <SafeIcon icon={FiChevronDown} className="w-4 h-4 text-gray-400" />
            </button>

            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-gray-100 py-1 z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                
                {user?.role === 'client' && (
                  <>
                    <Link
                      to={`/clients/${user.id}/report`}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <SafeIcon icon={FiFileText} className="w-4 h-4" />
                      <span>My Financial Report</span>
                    </Link>
                    <Link
                      to="/client-financial-analysis"
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <SafeIcon icon={FiActivity} className="w-4 h-4" />
                      <span>Update Financial Info</span>
                    </Link>
                  </>
                )}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <SafeIcon icon={isMenuOpen ? FiX : FiMenu} className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-100"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-1 block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                {item.icon && <SafeIcon icon={item.icon} className="w-4 h-4" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;