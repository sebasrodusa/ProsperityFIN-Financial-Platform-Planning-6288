import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiClock, FiUser, FiFileText, FiTarget, FiSend, FiAward } = FiIcons;

const FUNNEL_STAGES = [
  { 
    id: 'initial_meeting', 
    label: 'Initial Meeting Completed',
    description: 'First meeting with prospect completed',
    icon: FiUser,
    color: 'blue'
  },
  { 
    id: 'follow_up_meeting', 
    label: 'Follow-up for Meeting',
    description: 'Scheduling or conducting follow-up meeting',
    icon: FiClock,
    color: 'yellow'
  },
  { 
    id: 'interested_not_ready', 
    label: 'Interested but Not Ready',
    description: 'Client is interested but needs more time',
    icon: FiTarget,
    color: 'orange'
  },
  { 
    id: 'create_proposal', 
    label: 'Create Proposal',
    description: 'Preparing proposal for client',
    icon: FiFileText,
    color: 'purple'
  },
  { 
    id: 'follow_up_decision', 
    label: 'Follow-up for Decision',
    description: 'Waiting for client decision on proposal',
    icon: FiSend,
    color: 'indigo'
  },
  { 
    id: 'application_submitted', 
    label: 'Application Submitted',
    description: 'Application has been submitted for processing',
    icon: FiFileText,
    color: 'teal'
  },
  { 
    id: 'client_won', 
    label: 'Client (Won)',
    description: 'Successfully converted to client',
    icon: FiAward,
    color: 'green'
  }
];

const ClientStatusStepper = ({ currentStatus, onStatusChange, showLabels = true, size = 'md' }) => {
  const currentIndex = FUNNEL_STAGES.findIndex(stage => stage.id === currentStatus);

  const getStageStatus = (index) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  const getStatusColor = (status, color) => {
    switch (status) {
      case 'completed':
        return 'bg-success-500 text-white border-success-500';
      case 'current':
        return `bg-${color}-500 text-white border-${color}-500`;
      case 'pending':
        return 'bg-gray-200 text-gray-400 border-gray-200';
      default:
        return 'bg-gray-200 text-gray-400 border-gray-200';
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {FUNNEL_STAGES.map((stage, index) => {
          const status = getStageStatus(index);
          const isClickable = onStatusChange && (status === 'completed' || status === 'current' || index === currentIndex + 1);
          
          return (
            <div key={stage.id} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <motion.button
                onClick={() => isClickable && onStatusChange(stage.id)}
                disabled={!isClickable}
                className={`
                  ${sizeClasses[size]} rounded-full border-2 flex items-center justify-center
                  ${getStatusColor(status, stage.color)}
                  ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                  transition-all duration-200 mb-2
                `}
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
              >
                {status === 'completed' ? (
                  <SafeIcon icon={FiCheck} className="w-4 h-4" />
                ) : (
                  <SafeIcon icon={stage.icon} className="w-4 h-4" />
                )}
              </motion.button>

              {/* Step Label */}
              {showLabels && (
                <div className="text-center max-w-24">
                  <p className={`text-xs font-medium ${
                    status === 'current' ? 'text-gray-900' : 
                    status === 'completed' ? 'text-success-600' : 
                    'text-gray-500'
                  }`}>
                    {stage.label}
                  </p>
                </div>
              )}

              {/* Connector Line */}
              {index < FUNNEL_STAGES.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 -z-10">
                  <div className={`h-full ${
                    index < currentIndex ? 'bg-success-500' : 'bg-gray-200'
                  } transition-colors duration-200`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { FUNNEL_STAGES };
export default ClientStatusStepper;