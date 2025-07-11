import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiShield, FiTrendingUp, FiDollarSign, FiCalendar, FiUser, FiPhone, FiMail } = FiIcons;

const ProposalPDF = ({ proposal, client, advisor, carrier, strategy, product }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${value || 0}%`;
  };

  const calculateProjections = () => {
    const initialDeposit = parseFloat(proposal.initialLumpSum || 0);
    const monthlyContrib = parseFloat(proposal.monthlyContribution || 0);
    const annualCOI = parseFloat(proposal.annualCOI || 0);
    const yearsToPay = parseFloat(proposal.yearsToPay || 20);
    const returnRate = parseFloat(proposal.averageReturnPercentage || 6) / 100;
    const firstYearBonus = parseFloat(proposal.firstYearBonus || 0);

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
    <div id="proposal-pdf" className="bg-white min-h-screen p-8 print:p-0">
      {/* Header */}
      <div className="border-b-2 border-primary-600 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Strategy Projections</h1>
            <p className="text-gray-600 mt-2">{strategy?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Projections Date</p>
            <p className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-600 mt-2">Document ID</p>
            <p className="font-semibold text-gray-900">#{proposal.id?.substring(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* Client & Advisor Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <SafeIcon icon={FiUser} className="w-5 h-5" />
            <span>Client Information</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold text-gray-900">{client?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900">{client?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold text-gray-900">{client?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-semibold text-gray-900">{client?.dateOfBirth}</p>
            </div>
          </div>
        </div>

        <div className="bg-primary-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Professional</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold text-gray-900">{advisor?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900">{advisor?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Company</p>
              <p className="font-semibold text-gray-900">ProsperityFIN™</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy Overview</h2>
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Selected Strategy</h4>
              <p className="text-primary-600 font-medium">{strategy?.name}</p>
              <p className="text-sm text-gray-600 mt-1">{strategy?.description}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Product Type</h4>
              <p className="text-secondary-600 font-medium">{product?.name}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Insurance Carrier</h4>
              <div className="flex items-center space-x-2">
                <img src={carrier?.logo} alt={carrier?.name} className="w-8 h-8 rounded" />
                <div>
                  <p className="text-gray-900 font-medium">{carrier?.name}</p>
                  <p className="text-sm text-gray-600">{carrier?.rating} Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Configuration */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Initial Deposit</h4>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(proposal.initialLumpSum)}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Monthly Contribution</h4>
            <p className="text-2xl font-bold text-success-600">{formatCurrency(proposal.monthlyContribution)}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Annual COI / FEE</h4>
            <p className="text-2xl font-bold text-danger-600">{formatCurrency(proposal.annualCOI)}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">First Year Bonus</h4>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(proposal.firstYearBonus)}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Payment Period</h4>
            <p className="text-2xl font-bold text-gray-900">{proposal.yearsToPay} Years</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Expected Return</h4>
            <p className="text-2xl font-bold text-success-600">{formatPercentage(proposal.averageReturnPercentage)}</p>
          </div>
        </div>
      </div>

      {/* Benefits & Coverage */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits & Coverage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <SafeIcon icon={FiShield} className="w-5 h-5 text-primary-600" />
              <span>Insurance Benefits</span>
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Death Benefit</span>
                <span className="font-semibold">{formatCurrency(proposal.deathBenefitAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Living Benefits</span>
                <span className="font-semibold">{formatCurrency(proposal.livingBenefits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Terminal Illness</span>
                <span className="font-semibold">{formatCurrency(proposal.terminalIllnessBenefit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chronic Illness</span>
                <span className="font-semibold">{formatCurrency(proposal.chronicIllnessBenefit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Critical Illness</span>
                <span className="font-semibold">{formatCurrency(proposal.criticalIllnessBenefit)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-success-600" />
              <span>Income Projections</span>
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">10-Year Income</span>
                <span className="font-semibold">{formatCurrency(proposal.tenYearIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lifetime Income</span>
                <span className="font-semibold">{formatCurrency(proposal.lifetimeIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Cost</span>
                <span className="font-semibold">{formatCurrency(proposal.averageMonthlyCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Projections */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Projections</h2>
        <div className="bg-gradient-to-r from-success-50 to-primary-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Contributions</p>
              <p className="text-3xl font-bold text-primary-600">{formatCurrency(projections.totalContributions)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Total COI / Fees</p>
              <p className="text-3xl font-bold text-danger-600">{formatCurrency(projections.totalCOI)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Projected Growth</p>
              <p className="text-3xl font-bold text-success-600">{formatCurrency(projections.growth)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Accumulation</p>
              <p className="text-3xl font-bold text-secondary-600">{formatCurrency(projections.finalValue)}</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Calculation Method:</strong> Projected growth is calculated using compound interest at {formatPercentage(proposal.averageReturnPercentage)} 
              annual return, with annual COI/Fees of {formatCurrency(proposal.annualCOI)} deducted each year. 
              Monthly contributions of {formatCurrency(proposal.monthlyContribution)} are added throughout the {proposal.yearsToPay}-year period.
            </p>
          </div>
        </div>
      </div>

      {/* Projections Description */}
      {proposal.description && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Projections Details</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-800 leading-relaxed">{proposal.description}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-200 pt-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Important Disclaimers</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              These projections are based on current assumptions and projected rates of return with annual COI/Fee deductions. 
              Actual results may vary based on market conditions, policy performance, and other factors. 
              Please consult with your financial professional before making any investment decisions.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Prepared by:</p>
            <p className="font-semibold text-gray-900">{advisor?.name}</p>
            <p className="text-sm text-gray-600">Financial Professional</p>
            <p className="text-sm text-gray-600">ProsperityFIN™</p>
            <p className="text-sm text-gray-600 mt-2">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalPDF;