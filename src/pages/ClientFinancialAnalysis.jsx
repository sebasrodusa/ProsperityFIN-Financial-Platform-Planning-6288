import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useFinancialAnalysis } from '../contexts/FinancialAnalysisContext';
import Navbar from '../components/layout/Navbar';
import CashflowSection from '../components/financial/CashflowSection';
import BalanceSheetSection from '../components/financial/BalanceSheetSection';
import InsuranceSection from '../components/financial/InsuranceSection';
import FinancialGoalsSection from '../components/financial/FinancialGoalsSection';
import FinancialPlanningSection from '../components/financial/FinancialPlanningSection';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDollarSign, FiTrendingUp, FiShield, FiTarget, FiFileText, FiSave, FiArrowLeft } = FiIcons;

const ClientFinancialAnalysis = () => {
  const { user } = useAuth();
  const { analysis, loadAnalysis, saveAnalysis, loading } = useFinancialAnalysis();
  const [activeTab, setActiveTab] = useState('cashflow');
  const [hasChanges, setHasChanges] = useState(false);

  // Load the client's financial analysis data
  useEffect(() => {
    if (user?.id) {
      loadAnalysis(user.id);
    }
  }, [user?.id, loadAnalysis]);

  const tabs = [
    { id: 'cashflow', name: 'Income & Expenses', icon: FiDollarSign },
    { id: 'balance', name: 'Assets & Liabilities', icon: FiTrendingUp },
    { id: 'insurance', name: 'Insurance', icon: FiShield },
    { id: 'goals', name: 'Financial Goals', icon: FiTarget },
    { id: 'planning', name: 'Estate Planning', icon: FiFileText }
  ];

  const handleSave = async () => {
    try {
      await saveAnalysis(analysis);
      setHasChanges(false);
      alert('Your financial information has been saved successfully!');
    } catch (error) {
      alert('Error saving your information. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading your financial information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">No financial data found</h1>
            <p className="text-gray-600 mt-2">Please contact your financial professional to set up your financial analysis.</p>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">My Financial Information</h1>
                <p className="text-gray-600 mt-2">
                  Update your financial details to help your advisor provide better recommendations
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                {hasChanges && (
                  <span className="text-sm text-orange-600 font-medium">
                    Unsaved changes
                  </span>
                )}
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center space-x-2"
                  disabled={!hasChanges}
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>

          {/* Information Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <SafeIcon icon={FiShield} className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Secure & Confidential</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Your financial information is encrypted and only accessible by you and your assigned financial professional.
                  Keeping this information current helps us provide you with the most accurate financial advice.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
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
                  incomeSources={analysis.income_sources_fa7 || []}
                  expenses={analysis.expenses_fa7 || []}
                  onIncomeChange={(sources) => {
                    analysis.income_sources_fa7 = sources;
                    setHasChanges(true);
                  }}
                  onExpenseChange={(expenses) => {
                    analysis.expenses_fa7 = expenses;
                    setHasChanges(true);
                  }}
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
                  assets={analysis.assets_fa7 || []}
                  liabilities={analysis.liabilities_fa7 || []}
                  onAssetChange={(assets) => {
                    analysis.assets_fa7 = assets;
                    setHasChanges(true);
                  }}
                  onLiabilityChange={(liabilities) => {
                    analysis.liabilities_fa7 = liabilities;
                    setHasChanges(true);
                  }}
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
                  policies={analysis.insurance_policies_fa7 || []}
                  onPoliciesChange={(policies) => {
                    analysis.insurance_policies_fa7 = policies;
                    setHasChanges(true);
                  }}
                  needsCalculator={analysis.insuranceCalculator || {
                    annualIncome: 0,
                    yearsToReplace: 20,
                    finalExpenses: 25000,
                    educationFund: 0,
                    existingCoverage: 0,
                    liquidAssets: 0,
                    retirementAccounts: 0
                  }}
                  onNeedsCalculatorChange={(calculator) => {
                    analysis.insuranceCalculator = calculator;
                    setHasChanges(true);
                  }}
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
                  goals={analysis.financial_goals_fa7 || []}
                  onGoalsChange={(goals) => {
                    analysis.financial_goals_fa7 = goals;
                    setHasChanges(true);
                  }}
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
                  onChecklistChange={(checklist) => {
                    analysis.estate_checklist = checklist;
                    setHasChanges(true);
                  }}
                  legacyWishes={analysis.legacyWishes || ''}
                  onLegacyWishesChange={(wishes) => {
                    analysis.legacyWishes = wishes;
                    setHasChanges(true);
                  }}
                />
              </motion.div>
            )}
          </div>

          {/* Bottom Save Button */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <button
                onClick={handleSave}
                className="btn-primary flex items-center space-x-2 shadow-lg"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ClientFinancialAnalysis;