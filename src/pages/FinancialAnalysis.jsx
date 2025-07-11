import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import CashflowSection from '../components/financial/CashflowSection';
import BalanceSheetSection from '../components/financial/BalanceSheetSection';
import InsuranceSection from '../components/financial/InsuranceSection';
import FinancialPlanningSection from '../components/financial/FinancialPlanningSection';
import FinancialGoalsSection from '../components/financial/FinancialGoalsSection';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDollarSign, FiTrendingUp, FiShield, FiFileText, FiTarget, FiSave, FiDownload, FiPlus, FiUser } = FiIcons;

const FinancialAnalysis = () => {
  const { user } = useAuth();
  const { clients } = useData();
  const [activeTab, setActiveTab] = useState('cashflow');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Financial data state
  const [financialData, setFinancialData] = useState({
    incomeSources: [],
    expenses: [],
    assets: [],
    liabilities: [],
    insurancePolicies: [],
    insuranceCalculator: {
      annualIncome: 0,
      yearsToReplace: 20,
      finalExpenses: 25000,
      educationFund: 0,
      existingCoverage: 0,
      liquidAssets: 0,
      retirementAccounts: 0
    },
    financialGoals: [],
    estateChecklist: {
      will: { completed: false, lastUpdated: '', notes: '' },
      powerOfAttorney: { completed: false, lastUpdated: '', notes: '' },
      healthcareDirective: { completed: false, lastUpdated: '', notes: '' },
      trust: { completed: false, lastUpdated: '', notes: '' },
      beneficiaryDesignations: { completed: false, lastUpdated: '', notes: '' },
      guardianship: { completed: false, lastUpdated: '', notes: '' },
      emergencyFund: { completed: false, lastUpdated: '', notes: '' },
      taxPlanning: { completed: false, lastUpdated: '', notes: '' }
    },
    legacyWishes: ''
  });

  // Filter clients based on user role
  const availableClients = clients.filter(client => {
    if (user?.role === 'financial_professional') {
      return client.advisorId === user.id;
    }
    return true;
  });

  const tabs = [
    { id: 'cashflow', name: 'Cashflow', icon: FiDollarSign },
    { id: 'balance', name: 'Balance Sheet', icon: FiTrendingUp },
    { id: 'insurance', name: 'Life Insurance', icon: FiShield },
    { id: 'goals', name: 'Financial Goals', icon: FiTarget },
    { id: 'planning', name: 'Estate Planning', icon: FiFileText }
  ];

  const handleSaveAnalysis = () => {
    if (!selectedClient) {
      alert('Please select a client first');
      return;
    }
    
    // Here you would save to Supabase
    console.log('Saving analysis for client:', selectedClient.id, financialData);
    alert('Analysis saved successfully!');
  };

  const handleDownloadPDF = () => {
    if (!selectedClient) {
      alert('Please select a client first');
      return;
    }
    
    // Here you would generate and download PDF
    console.log('Generating PDF for client:', selectedClient.id);
    alert('PDF generation feature coming soon!');
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Financial Analysis</h1>
                <p className="text-gray-600 mt-2">
                  Comprehensive financial planning and analysis tool
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <button
                  onClick={() => setIsClientModalOpen(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <SafeIcon icon={FiUser} className="w-4 h-4" />
                  <span>{selectedClient ? selectedClient.name : 'Select Client'}</span>
                </button>
                
                <button
                  onClick={handleSaveAnalysis}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  <span>Save</span>
                </button>
                
                <button
                  onClick={handleDownloadPDF}
                  className="btn-primary flex items-center space-x-2"
                >
                  <SafeIcon icon={FiDownload} className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
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
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'cashflow' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CashflowSection
                  incomeSources={financialData.incomeSources}
                  expenses={financialData.expenses}
                  onIncomeChange={(sources) => setFinancialData({ ...financialData, incomeSources: sources })}
                  onExpenseChange={(expenses) => setFinancialData({ ...financialData, expenses })}
                />
              </motion.div>
            )}

            {activeTab === 'balance' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BalanceSheetSection
                  assets={financialData.assets}
                  liabilities={financialData.liabilities}
                  onAssetChange={(assets) => setFinancialData({ ...financialData, assets })}
                  onLiabilityChange={(liabilities) => setFinancialData({ ...financialData, liabilities })}
                />
              </motion.div>
            )}

            {activeTab === 'insurance' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <InsuranceSection
                  policies={financialData.insurancePolicies}
                  onPoliciesChange={(policies) => setFinancialData({ ...financialData, insurancePolicies: policies })}
                  needsCalculator={financialData.insuranceCalculator}
                  onNeedsCalculatorChange={(calculator) => setFinancialData({ ...financialData, insuranceCalculator: calculator })}
                />
              </motion.div>
            )}

            {activeTab === 'goals' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FinancialGoalsSection
                  goals={financialData.financialGoals}
                  onGoalsChange={(goals) => setFinancialData({ ...financialData, financialGoals: goals })}
                />
              </motion.div>
            )}

            {activeTab === 'planning' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FinancialPlanningSection
                  checklist={financialData.estateChecklist}
                  onChecklistChange={(checklist) => setFinancialData({ ...financialData, estateChecklist: checklist })}
                  legacyWishes={financialData.legacyWishes}
                  onLegacyWishesChange={(wishes) => setFinancialData({ ...financialData, legacyWishes: wishes })}
                />
              </motion.div>
            )}
          </div>
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
              onClick={() => {
                setSelectedClient(client);
                setIsClientModalOpen(false);
              }}
              className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={client.avatar}
                  alt={client.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
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
    </div>
  );
};

export default FinancialAnalysis;