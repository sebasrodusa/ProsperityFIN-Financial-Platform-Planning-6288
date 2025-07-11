import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiShield, FiTrendingUp, FiDollarSign, FiHeart, FiUsers, FiAward } = FiIcons;

const FINANCIAL_STRATEGIES = [
  {
    id: 'lirp',
    name: 'LIRP (Life Insurance Retirement Plan)',
    description: 'Tax-free retirement income through life insurance cash value',
    icon: FiTrendingUp,
    category: 'retirement',
    products: ['whole_life', 'universal_life', 'variable_universal_life', 'indexed_universal_life']
  },
  {
    id: 'infinite_banking',
    name: 'Infinite Banking',
    description: 'Become your own bank using whole life insurance',
    icon: FiDollarSign,
    category: 'wealth_building',
    products: ['whole_life', 'universal_life']
  },
  {
    id: 'income_protection',
    name: 'Income Protection',
    description: 'Protect your income with disability and life insurance',
    icon: FiShield,
    category: 'protection',
    products: ['term_life', 'whole_life', 'disability_insurance']
  },
  {
    id: 'executive_bonus_eb162',
    name: 'Executive Bonus Plan (EB162)',
    description: 'Tax-advantaged executive compensation strategy',
    icon: FiAward,
    category: 'executive',
    products: ['whole_life', 'universal_life', 'variable_universal_life']
  },
  {
    id: 'sep_ira',
    name: 'SEP IRA',
    description: 'Simplified Employee Pension for small businesses',
    icon: FiUsers,
    category: 'retirement',
    products: ['annuity', 'mutual_funds', 'life_insurance']
  },
  {
    id: 'simple_ira',
    name: 'SIMPLE IRA',
    description: 'Savings Incentive Match Plan for Employees',
    icon: FiUsers,
    category: 'retirement',
    products: ['annuity', 'mutual_funds']
  },
  {
    id: 'charity_trust',
    name: 'Charitable Trust',
    description: 'Tax-efficient charitable giving strategy',
    icon: FiHeart,
    category: 'estate_planning',
    products: ['whole_life', 'universal_life', 'annuity']
  },
  {
    id: 'annuity_income',
    name: 'Annuity Income Strategy',
    description: 'Guaranteed lifetime income through annuities',
    icon: FiTrendingUp,
    category: 'retirement',
    products: ['fixed_annuity', 'variable_annuity', 'indexed_annuity']
  },
  {
    id: 'estate_planning',
    name: 'Estate Planning Strategy',
    description: 'Wealth transfer and estate tax minimization',
    icon: FiShield,
    category: 'estate_planning',
    products: ['whole_life', 'universal_life', 'variable_universal_life']
  },
  {
    id: 'key_person_insurance',
    name: 'Key Person Insurance',
    description: 'Protect business from loss of key employees',
    icon: FiAward,
    category: 'business',
    products: ['term_life', 'whole_life', 'universal_life']
  }
];

const PRODUCT_TYPES = {
  // Life Insurance Products
  term_life: { name: 'Term Life Insurance', type: 'life_insurance' },
  whole_life: { name: 'Whole Life Insurance', type: 'life_insurance' },
  universal_life: { name: 'Universal Life Insurance', type: 'life_insurance' },
  variable_universal_life: { name: 'Variable Universal Life', type: 'life_insurance' },
  indexed_universal_life: { name: 'Indexed Universal Life', type: 'life_insurance' },
  
  // Annuity Products
  fixed_annuity: { name: 'Fixed Annuity', type: 'annuity' },
  variable_annuity: { name: 'Variable Annuity', type: 'annuity' },
  indexed_annuity: { name: 'Indexed Annuity', type: 'annuity' },
  
  // Other Products
  disability_insurance: { name: 'Disability Insurance', type: 'protection' },
  mutual_funds: { name: 'Mutual Funds', type: 'investment' }
};

const StrategySelector = ({ selectedStrategy, onStrategyChange, selectedProduct, onProductChange }) => {
  const availableProducts = selectedStrategy 
    ? FINANCIAL_STRATEGIES.find(s => s.id === selectedStrategy)?.products || []
    : [];

  const getCategoryColor = (category) => {
    switch (category) {
      case 'retirement': return 'bg-primary-50 border-primary-200 text-primary-800';
      case 'protection': return 'bg-success-50 border-success-200 text-success-800';
      case 'wealth_building': return 'bg-secondary-50 border-secondary-200 text-secondary-800';
      case 'executive': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'estate_planning': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'business': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Strategy Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FINANCIAL_STRATEGIES.map((strategy) => (
            <button
              key={strategy.id}
              type="button"
              onClick={() => onStrategyChange(strategy.id)}
              className={`p-4 text-left border-2 rounded-lg transition-all ${
                selectedStrategy === strategy.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getCategoryColor(strategy.category)}`}>
                  <SafeIcon icon={strategy.icon} className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{strategy.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${getCategoryColor(strategy.category)}`}>
                    {strategy.category.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Product Type Selection */}
      {selectedStrategy && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableProducts.map((productId) => {
              const product = PRODUCT_TYPES[productId];
              return (
                <button
                  key={productId}
                  type="button"
                  onClick={() => onProductChange(productId)}
                  className={`p-3 text-left border-2 rounded-lg transition-all ${
                    selectedProduct === productId
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-600 capitalize">{product.type.replace('_', ' ')}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategySelector;