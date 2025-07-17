import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../contexts/DataContext';
import { useFinancialAnalysis } from '../contexts/FinancialAnalysisContext';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import ClientForm from '../components/forms/ClientForm';
import ProposalPDF from '../components/proposals/ProposalPDF';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiEdit, FiBarChart2, FiActivity, FiFileText, FiMail, FiPhone, FiMapPin, FiCalendar, FiUsers, FiBriefcase, FiShield, FiStar, FiBuilding, FiDollarSign, FiTrendingUp, FiSettings } = FiIcons;

const ClientPortal = () => {
  const { user } = useAuth();
  const { clients, proposals, users, updateClient } = useData();
  const { analysis, loadAnalysis, loading: analysisLoading } = useFinancialAnalysis();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [latestProposal, setLatestProposal] = useState(null);
  const [advisor, setAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fnaCode, setFnaCode] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claiming, setClaiming] = useState(false);

  // With client scoped data, the first entry is the current user
  const clientData = clients[0];

  useEffect(() => {
    // Load client's financial analysis data
    if (user?.id) {
      loadAnalysis(user.id, false);
    }
  }, [user?.id, loadAnalysis]);

  // Attempt to automatically claim an analysis code stored locally or by email
  useEffect(() => {
    const autoLink = async () => {
      if (analysis || !user?.id) return;

      const stored = localStorage.getItem('fna_code');
      if (stored) {
        await handleClaimCode(stored);
        return;
      }

      if (user.email) {
        const { data } = await supabase
          .from('financial_analyses_pf')
          .select('fna_code')
          .eq('client_email', user.email)
          .is('client_id', null)
          .maybeSingle();
        if (data?.fna_code) {
          await handleClaimCode(data.fna_code);
        }
      }
    };
    autoLink();
  }, [analysis, user]);

  const handleClaimCode = async (code) => {
    if (!code) return;
    setClaiming(true);
    setClaimError('');
    try {
      const { data, error } = await supabase
        .from('financial_analyses_pf')
        .select('*')
        .eq('fna_code', code)
        .maybeSingle();

      if (error || !data) {
        setClaimError('Invalid code.');
        return;
      }

      if (data.client_id && data.client_id !== user.id) {
        setClaimError('This code has already been claimed.');
        return;
      }

      if (!data.client_id) {
        const { error: updateError } = await supabase
          .from('financial_analyses_pf')
          .update({ client_id: user.id, claimed_at: new Date().toISOString() })
          .eq('id', data.id);
        if (updateError) {
          setClaimError('Failed to claim code.');
          return;
        }
      }

      localStorage.setItem('fna_code', code);
      await loadAnalysis(user.id, false);
    } catch (err) {
      setClaimError('Unable to claim code.');
    } finally {
      setClaiming(false);
    }
  };

  // Find advisor and latest proposal
  useEffect(() => {
    if (clientData) {
      setLoading(false);

      // Find the advisor for this client
      const clientAdvisor = users.find(u => u.id === clientData.advisorId);
      setAdvisor(clientAdvisor);

      // Find the latest proposal for this client
      const clientProposals = proposals.filter(p => p.clientId === clientData.id);
      if (clientProposals.length > 0) {
        const sortedProposals = [...clientProposals].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setLatestProposal(sortedProposals[0]);
      }
    }
  }, [clientData, users, proposals]);

  if (loading || analysisLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading your financial dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Link Financial Analysis</h1>
          <p className="text-gray-600 mt-2">Enter the code provided by your financial professional.</p>
          <form onSubmit={(e) => { e.preventDefault(); handleClaimCode(fnaCode); }} className="mt-6 space-y-4">
            <input
              type="text"
              value={fnaCode}
              onChange={(e) => setFnaCode(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="FNA Code"
              required
            />
            {claimError && <p className="text-danger-600 text-sm">{claimError}</p>}
            <button type="submit" className="btn-primary w-full" disabled={claiming}>
              {claiming ? 'Linking...' : 'Link Code'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Client data not found</h1>
            <p className="text-gray-600 mt-2">Please contact your financial professional for assistance.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate financial overview
  const calculateFinancialOverview = () => {
    // Use analysis data for financial overview
    const totalAssets = analysis.assets?.reduce((sum, asset) => sum + parseFloat(asset.amount || 0), 0) || 0;
    const totalLiabilities = analysis.liabilities?.reduce((sum, liability) => sum + parseFloat(liability.amount || 0), 0) || 0;
    const netWorth = totalAssets - totalLiabilities;

    return { totalAssets, totalLiabilities, netWorth };
  };

  const financialOverview = calculateFinancialOverview();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpdateClient = (clientData) => {
    updateClient(user.id, clientData);
    setIsEditModalOpen(false);
  };

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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-gray-900">My Financial Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your financial information and track your progress</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Client Information */}
            <div className="lg:col-span-2">
              {/* Personal Information Card */}
              <div className="card mb-6">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                    <Link to="/profile-settings" className="btn-secondary flex items-center space-x-2">
                      <SafeIcon icon={FiSettings} className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <img src={clientData.avatar} alt={clientData.name} className="w-20 h-20 rounded-full object-cover" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{clientData.name}</h3>
                    <p className="text-gray-600">{clientData.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        Active Client
                      </span>
                      {clientData.hasAccess && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          Portal Access
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiMail} className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{clientData.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiPhone} className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{clientData.phone}</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <SafeIcon icon={FiMapPin} className="w-5 h-5 text-gray-400 mt-0.5" />
                        <span className="text-gray-700">{clientData.address}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">Born: {clientData.dateOfBirth}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">Gender: {clientData.gender}</span>
                      </div>
                      {clientData.maritalStatus && (
                        <div className="flex items-center space-x-3">
                          <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">Marital Status: {clientData.maritalStatus}</span>
                        </div>
                      )}
                      {clientData.employerName && (
                        <div className="flex items-center space-x-3">
                          <SafeIcon icon={FiBriefcase} className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">Employer: {clientData.employerName}</span>
                        </div>
                      )}
                      {clientData.spouse && (
                        <div className="flex items-center space-x-3">
                          <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">Spouse: {clientData.spouse.name}</span>
                        </div>
                      )}
                      {clientData.children && clientData.children.length > 0 && (
                        <div className="flex items-center space-x-3">
                          <SafeIcon icon={FiUsers} className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">
                            {clientData.children.length} {clientData.children.length === 1 ? 'child' : 'children'}
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
                  <div className="text-center p-4 bg-success-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <SafeIcon icon={FiDollarSign} className="w-6 h-6 text-success-500" />
                    </div>
                    <p className="text-2xl font-bold text-success-600">{formatCurrency(financialOverview.totalAssets)}</p>
                    <p className="text-sm text-gray-600">Total Assets</p>
                  </div>

                  <div className="text-center p-4 bg-danger-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-danger-500" />
                    </div>
                    <p className="text-2xl font-bold text-danger-600">{formatCurrency(financialOverview.totalLiabilities)}</p>
                    <p className="text-sm text-gray-600">Total Liabilities</p>
                  </div>

                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <SafeIcon icon={FiDollarSign} className="w-6 h-6 text-primary-500" />
                    </div>
                    <p className={`text-2xl font-bold ${financialOverview.netWorth >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {formatCurrency(financialOverview.netWorth)}
                    </p>
                    <p className="text-sm text-gray-600">Net Worth</p>
                  </div>
                </div>

                {/* Income & Expenses Summary */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Income & Expenses</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-3">Top Income Sources</h5>
                      <div className="space-y-2">
                        {analysis.income_sources && analysis.income_sources
                          .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
                          .slice(0, 3)
                          .map((income, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700">{income.description}</span>
                              <span className="font-medium text-success-600">{formatCurrency(income.amount)}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-800 mb-3">Top Expenses</h5>
                      <div className="space-y-2">
                        {analysis.expenses && analysis.expenses
                          .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
                          .slice(0, 3)
                          .map((expense, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700">{expense.description}</span>
                              <span className="font-medium text-danger-600">{formatCurrency(expense.amount)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <Link
                    to={`/clients/${clientData.id}/report`}
                    className="block w-full p-3 text-left bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiBarChart2} className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-primary-900">View Financial Report</p>
                        <p className="text-sm text-primary-700">Complete financial analysis</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to={`/client-financial-analysis`}
                    className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiActivity} className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">Update Financial Information</p>
                        <p className="text-sm text-gray-500">Edit your financial data</p>
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
                          <p className="font-medium text-secondary-900">View Financial Projection</p>
                          <p className="text-sm text-secondary-700">Latest strategy projection</p>
                        </div>
                      </div>
                    </button>
                  )}

                  <Link
                    to="/profile-settings"
                    className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiSettings} className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">Edit Profile Settings</p>
                        <p className="text-sm text-gray-500">Update your account information</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Financial Goals Summary */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Financial Goals</h3>
                </div>
                <div className="space-y-4">
                  {analysis.financial_goals && analysis.financial_goals.slice(0, 3).map((goal, index) => {
                    const progress = Math.min((parseFloat(goal.currentAmount || 0) / parseFloat(goal.targetAmount)) * 100, 100);
                    return (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{goal.title}</p>
                            <p className="text-xs text-gray-600">Target: {formatCurrency(goal.targetAmount)}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            goal.priority === 'high' ? 'bg-danger-100 text-danger-800' :
                            goal.priority === 'medium' ? 'bg-secondary-100 text-secondary-800' :
                            'bg-success-100 text-success-800'
                          }`}>
                            {goal.priority}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{Math.round(progress)}% complete</span>
                          <span>Target date: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}

                  {(!analysis.financial_goals || analysis.financial_goals.length === 0) && (
                    <div className="p-4 text-center text-gray-500">
                      <p>No financial goals set</p>
                      <Link to="/client-financial-analysis" className="text-primary-600 hover:underline text-sm block mt-2">Add goals</Link>
                    </div>
                  )}

                  {analysis.financial_goals && analysis.financial_goals.length > 3 && (
                    <Link to="/client-financial-analysis" className="text-primary-600 hover:underline text-sm block text-center">
                      View all {analysis.financial_goals.length} goals
                    </Link>
                  )}
                </div>
              </div>

              {/* Financial Professional Info */}
              {advisor && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Your Financial Professional</h3>
                  </div>
                  <div className="text-center">
                    <img
                      src={advisor.avatar}
                      alt={advisor.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
                    />
                    <h4 className="text-lg font-semibold text-gray-900">{advisor.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{advisor.email}</p>
                    <div className="space-y-3 text-left">
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiShield} className="w-4 h-4 text-primary-600" />
                        <span className="text-sm text-gray-700">Licensed Financial Professional</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiBuilding} className="w-4 h-4 text-primary-600" />
                        <span className="text-sm text-gray-700">ProsperityFIN™</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiStar} className="w-4 h-4 text-primary-600" />
                        <span className="text-sm text-gray-700">Dedicated to your financial success</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 btn-primary flex items-center justify-center space-x-2">
                      <SafeIcon icon={FiMail} className="w-4 h-4" />
                      <span>Contact Your Advisor</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Status</span>
                    <span className="px-2 py-1 bg-success-100 text-success-800 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Portal Access</span>
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                      Enabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Client Since</span>
                    <span className="text-sm text-gray-900">{clientData.createdAt}</span>
                  </div>
                  {clientData.nextReviewDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Next Review</span>
                      <span className="text-sm text-gray-900">{clientData.nextReviewDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Client Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Personal Information"
        size="xl"
      >
        <ClientForm
          initialData={clientData}
          onSubmit={handleUpdateClient}
          onCancel={() => setIsEditModalOpen(false)}
          isEditing={true}
        />
      </Modal>

      {/* Proposal PDF Modal */}
      <Modal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        title="Financial Strategy Projection"
        size="full"
      >
        {latestProposal && (
          <div>
            <div className="mb-4 flex justify-end space-x-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="btn-secondary flex items-center space-x-2"
              >
                <SafeIcon icon={FiFileText} className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
            <ProposalPDF
              proposal={latestProposal}
              client={clientData}
              advisor={advisor}
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

export default ClientPortal;