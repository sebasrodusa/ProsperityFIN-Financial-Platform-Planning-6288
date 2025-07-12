import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { FUNNEL_STAGES } from './ClientStatusStepper';

const { FiClock, FiArrowRight } = FiIcons;

const StatusHistory = ({ history = [] }) => {
  const getStageInfo = (statusId) => {
    return FUNNEL_STAGES.find(stage => stage.id === statusId) || {
      label: statusId,
      icon: FiClock,
      color: 'gray'
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <SafeIcon icon={FiClock} className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No status history yet</p>
        <p className="text-sm">Status changes will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <SafeIcon icon={FiClock} className="w-5 h-5" />
        <span>Status History</span>
      </h3>

      <div className="space-y-3">
        {history.map((entry, index) => {
          const fromStage = entry.fromStatus ? getStageInfo(entry.fromStatus) : null;
          const toStage = getStageInfo(entry.toStatus);
          const isLatest = index === 0;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${
                isLatest 
                  ? 'bg-primary-50 border-primary-500' 
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {fromStage ? (
                    <>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <SafeIcon icon={fromStage.icon} className="w-4 h-4" />
                        <span className="text-sm">{fromStage.label}</span>
                      </div>
                      <SafeIcon icon={FiArrowRight} className="w-4 h-4 text-gray-400" />
                    </>
                  ) : (
                    <span className="text-sm text-gray-600">Initial status set to</span>
                  )}
                  <div className="flex items-center space-x-1 text-primary-600 font-medium">
                    <SafeIcon icon={toStage.icon} className="w-4 h-4" />
                    <span className="text-sm">{toStage.label}</span>
                  </div>
                  {isLatest && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                      Current
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                {formatDate(entry.changedAt)}
              </div>

              {entry.notes && (
                <div className="mt-2 text-sm text-gray-700 bg-white p-2 rounded border">
                  {entry.notes}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusHistory;