import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import { CLIENT_STATUSES } from '../../contexts/CrmContext';
import * as FiIcons from 'react-icons/fi';

const { FiCheck } = FiIcons;

const StatusStepper = ({ currentStatus }) => {
  // Get the current step index
  const getCurrentStep = () => {
    return CLIENT_STATUSES.findIndex(s => s.id === currentStatus) || 0;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center min-w-max pb-4">
        {CLIENT_STATUSES.map((status, index) => {
          const isActive = index <= currentStep;
          const isCurrentStep = index === currentStep;
          
          return (
            <div key={status.id} className="flex items-center">
              <div className={`flex flex-col items-center ${index === 0 ? 'ml-0' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  } ${isCurrentStep ? 'ring-4 ring-primary-100' : ''}`}
                >
                  {isActive ? <SafeIcon icon={FiCheck} className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`mt-2 text-xs text-center max-w-[80px] ${
                  isActive ? 'text-primary-600 font-medium' : 'text-gray-500'
                }`}>
                  {status.label}
                </span>
              </div>
              
              {index < CLIENT_STATUSES.length - 1 && (
                <div className={`w-12 h-0.5 mx-1 ${
                  index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusStepper;