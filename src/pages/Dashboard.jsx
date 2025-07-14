import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import SafeIcon from '../common/SafeIcon';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiFileText, FiBarChart2 } = FiIcons;

const Dashboard = () => {
  const { isLoaded, user } = useUser();
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-gray-900">
              Welcome, {user?.firstName || 'User'}
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your financial planning
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              to="/clients"
              className="card hover:shadow-medium transition-shadow flex flex-col items-center justify-center py-8"
            >
              <SafeIcon icon={FiUsers} className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Clients</h3>
              <p className="text-gray-600 text-center">Manage your client relationships</p>
            </Link>

            <Link
              to="/financial-analysis"
              className="card hover:shadow-medium transition-shadow flex flex-col items-center justify-center py-8"
            >
              <SafeIcon icon={FiBarChart2} className="w-12 h-12 text-secondary-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial Analysis</h3>
              <p className="text-gray-600 text-center">Analyze client financial data</p>
            </Link>

            <Link
              to="/proposals"
              className="card hover:shadow-medium transition-shadow flex flex-col items-center justify-center py-8"
            >
              <SafeIcon icon={FiFileText} className="w-12 h-12 text-success-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Proposals</h3>
              <p className="text-gray-600 text-center">Create and manage financial proposals</p>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            
            <div className="text-center py-12">
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-500 mt-2">Your recent actions will appear here</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;