import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/layout/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiSave, FiDownload, FiPlus, FiTrash2, FiDollarSign, FiTrendingUp, FiShield, FiFileText } = FiIcons;

const FinancialEvaluation = () => {
  const { clientId } = useParams();
  const { clients } = useData();
  const [activeTab, setActiveTab] = useState('cashflow');
  
  const client = clients.find(c => c.id === clientId);

  // Mock financial data
  const [financialData, setFinancialData] = useState({
    cashflow: {
      income: [
        { description: 'Salary', amount: 85000 },
        { description: 'Investment Income', amount: 15000 },
        { description: 'Rental Income', amount: 24000 }
      ],
      expenses: [
        { description: 'Housing', amount: 36000 },
        { description: 'Transportation', amount: 12000 },
        { description: 'Food & Groceries', amount: 8000 },
        { description: 'Insurance', amount: 6000 },
        { description: 'Utilities', amount: 4800 },
        { description: 'Entertainment', amount: 6000 }
      ]
    },
    balanceSheet: {
      assets: [
        { description: 'Primary Residence', amount: 650000 },
        { description: 'Investment Accounts', amount: 350000 },
        { description: 'Retirement Accounts', amount: 280000 },
        { description: 'Cash & Savings', amount: 45000 },
        { description: 'Personal Property', amount: 35000 }
      ],
      liabilities: [
        { description: 'Mortgage', amount: 320000 },
        { description: 'Car Loan', amount: 25000 },
        { description: 'Credit Cards', amount: 8000 },
        { description: 'Student Loans', amount: 15000 }
      ]
    },
    insurance: [
      {
        provider: 'State Farm',
        type: 'Term Life',
        coverage: 500000,
        premium: 2400,
        beneficiary: 'Spouse'
      },
      {
        provider: 'Allstate',
        type: 'Whole Life',
        coverage: 250000,
        premium: 3600,
        beneficiary: 'Children'
      }
    ],
    estate: {
      trusts: [
        {
          name: 'Family Trust',
          type: 'Revocable Living Trust',
          value: 750000,
          beneficiaries: 'Spouse and Children'
        }
      ],
      wills: {
        lastUpdated: '2023-06-15',
        executor: 'John Smith Jr.',
        guardians: 'Jane Smith (sister)'
      },
      comments: 'Estate planning reviewed annually. Consider updating beneficiaries after major life events.'
    }
  });

  const calculateTotals = () => {
    const totalIncome = financialData.cashflow.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = financialData.cashflow.expenses.reduce((sum, item) => sum + item.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    const totalAssets = financialData.balanceSheet.assets.reduce((sum, item) => sum + item.amount, 0);
    const totalLiabilities = financialData.balanceSheet.liabilities.reduce((sum, item) => sum + item.amount, 0);
    const netWorth = totalAssets - totalLiabilities;

    const totalInsuranceCoverage = financialData.insurance.reduce((sum, policy) => sum + policy.coverage, 0);
    const totalPremiums = financialData.insurance.reduce((sum, policy) => sum + policy.premium, 0);

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      totalAssets,
      totalLiabilities,
      netWorth,
      totalInsuranceCoverage,
      totalPremiums
    };
  };

  const totals = calculateTotals();

  const addIncomeItem = () => {
    setFinancialData(prev => ({
      ...prev,
      cashflow: {
        ...prev.cashflow,
        income: [...prev.cashflow.income, { description: '', amount: 0 }]
      }
    }));
  };

  const addExpenseItem = () => {
    setFinancialData(prev => ({
      ...prev,
      cashflow: {
        ...prev.cashflow,
        expenses: [...prev.cashflow.expenses, { description: '', amount: 0 }]
      }
    }));
  };

  const updateIncomeItem = (index, field, value) => {
    setFinancialData(prev => ({
      ...prev,
      cashflow: {
        ...prev.cashflow,
        income: prev.cashflow.income.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const updateExpenseItem = (index, field, value) => {
    setFinancialData(prev => ({
      ...prev,
      cashflow: {
        ...prev.cashflow,
        expenses: prev.cashflow.expenses.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const removeIncomeItem = (index) => {
    setFinancialData(prev => ({
      ...prev,
      cashflow: {
        ...prev.cashflow,
        income: prev.cashflow.income.filter((_, i) => i !== index)
      }
    }));
  };

  const removeExpenseItem = (index) => {
    setFinancialData(prev => ({
      ...prev,
      cashflow: {
        ...prev.cashflow,
        expenses: prev.cashflow.expenses.filter((_, i) => i !== index)
      }
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const tabs = [
    { id: 'cashflow', name: 'Cashflow', icon: FiDollarSign },
    { id: 'balance', name: 'Balance Sheet', icon: FiTrendingUp },
    { id: 'insurance', name: 'Life Insurance', icon: FiShield },
    { id: 'estate', name: 'Estate Planning', icon: FiFileText }
  ];

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
              to={`/clients/${client.id}`}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
              <span>Back to Client Details</span>
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Financial Evaluation</h1>
                <p className="text-gray-600">Client: {client.name}</p>
              </div>
              <div className="flex space-x-3">
                <button className="btn-secondary flex items-center space-x-2">
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button className="btn-primary flex items-center space-x-2">
                  <SafeIcon icon={FiDownload} className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
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
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Income */}
                <div className="card">
                  <div className="card-header">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Income</h3>
                      <button
                        onClick={addIncomeItem}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <SafeIcon icon={FiPlus} className="w-4 h-4" />
                        <span>Add Item</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {financialData.cashflow.income.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateIncomeItem(index, 'description', e.target.value)}
                          className="form-input flex-1"
                          placeholder="Description"
                        />
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateIncomeItem(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="form-input w-32"
                          placeholder="Amount"
                        />
                        <button
                          onClick={() => removeIncomeItem(index)}
                          className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Income:</span>
                        <span className="text-success-600">{formatCurrency(totals.totalIncome)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expenses */}
                <div className="card">
                  <div className="card-header">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
                      <button
                        onClick={addExpenseItem}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <SafeIcon icon={FiPlus} className="w-4 h-4" />
                        <span>Add Item</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {financialData.cashflow.expenses.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateExpenseItem(index, 'description', e.target.value)}
                          className="form-input flex-1"
                          placeholder="Description"
                        />
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateExpenseItem(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="form-input w-32"
                          placeholder="Amount"
                        />
                        <button
                          onClick={() => removeExpenseItem(index)}
                          className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Expenses:</span>
                        <span className="text-danger-600">{formatCurrency(totals.totalExpenses)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Income Summary */}
                <div className="lg:col-span-2">
                  <div className="card bg-gradient-to-r from-primary-50 to-secondary-50">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Net Income Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-2xl font-bold text-success-600">{formatCurrency(totals.totalIncome)}</p>
                          <p className="text-sm text-gray-600">Total Income</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-danger-600">{formatCurrency(totals.totalExpenses)}</p>
                          <p className="text-sm text-gray-600">Total Expenses</p>
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${totals.netIncome >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                            {formatCurrency(totals.netIncome)}
                          </p>
                          <p className="text-sm text-gray-600">Net Income</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'balance' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Assets */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Assets</h3>
                  </div>
                  <div className="space-y-4">
                    {financialData.balanceSheet.assets.map((asset, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{asset.description}</span>
                        <span className="text-success-600 font-semibold">{formatCurrency(asset.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Assets:</span>
                        <span className="text-success-600">{formatCurrency(totals.totalAssets)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liabilities */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Liabilities</h3>
                  </div>
                  <div className="space-y-4">
                    {financialData.balanceSheet.liabilities.map((liability, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{liability.description}</span>
                        <span className="text-danger-600 font-semibold">{formatCurrency(liability.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Liabilities:</span>
                        <span className="text-danger-600">{formatCurrency(totals.totalLiabilities)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Worth Summary */}
                <div className="lg:col-span-2">
                  <div className="card bg-gradient-to-r from-primary-50 to-secondary-50">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Net Worth Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-2xl font-bold text-success-600">{formatCurrency(totals.totalAssets)}</p>
                          <p className="text-sm text-gray-600">Total Assets</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-danger-600">{formatCurrency(totals.totalLiabilities)}</p>
                          <p className="text-sm text-gray-600">Total Liabilities</p>
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${totals.netWorth >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                            {formatCurrency(totals.netWorth)}
                          </p>
                          <p className="text-sm text-gray-600">Net Worth</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'insurance' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Life Insurance Policies */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Life Insurance Policies</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Provider
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Coverage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Annual Premium
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Beneficiary
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {financialData.insurance.map((policy, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {policy.provider}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {policy.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(policy.coverage)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(policy.premium)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {policy.beneficiary}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Coverage</p>
                        <p className="text-xl font-bold text-primary-600">{formatCurrency(totals.totalInsuranceCoverage)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Annual Premiums</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.totalPremiums)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Life Insurance Needs Calculator */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Life Insurance Needs Calculator</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Income Replacement Needs</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Annual Income</span>
                          <span className="font-medium">{formatCurrency(totals.totalIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Years to Replace (20)</span>
                          <span className="font-medium">{formatCurrency(totals.totalIncome * 20)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Education Fund</span>
                          <span className="font-medium">{formatCurrency(200000)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Final Expenses</span>
                          <span className="font-medium">{formatCurrency(25000)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Available Resources</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Existing Life Insurance</span>
                          <span className="font-medium">{formatCurrency(totals.totalInsuranceCoverage)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Liquid Assets</span>
                          <span className="font-medium">{formatCurrency(45000)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Retirement Accounts</span>
                          <span className="font-medium">{formatCurrency(280000)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Additional Coverage Needed:</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(Math.max(0, (totals.totalIncome * 20 + 200000 + 25000) - (totals.totalInsuranceCoverage + 45000 + 280000)))}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'estate' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Trusts */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Trusts</h3>
                  </div>
                  <div className="space-y-4">
                    {financialData.estate.trusts.map((trust, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-gray-900">{trust.name}</p>
                            <p className="text-sm text-gray-600">{trust.type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Value</p>
                            <p className="font-semibold text-gray-900">{formatCurrency(trust.value)}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Beneficiaries</p>
                            <p className="font-medium text-gray-900">{trust.beneficiaries}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wills */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Wills & Testament</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Last Will & Testament</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Last Updated</p>
                          <p className="font-medium text-gray-900">{financialData.estate.wills.lastUpdated}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Executor</p>
                          <p className="font-medium text-gray-900">{financialData.estate.wills.executor}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Guardians for Minor Children</p>
                          <p className="font-medium text-gray-900">{financialData.estate.wills.guardians}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Power of Attorney</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Financial POA</p>
                          <p className="font-medium text-gray-900">Jane Smith (spouse)</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Healthcare POA</p>
                          <p className="font-medium text-gray-900">Jane Smith (spouse)</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Living Will</p>
                          <p className="font-medium text-gray-900">On file</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Estate Planning Comments</h3>
                  </div>
                  <textarea
                    value={financialData.estate.comments}
                    onChange={(e) => setFinancialData(prev => ({
                      ...prev,
                      estate: {
                        ...prev.estate,
                        comments: e.target.value
                      }
                    }))}
                    className="form-input h-32 resize-none"
                    placeholder="Add notes about estate planning strategies, recommendations, or follow-up items..."
                  />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinancialEvaluation;