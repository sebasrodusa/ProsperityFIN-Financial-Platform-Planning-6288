import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiShield } = FiIcons;

const InsuranceSection = ({
  policies = [],
  onPoliciesChange,
  needsCalculator = {
    annualIncome: 0,
    yearsToReplace: 20,
    finalExpenses: 25000,
    educationFund: 0,
    existingCoverage: 0,
    liquidAssets: 0,
    retirementAccounts: 0
  },
  onNeedsCalculatorChange
}) => {
  const [newPolicy, setNewPolicy] = useState({
    carrier: '',
    policyType: '',
    coverageAmount: '',
    annualPremium: '',
    issueDate: '',
    beneficiary: ''
  });

  const totalCoverage = policies.reduce((sum, policy) => sum + parseFloat(policy.coverageAmount || 0), 0);
  const totalPremiums = policies.reduce((sum, policy) => sum + parseFloat(policy.annualPremium || 0), 0);

  const handleAddPolicy = useCallback(() => {
    if (newPolicy.carrier && newPolicy.policyType && newPolicy.coverageAmount) {
      const updatedPolicies = [...policies, {
        ...newPolicy,
        id: Date.now()
      }];
      onPoliciesChange(updatedPolicies);
      setNewPolicy({
        carrier: '',
        policyType: '',
        coverageAmount: '',
        annualPremium: '',
        issueDate: '',
        beneficiary: ''
      });
    }
  }, [newPolicy, policies, onPoliciesChange]);

  const handleUpdatePolicy = (id, field, value) => {
    const updated = policies.map(policy => 
      policy.id === id ? { ...policy, [field]: value } : policy
    );
    onPoliciesChange(updated);
  };

  const handleDeletePolicy = (id) => {
    const updated = policies.filter(policy => policy.id !== id);
    onPoliciesChange(updated);
  };

  const handleCalculatorChange = (field, value) => {
    const updatedCalculator = { ...needsCalculator, [field]: value };
    onNeedsCalculatorChange(updatedCalculator);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate insurance needs
  const calculateInsuranceNeeds = () => {
    const totalNeeds = (
      parseFloat(needsCalculator.annualIncome) * parseFloat(needsCalculator.yearsToReplace) +
      parseFloat(needsCalculator.finalExpenses) +
      parseFloat(needsCalculator.educationFund)
    );
    
    const totalResources = (
      parseFloat(needsCalculator.existingCoverage) +
      parseFloat(needsCalculator.liquidAssets) +
      parseFloat(needsCalculator.retirementAccounts)
    );
    
    return Math.max(0, totalNeeds - totalResources);
  };

  const additionalCoverageNeeded = calculateInsuranceNeeds();

  return (
    <div className="space-y-6">
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
                  Carrier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coverage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premium
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficiary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {policies.map((policy) => (
                <tr key={policy.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <input
                      type="text"
                      value={policy.carrier}
                      onChange={(e) => handleUpdatePolicy(policy.id, 'carrier', e.target.value)}
                      className="form-input"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={policy.policyType}
                      onChange={(e) => handleUpdatePolicy(policy.id, 'policyType', e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select Type</option>
                      <option value="Term Life">Term Life</option>
                      <option value="Whole Life">Whole Life</option>
                      <option value="Universal Life">Universal Life</option>
                      <option value="Variable Life">Variable Life</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="number"
                      value={policy.coverageAmount}
                      onChange={(e) => handleUpdatePolicy(policy.id, 'coverageAmount', e.target.value)}
                      className="form-input"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="number"
                      value={policy.annualPremium}
                      onChange={(e) => handleUpdatePolicy(policy.id, 'annualPremium', e.target.value)}
                      className="form-input"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="date"
                      value={policy.issueDate}
                      onChange={(e) => handleUpdatePolicy(policy.id, 'issueDate', e.target.value)}
                      className="form-input"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="text"
                      value={policy.beneficiary}
                      onChange={(e) => handleUpdatePolicy(policy.id, 'beneficiary', e.target.value)}
                      className="form-input"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="text-danger-600 hover:text-danger-900"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Policy Form */}
        <div className="mt-6 border-t pt-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Add New Policy</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              value={newPolicy.carrier}
              onChange={(e) => setNewPolicy({...newPolicy, carrier: e.target.value})}
              className="form-input"
              placeholder="Insurance Carrier"
            />
            <select
              value={newPolicy.policyType}
              onChange={(e) => setNewPolicy({...newPolicy, policyType: e.target.value})}
              className="form-input"
            >
              <option value="">Select Policy Type</option>
              <option value="Term Life">Term Life</option>
              <option value="Whole Life">Whole Life</option>
              <option value="Universal Life">Universal Life</option>
              <option value="Variable Life">Variable Life</option>
            </select>
            <input
              type="number"
              value={newPolicy.coverageAmount}
              onChange={(e) => setNewPolicy({...newPolicy, coverageAmount: e.target.value})}
              className="form-input"
              placeholder="Coverage Amount"
            />
            <input
              type="number"
              value={newPolicy.annualPremium}
              onChange={(e) => setNewPolicy({...newPolicy, annualPremium: e.target.value})}
              className="form-input"
              placeholder="Annual Premium"
            />
            <input
              type="date"
              value={newPolicy.issueDate}
              onChange={(e) => setNewPolicy({...newPolicy, issueDate: e.target.value})}
              className="form-input"
            />
            <input
              type="text"
              value={newPolicy.beneficiary}
              onChange={(e) => setNewPolicy({...newPolicy, beneficiary: e.target.value})}
              className="form-input"
              placeholder="Beneficiary"
            />
          </div>
          <button
            onClick={handleAddPolicy}
            className="mt-4 btn-primary flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Policy</span>
          </button>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Coverage</p>
              <p className="text-xl font-bold text-primary-600">{formatCurrency(totalCoverage)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Annual Premiums</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalPremiums)}</p>
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
            <h4 className="font-medium text-gray-900 mb-3">Insurance Needs</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Income
                </label>
                <input
                  type="number"
                  value={needsCalculator.annualIncome}
                  onChange={(e) => handleCalculatorChange('annualIncome', e.target.value)}
                  className="form-input"
                  placeholder="Annual income"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years to Replace Income
                </label>
                <input
                  type="number"
                  value={needsCalculator.yearsToReplace}
                  onChange={(e) => handleCalculatorChange('yearsToReplace', e.target.value)}
                  className="form-input"
                  placeholder="Years to replace"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Expenses
                </label>
                <input
                  type="number"
                  value={needsCalculator.finalExpenses}
                  onChange={(e) => handleCalculatorChange('finalExpenses', e.target.value)}
                  className="form-input"
                  placeholder="Final expenses"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Fund
                </label>
                <input
                  type="number"
                  value={needsCalculator.educationFund}
                  onChange={(e) => handleCalculatorChange('educationFund', e.target.value)}
                  className="form-input"
                  placeholder="Education fund needed"
                />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Available Resources</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Life Insurance
                </label>
                <input
                  type="number"
                  value={needsCalculator.existingCoverage}
                  onChange={(e) => handleCalculatorChange('existingCoverage', e.target.value)}
                  className="form-input"
                  placeholder="Existing coverage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Liquid Assets
                </label>
                <input
                  type="number"
                  value={needsCalculator.liquidAssets}
                  onChange={(e) => handleCalculatorChange('liquidAssets', e.target.value)}
                  className="form-input"
                  placeholder="Liquid assets"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retirement Accounts
                </label>
                <input
                  type="number"
                  value={needsCalculator.retirementAccounts}
                  onChange={(e) => handleCalculatorChange('retirementAccounts', e.target.value)}
                  className="form-input"
                  placeholder="Retirement accounts"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Result */}
        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Additional Coverage Needed:</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(additionalCoverageNeeded)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceSection;