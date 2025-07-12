import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useCrm, CLIENT_STATUSES } from '../contexts/CrmContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import Navbar from '../components/layout/Navbar';
import StatusBadgeWithIcon from '../components/crm/StatusBadgeWithIcon';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

const {
  FiUsers,
  FiFileText,
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiActivity,
  FiBarChart2,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiList
} = FiIcons;

const Dashboard = () => {
  const { user } = useAuth();
  const { clients, proposals } = useData();
  const { getClientStatus, getClientTasks } = useCrm();
  
  const [timeframe, setTimeframe] = useState('month');

  // Filter data based on user role
  const getFilteredData = () => {
    if (user?.role === 'client') {
      return {
        clients: clients.filter(client => client.id === user.id),
        proposals: proposals.filter(proposal => proposal.clientId === user.id)
      };
    } else if (user?.role === 'financial_professional') {
      return {
        clients: clients.filter(client => client.advisorId === user.id),
        proposals: proposals.filter(proposal => proposal.advisorId === user.id)
      };
    }
    return { clients, proposals };
  };

  const { clients: filteredClients, proposals: filteredProposals } = getFilteredData();

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalAUM = filteredClients.reduce((sum, client) => {
      const assets = client.financialProfile?.assets || {};
      return sum + Object.values(assets).reduce(
        (total, category) => total + Object.values(category).reduce(
          (sum, value) => sum + (parseFloat(value) || 0), 0
        ), 0
      );
    }, 0);

    const activeProposals = filteredProposals.filter(p => p.status === 'pending').length;
    const completedProposals = filteredProposals.filter(p => p.status === 'approved').length;

    const averageClientNetWorth = filteredClients.reduce((sum, client) => {
      const assets = Object.values(client.financialProfile?.assets || {}).reduce(
        (total, category) => total + Object.values(category).reduce(
          (sum, value) => sum + (parseFloat(value) || 0), 0
        ), 0
      );

      const liabilities = Object.values(client.financialProfile?.liabilities || {}).reduce(
        (total, category) => {
          if (typeof category === 'object') {
            return total + Object.values(category).reduce(
              (sum, value) => sum + (parseFloat(value) || 0), 0
            );
          }
          return total + (parseFloat(category) || 0);
        }, 0
      );

      return sum + (assets - liabilities);
    }, 0) / (filteredClients.length || 1);

    return {
      totalAUM,
      activeProposals,
      completedProposals,
      averageClientNetWorth,
      totalClients: filteredClients.length
    };
  }, [filteredClients, filteredProposals]);

  // Get client status distribution
  const getClientStatusDistribution = () => {
    const statusCounts = {};
    
    // Initialize with all statuses set to 0
    CLIENT_STATUSES.forEach(status => {
      statusCounts[status.id] = 0;
    });
    
    // Count clients in each status
    filteredClients.forEach(client => {
      const status = getClientStatus(client.id);
      if (status && status.status) {
        statusCounts[status.status] = (statusCounts[status.status] || 0) + 1;
      }
    });
    
    return statusCounts;
  };

  const statusDistribution = getClientStatusDistribution();

  // Prepare charts data
  const clientSegmentationData = {
    labels: ['High Net Worth', 'Mass Affluent', 'Mass Market'],
    datasets: [{
      data: [35, 45, 20],
      backgroundColor: [
        'rgba(34,197,94,0.6)',
        'rgba(14,165,233,0.6)',
        'rgba(168,85,247,0.6)'
      ],
      borderColor: [
        'rgb(34,197,94)',
        'rgb(14,165,233)',
        'rgb(168,85,247)'
      ],
      borderWidth: 1
    }]
  };

  const productMixData = {
    labels: ['Life Insurance', 'Annuities', 'Investments', 'Retirement Plans'],
    datasets: [{
      label: 'Product Distribution',
      data: [40, 25, 20, 15],
      backgroundColor: [
        'rgba(34,197,94,0.6)',
        'rgba(14,165,233,0.6)',
        'rgba(168,85,247,0.6)',
        'rgba(249,115,22,0.6)'
      ],
      borderColor: [
        'rgb(34,197,94)',
        'rgb(14,165,233)',
        'rgb(168,85,247)',
        'rgb(249,115,22)'
      ],
      borderWidth: 1
    }]
  };

  // Sales funnel data
  const salesFunnelData = {
    labels: CLIENT_STATUSES.map(status => status.label),
    datasets: [{
      data: CLIENT_STATUSES.map(status => statusDistribution[status.id] || 0),
      backgroundColor: [
        'rgba(59,130,246,0.6)', // blue
        'rgba(124,58,237,0.6)', // purple
        'rgba(234,179,8,0.6)',  // yellow
        'rgba(14,165,233,0.6)', // cyan
        'rgba(249,115,22,0.6)', // orange
        'rgba(79,70,229,0.6)',  // indigo
        'rgba(34,197,94,0.6)'   // green
      ],
      borderColor: [
        'rgb(59,130,246)',
        'rgb(124,58,237)',
        'rgb(234,179,8)',
        'rgb(14,165,233)',
        'rgb(249,115,22)',
        'rgb(79,70,229)',
        'rgb(34,197,94)'
      ],
      borderWidth: 1,
      hoverOffset: 4
    }]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get upcoming client reviews and actions needed
  const upcomingReviews = filteredClients
    .filter(client => client.nextReviewDate && new Date(client.nextReviewDate) > new Date())
    .slice(0, 5);

  // Get upcoming tasks
  const getUpcomingTasks = () => {
    const allTasks = [];
    filteredClients.forEach(client => {
      const clientTasks = getClientTasks(client.id);
      const pendingTasks = clientTasks.filter(task => !task.completed);
      
      pendingTasks.forEach(task => {
        allTasks.push({
          ...task,
          clientName: client.name,
          clientId: client.id
        });
      });
    });
    
    // Sort by due date
    return allTasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }).slice(0, 5);
  };

  const upcomingTasks = getUpcomingTasks();

  const actionsNeeded = useMemo(() => {
    return filteredClients.reduce((actions, client) => {
      if (!client.financialProfile?.assets?.retirement?.retirementAccount401k && !client.financialProfile?.assets?.retirement?.ira) {
        actions.push({
          clientId: client.id,
          clientName: client.name,
          type: 'retirement',
          description: 'No retirement accounts'
        });
      }

      // Check for high debt-to-income ratio
      const totalIncome = Object.values(client.financialProfile?.income || {})
        .reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
      const totalDebt = client.financialProfile?.liabilities?.creditCards || 0;
      if (totalDebt > totalIncome * 0.3) {
        actions.push({
          clientId: client.id,
          clientName: client.name,
          type: 'debt',
          description: 'High debt-to-income ratio'
        });
      }

      return actions;
    }, []);
  }, [filteredClients]);

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
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600">Assets Under Management</p>
                <p className="text-2xl font-bold text-primary-900">{formatCurrency(metrics.totalAUM)}</p>
                <p className="text-sm text-primary-600">+12% from last month</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <SafeIcon icon={FiDollarSign} className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-success-50 to-success-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success-600">Total Clients</p>
                <p className="text-2xl font-bold text-success-900">{metrics.totalClients}</p>
                <p className="text-sm text-success-600">Average NW: {formatCurrency(metrics.averageClientNetWorth)}</p>
              </div>
              <div className="p-3 bg-success-100 rounded-lg">
                <SafeIcon icon={FiUsers} className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-secondary-50 to-secondary-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Active Proposals</p>
                <p className="text-2xl font-bold text-secondary-900">{metrics.activeProposals}</p>
                <p className="text-sm text-secondary-600">{metrics.completedProposals} completed this month</p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-lg">
                <SafeIcon icon={FiFileText} className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-900">68%</p>
                <p className="text-sm text-purple-600">+5% from last month</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Client Segmentation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
          >
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Client Segmentation</h3>
            </div>
            <div className="flex items-center justify-center p-4">
              <div className="w-64 h-64">
                <Pie data={clientSegmentationData} options={{ maintainAspectRatio: true }} />
              </div>
            </div>
          </motion.div>

          {/* Product Mix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card"
          >
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Product Mix</h3>
            </div>
            <div className="flex items-center justify-center p-4">
              <div className="w-64 h-64">
                <Pie data={productMixData} options={{ maintainAspectRatio: true }} />
              </div>
            </div>
          </motion.div>

          {/* Sales Funnel - New */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card"
          >
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Sales Funnel</h3>
                <Link to="/clients" className="text-primary-600 hover:text-primary-700 text-sm">
                  View Clients
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center p-4">
              <div className="w-64 h-64">
                <Doughnut 
                  data={salesFunnelData} 
                  options={{ 
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          boxWidth: 12,
                          font: {
                            size: 10
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tasks, Reviews and Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Tasks - New */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card"
          >
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
                <Link to="/clients" className="text-primary-600 hover:text-primary-700 text-sm">
                  View All Tasks
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/clients/${task.clientId}/crm`}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <SafeIcon icon={FiClock} className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{task.taskName}</p>
                      <p className="text-sm text-gray-600">
                        {task.clientName} • Due: {task.dueDate}
                      </p>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex items-start space-x-3 p-3 bg-success-50 rounded-lg">
                  <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-success-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-success-900">No upcoming tasks</p>
                    <p className="text-sm text-success-700">All tasks are completed</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Actions Needed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card"
          >
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Actions Needed</h3>
            </div>

            <div className="space-y-4">
              {actionsNeeded.map((action, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-danger-50 rounded-lg">
                  <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-danger-500 mt-0.5" />
                  <div>
                    <Link
                      to={`/clients/${action.clientId}`}
                      className="font-medium text-danger-900 hover:text-danger-700"
                    >
                      {action.clientName}
                    </Link>
                    <p className="text-sm text-danger-700">{action.description}</p>
                  </div>
                </div>
              ))}

              {actionsNeeded.length === 0 && (
                <div className="flex items-start space-x-3 p-3 bg-success-50 rounded-lg">
                  <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-success-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-success-900">All Clients in Good Standing</p>
                    <p className="text-sm text-success-700">No immediate actions needed at this time</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Upcoming Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="card"
          >
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Reviews</h3>
            </div>

            <div className="space-y-4">
              {upcomingReviews.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img src={client.avatar} alt={client.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <Link
                        to={`/clients/${client.id}`}
                        className="font-medium text-gray-900 hover:text-primary-600"
                      >
                        {client.name}
                      </Link>
                      <p className="text-sm text-gray-500">{new Date(client.nextReviewDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400" />
                </div>
              ))}

              {upcomingReviews.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No upcoming reviews scheduled
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;