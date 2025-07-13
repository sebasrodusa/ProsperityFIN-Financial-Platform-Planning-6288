import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiDollarSign } = FiIcons;

const DEFAULT_ITEM = { description: '', amount: 0 };

const FinancialEvaluationForm = ({ 
  financialData, 
  setFinancialData, 
  activeTab, 
  formatCurrency 
}) => {
  // Memoized calculations for readOnly values
  const totals = useMemo(() => ({
    totalIncome: financialData.cashflow.income.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0), 
      0
    ),
    totalExpenses: financialData.cashflow.expenses.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0), 
      0
    )
  }), [financialData.cashflow.income, financialData.cashflow.expenses]);

  const netIncome = useMemo(() => 
    totals.totalIncome - totals.totalExpenses,
    [totals.totalIncome, totals.totalExpenses]
  );

  // Form handlers with validation
  const addIncomeItem = () => {
    setFinancialData(prev => ({
      ...prev,
      cashflow: {
        ...prev.cashflow,
        income: [...prev.cashflow.income, { ...DEFAULT_ITEM }]
      }
    }));
  };

  const addExpenseItem = () => {
    setFinancialData(prev => ({
      ...prev,
      cashflow: {
        ...prev.cashflow,
        expenses: [...prev.cashflow.expenses, { ...DEFAULT_ITEM }]
      }
    }));
  };

  const updateIncomeItem = (index, field, value) => {
    setFinancialData(prev => ({
      ...prev,
      cashflow: {
        ...prev.cashflow,
        income: prev.cashflow.income.map((item, i) => 
          i === index ? { 
            ...item, 
            [field]: field === 'amount' ? parseFloat(value) || 0 : value 
          } : item
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
          i === index ? { 
            ...item, 
            [field]: field === 'amount' ? parseFloat(value) || 0 : value 
          } : item
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

  // Effect to update derived values when inputs change
  useEffect(() => {
    setFinancialData(prev => ({
      ...prev,
      cashflow: {
        ...prev.cashflow,
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        netIncome
      }
    }));
  }, [totals.totalIncome, totals.totalExpenses, netIncome]);

  if (activeTab !== 'cashflow') {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ duration: 0.3 }} 
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      {/* Income Section */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Income</h3>
            <button 
              onClick={addIncomeItem} 
              className="btn-primary flex items-center space-x-2"
              type="button"
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
                onChange={(e) => updateIncomeItem(index, 'amount', e.target.value)}
                className="form-input w-32"
                placeholder="Amount"
                min="0"
                step="0.01"
              />
              <button
                type="button"
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

      {/* Expenses Section */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
            <button
              onClick={addExpenseItem}
              className="btn-primary flex items-center space-x-2"
              type="button"
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
                onChange={(e) => updateExpenseItem(index, 'amount', e.target.value)}
                className="form-input w-32"
                placeholder="Amount"
                min="0"
                step="0.01"
              />
              <button
                type="button"
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
                <p className="text-2xl font-bold text-success-600">
                  {formatCurrency(totals.totalIncome)}
                </p>
                <p className="text-sm text-gray-600">Total Income</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-danger-600">
                  {formatCurrency(totals.totalExpenses)}
                </p>
                <p className="text-sm text-gray-600">Total Expenses</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {formatCurrency(netIncome)}
                </p>
                <p className="text-sm text-gray-600">Net Income</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FinancialEvaluationForm;