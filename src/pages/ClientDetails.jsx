import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useCrm } from '../contexts/CrmContext';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import Toggle from '../components/ui/Toggle';
import ClientForm from '../components/forms/ClientForm';
import StatusBadge from '../components/ui/StatusBadge';
import StatusBadgeWithIcon from '../components/crm/StatusBadgeWithIcon';
import TaskList from '../components/crm/TaskList';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiArrowLeft, FiEdit, FiTrash2, FiBarChart2, FiFileText, FiActivity, FiUser, FiMail, 
  FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiUsers, FiList, FiCheck, FiDollarSign, FiArchive
} = FiIcons;

const ClientDetails = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients, users, updateClient, deleteClient } = useData();
  const { getClientStatus, getClientTasks, updateClientTask } = useCrm();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientStatus, setClientStatus] = useState(null);
  const [clientTasks, setClientTasks] = useState([]);

  const client = clients.find(c => c.id === clientId);
  const advisor = users.find(u => u.id === client?.advisorId);

  // Load CRM data
  useEffect(() => {
    if (client) {
      const status = getClientStatus(clientId);
      const tasks = getClientTasks(clientId);
      setClientStatus(status);
      setClientTasks(tasks);
    }
  }, [client, clientId, getClientStatus, getClientTasks]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClient(clientId);
      navigate('/clients');
    }
  };

  const handleUpdateClient = (clientData) => {
    updateClient(clientId, clientData);
    setIsEditModalOpen(false);
  };

  const handleTogglePortalAccess = () => {
    updateClient(clientId, { hasAccess: !client.hasAccess });
  };

  const handleToggleArchive = () => {
    updateClient(clientId, {
      isArchived: !client.isArchived,
      lastActivity: new Date().toISOString()
    });
  };

  const handleToggleTaskCompletion = async (taskId, currentStatus) => {
    const result = await updateClientTask(clientId, taskId, { completed: !currentStatus });
    if (result.success) {
      // Refresh tasks
      setClientTasks(getClientTasks(clientId));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Client not found</h1>
            <Link to="/clients" className="text-primary-600 hover:text-primary-700">
              Back to Clients
            </Link>
          </div>
        </div>
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
          <div className="mb-6">
            <Link
              to="/clients"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
              <span>Back to Clients</span>
            </Link>

            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <img
                  src={client.avatar}
                  alt={client.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-3xl font-heading font-bold text-gray-900">
                      {client.name}
                    </h1>
                    {client.isArchived && (
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                        Archived
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <StatusBadge status={client.status} />
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        client.status === 'active' ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.status}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Portal Access</span>
                        <Toggle
                          enabled={client.hasAccess || false}
                          onChange={handleTogglePortalAccess}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleToggleArchive}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <SafeIcon icon={FiArchive} className="w-4 h-4" />
                  <span>{client.isArchived ? 'Unarchive' : 'Archive'}</span>
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <SafeIcon icon={FiEdit} className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-danger flex items-center space-x-2"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Personal Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiMail} className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{client.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiPhone} className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{client.phone}</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <SafeIcon icon={FiMapPin} className="w-5 h-5 text-gray-400 mt-0.5" />
                        <span className="text-gray-700">{client.address}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">Born: {client.dateOfBirth}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">Gender: {client.gender}</span>
                      </div>
                      {client.maritalStatus && (
                        <div className="flex items-center space-x-3">
                          <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">Marital Status: {client.maritalStatus}</span>
                        </div>
                      )}
                      {client.employerName && (
                        <div className="flex items-center space-x-3">
                          <SafeIcon icon={FiBriefcase} className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">Employer: {client.employerName}</span>
                        </div>
                      )}
                      {client.targetRevenue && (
                        <div className="flex items-center space-x-3">
                          <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-gray-400" />
                          <span className="text-success-600 font-medium">Target Revenue: {formatCurrency(client.targetRevenue)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Family Information */}
                {(client.spouse || (client.children && client.children.length > 0)) && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Family Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {client.spouse && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Spouse</h5>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-700">{client.spouse.name}</span>
                            </div>
                            {client.spouse.email && (
                              <div className="flex items-center space-x-3">
                                <SafeIcon icon={FiMail} className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-700">{client.spouse.email}</span>
                              </div>
                            )}
                            {client.spouse.phone && (
                              <div className="flex items-center space-x-3">
                                <SafeIcon icon={FiPhone} className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-700">{client.spouse.phone}</span>
                              </div>
                            )}
                            {client.spouse.dateOfBirth && (
                              <div className="flex items-center space-x-3">
                                <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-700">Born: {client.spouse.dateOfBirth}</span>
                              </div>
                            )}
                            {client.spouse.employerName && (
                              <div className="flex items-center space-x-3">
                                <SafeIcon icon={FiBriefcase} className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-700">Employer: {client.spouse.employerName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {client.children && client.children.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Children</h5>
                          <div className="space-y-3">
                            {client.children.map((child, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <SafeIcon icon={FiUsers} className="w-5 h-5 text-gray-400" />
                                  <span className="text-gray-700">{child.name}</span>
                                </div>
                                {child.dateOfBirth && (
                                  <div className="flex items-center space-x-3 mt-1">
                                    <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-700">Born: {child.dateOfBirth}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Overview */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Financial Overview
                  </h2>
                </div>
                <div className="space-y-6">
                  {/* Income Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Income</h4>
                    {client.financialProfile?.income ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(client.financialProfile.income).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700">
                              {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="font-medium text-success-600">${value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No income data available</p>
                    )}
                  </div>

                  {/* Assets & Liabilities */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    {/* Assets */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Assets</h4>
                      {client.financialProfile?.assets ? (
                        <div className="space-y-3">
                          {Object.entries(client.financialProfile.assets).map(([categoryKey, category]) => (
                            <div key={categoryKey}>
                              <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                                {categoryKey.replace('_', ' ')}
                              </h5>
                              <div className="space-y-2">
                                {Object.entries(category).map(([itemKey, value]) => (
                                  <div key={itemKey} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-xs text-gray-700 capitalize">{itemKey.replace('_', ' ')}</span>
                                    <span className="text-xs font-medium text-gray-900">${value.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No asset data available</p>
                      )}
                    </div>

                    {/* Liabilities */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Liabilities</h4>
                      {client.financialProfile?.liabilities ? (
                        <div className="space-y-3">
                          {Object.entries(client.financialProfile.liabilities).map(([categoryKey, category]) => {
                            if (typeof category === 'object') {
                              // Category with sub-items
                              return (
                                <div key={categoryKey}>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {categoryKey.replace('_', ' ')}
                                  </h5>
                                  <div className="space-y-2">
                                    {Object.entries(category).map(([itemKey, value]) => (
                                      <div key={itemKey} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <span className="text-xs text-gray-700 capitalize">{itemKey.replace('_', ' ')}</span>
                                        <span className="text-xs font-medium text-danger-600">${value.toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            } else {
                              // Direct liability
                              return (
                                <div key={categoryKey} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <span className="text-gray-700 capitalize">{categoryKey.replace('_', ' ')}</span>
                                  <span className="font-medium text-danger-600">${category.toLocaleString()}</span>
                                </div>
                              );
                            }
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No liability data available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CRM Section */}
              <div className="card">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">CRM Overview</h2>
                    <Link
                      to={`/clients/${clientId}/crm`}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <SafeIcon icon={FiList} className="w-4 h-4" />
                      <span>Full CRM</span>
                    </Link>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Current Status */}
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">Current Status</h4>
                      {clientStatus && <StatusBadgeWithIcon status={clientStatus.status} />}
                    </div>
                  </div>

                  {/* Task Summary */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Upcoming Tasks</h4>
                    {clientTasks.length > 0 ? (
                      <div className="space-y-3">
                        {clientTasks
                          .filter(task => !task.completed)
                          .slice(0, 3)
                          .map(task => (
                            <div key={task.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                              <button
                                onClick={() => handleToggleTaskCompletion(task.id, task.completed)}
                                className="mt-1 p-1 rounded-full flex-shrink-0 bg-gray-100 text-gray-400 hover:bg-gray-200"
                              >
                                <SafeIcon icon={FiCheck} className="w-4 h-4" />
                              </button>
                              <div className="ml-3">
                                <p className="font-medium text-gray-900">{task.taskName}</p>
                                {task.dueDate && (
                                  <p className="text-xs text-gray-500 mt-1">Due: {task.dueDate}</p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic p-3 bg-gray-50 rounded-lg">No pending tasks</p>
                    )}
                    <div className="text-right">
                      <Link
                        to={`/clients/${clientId}/crm`}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        View all tasks
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Actions Card */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Client Actions
                  </h2>
                </div>
                <div className="space-y-3">
                  <Link
                    to={`/clients/${clientId}/report`}
                    className="block w-full p-3 text-left bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiBarChart2} className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-primary-900">Generate Financial Report</p>
                        <p className="text-sm text-primary-700">Complete financial analysis</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to={`/financial-analysis/${clientId}`}
                    className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiActivity} className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">Financial Analysis</p>
                        <p className="text-sm text-gray-500">Complete financial planning</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to={`/clients/${clientId}/crm`}
                    className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiList} className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">CRM Management</p>
                        <p className="text-sm text-gray-500">Manage client relationship</p>
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
                        <p className="font-medium text-gray-900">Create Proposal</p>
                        <p className="text-sm text-gray-500">New financial strategy</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Account Information */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Account Information
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <StatusBadge status={client.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Client Since</span>
                    <span className="text-sm text-gray-900">{client.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Portal Access</span>
                    <Toggle
                      enabled={client.hasAccess || false}
                      onChange={handleTogglePortalAccess}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Archived</span>
                    <Toggle
                      enabled={client.isArchived || false}
                      onChange={handleToggleArchive}
                      size="sm"
                    />
                  </div>
                  {client.nextReviewDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Next Review</span>
                      <span className="text-sm text-gray-900">{client.nextReviewDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Professional */}
              {advisor && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Financial Professional
                    </h2>
                  </div>
                  <div className="text-center">
                    <img
                      src={advisor.avatar}
                      alt={advisor.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
                    />
                    <h4 className="text-lg font-semibold text-gray-900">{advisor.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{advisor.email}</p>
                    <button className="btn-secondary w-full">Contact Advisor</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Edit Client Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Client"
          size="xl"
        >
          <ClientForm
            initialData={client}
            onSubmit={handleUpdateClient}
            onCancel={() => setIsEditModalOpen(false)}
            isEditing={true}
          />
        </Modal>
      </div>
    </div>
  );
};

export default ClientDetails;