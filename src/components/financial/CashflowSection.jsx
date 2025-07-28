import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiDollarSign } = FiIcons;

const INCOME_CATEGORIES = [
  { id: 'primary', label: 'Primary Income' },
  { id: 'spouse', label: 'Spouse Income' },
  { id: 'business', label: 'Business Income' },
  { id: 'real_estate', label: 'Real Estate Income' },
  { id: 'investment', label: 'Investment Income' },
  { id: 'other', label: 'Other' }
];

const EXPENSE_CATEGORIES = [
  {
    id: 'housing',
    label: 'Housing',
    items: [
      { id: 'mortgage', label: 'Mortgage or Rent' },
      { id: 'home_insurance', label: 'Home Insurance' },
      { id: 'electricity', label: 'Home Electricity' },
      { id: 'utilities', label: 'Water, Gas & Sewer' }
    ]
  },
  {
    id: 'transportation',
    label: 'Transportation',
    items: [
      { id: 'auto_loan', label: 'Auto Loan / Lease' },
      { id: 'car_insurance', label: 'Car Insurance' },
      { id: 'gas_toll', label: 'Gas, Toll and Parking' }
    ]
  },
  {
    id: 'living',
    label: 'Living Expenses',
    items: [
      { id: 'groceries', label: 'Groceries' },
      { id: 'household', label: 'Household Expenses' },
      { id: 'dining', label: 'Dining Out' },
      { id: 'entertainment', label: 'Entertainment' }
    ]
  },
  {
    id: 'health',
    label: 'Healthcare',
    items: [
      { id: 'health_insurance', label: 'Health Insurance' },
      { id: 'prescriptions', label: 'Prescriptions' }
    ]
  },
  {
    id: 'family',
    label: 'Family',
    items: [
      { id: 'childcare', label: 'Child Sitting & Care' },
      { id: 'education', label: 'Educational' },
      { id: 'alimony', label: 'Alimony & Child Support' }
    ]
  },
  {
    id: 'debt',
    label: 'Debt Payments',
    items: [
      { id: 'credit_card', label: 'Credit Card' },
      { id: 'personal_loans', label: 'Personal Loans' }
    ]
  },
  {
    id: 'communication',
    label: 'Communication & Services',
    items: [
      { id: 'cable_internet', label: 'Cable & Internet' },
      { id: 'mobile', label: 'Mobile Phone' },
      { id: 'subscriptions', label: 'Subscriptions' }
    ]
  },
  {
    id: 'personal',
    label: 'Personal Care',
    items: [
      { id: 'gym', label: 'Gym' },
      { id: 'hair_salon', label: 'Hair Salon' },
      { id: 'personal_care', label: 'Personal Care' }
    ]
  },
  {
    id: 'discretionary',
    label: 'Discretionary',
    items: [
      { id: 'travel', label: 'Travel & Vacation' },
      { id: 'charity', label: 'Tithe & Charity' },
      { id: 'other', label: 'Others' }
    ]
  }
];

const CashflowSection = ({ incomeSources = [], expenses = [], onIncomeChange, onExpenseChange }) => {
  const [newIncomeSource, setNewIncomeSource] = useState({
    category: '',
    amount: '',
    frequency: 'monthly'
  });

  const [incomeErrors, setIncomeErrors] = useState({
    category: false,
    amount: false
  });

  const totalIncome = incomeSources.reduce((sum, source) => sum + parseFloat(source.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
  const netIncome = totalIncome - totalExpenses;

  const handleAddIncome = useCallback(() => {
    const categoryError = !newIncomeSource.category;
    const amountError = !newIncomeSource.amount;
    setIncomeErrors({ category: categoryError, amount: amountError });

    if (categoryError || amountError) {
      return;
    }

    const categoryLabel = INCOME_CATEGORIES.find(cat => cat.id === newIncomeSource.category)?.label;
    const parsedAmount = parseFloat(newIncomeSource.amount);
    const newIncomeSources = [
      ...incomeSources,
      {
        ...newIncomeSource,
        amount: isNaN(parsedAmount) ? 0 : parsedAmount,
        id: Date.now().toString(),
        description: categoryLabel
      }
    ];
    onIncomeChange(newIncomeSources);
    setNewIncomeSource({
      category: '',
      amount: '',
      frequency: 'monthly'
    });
  }, [newIncomeSource, incomeSources, onIncomeChange]);

  const handleExpenseChange = (categoryId, itemId, value) => {
    const updatedExpenses = [...expenses];
    const expenseIndex = updatedExpenses.findIndex(exp => exp.id === `${categoryId}_${itemId}`);
    
    if (expenseIndex >= 0) {
      updatedExpenses[expenseIndex] = {
        ...updatedExpenses[expenseIndex],
        amount: value
      };
    } else {
      const category = EXPENSE_CATEGORIES.find(cat => cat.id === categoryId);
      const item = category.items.find(i => i.id === itemId);
      updatedExpenses.push({
        id: `${categoryId}_${itemId}`,
        category: category.label,
        description: item.label,
        amount: value,
        frequency: 'monthly'
      });
    }
    
    onExpenseChange(updatedExpenses.filter(exp => exp.amount && parseFloat(exp.amount) > 0));
  };

  const getExpenseAmount = (categoryId, itemId) => {
    const expense = expenses.find(exp => exp.id === `${categoryId}_${itemId}`);
    return expense?.amount || '';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleIncomeUpdate = (id, field, value) => {
    const updated = incomeSources.map(source => 
      source.id === id ? { ...source, [field]: value } : source
    );
    onIncomeChange(updated);
  };

  const handleIncomeDelete = (id) => {
    const updated = incomeSources.filter(source => source.id !== id);
    onIncomeChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Income Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Income Sources</h3>
        </div>
        <div className="space-y-4">
          {incomeSources.map((source) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="flex-1">
                <span className="text-gray-700">{source.description}</span>
              </div>
              <input
                type="number"
                value={source.amount}
                onChange={(e) => handleIncomeUpdate(source.id, 'amount', e.target.value)}
                onWheel={(e) => e.target.blur()}
                className="form-input w-32"
                placeholder="Amount"
              />
              <select
                value={source.frequency}
                onChange={(e) => handleIncomeUpdate(source.id, 'frequency', e.target.value)}
                className="form-input w-32"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
                <option value="weekly">Weekly</option>
              </select>
              <button
                onClick={() => handleIncomeDelete(source.id)}
                className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            </motion.div>
          ))}

          {/* Add new income source */}
          <div className="flex items-center space-x-4">
            <select
              aria-label="Select Income Type"
              value={newIncomeSource.category}
              onChange={(e) => {
                setNewIncomeSource({ ...newIncomeSource, category: e.target.value });
                if (incomeErrors.category && e.target.value) {
                  setIncomeErrors(prev => ({ ...prev, category: false }));
                }
              }}
              className={`form-input flex-1 ${incomeErrors.category ? 'border-danger-300' : ''}`}
            >
              <option value="">Select Income Type</option>
              {INCOME_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
              <input
                type="number"
                value={newIncomeSource.amount}
                onChange={(e) => {
                  setNewIncomeSource({ ...newIncomeSource, amount: e.target.value });
                  if (incomeErrors.amount && e.target.value) {
                    setIncomeErrors(prev => ({ ...prev, amount: false }));
                  }
                }}
                onWheel={(e) => e.target.blur()}
                className={`form-input w-32 ${incomeErrors.amount ? 'border-danger-300' : ''}`}
                placeholder="Amount"
              />
            <select
              value={newIncomeSource.frequency}
              onChange={(e) => setNewIncomeSource({...newIncomeSource, frequency: e.target.value})}
              className="form-input w-32"
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
              <option value="weekly">Weekly</option>
            </select>
            <button
              onClick={handleAddIncome}
              disabled={!newIncomeSource.category || !newIncomeSource.amount}
              className={`p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors ${(!newIncomeSource.category || !newIncomeSource.amount) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
            </button>
            {(incomeErrors.category || incomeErrors.amount) && (
              <p className="text-danger-700 text-sm ml-2">Both fields are required</p>
            )}
          </div>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Expenses</h3>
        </div>
        <div className="space-y-6">
          {EXPENSE_CATEGORIES.map((category) => (
            <div key={category.id} className="space-y-4">
              <h4 className="font-medium text-gray-900">{category.label}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{item.label}</span>
                    <input
                      type="number"
                      value={getExpenseAmount(category.id, item.id)}
                      onChange={(e) => handleExpenseChange(category.id, item.id, e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      className="form-input w-32"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Section */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-success-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-danger-600">{formatCurrency(totalExpenses)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Net Income</p>
            <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {formatCurrency(netIncome)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashflowSection;