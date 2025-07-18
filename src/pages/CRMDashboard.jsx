import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../contexts/DataContext';
import { useCrm } from '../contexts/CrmContext';
import Navbar from '../components/layout/Navbar';
import ClientStatusStepper, { FUNNEL_STAGES } from '../components/crm/ClientStatusStepper';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiFilter, FiUsers, FiTrendingUp, FiClock, FiTarget, FiEye, FiCalendar, FiArchive, FiToggleRight } = FiIcons;

const CRMDashboard = () => {
  const { user } = useAuth();
  const { clients } = useData();
  const {
    getClientStatus,
    getClientHistory,
    getClientTasks,
    updateClientStatus
  } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showArchived, setShowArchived] = useState(false);

  // Filter clients based on user role
  const filteredClients = useMemo(() => {
    let clientList = clients;

    // Filter by role
    if (user?.role === 'financial_professional') {
      clientList = clients.filter(client => client.advisorId === user.id);
    }

    // Filter by archive status
    if (!showArchived) {
      clientList = clientList.filter(client => !client.isArchived);
    }

    // Filter by search term
    if (searchTerm) {
      clientList = clientList.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      clientList = clientList.filter(client => getClientStatus(client.id).status === statusFilter);
    }

    // Sort clients
    clientList.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          const aIndex = FUNNEL_STAGES.findIndex(s => s.id === getClientStatus(a.id).status);
          const bIndex = FUNNEL_STAGES.findIndex(s => s.id === getClientStatus(b.id).status);
          return aIndex - bIndex;
        case 'revenue':
          return (parseFloat(b.targetRevenue) || 0) - (parseFloat(a.targetRevenue) || 0);
        case 'lastActivity':
          const bHist = getClientHistory(b.id);
          const aHist = getClientHistory(a.id);
          const bDate = bHist[0]?.createdAt || b.createdAt;
          const aDate = aHist[0]?.createdAt || a.createdAt;
          return new Date(bDate) - new Date(aDate);
        default:
          return 0;
      }
    });

    return clientList;
  }, [clients, user, searchTerm, statusFilter, sortBy, showArchived]);

  // Calculate funnel metrics
  const funnelMetrics = useMemo(() => {
    const metrics = {};
    let totalValue = 0;

    FUNNEL_STAGES.forEach(stage => {
          const stageClients = filteredClients.filter(client => getClientStatus(client.id).status === stage.id);
      const count = stageClients.length;
      metrics[stage.id] = count;
      
      // Calculate total value based on target revenue
      const stageValue = stageClients.reduce((sum, client) => {
        return sum + (parseFloat(client.targetRevenue) || 0);
      }, 0);
      
      totalValue += stageValue;
    });

    return { ...metrics, totalValue };
  }, [filteredClients]);

  const handleStatusChange = async (clientId, newStatus) => {
    await updateClientStatus(clientId, newStatus);
  };

  const handleToggleArchive = (clientId, currentStatus) => {
    updateClient(clientId, {
      is_archived: !currentStatus
    });
  };

  const getStageInfo = (statusId) => {
    return FUNNEL_STAGES.find(stage => stage.id === statusId) || FUNNEL_STAGES[0];
  };

  const getTasksDue = (client) => {
    const tasks = getClientTasks(client.id);
    const today = new Date();
    return tasks.filter(task =>
      !task.completed && task.dueDate && new Date(task.dueDate) <= today
    ).length;
  };

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-gray-900">CRM Dashboard</h1>
            <p className="text-gray-600 mt-2">Track client progress through the sales funnel</p>
          </div>

          {/* Funnel Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {FUNNEL_STAGES.map((stage) => (
              <div key={stage.id} className="card text-center">
                <div className={`w-12 h-12 rounded-full bg-${stage.color}-100 mx-auto mb-3 flex items-center justify-center`}>
                  <SafeIcon icon={stage.icon} className={`w-6 h-6 text-${stage.color}-600`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{funnelMetrics[stage.id] || 0}</h3>
                <p className="text-sm text-gray-600">{stage.label}</p>
              </div>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600">Total Prospects</p>
                  <p className="text-2xl font-bold text-primary-900">{filteredClients.length}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <SafeIcon icon={FiUsers} className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-success-50 to-success-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-success-600">Pipeline Value</p>
                  <p className="text-2xl font-bold text-success-900">{formatCurrency(funnelMetrics.totalValue)}</p>
                </div>
                <div className="p-3 bg-success-100 rounded-lg">
                  <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-success-600" />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-secondary-50 to-secondary-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {filteredClients.length > 0
                      ? Math.round((funnelMetrics.client_won || 0) / filteredClients.length * 100)
                      : 0}%
                  </p>
                </div>
                <div className="p-3 bg-secondary-100 rounded-lg">
                  <SafeIcon icon={FiTarget} className="w-6 h-6 text-secondary-600" />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Tasks Due</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {filteredClients.reduce((sum, client) => sum + getTasksDue(client), 0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <SafeIcon icon={FiClock} className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="card mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="all">All Statuses</option>
                  {FUNNEL_STAGES.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.label}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-input"
                >
                  <option value="name">Sort by Name</option>
                  <option value="status">Sort by Status</option>
                  <option value="revenue">Sort by Revenue</option>
                  <option value="lastActivity">Sort by Last Activity</option>
                </select>
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`btn-secondary flex items-center space-x-2 ${showArchived ? 'bg-primary-100 text-primary-800' : ''}`}
                >
                  <SafeIcon icon={showArchived ? FiToggleRight : FiArchive} className="w-4 h-4" />
                  <span>{showArchived ? 'Showing Archived' : 'Show Archived'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Client List */}
          <div className="space-y-4">
            {filteredClients.map((client) => {
              const status = getClientStatus(client.id);
              const stageInfo = getStageInfo(status.status);
              const tasksDue = getTasksDue(client);
              
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card hover:shadow-medium transition-shadow ${client.isArchived ? 'border-dashed border-gray-300 bg-gray-50' : ''}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Client Info */}
                    <div className="flex items-center space-x-4 flex-1">
                      <img src={client.avatar} alt={client.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-900">{client.name}</h3>
                          {client.isArchived && (
                            <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                              Archived
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{client.email}</p>
                        {client.targetRevenue && (
                          <p className="text-sm text-success-600 font-medium flex items-center">
                            <SafeIcon icon={FiTrendingUp} className="w-3 h-3 mr-1" />
                            {formatCurrency(client.targetRevenue)}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-1">
                          {tasksDue > 0 && (
                            <span className="text-xs text-orange-600 flex items-center space-x-1">
                              <SafeIcon icon={FiClock} className="w-3 h-3" />
                              <span>{tasksDue} tasks due</span>
                            </span>
                          )}
                          {getClientHistory(client.id)[0] && (
                            <span className="text-xs text-gray-500">
                              Last activity: {new Date(getClientHistory(client.id)[0].createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Stepper */}
                    <div className="flex-1 lg:max-w-2xl">
                      <ClientStatusStepper
                        currentStatus={status.status || 'initial_meeting'}
                        onStatusChange={(newStatus) => handleStatusChange(client.id, newStatus)}
                        showLabels={false}
                        size="sm"
                      />
                      <div className="text-center mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${stageInfo.color}-100 text-${stageInfo.color}-800`}>
                          <SafeIcon icon={stageInfo.icon} className="w-3 h-3 mr-1" />
                          {stageInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/clients/${client.id}/crm`}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <SafeIcon icon={FiEye} className="w-4 h-4" />
                        <span>Manage</span>
                      </Link>
                      <button
                        onClick={() => handleToggleArchive(client.id, client.isArchived)}
                        className={`p-2 rounded-lg ${client.isArchived ? 'text-primary-600 hover:bg-primary-50' : 'text-gray-400 hover:bg-gray-50'}`}
                        title={client.isArchived ? "Unarchive" : "Archive"}
                      >
                        <SafeIcon icon={FiArchive} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <SafeIcon icon={FiUsers} className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Add your first client to get started with CRM tracking'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CRMDashboard;