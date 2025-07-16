import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiX, FiFileText, FiEdit3 } = FiIcons;

const FinancialPlanningSection = ({ 
  checklist = {
    will: { completed: false, lastUpdated: '', notes: '' },
    powerOfAttorney: { completed: false, lastUpdated: '', notes: '' },
    healthcareDirective: { completed: false, lastUpdated: '', notes: '' },
    trust: { completed: false, lastUpdated: '', notes: '' },
    beneficiaryDesignations: { completed: false, lastUpdated: '', notes: '' },
    guardianship: { completed: false, lastUpdated: '', notes: '' },
    emergencyFund: { completed: false, lastUpdated: '', notes: '' },
    taxPlanning: { completed: false, lastUpdated: '', notes: '' }
  },
  onChecklistChange,
  legacy_wishes = '',
  onLegacyWishesChange
}) => {
  const [editingItem, setEditingItem] = useState(null);

  const checklistItems = [
    { key: 'will', label: 'Last Will & Testament', description: 'Legal document distributing assets after death' },
    { key: 'powerOfAttorney', label: 'Power of Attorney', description: 'Authorizes someone to act on your behalf' },
    { key: 'healthcareDirective', label: 'Healthcare Directive', description: 'Medical treatment preferences and healthcare proxy' },
    { key: 'trust', label: 'Trust Documents', description: 'Revocable or irrevocable trust arrangements' },
    { key: 'beneficiaryDesignations', label: 'Beneficiary Designations', description: 'Updated beneficiaries on all accounts' },
    { key: 'guardianship', label: 'Guardianship Documents', description: 'Legal guardians for minor children' },
    { key: 'emergencyFund', label: 'Emergency Fund', description: '3-6 months of expenses in liquid savings' },
    { key: 'taxPlanning', label: 'Tax Planning Strategy', description: 'Ongoing tax optimization plan' }
  ];

  const handleItemUpdate = (key, field, value) => {
    const updatedChecklist = {
      ...checklist,
      [key]: {
        ...checklist[key],
        [field]: value
      }
    };
    onChecklistChange(updatedChecklist);
  };

  const completedItems = Object.values(checklist).filter(item => item.completed).length;
  const totalItems = checklistItems.length;
  const completionPercentage = (completedItems / totalItems) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Estate Planning Progress</h3>
            <span className="text-sm text-gray-500">
              {completedItems} of {totalItems} completed
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-primary-600">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Estate Planning Checklist */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Estate Planning Checklist</h3>
        </div>
        
        <div className="space-y-4">
          {checklistItems.map((item) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => handleItemUpdate(item.key, 'completed', !checklist[item.key].completed)}
                  className={`p-2 rounded-lg transition-colors ${
                    checklist[item.key].completed
                      ? 'bg-success-100 text-success-600 hover:bg-success-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <SafeIcon icon={checklist[item.key].completed ? FiCheck : FiX} className="w-5 h-5" />
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${
                      checklist[item.key].completed ? 'text-success-700' : 'text-gray-900'
                    }`}>
                      {item.label}
                    </h4>
                    <button
                      onClick={() => setEditingItem(editingItem === item.key ? null : item.key)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  
                  {checklist[item.key].lastUpdated && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {checklist[item.key].lastUpdated}
                    </p>
                  )}
                  
                  {editingItem === item.key && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Updated
                        </label>
                        <input
                          type="date"
                          value={checklist[item.key].lastUpdated}
                          onChange={(e) => handleItemUpdate(item.key, 'lastUpdated', e.target.value)}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={checklist[item.key].notes}
                          onChange={(e) => handleItemUpdate(item.key, 'notes', e.target.value)}
                          className="form-input w-full h-20 resize-none"
                          placeholder="Add notes about this item..."
                        />
                      </div>
                    </div>
                  )}
                  
                  {checklist[item.key].notes && editingItem !== item.key && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      {checklist[item.key].notes}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legacy Wishes */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Legacy Wishes & Special Instructions</h3>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personal Messages, Charitable Giving, and Special Instructions
          </label>
          <textarea
            value={legacy_wishes}
            onChange={(e) => onLegacyWishesChange(e.target.value)}
            className="form-input w-full h-32 resize-none"
            placeholder="Document any special wishes, charitable intentions, personal messages to family members, or specific instructions for your legacy..."
          />
        </div>
      </div>

      {/* Action Items */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Recommended Next Steps</h3>
        </div>
        
        <div className="space-y-3">
          {!checklist.will.completed && (
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-sm font-medium text-secondary-800">
                Create or update your Will
              </p>
              <p className="text-xs text-secondary-600 mt-1">
                This is the foundation of your estate plan
              </p>
            </div>
          )}
          
          {!checklist.powerOfAttorney.completed && (
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-sm font-medium text-secondary-800">
                Establish Power of Attorney
              </p>
              <p className="text-xs text-secondary-600 mt-1">
                Important for financial and healthcare decisions
              </p>
            </div>
          )}
          
          {!checklist.beneficiaryDesignations.completed && (
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-sm font-medium text-secondary-800">
                Review Beneficiary Designations
              </p>
              <p className="text-xs text-secondary-600 mt-1">
                Check all accounts and insurance policies
              </p>
            </div>
          )}
          
          {completionPercentage === 100 && (
            <div className="p-3 bg-success-50 rounded-lg">
              <p className="text-sm font-medium text-success-800">
                Excellent! Your estate planning is complete
              </p>
              <p className="text-xs text-success-600 mt-1">
                Remember to review and update annually
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialPlanningSection;