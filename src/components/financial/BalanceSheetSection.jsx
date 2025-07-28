import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiDollarSign } = FiIcons;

const ASSET_CATEGORIES = [
  { id: 'real_estate', label: 'Real Estate' },
  { id: 'investments', label: 'Investments' },
  { id: 'checking', label: 'Checking' },
  { id: 'savings', label: 'Savings' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'retirement', label: 'Retirement Accounts' },
  { id: '401k_403b', label: '401k or 403b' },
  { id: 'ira_sep', label: 'IRA or SEP IRA' },
  { id: 'roth_ira', label: 'Roth IRA' },
  { id: 'cash_value_insurance', label: 'Cash Value Insurance' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'mutual_funds', label: 'Mutual Funds' },
  { id: 'etf', label: 'ETF' },
  { id: 'other', label: 'Other' }
];

const BalanceSheetSection = ({ assets = [], liabilities = [], onAssetChange, onLiabilityChange }) => {
  const [newLiability, setNewLiability] = useState({
    category: '',
    description: '',
    amount: '',
    interestRate: ''
  });

  const totalAssets = assets.reduce((sum, asset) => sum + parseFloat(asset.amount || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + parseFloat(liability.amount || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleAssetChange = (categoryId, value) => {
    const updatedAssets = [...assets];
    const assetIndex = updatedAssets.findIndex(a => a.category === categoryId);
    
    if (assetIndex >= 0) {
      updatedAssets[assetIndex] = {
        ...updatedAssets[assetIndex],
        amount: value
      };
    } else {
      const category = ASSET_CATEGORIES.find(cat => cat.id === categoryId);
      updatedAssets.push({
        id: Date.now(),
        category: categoryId,
        description: category.label,
        amount: value
      });
    }
    
    onAssetChange(updatedAssets.filter(asset => asset.amount && parseFloat(asset.amount) > 0));
  };

  const getAssetAmount = (categoryId) => {
    const asset = assets.find(a => a.category === categoryId);
    return asset?.amount || '';
  };

  const handleAddLiability = useCallback(() => {
    if (newLiability.description && newLiability.amount && newLiability.category) {
      const newLiabilities = [...liabilities, {
        ...newLiability,
        id: Date.now()
      }];
      onLiabilityChange(newLiabilities);
      setNewLiability({
        category: '',
        description: '',
        amount: '',
        interestRate: ''
      });
    }
  }, [newLiability, liabilities, onLiabilityChange]);

  const handleUpdateLiability = (id, field, value) => {
    const updated = liabilities.map(liability => 
      liability.id === id ? { ...liability, [field]: value } : liability
    );
    onLiabilityChange(updated);
  };

  const handleDeleteLiability = (id) => {
    const updated = liabilities.filter(liability => liability.id !== id);
    onLiabilityChange(updated);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Assets Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Assets</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ASSET_CATEGORIES.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{category.label}</span>
                <input
                  type="number"
                  value={getAssetAmount(category.id)}
                  onChange={(e) => handleAssetChange(category.id, e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="form-input w-40"
                  placeholder="Value"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Liabilities Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Liabilities</h3>
        </div>
        <div className="space-y-4">
          {liabilities.map((liability) => (
            <motion.div
              key={liability.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4"
            >
              <select
                value={liability.category}
                onChange={(e) => handleUpdateLiability(liability.id, 'category', e.target.value)}
                className="form-input w-40"
              >
                <option value="">Select category</option>
                <option value="mortgage">Mortgage</option>
                <option value="auto_loan">Auto Loan</option>
                <option value="student_loan">Student Loan</option>
                <option value="credit_card">Credit Card</option>
                <option value="personal_loan">Personal Loan</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                value={liability.description}
                onChange={(e) => handleUpdateLiability(liability.id, 'description', e.target.value)}
                className="form-input flex-1"
                placeholder="Liability description"
              />
              <input
                type="number"
                value={liability.amount}
                onChange={(e) => handleUpdateLiability(liability.id, 'amount', e.target.value)}
                onWheel={(e) => e.target.blur()}
                className="form-input w-32"
                placeholder="Amount"
              />
              <input
                type="number"
                value={liability.interestRate}
                onChange={(e) => handleUpdateLiability(liability.id, 'interestRate', e.target.value)}
                onWheel={(e) => e.target.blur()}
                className="form-input w-32"
                placeholder="Interest Rate %"
              />
              <button
                onClick={() => handleDeleteLiability(liability.id)}
                className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            </motion.div>
          ))}

          {/* Add new liability */}
          <div className="flex items-center space-x-4">
            <select
              value={newLiability.category}
              onChange={(e) => setNewLiability({...newLiability, category: e.target.value})}
              className="form-input w-40"
            >
              <option value="">Select category</option>
              <option value="mortgage">Mortgage</option>
              <option value="auto_loan">Auto Loan</option>
              <option value="student_loan">Student Loan</option>
              <option value="credit_card">Credit Card</option>
              <option value="personal_loan">Personal Loan</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              value={newLiability.description}
              onChange={(e) => setNewLiability({...newLiability, description: e.target.value})}
              className="form-input flex-1"
              placeholder="New liability"
            />
            <input
              type="number"
              value={newLiability.amount}
              onChange={(e) => setNewLiability({...newLiability, amount: e.target.value})}
              onWheel={(e) => e.target.blur()}
              className="form-input w-32"
              placeholder="Amount"
            />
            <input
              type="number"
              value={newLiability.interestRate}
              onChange={(e) => setNewLiability({...newLiability, interestRate: e.target.value})}
              onWheel={(e) => e.target.blur()}
              className="form-input w-32"
              placeholder="Interest Rate %"
            />
            <button
              onClick={handleAddLiability}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Net Worth Summary */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Assets</p>
            <p className="text-2xl font-bold text-success-600">{formatCurrency(totalAssets)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Liabilities</p>
            <p className="text-2xl font-bold text-danger-600">{formatCurrency(totalLiabilities)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Net Worth</p>
            <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {formatCurrency(netWorth)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetSection;