import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import ProposalPDF from '../components/proposals/ProposalPDF';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiUsers, FiActivity, FiBarChart2, FiDownload, FiBriefcase, FiFileText } = FiIcons;

const ClientDetails = () => {
  const { clientId } = useParams();
  const { clients, proposals, users } = useData();
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [latestProposal, setLatestProposal] = useState(null);
  
  const client = clients.find(c => c.id === clientId);

  // Find the latest proposal for this client
  useEffect(() => {
    if (clientId) {
      const clientProposals = proposals.filter(p => p.clientId === clientId);
      if (clientProposals.length > 0) {
        // Sort by createdAt date (descending) and get the first one
        const sortedProposals = [...clientProposals].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setLatestProposal(sortedProposals[0]);
      }
    }
  }, [clientId, proposals]);

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

  // Calculate financial overview data
  const calculateFinancialOverview = () => {
    if (!client.financialProfile) {
      return { totalAssets: 0, totalLiabilities: 0, netWorth: 0 };
    }

    // Calculate total assets
    const assets = client.financialProfile.assets || {};
    let totalAssets = 0;
    // Sum all asset categories
    Object.values(assets).forEach(category => {
      Object.values(category).forEach(value => {
        totalAssets += parseFloat(value) || 0;
      });
    });

    // Calculate total liabilities
    const liabilities = client.financialProfile.liabilities || {};
    let totalLiabilities = 0;
    // Sum all liability categories
    Object.values(liabilities).forEach(category => {
      if (typeof category === 'object') {
        Object.values(category).forEach(value => {
          totalLiabilities += parseFloat(value) || 0;
        });
      } else {
        totalLiabilities += parseFloat(category) || 0;
      }
    });

    // Calculate net worth
    const netWorth = totalAssets - totalLiabilities;
    return { totalAssets, totalLiabilities, netWorth };
  };

  const financialOverview = calculateFinancialOverview();

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle viewing the latest proposal
  const handleViewProposal = () => {
    if (latestProposal) {
      setIsPDFModalOpen(true);
    }
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
          <div className="mb-6">
            <Link
              to="/clients"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
              <span>Back to Clients</span>
            </Link>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-heading font-bold text-gray-900">Client Details</h1>
              <Link
                to={`/clients/${client.id}/report`}
                className="btn-primary flex items-center space-x-2"
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                <span>View Financial Report</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Client Information */}
            <div className="lg:col-span-2">
              <div className="card mb-6">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
                    <p className="text-gray-600">{client.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          client.status === 'active'
                            ? 'bg-success-100 text-success-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {client.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          client.hasAccess
                            ? 'bg-primary-100 text-primary-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {client.hasAccess ? 'Has Portal Access' : 'No Portal Access'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
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
                      {client.spouse && (
                        <div className="flex items-center space-x-3">
                          <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">Spouse: {client.spouse.name}</span>
                        </div>
                      )}
                      {client.children && client.children.length > 0 && (
                        <div className="flex items-center space-x-3">
                          <SafeIcon icon={FiUsers} className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">
                            {client.children.length} {client.children.length === 1 ? 'child' : 'children'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Overview */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Financial Overview</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialOverview.totalAssets)}</p>
                    <p className="text-sm text-gray-600">Total Assets</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialOverview.totalLiabilities)}</p>
                    <p className="text-sm text-gray-600">Total Liabilities</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className={`text-2xl font-bold ${financialOverview.netWorth >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {formatCurrency(financialOverview.netWorth)}
                    </p>
                    <p className="text-sm text-gray-600">Net Worth</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions & Quick Links */}
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <Link
                    to={`/clients/${client.id}/evaluation`}
                    className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiActivity} className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">Financial Evaluation</p>
                        <p className="text-sm text-gray-500">View or create financial analysis</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link
                    to={`/clients/${client.id}/report`}
                    className="block w-full p-3 text-left bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiBarChart2} className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-primary-900">Financial Report</p>
                        <p className="text-sm text-primary-700">View comprehensive financial report</p>
                      </div>
                    </div>
                  </Link>
                  
                  {latestProposal && (
                    <button
                      onClick={handleViewProposal}
                      className="block w-full p-3 text-left border border-secondary-200 bg-secondary-50 rounded-lg hover:bg-secondary-100 hover:border-secondary-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiFileText} className="w-5 h-5 text-secondary-600" />
                        <div>
                          <p className="font-medium text-secondary-900">View Projection</p>
                          <p className="text-sm text-secondary-700">Latest financial projection</p>
                        </div>
                      </div>
                    </button>
                  )}
                  
                  <Link
                    to={`/proposals`}
                    className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiFileText} className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">All Projections</p>
                        <p className="text-sm text-gray-500">View all financial projections</p>
                      </div>
                    </div>
                  </Link>
                  
                  <button className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiMail} className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">Send Message</p>
                        <p className="text-sm text-gray-500">Contact client directly</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Financial evaluation updated</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-success-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Report generated</p>
                      <p className="text-xs text-gray-500">1 week ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Client profile created</p>
                      <p className="text-xs text-gray-500">{client.createdAt}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Proposal PDF Modal */}
      <Modal 
        isOpen={isPDFModalOpen} 
        onClose={() => setIsPDFModalOpen(false)} 
        title="Strategy Projection" 
        size="full"
      >
        {latestProposal && (
          <div>
            <div className="mb-4 flex justify-end space-x-3 print:hidden">
              <button onClick={() => window.print()} className="btn-secondary flex items-center space-x-2">
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
            <ProposalPDF 
              proposal={latestProposal}
              client={client}
              advisor={users.find(u => u.id === latestProposal.advisorId)}
              carrier={latestProposal.carrier ? { 
                id: latestProposal.carrier,
                name: latestProposal.carrier,
                logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
                rating: 'A+'
              } : null}
              strategy={latestProposal.strategy ? {
                id: latestProposal.strategy,
                name: latestProposal.strategy
              } : null}
              product={latestProposal.productType ? {
                name: latestProposal.productType
              } : null}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientDetails;