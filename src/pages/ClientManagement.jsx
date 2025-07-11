import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import ClientForm from '../components/forms/ClientForm';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiUsers, FiBriefcase } = FiIcons;

const ClientManagement = () => {
  const { user } = useAuth();
  const { clients, addClient, updateClient, deleteClient } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (user?.role === 'financial_professional') {
      return matchesSearch && client.advisorId === user.id;
    }
    return matchesSearch;
  });

  const handleAddClient = useCallback((clientData) => {
    addClient(clientData);
    setIsAddModalOpen(false);
  }, [addClient]);

  const handleUpdateClient = useCallback((clientData) => {
    updateClient(selectedClient.id, clientData);
    setIsEditModalOpen(false);
    setSelectedClient(null);
  }, [updateClient, selectedClient]);

  const handleEdit = useCallback((client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClient(clientId);
    }
  }, [deleteClient]);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedClient(null);
  }, []);

  return (
    <>
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
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredClients.map((client) => (
            <div key={client.id} className="card hover:shadow-medium transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <StatusBadge status={client.status} />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/clients/${client.id}`}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
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

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <SafeIcon icon={FiMail} className="w-4 h-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <SafeIcon icon={FiPhone} className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <SafeIcon icon={FiMapPin} className="w-4 h-4" />
                  <span>{client.address}</span>
                </div>
                {client.employerName && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SafeIcon icon={FiBriefcase} className="w-4 h-4" />
                    <span>{client.employerName}</span>
                  </div>
                )}
                {client.spouse && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SafeIcon icon={FiUser} className="w-4 h-4" />
                    <span>Spouse: {client.spouse.name}</span>
                  </div>
                )}
                {client.children && client.children.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SafeIcon icon={FiUsers} className="w-4 h-4" />
                    <span>{client.children.length} children</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiCalendar} className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Added {client.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Add Client Modal */}
        {isAddModalOpen && (
          <Modal
            isOpen={isAddModalOpen}
            onClose={handleCloseAddModal}
            title="Add New Client"
            size="xl"
          >
            <ClientForm
              onSubmit={handleAddClient}
              onCancel={handleCloseAddModal}
              isEditing={false}
            />
          </Modal>
        )}

        {/* Edit Client Modal */}
        {isEditModalOpen && selectedClient && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            title="Edit Client"
            size="xl"
          >
            <ClientForm
              initialData={selectedClient}
              onSubmit={handleUpdateClient}
              onCancel={handleCloseEditModal}
              isEditing={true}
            />
          </Modal>
        )}
      </div>
    </>
  );
};

export default ClientManagement;