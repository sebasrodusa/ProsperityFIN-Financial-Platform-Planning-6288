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
      <h2 className="text-4xl font-semibold text-gray-900">Your Financial Independence</h2>
      <p className="text-3xl text-gray-800">Dear {clientName},</p>
      <p className="text-3xl text-gray-800">
        Based on your current financial situation, we've calculated your Financial Independence Number (FIN) - the amount needed
        to support your lifestyle indefinitely:
      </p>
      <p className="text-7xl font-bold text-primary-600">{formatCurrency(fin)}</p>
      <p className="text-3xl text-gray-800">
        This report provides a comprehensive overview of your current financial position and identifies opportunities to help you
        achieve financial independence.
      </p>
    </div>
  );
};

export default FinancialIndependenceSummary;
