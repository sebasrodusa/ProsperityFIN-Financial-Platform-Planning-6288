import React from 'react';

const FinancialIndependenceSummary = ({ fin, clientName }) => {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Your Financial Independence</h2>
      <p className="text-base text-gray-800">Dear {clientName},</p>
      <p className="text-sm text-gray-800">
        Based on your current financial situation, we've calculated your Financial Independence Number (FIN) - the amount needed
        to support your lifestyle indefinitely:
      </p>
      {/* Emphasized FIN amount */}
      <p className="text-xl text-[18px] font-bold text-primary-600 inline-block border-b border-gray-300 pb-1">
        {formatCurrency(fin)}
      </p>
    </div>
  );
};

export default FinancialIndependenceSummary;
