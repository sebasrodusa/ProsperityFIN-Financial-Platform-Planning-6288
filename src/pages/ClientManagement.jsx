import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../contexts/DataContext';
import { useCrm } from '../contexts/CrmContext';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import StatusBadgeWithIcon from '../components/crm/StatusBadgeWithIcon';
import Toggle from '../components/ui/Toggle';
import ClientForm from '../components/forms/ClientForm';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import logDev from '../utils/logDev';

const { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiUsers, FiBriefcase, FiFilter, FiList, FiArchive, FiDollarSign, FiToggleRight } = FiIcons;

const ClientManagement = () => {
  const { user } = useAuth();
  const { clients, addClient, updateClient, deleteClient } = useData();
  const { getClientStatus } = useCrm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFilteredClients = () => {
    let filtered = clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           client.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by role
      if (user?.role === 'advisor') {
        if (!matchesSearch || client.advisorId !== user.id) {
          return false;
        }
      } else if (!matchesSearch) {
        return false;
      }

      // Filter by archive status
      if (!showArchived && client.isArchived) {
        return false;
      }

      // Apply status filter if selected
      if (statusFilter) {
        const clientStatus = getClientStatus(client.id);
        return clientStatus?.status === statusFilter;
      }

      return true;
    });

    return filtered;
  };

  const filteredClients = getFilteredClients();

  const handleAddClient = useCallback(async (clientData) => {
    logDev('Adding client:', clientData);
    setIsSubmitting(true);

    try {
      await addClient(clientData);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding client:', error);
      alert(`Failed to add client: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [addClient]);

  const handleUpdateClient = useCallback(async (clientData) => {
    logDev('Updating client:', clientData);
    setIsSubmitting(true);

    try {
      await updateClient(selectedClient.id, clientData);
      setIsEditModalOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
      alert(`Failed to update client: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [updateClient, selectedClient]);

  const handleEdit = useCallback((client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        logDev('Deleting client:', clientId);
        await deleteClient(clientId);
      } catch (error) {
        console.error('Error deleting client:', error);
        alert(`Failed to delete client: ${error.message}`);
      }
    }
  }, [deleteClient]);

  const handleTogglePortalAccess = useCallback(async (clientId, currentAccess) => {
    try {
      logDev('Toggling portal access:', clientId, !currentAccess);
      await updateClient(clientId, {
        has_access: !currentAccess,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error toggling portal access:', error);
      alert(`Failed to update portal access: ${error.message}`);
    }
  }, [updateClient]);

  const handleToggleArchive = useCallback(async (clientId, isArchived) => {
    try {
      logDev('Toggling archive status:', clientId, !isArchived);
      await updateClient(clientId, {
        is_archived: !isArchived,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error toggling archive status:', error);
      alert(`Failed to update archive status: ${error.message}`);
    }
  }, [updateClient]);

  const formatCurrency = (amount) => {
    if (!amount) return '';
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
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-900">Client Management</h1>
              <p className="text-gray-600">Manage your client relationships and information</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
              <span>Add Client</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            {/* Status Filter - New */}
            <div className="sm:w-64">
              <div className="relative">
                <SafeIcon icon={FiFilter} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input pl-10"
                >
                  <option value="">All Sales Statuses</option>
                  <option value="initial_meeting_completed">Initial Meeting Completed</option>
                  <option value="follow_up_meeting">Follow-up for Meeting</option>
                  <option value="interested_not_ready">Interested but Not Ready</option>
                  <option value="create_proposal">Create Proposal</option>
                  <option value="follow_up_decision">Follow-up for Decision</option>
                  <option value="application_submitted">Application Submitted</option>
                  <option value="client_won">Client (won)</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`btn-secondary flex items-center space-x-2 ${showArchived ? 'bg-primary-100 text-primary-800' : ''}`}
            >
              <SafeIcon icon={showArchived ? FiToggleRight : FiArchive} className="w-4 h-4" />
              <span>{showArchived ? 'Showing Archived' : 'Show Archived'}</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredClients.map((client) => {
            const clientStatus = getClientStatus(client.id);
            return (
              <div
                key={client.id}
                className={`card hover:shadow-medium transition-shadow ${client.isArchived ? 'border-dashed border-gray-300 bg-gray-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
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
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={client.status} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link to={`/clients/${client.id}`} className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                      <SafeIcon icon={FiEye} className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <SafeIcon icon={FiEdit} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sales Status - New */}
                <div className="mb-3">
                  {clientStatus && <StatusBadgeWithIcon status={clientStatus.status} />}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SafeIcon icon={FiMail} className="w-4 h-4" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SafeIcon icon={FiPhone} className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                  {client.address && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <SafeIcon icon={FiMapPin} className="w-4 h-4" />
                      <span>{client.address}</span>
                    </div>
                  )}
                  {client.employerName && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <SafeIcon icon={FiBriefcase} className="w-4 h-4" />
                      <span>{client.employerName}</span>
                    </div>
                  )}
                  {client.targetRevenue && (
                    <div className="flex items-center space-x-2 text-sm text-success-600 font-medium">
                      <SafeIcon icon={FiDollarSign} className="w-4 h-4" />
                      <span>Target Revenue: {formatCurrency(client.targetRevenue)}</span>
                    </div>
                  )}

                  {/* Portal Access Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-600">Portal Access</span>
                    <Toggle
                      enabled={client.hasAccess || false}
                      onChange={() => handleTogglePortalAccess(client.id, client.hasAccess)}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Added {client.createdAt}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* CRM Link - New */}
                    <Link to={`/clients/${client.id}/crm`} className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                      <SafeIcon icon={FiList} className="w-4 h-4" />
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
              </div>
            );
          })}
          {filteredClients.length === 0 && (
            <div className="lg:col-span-3 p-8 text-center bg-white rounded-lg shadow-soft">
              <p className="text-gray-600">No clients found matching your search criteria.</p>
            </div>
          )}
        </motion.div>

        {/* Add Client Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Client"
          size="xl"
        >
          <ClientForm
            onSubmit={handleAddClient}
            onCancel={() => setIsAddModalOpen(false)}
            isEditing={false}
          />
        </Modal>

        {/* Edit Client Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedClient(null);
          }}
          title="Edit Client"
          size="xl"
        >
          {selectedClient && (
            <ClientForm
              initialData={selectedClient}
              onSubmit={handleUpdateClient}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedClient(null);
              }}
              isEditing={true}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ClientManagement;