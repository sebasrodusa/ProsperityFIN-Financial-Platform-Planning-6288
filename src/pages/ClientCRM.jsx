import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/layout/Navbar';
import ClientStatusStepper, { FUNNEL_STAGES } from '../components/crm/ClientStatusStepper';
import ClientNotes from '../components/crm/ClientNotes';
import ClientTasks from '../components/crm/ClientTasks';
import StatusHistory from '../components/crm/StatusHistory';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiEdit, FiFileText } = FiIcons;

const ClientCRM = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients, updateClient } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  
  const client = clients.find(c => c.id === clientId);

  useEffect(() => {
    // Initialize CRM data if it doesn't exist
    if (client && !client.crm_status) {
      updateClient(clientId, {
        crm_status: 'initial_meeting',
        crm_notes: [],
        crm_tasks: [],
        status_history: [{
          id: Date.now().toString(),
          fromStatus: null,
          toStatus: 'initial_meeting',
          changedAt: new Date().toISOString(),
          notes: 'Initial status set'
        }],
        last_activity: new Date().toISOString()
      });
    }
  }, [client, clientId, updateClient]);

  const handleStatusChange = (newStatus) => {
    const oldStatus = client.crm_status;
    
    // Create status history entry
    const statusHistoryEntry = {
      id: Date.now().toString(),
      fromStatus: oldStatus,
      toStatus: newStatus,
      changedAt: new Date().toISOString(),
      notes: ''
    };

    // Update client
    updateClient(clientId, {
      crm_status: newStatus,
      last_activity: new Date().toISOString(),
      status_history: [statusHistoryEntry, ...(client.status_history || [])]
    });
  };

  const handleNotesChange = (notes) => {
    updateClient(clientId, {
      crm_notes: notes,
      last_activity: new Date().toISOString()
    });
  };

  const handleTasksChange = (tasks) => {
    updateClient(clientId, {
      crm_tasks: tasks,
      last_activity: new Date().toISOString()
    });
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Client not found</h1>
            <Link to="/crm" className="text-primary-600 hover:text-primary-700">
              Back to CRM Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStage = FUNNEL_STAGES.find(stage => stage.id === client.crm_status) || FUNNEL_STAGES[0];
  const pendingTasks = (client.crm_tasks || []).filter(task => !task.completed).length;
  const overdueTasks = (client.crm_tasks || []).filter(task =>
    !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
  ).length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiUser },
    { id: 'notes', label: 'Notes', icon: FiEdit, count: client.crm_notes?.length },
    { id: 'tasks', label: 'Tasks', icon: FiFileText, count: pendingTasks },
    { id: 'history', label: 'History', icon: FiCalendar }
  ];

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
          <div className="mb-6">
            <Link
              to="/crm"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
              <span>Back to CRM Dashboard</span>
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img
                  src={client.avatar}
                  alt={client.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-3xl font-heading font-bold text-gray-900">{client.name}</h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <SafeIcon icon={FiMail} className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <SafeIcon icon={FiPhone} className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className={`px-4 py-2 rounded-lg bg-${currentStage.color}-100 text-${currentStage.color}-800`}>
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={currentStage.icon} className="w-4 h-4" />
                    <span className="font-medium">{currentStage.label}</span>
                  </div>
                </div>
                
                {overdueTasks > 0 && (
                  <div className="px-3 py-1 rounded-full bg-danger-100 text-danger-800 text-sm font-medium">
                    {overdueTasks} overdue tasks
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Stepper */}
          <div className="card mb-8">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Sales Funnel Progress</h2>
            </div>
            <ClientStatusStepper
              currentStatus={client.crm_status || 'initial_meeting'}
              onStatusChange={handleStatusChange}
              showLabels={true}
              size="lg"
            />
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <SafeIcon icon={tab.icon} className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Client Summary */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Client Summary</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Current Status</p>
                        <p className="font-semibold text-gray-900">{currentStage.label}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Client Since</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Activity</p>
                        <p className="font-semibold text-gray-900">
                          {client.last_activity
                            ? new Date(client.last_activity).toLocaleDateString()
                            : 'No recent activity'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Notes</p>
                        <p className="font-semibold text-gray-900">{client.crm_notes?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  </div>
                  <div className="space-y-3">
                    <Link
                      to={`/clients/${clientId}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiUser} className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900">View Client Details</p>
                          <p className="text-sm text-gray-500">See full client profile</p>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to={`/clients/${clientId}/report`}
                      className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiFileText} className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900">Generate Report</p>
                          <p className="text-sm text-gray-500">Create financial analysis</p>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/proposals"
                      className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiFileText} className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900">Create Proposal</p>
                          <p className="text-sm text-gray-500">New strategy projection</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="space-y-3">
                    {client.status_history?.slice(0, 3).map((entry, index) => {
                      const stage = FUNNEL_STAGES.find(s => s.id === entry.toStatus);
                      return (
                        <div key={entry.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <SafeIcon icon={stage?.icon || FiCalendar} className="w-5 h-5 text-gray-600" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              Status changed to <span className="font-medium">{stage?.label}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.changedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    
                    {(!client.status_history || client.status_history.length === 0) && (
                      <p className="text-gray-500 text-center py-4">No activity yet</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ClientNotes
                  notes={client.crm_notes || []}
                  onNotesChange={handleNotesChange}
                  clientName={client.name}
                />
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ClientTasks
                  tasks={client.crm_tasks || []}
                  onTasksChange={handleTasksChange}
                  clientName={client.name}
                />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StatusHistory history={client.status_history || []} />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientCRM;