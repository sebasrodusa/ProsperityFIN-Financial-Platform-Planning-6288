import React from 'react';
import { twMerge } from 'tailwind-merge';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-success-100 text-success-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-secondary-100 text-secondary-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-primary-100 text-primary-800';
      case 'approved':
        return 'bg-success-100 text-success-800';
      case 'rejected':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={twMerge(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getStatusStyles(status),
        className
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;