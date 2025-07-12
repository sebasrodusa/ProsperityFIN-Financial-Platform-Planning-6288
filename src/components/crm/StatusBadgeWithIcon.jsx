import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import { FUNNEL_STAGES } from './ClientStatusStepper';
import * as FiIcons from 'react-icons/fi';

const { FiCheckSquare, FiCalendar, FiClock, FiFileText, FiMessageSquare, FiUpload, FiUser } = FiIcons;

const StatusBadgeWithIcon = ({ status }) => {
  // Get the status info
  const statusInfo = FUNNEL_STAGES.find(s => s.id === status);
  
  if (!statusInfo) {
    return null;
  }

  // Define icon and color based on status
  const getStatusConfig = (statusId) => {
    switch (statusId) {
      case 'initial_meeting':
        return { icon: FiCheckSquare, bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      case 'follow_up_meeting':
        return { icon: FiCalendar, bgColor: 'bg-purple-100', textColor: 'text-purple-800' };
      case 'interested_not_ready':
        return { icon: FiClock, bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'create_proposal':
        return { icon: FiFileText, bgColor: 'bg-secondary-100', textColor: 'text-secondary-800' };
      case 'follow_up_decision':
        return { icon: FiMessageSquare, bgColor: 'bg-orange-100', textColor: 'text-orange-800' };
      case 'application_submitted':
        return { icon: FiUpload, bgColor: 'bg-primary-100', textColor: 'text-primary-800' };
      case 'client_won':
        return { icon: FiUser, bgColor: 'bg-success-100', textColor: 'text-success-800' };
      default:
        return { icon: FiCheckSquare, bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  const { icon, bgColor, textColor } = getStatusConfig(status);

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <SafeIcon icon={icon} className="w-3 h-3 mr-1" />
      <span>{statusInfo.label}</span>
    </div>
  );
};

export default StatusBadgeWithIcon;