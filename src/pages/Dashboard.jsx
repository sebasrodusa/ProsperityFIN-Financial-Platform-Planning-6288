import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/layout/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiFileText,
  FiCalendar,
  FiClock,
  FiTarget,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiPhone,
  FiMail,
  FiEye,
  FiEdit,
  FiPlus,
  FiArrowUp,
  FiArrowDown,
  FiBarChart2,
  FiPieChart
} = FiIcons;

const Dashboard = () => {
  const { user } = useAuth();
  const { clients, proposals } = useData();
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');

  // Filter clients based on user role
  const filteredClients = clients.filter(client => {
    if (user?.role === 'financial_professional') {
      return client.advisorId === user.id;
    }
    return true;
  });

  // Calculate comprehensive dashboard metrics
  const calculateMetrics = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    // Active clients (non-archived)
    const activeClients = filteredClients.filter(client => !client.isArchived);
    
    // Pipeline calculations
    const totalPipelineValue = activeClients.reduce((sum, client) => 
      sum + (parseFloat(client.targetRevenue) || 0), 0
    );

    // This month's metrics
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthClients = activeClients.filter(client => {
      const clientDate = new Date(client.createdAt);
      return clientDate >= firstDayOfMonth && clientDate <= today;
    });

    // CRM Status distribution
    const statusDistribution = {
      'initial_meeting': 0,
      'follow_up_meeting': 0,
      'interested_not_ready': 0,
      'create_proposal': 0,
      'follow_up_decision': 0,
      'application_submitted': 0,
      'client_won': 0
    };

    activeClients.forEach(client => {
      if (client.crmStatus && Object.prototype.hasOwnProperty.call(statusDistribution, client.crmStatus)) {
        statusDistribution[client.crmStatus]++;
      }
    });

    // Recent activity
    const recentClients = activeClients
      .filter(client => client.lastActivity)
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      .slice(0, 5);

    // Tasks due
    const tasksDue = activeClients.reduce((total, client) => {
      if (!client.crmTasks) return total;
      return total + client.crmTasks.filter(task => 
        !task.completed && 
        task.dueDate && 
        new Date(task.dueDate) <= today
      ).length;
    }, 0);

    // Overdue tasks
    const overdueTasks = activeClients.reduce((total, client) => {
      if (!client.crmTasks) return total;
      return total + client.crmTasks.filter(task => 
        !task.completed && 
        task.dueDate && 
        new Date(task.dueDate) < today
      ).length;
    }, 0);

    // Proposals metrics
    const activeProposals = proposals.filter(p => p.status === 'draft' || p.status === 'sent').length;
    const approvedProposals = proposals.filter(p => 
      p.status === 'approved' && 
      new Date(p.createdAt) >= firstDayOfMonth
    ).length;

    // High-value prospects
    const highValueProspects = activeClients.filter(client => 
      parseFloat(client.targetRevenue || 0) >= 50000
    );

    // Conversion rate
    const totalProspects = activeClients.length;
    const convertedClients = statusDistribution.client_won;
    const conversionRate = totalProspects > 0 ? (convertedClients / totalProspects) * 100 : 0;

    // Growth metrics (mock data for demonstration)
    const lastMonthPipeline = totalPipelineValue * 0.85; // Mock previous data
    const pipelineGrowth = totalPipelineValue > 0 ? 
      ((totalPipelineValue - lastMonthPipeline) / lastMonthPipeline) * 100 : 0;

    return {
      totalPipelineValue,
      activeClients: activeClients.length,
      thisMonthClients: thisMonthClients.length,
      thisMonthPipeline: thisMonthClients.reduce((sum, client) => 
        sum + (parseFloat(client.targetRevenue) || 0), 0
      ),
      statusDistribution,
      recentClients,
      tasksDue,
      overdueTasks,
      activeProposals,
      approvedProposals,
      highValueProspects: highValueProspects.length,
      conversionRate,
      pipelineGrowth
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

  const getStatusColor = (status) => {
    const colors = {
      'initial_meeting': 'bg-blue-100 text-blue-800',
      'follow_up_meeting': 'bg-purple-100 text-purple-800',
      'interested_not_ready': 'bg-yellow-100 text-yellow-800',
      'create_proposal': 'bg-orange-100 text-orange-800',
      'follow_up_decision': 'bg-indigo-100 text-indigo-800',
      'application_submitted': 'bg-teal-100 text-teal-800',
      'client_won': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'initial_meeting': 'Initial Meeting',
      'follow_up_meeting': 'Follow-up Meeting',
      'interested_not_ready': 'Interested/Not Ready',
      'create_proposal': 'Create Proposal',
      'follow_up_decision': 'Follow-up Decision',
      'application_submitted': 'Application Submitted',
      'client_won': 'Client Won'
    };
    return labels[status] || status;
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-900">
                Welcome back, {user?.name}
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your clients and pipeline
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="form-input"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
              </select>
              <Link to="/clients" className="btn-primary flex items-center space-x-2">
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                <span>Add Client</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Row */}
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
                <p className="text-sm font-medium text-primary-600">Total Pipeline</p>
                <p className="text-2xl font-bold text-primary-900">
                  {formatCurrency(metrics.totalPipelineValue)}
                </p>
                <div className="flex items-center mt-1">
                  <SafeIcon 
                    icon={metrics.pipelineGrowth >= 0 ? FiArrowUp : FiArrowDown} 
                    className={`w-3 h-3 mr-1 ${metrics.pipelineGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} 
                  />
                  <span className={`text-xs ${metrics.pipelineGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(metrics.pipelineGrowth).toFixed(1)}% vs last month
                  </span>
                </div>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <SafeIcon icon={FiDollarSign} className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Active Clients */}
          <div className="card bg-gradient-to-br from-success-50 to-success-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success-600">Active Clients</p>
                <p className="text-2xl font-bold text-success-900">
                  {metrics.activeClients}
                </p>
                <p className="text-sm text-success-600">
                  {metrics.thisMonthClients} added this month
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
                <p className="text-2xl font-bold text-secondary-900">
                  {metrics.conversionRate.toFixed(1)}%
                </p>
                <p className="text-sm text-secondary-600">
                  {metrics.statusDistribution.client_won} clients won
                </p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-lg">
                <SafeIcon icon={FiTarget} className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </div>

          {/* Tasks & Activities */}
          <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Tasks Due</p>
                <p className="text-2xl font-bold text-orange-900">{metrics.tasksDue}</p>
                <p className="text-sm text-orange-600">
                  {metrics.overdueTasks} overdue
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <SafeIcon icon={FiClock} className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pipeline Funnel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card"
            >
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Sales Funnel</h3>
                  <Link to="/crm" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View CRM →
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(metrics.statusDistribution).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)} mt-2`}>
                      {getStatusLabel(status)}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card"
            >
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Client Activity</h3>
                  <Link to="/clients" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All →
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                {metrics.recentClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-600">
                          Last activity: {new Date(client.lastActivity).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {client.targetRevenue && (
                        <span className="text-sm text-success-600 font-medium">
                          {formatCurrency(client.targetRevenue)}
                        </span>
                      )}
                      <Link
                        to={`/clients/${client.id}`}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <SafeIcon icon={FiEye} className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
                {metrics.recentClients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <SafeIcon icon={FiActivity} className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Proposals Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card"
            >
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Strategy Projections</h3>
                  <Link to="/proposals" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All →
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <SafeIcon icon={FiFileText} className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary-600">{metrics.activeProposals}</p>
                  <p className="text-sm text-gray-600">Active Projections</p>
                </div>
                <div className="text-center p-4 bg-success-50 rounded-lg">
                  <SafeIcon icon={FiCheckCircle} className="w-8 h-8 text-success-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-success-600">{metrics.approvedProposals}</p>
                  <p className="text-sm text-gray-600">Approved This Month</p>
                </div>
                <div className="text-center">
                  <Link to="/proposals" className="btn-primary w-full flex items-center justify-center space-x-2">
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                    <span>Create Projection</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <Link
                  to="/clients"
                  className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiPlus} className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">Add New Client</p>
                      <p className="text-sm text-gray-500">Create a new client profile</p>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/proposals"
                  className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiFileText} className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">Create Projection</p>
                      <p className="text-sm text-gray-500">Build financial strategy</p>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/financial-analysis"
                  className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiBarChart2} className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">Financial Analysis</p>
                      <p className="text-sm text-gray-500">Analyze client finances</p>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/crm"
                  className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiUsers} className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">Manage CRM</p>
                      <p className="text-sm text-gray-500">Track client progress</p>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* High-Value Prospects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">High-Value Prospects</h3>
              </div>
              <div className="text-center p-6">
                <SafeIcon icon={FiTrendingUp} className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-primary-600 mb-2">{metrics.highValueProspects}</p>
                <p className="text-sm text-gray-600 mb-4">Prospects worth $50K+</p>
                <Link to="/clients" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View High-Value Prospects →
                </Link>
              </div>
            </motion.div>

            {/* Alerts & Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
              </div>
              <div className="space-y-3">
                {metrics.overdueTasks > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          {metrics.overdueTasks} Overdue Tasks
                        </p>
                        <p className="text-sm text-red-600">
                          Review and complete overdue client tasks
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {metrics.tasksDue > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <SafeIcon icon={FiClock} className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          {metrics.tasksDue} Tasks Due Today
                        </p>
                        <p className="text-sm text-yellow-600">
                          Complete today's scheduled activities
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {metrics.activeProposals > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <SafeIcon icon={FiFileText} className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          {metrics.activeProposals} Pending Projections
                        </p>
                        <p className="text-sm text-blue-600">
                          Follow up on pending proposals
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {metrics.overdueTasks === 0 && metrics.tasksDue === 0 && metrics.activeProposals === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    <SafeIcon icon={FiCheckCircle} className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">All caught up!</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Performance Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="card bg-gradient-to-br from-gray-50 to-gray-100"
            >
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">This Month Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Clients</span>
                  <span className="font-semibold text-gray-900">{metrics.thisMonthClients}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pipeline Added</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(metrics.thisMonthPipeline)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Proposals Approved</span>
                  <span className="font-semibold text-gray-900">{metrics.approvedProposals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="font-semibold text-gray-900">{metrics.conversionRate.toFixed(1)}%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;