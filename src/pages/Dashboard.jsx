import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/layout/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDollarSign, FiUsers, FiTrendingUp, FiFileText } = FiIcons;

const Dashboard = () => {
  const { user } = useAuth();
  const { clients, proposals } = useData();

  // Filter clients based on user role
  const filteredClients = clients.filter(client => {
    if (user?.role === 'financial_professional') {
      return client.advisorId === user.id;
    }
    return true;
  });

  // Calculate dashboard metrics
  const calculateMetrics = () => {
    // Calculate total pipeline value (sum of all non-archived clients' target revenue)
    const totalPipelineValue = filteredClients
      .filter(client => !client.isArchived)
      .reduce((sum, client) => sum + (parseFloat(client.targetRevenue) || 0), 0);

    // Calculate this month's metrics
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const thisMonthClients = filteredClients.filter(client => {
      const clientDate = new Date(client.createdAt);
      return clientDate >= firstDayOfMonth && clientDate <= today && !client.isArchived;
    });

    const thisMonthPipelineValue = thisMonthClients
      .reduce((sum, client) => sum + (parseFloat(client.targetRevenue) || 0), 0);

    const totalClientsThisMonth = thisMonthClients.length;

    // Calculate proposals metrics
    const activeProposals = proposals.filter(p => p.status === 'draft' || p.status === 'sent').length;
    const completedProposals = proposals.filter(p => p.status === 'approved' && 
      new Date(p.createdAt) >= firstDayOfMonth && 
      new Date(p.createdAt) <= today
    ).length;

    return {
      totalPipelineValue,
      thisMonthPipelineValue,
      totalClientsThisMonth,
      activeProposals,
      completedProposals
    };
  };

  const metrics = calculateMetrics();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold text-gray-900">
            Financial Professional Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}
          </p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Pipeline Value */}
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600">Pipeline Value</p>
                <p className="text-2xl font-bold text-primary-900">
                  {formatCurrency(metrics.totalPipelineValue)}
                </p>
                <p className="text-sm text-primary-600">Total opportunity value</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <SafeIcon icon={FiDollarSign} className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          {/* This Month's Clients */}
          <div className="card bg-gradient-to-br from-success-50 to-success-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success-600">Total Clients This Month</p>
                <p className="text-2xl font-bold text-success-900">
                  {metrics.totalClientsThisMonth}
                </p>
                <p className="text-sm text-success-600">
                  Pipeline: {formatCurrency(metrics.thisMonthPipelineValue)}
                </p>
              </div>
              <div className="p-3 bg-success-100 rounded-lg">
                <SafeIcon icon={FiUsers} className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="card bg-gradient-to-br from-secondary-50 to-secondary-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-secondary-900">68%</p>
                <p className="text-sm text-secondary-600">+5% from last month</p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-lg">
                <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </div>

          {/* Active Proposals */}
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Proposals</p>
                <p className="text-2xl font-bold text-purple-900">{metrics.activeProposals}</p>
                <p className="text-sm text-purple-600">{metrics.completedProposals} completed this month</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <SafeIcon icon={FiFileText} className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;