import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../contexts/DataContext';
import { useFinancialAnalysis } from '../contexts/FinancialAnalysisContext';
import useDebounce from '../hooks/useDebounce';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import CashflowSection from '../components/financial/CashflowSection';
import BalanceSheetSection from '../components/financial/BalanceSheetSection';
import InsuranceSection from '../components/financial/InsuranceSection';
import FinancialPlanningSection from '../components/financial/FinancialPlanningSection';
import FinancialGoalsSection from '../components/financial/FinancialGoalsSection';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import logDev from '../utils/logDev';
import * as FiIcons from 'react-icons/fi';

const { FiDollarSign, FiTrendingUp, FiShield, FiFileText, FiTarget, FiSave, FiDownload, FiUser, FiArrowLeft } = FiIcons;

const FinancialAnalysis = () => {
  const { clientId } = useParams(); // Optional - if accessed from client details
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clients } = useData();
  const { analysis, loadAnalysis, saveAnalysis, setAnalysis, loading } = useFinancialAnalysis();
  const [activeTab, setActiveTab] = useState('cashflow');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const debouncedSave = useDebounce(saveAnalysis, 800);

  // Filter clients based on user role
  const availableClients = clients.filter(client => {
    if (user?.role === 'financial_professional') {
      return client.advisorId === user.id;
    }
    return true;
  });

  // Initialize with client from URL params or require selection
  useEffect(() => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setSelectedClient(client);
        loadAnalysis(clientId);
      }
    }
  }, [clientId, clients, loadAnalysis]);

  // Load analysis when client is selected
  useEffect(() => {
    if (selectedClient && !clientId) {
      loadAnalysis(selectedClient.id);
    }
  }, [selectedClient, loadAnalysis, clientId]);

  // When analysis data loads with an existing share code, populate it
  useEffect(() => {
    if (analysis?.fna_code) {
      setGeneratedCode(analysis.fna_code);
    }
  }, [analysis?.fna_code]);

  const tabs = [
    { id: 'cashflow', name: 'Cashflow', icon: FiDollarSign },
    { id: 'balance', name: 'Balance Sheet', icon: FiTrendingUp },
    { id: 'insurance', name: 'Life Insurance', icon: FiShield },
    { id: 'goals', name: 'Financial Goals', icon: FiTarget },
    { id: 'planning', name: 'Estate Planning', icon: FiFileText }
  ];

  const handleSaveAnalysis = async () => {
    if (!selectedClient || !analysis) {
      alert('Please select a client first');
      return;
    }

    setIsSaving(true);
    try {
      logDev('Saving financial analysis to Supabase:', analysis);

      // Prepare the analysis data with required fields
      const analysisData = {
        ...analysis,
        client_id: selectedClient.id,
        created_by: user.id, // Add created_by for RLS
        updated_at: new Date().toISOString()
      };

      // Check if this is an update or new record
      if (analysis.id && !analysis.id.startsWith('new-analysis')) {
        // Update existing record
        const { data, error } = await supabase
          .from('financial_analyses_pf')
          .update(analysisData)
          .eq('id', analysis.id)
          .select();

        if (error) throw error;
        
        logDev('Financial analysis updated successfully in Supabase:', data);
        
        // Update local context with the returned data
        if (data && data.length > 0) {
          await saveAnalysis(data[0]);
        } else {
          await saveAnalysis(analysisData);
        }
      } else {
        // Insert new record
        // Remove any temporary ID
        if (analysisData.id && analysisData.id.startsWith('new-analysis')) {
          delete analysisData.id;
        }

        // Generate a shareable code for the client portal
        const fnaCode = crypto.randomUUID();
        analysisData.fna_code = fnaCode;

        const { data, error } = await supabase
          .from('financial_analyses_pf')
          .insert(analysisData)
          .select();

        if (error) throw error;
        
        logDev('Financial analysis created successfully in Supabase:', data);
        
        // Update local context with the returned data
        if (data && data.length > 0) {
          await saveAnalysis(data[0]);
        } else {
          await saveAnalysis(analysisData);
        }

        // Store generated code so it can be displayed to the advisor
        setGeneratedCode(fnaCode);
        setIsCodeModalOpen(true);
      }

      setHasChanges(false);
      setSaveSuccess(true);
      // Clear success message after 3 seconds but keep generated code
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving financial analysis to Supabase:', error);
      alert(`Error saving analysis: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateReport = () => {
    if (!selectedClient) {
      alert('Please select a client first');
      return;
    }
    // Navigate to the financial report page
    navigate(`/clients/${selectedClient.id}/report`);
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setIsClientModalOpen(false);
    loadAnalysis(client.id);
  };

  const handleDataChange = (section, data) => {
    if (!analysis) return;

    const updatedAnalysis = { ...analysis, [section]: data };

    setAnalysis(updatedAnalysis);
    debouncedSave(updatedAnalysis);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading financial analysis...</p>
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              {clientId && (
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mr-4"
                >
                  <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-heading font-bold text-gray-900">
                  Financial Analysis
                  {selectedClient && (
                    <span className="text-xl text-gray-600 ml-2">- {selectedClient.name}</span>
                  )}
                </h1>
                <p className="text-gray-600 mt-2">
                  Comprehensive financial planning and analysis tool
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {!clientId && (
                <button
                  onClick={() => setIsClientModalOpen(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <SafeIcon icon={FiUser} className="w-4 h-4" />
                  <span>{selectedClient ? selectedClient.name : 'Select Client'}</span>
                </button>
              )}
              <button
                onClick={handleSaveAnalysis}
                disabled={!selectedClient || !hasChanges || isSaving}
                className="btn-secondary flex items-center space-x-2"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={!selectedClient}
                className="btn-primary flex items-center space-x-2"
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
              {saveSuccess && (
                <span className="px-3 py-1 bg-success-100 text-success-800 rounded-lg text-sm">
                  Analysis saved successfully!
                </span>
              )}
              {generatedCode && (
                <span className="px-3 py-1 bg-primary-50 text-primary-800 rounded-lg text-sm">
                  Share code with client: <strong>{generatedCode}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Client Selection Notice */}
          {!selectedClient && (
            <div className="mb-6 p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
              <p className="text-secondary-800 font-medium">
                Please select a client to begin financial analysis
              </p>
            </div>
          )}

          {/* Tab Navigation */}
          {selectedClient && (
            <>
              <div className="border-b border-gray-200 mb-8 overflow-x-auto">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      <SafeIcon icon={tab.icon} className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'cashflow' && analysis && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CashflowSection
                      incomeSources={analysis.income_sources || []}
                      expenses={analysis.expenses || []}
                      onIncomeChange={(sources) => handleDataChange('income_sources', sources)}
                      onExpenseChange={(expenses) => handleDataChange('expenses', expenses)}
                    />
                  </motion.div>
                )}

                {activeTab === 'balance' && analysis && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BalanceSheetSection
                      assets={analysis.assets || []}
                      liabilities={analysis.liabilities || []}
                      onAssetChange={(assets) => handleDataChange('assets', assets)}
                      onLiabilityChange={(liabilities) => handleDataChange('liabilities', liabilities)}
                    />
                  </motion.div>
                )}

                {activeTab === 'insurance' && analysis && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InsuranceSection
                      policies={analysis.insurance_policies || []}
                      onPoliciesChange={(policies) => handleDataChange('insurance_policies', policies)}
                      needsCalculator={analysis.insurance_calculator || {
                        annualIncome: 0,
                        yearsToReplace: 20,
                        finalExpenses: 25000,
                        educationFund: 0,
                        existingCoverage: 0,
                        liquidAssets: 0,
                        retirementAccounts: 0
                      }}
                      onNeedsCalculatorChange={(calculator) => handleDataChange('insurance_calculator', calculator)}
                    />
                  </motion.div>
                )}

                {activeTab === 'goals' && analysis && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FinancialGoalsSection
                      goals={analysis.financial_goals || []}
                      onGoalsChange={(goals) => handleDataChange('financial_goals', goals)}
                    />
                  </motion.div>
                )}

                {activeTab === 'planning' && analysis && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FinancialPlanningSection
                      checklist={analysis.estate_checklist || {
                        will: { completed: false, lastUpdated: '', notes: '' },
                        powerOfAttorney: { completed: false, lastUpdated: '', notes: '' },
                        healthcareDirective: { completed: false, lastUpdated: '', notes: '' },
                        trust: { completed: false, lastUpdated: '', notes: '' },
                        beneficiaryDesignations: { completed: false, lastUpdated: '', notes: '' },
                        guardianship: { completed: false, lastUpdated: '', notes: '' },
                        emergencyFund: { completed: false, lastUpdated: '', notes: '' },
                        taxPlanning: { completed: false, lastUpdated: '', notes: '' }
                      }}
                      onChecklistChange={(checklist) => handleDataChange('estate_checklist', checklist)}
                      legacy_wishes={analysis.legacy_wishes || ''}
                      onLegacyWishesChange={(wishes) => handleDataChange('legacy_wishes', wishes)}
                    />
                  </motion.div>
                )}
              </div>
            </>
          )}

          {/* Bottom Save Button */}
          {hasChanges && selectedClient && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <button
                onClick={handleSaveAnalysis}
                disabled={isSaving}
                className="btn-primary flex items-center space-x-2 shadow-lg"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Client Selection Modal */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Select Client"
        size="md"
      >
        <div className="space-y-4">
          {availableClients.map((client) => (
            <button
              key={client.id}
              onClick={() => handleClientSelect(client)}
              className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <img src={client.avatar} alt={client.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.email}</p>
                </div>
              </div>
            </button>
          ))}
          {availableClients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No clients available</p>
            </div>
          )}
        </div>
      </Modal>

      {/* FNA Code Modal */}
      <Modal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        title="Share Code"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <p className="text-gray-700">Provide this code to your client:</p>
          <div className="font-mono text-lg p-2 bg-gray-100 rounded-lg break-all">
            {generatedCode}
          </div>
          <div className="flex justify-center space-x-4">
            <button onClick={handleCopyCode} className="btn-primary">Copy</button>
            <button onClick={() => setIsCodeModalOpen(false)} className="btn-secondary">Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FinancialAnalysis;
