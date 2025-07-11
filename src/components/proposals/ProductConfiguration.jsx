import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDollarSign, FiCalendar, FiShield, FiTrendingUp, FiInfo } = FiIcons;

const ProductConfiguration = ({ formData, onFormDataChange }) => {
  const handleInputChange = (field, value) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const calculateProjections = () => {
    const initialDeposit = parseFloat(formData.initialLumpSum || 0);
    const monthlyContrib = parseFloat(formData.monthlyContribution || 0);
    const annualCOI = parseFloat(formData.annualCOI || 0);
    const yearsToPay = parseFloat(formData.yearsToPay || 20);
    const returnRate = parseFloat(formData.averageReturnPercentage || 6) / 100;
    const firstYearBonus = parseFloat(formData.firstYearBonus || 0);

    // Calculate total contributions (what goes in)
    const totalContributions = initialDeposit + firstYearBonus + (monthlyContrib * 12 * yearsToPay);
    const totalCOI = annualCOI * yearsToPay;

    // Year-by-year compound interest calculation with annual COI deduction
    let accountValue = initialDeposit + firstYearBonus;
    
    for (let year = 1; year <= yearsToPay; year++) {
      // Add monthly contributions for the year
      const annualContributions = monthlyContrib * 12;
      accountValue += annualContributions;
      
      // Apply growth for the year
      accountValue = accountValue * (1 + returnRate);
      
      // Subtract annual COI/Fee
      accountValue -= annualCOI;
      
      // Ensure account value doesn't go negative
      accountValue = Math.max(0, accountValue);
    }

    const finalValue = accountValue;
    const growth = finalValue - totalContributions;

    return {
      totalContributions,
      totalCOI,
      finalValue,
      growth: Math.max(0, growth) // Ensure growth isn't negative
    };
  };

  const projections = calculateProjections();

  return (
    <div className="space-y-8">
      {/* Financial Configuration */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <SafeIcon icon={FiDollarSign} className="w-5 h-5" />
            <span>Financial Configuration</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Lump Sum Deposit
            </label>
            <input
              type="number"
              value={formData.initialLumpSum || ''}
              onChange={(e) => handleInputChange('initialLumpSum', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Contribution
            </label>
            <input
              type="number"
              value={formData.monthlyContribution || ''}
              onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual COI / FEE
            </label>
            <input
              type="number"
              value={formData.annualCOI || ''}
              onChange={(e) => handleInputChange('annualCOI', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Year Bonus
            </label>
            <input
              type="number"
              value={formData.firstYearBonus || ''}
              onChange={(e) => handleInputChange('firstYearBonus', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years to Pay Off Plan
            </label>
            <input
              type="number"
              value={formData.yearsToPay || ''}
              onChange={(e) => handleInputChange('yearsToPay', e.target.value)}
              className="form-input"
              placeholder="20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average Return Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={formData.averageReturnPercentage || ''}
                onChange={(e) => handleInputChange('averageReturnPercentage', e.target.value)}
                className="form-input pr-8"
                placeholder="6.0"
              />
              <span className="absolute right-3 top-3 text-gray-500">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Configuration */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <SafeIcon icon={FiShield} className="w-5 h-5" />
            <span>Benefits & Coverage</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Death Benefit Amount
            </label>
            <input
              type="number"
              value={formData.deathBenefitAmount || ''}
              onChange={(e) => handleInputChange('deathBenefitAmount', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Living Benefits Amount
            </label>
            <input
              type="number"
              value={formData.livingBenefits || ''}
              onChange={(e) => handleInputChange('livingBenefits', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terminal Illness Benefit
            </label>
            <input
              type="number"
              value={formData.terminalIllnessBenefit || ''}
              onChange={(e) => handleInputChange('terminalIllnessBenefit', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chronic Illness Benefit
            </label>
            <input
              type="number"
              value={formData.chronicIllnessBenefit || ''}
              onChange={(e) => handleInputChange('chronicIllnessBenefit', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Critical Illness Benefit
            </label>
            <input
              type="number"
              value={formData.criticalIllnessBenefit || ''}
              onChange={(e) => handleInputChange('criticalIllnessBenefit', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average Monthly Cost of Insurance
            </label>
            <input
              type="number"
              value={formData.averageMonthlyCost || ''}
              onChange={(e) => handleInputChange('averageMonthlyCost', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Income Projections */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <SafeIcon icon={FiTrendingUp} className="w-5 h-5" />
            <span>Income Projections</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Potential Income (10 Years)
            </label>
            <input
              type="number"
              value={formData.tenYearIncome || ''}
              onChange={(e) => handleInputChange('tenYearIncome', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Potential Lifetime Income
            </label>
            <input
              type="number"
              value={formData.lifetimeIncome || ''}
              onChange={(e) => handleInputChange('lifetimeIncome', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Projections Summary */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <SafeIcon icon={FiInfo} className="w-5 h-5" />
            <span>Calculated Projections</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Contributions</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(projections.totalContributions)}
            </p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total COI / Fees</p>
            <p className="text-2xl font-bold text-danger-600">
              {formatCurrency(projections.totalCOI)}
            </p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Projected Growth</p>
            <p className="text-2xl font-bold text-success-600">
              {formatCurrency(projections.growth)}
            </p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Accumulation</p>
            <p className="text-2xl font-bold text-secondary-600">
              {formatCurrency(projections.finalValue)}
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-secondary-100 rounded-lg">
          <p className="text-sm text-secondary-800">
            <strong>Note:</strong> These are projections based on the provided parameters and assumed rates of return. 
            Projected growth is calculated using compound interest with annual COI/Fee deductions. 
            Actual results may vary based on market conditions, policy performance, and other factors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductConfiguration;