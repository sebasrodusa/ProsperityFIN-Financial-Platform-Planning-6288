import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useFinancialAnalysis } from '../contexts/FinancialAnalysisContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const { FiArrowLeft, FiDownload, FiPrinter, FiUser, FiUsers, FiCalendar, FiMail, FiPhone, FiCheck, FiX } = FiIcons;

const ClientFinancialReport = () => {
  const { clientId } = useParams();
  const { clients, users } = useData();
  const { analysis, loadAnalysis, loading, error } = useFinancialAnalysis();
  const [reportData, setReportData] = useState(null);
  const [advisorName, setAdvisorName] = useState('');
  const client = clients.find(c => c.id === clientId);

  // Load financial analysis data
  useEffect(() => {
    if (clientId) {
      loadAnalysis(clientId, false);
    }
  }, [clientId, loadAnalysis]);

  // Prepare report data once analysis is loaded
  useEffect(() => {
    if (client && analysis) {
      // Find advisor
      const advisor = users.find(u => u.id === client.advisorId);
      setAdvisorName(
        advisor?.name ||
        advisor?.fullName ||
        'Not Assigned'
      );

      // Process financial data for the report
      const totalIncome = analysis.income_sources?.reduce((sum, source) => sum + parseFloat(source.amount || 0), 0) || 0;
      const totalExpenses = analysis.expenses?.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0) || 0;
      const netIncome = totalIncome - totalExpenses;
      
      const totalAssets = analysis.assets?.reduce((sum, asset) => sum + parseFloat(asset.amount || 0), 0) || 0;
      const totalLiabilities = analysis.liabilities?.reduce((sum, liability) => sum + parseFloat(liability.amount || 0), 0) || 0;
      const netWorth = totalAssets - totalLiabilities;
      
      const totalInsuranceCoverage = analysis.insurance_policies?.reduce((sum, policy) => sum + parseFloat(policy.coverageAmount || 0), 0) || 0;

      // Calculate FIN (Financial Independence Number)
      const financialIndependenceNumber = totalIncome * 25;
      
      setReportData({
        clientInfo: {
          name: client.name,
          age: calculateAge(client.dateOfBirth),
          email: client.email,
          phone: client.phone,
          spouse:
            client.spouse?.name ||
            client.spouseName ||
            client.spouse_name ||
            client.spouseInfo?.name ||
            null,
          children: client.children?.length || 0,
          fin: financialIndependenceNumber
        },
        cashflow: {
          income: totalIncome,
          expenses: totalExpenses,
          netIncome: netIncome,
          sources: analysis.income_sources || [],
          expenseCategories: analysis.expenses || []
        },
        balanceSheet: {
          assets: totalAssets,
          liabilities: totalLiabilities,
          netWorth: netWorth,
          assetDetails: analysis.assets || [],
          liabilityDetails: analysis.liabilities || []
        },
        insurance: {
          policies: analysis.insurance_policies || [],
          totalCoverage: totalInsuranceCoverage,
          calculator: analysis.insurance_calculator || {}
        },
        goals: analysis.financial_goals || [],
        estatePlanning: analysis.estate_checklist || {},
        legacy_wishes: analysis.legacy_wishes || ''
      });
    }
  }, [client, analysis, users]);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const reportElement = document.getElementById('financial-report');
    if (!reportElement) return;

    // Create a new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Get the width and height of the PDF document
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    let currentPage = 1;
    const totalPages = Math.ceil(reportElement.scrollHeight / 900); // Estimate pages
    
    // Add each section to the PDF
    const sections = Array.from(reportElement.children);
    let yOffset = 0;
    
    for (const section of sections) {
      // Convert section to image
      const canvas = await html2canvas(section, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      const imgData = canvas.toDataURL('image/png');
      
      // Adjust image size to fit PDF
      const imgWidth = pdfWidth - 20; // margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if we need a new page
      if (yOffset + 10 + imgHeight > pdfHeight) {
        pdf.addPage();
        currentPage++;
        yOffset = 10;
      }
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 10, yOffset + 10, imgWidth, imgHeight);
      yOffset += imgHeight + 10;
    }
    
    // Save PDF
    pdf.save(`${client.name.replace(/\s+/g, '_')}_Financial_Report.pdf`);
  };

  // Cashflow pie chart data
  const cashflowPieData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: reportData ? [reportData.cashflow.income, reportData.cashflow.expenses] : [0, 0],
        backgroundColor: ['rgba(34, 197, 94, 0.6)', 'rgba(239, 68, 68, 0.6)'],
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Net worth bar chart data
  const netWorthBarData = {
    labels: ['Assets', 'Liabilities', 'Net Worth'],
    datasets: [
      {
        label: 'Balance Sheet',
        data: reportData ? [
          reportData.balanceSheet.assets,
          reportData.balanceSheet.liabilities,
          reportData.balanceSheet.netWorth
        ] : [0, 0, 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          reportData?.balanceSheet.netWorth >= 0 ? 'rgba(14, 165, 233, 0.6)' : 'rgba(239, 68, 68, 0.6)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          reportData?.balanceSheet.netWorth >= 0 ? 'rgba(14, 165, 233, 1)' : 'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Client not found</h1>
            <Link to="/clients" className="text-primary-600 hover:text-primary-700">
              Back to Clients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  const getInsuranceNeeds = () => {
    if (!reportData || !reportData.insurance.calculator) return 0;
    
    const calc = reportData.insurance.calculator;
    const totalNeeds = (
      parseFloat(calc.annualIncome || 0) * parseFloat(calc.yearsToReplace || 20) +
      parseFloat(calc.finalExpenses || 0) +
      parseFloat(calc.educationFund || 0)
    );
    
    const totalResources = (
      parseFloat(calc.existingCoverage || 0) +
      parseFloat(calc.liquidAssets || 0) +
      parseFloat(calc.retirementAccounts || 0)
    );
    
    return Math.max(0, totalNeeds - totalResources);
  };

  const insuranceGap = reportData ? getInsuranceNeeds() - reportData.insurance.totalCoverage : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 print:hidden">
            <Link
              to={`/clients/${client.id}`}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
              <span>Back to Client Details</span>
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Financial Report</h1>
                <p className="text-gray-600">Client: {client.name}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handlePrint}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <SafeIcon icon={FiPrinter} className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="btn-primary flex items-center space-x-2"
                >
                  <SafeIcon icon={FiDownload} className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Financial Report Content */}
          <div id="financial-report" className="space-y-8">
            {/* Report Header */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8 print:border-0 print:shadow-none">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-xl">P</span>
                  </div>
                  <h1 className="text-3xl font-heading font-bold text-gray-900">Financial Independence Report</h1>
                  <p className="text-gray-600">Prepared on: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <p className="text-lg font-medium text-gray-900">Prepared by:</p>
                  <p className="text-gray-700">{advisorName}</p>
                  <p className="text-gray-700">Financial Professional</p>
                  <p className="text-gray-600">ProsperityFIN™</p>
                </div>
              </div>

              {reportData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Client Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 font-medium">{reportData.clientInfo.name}, {reportData.clientInfo.age} years old</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiUsers} className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">
                          {reportData.clientInfo.spouse ? `Spouse: ${reportData.clientInfo.spouse}` : 'No spouse'}
                          {reportData.clientInfo.children > 0 && `, ${reportData.clientInfo.children} children`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiMail} className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{reportData.clientInfo.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiPhone} className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{reportData.clientInfo.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter / FIN */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Financial Independence</h3>
                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-lg">
                      <p className="text-gray-800 mb-4">
                        Dear {reportData.clientInfo.name},
                      </p>
                      <p className="text-gray-800 mb-4">
                        Based on your current financial situation, we've calculated your Financial Independence Number (FIN) - the amount needed to support your lifestyle indefinitely:
                      </p>
                      <div className="text-center my-6">
                        <p className="text-sm text-gray-600">Your Financial Independence Number (FIN)</p>
                        <p className="text-4xl font-bold text-primary-600">{formatCurrency(reportData.clientInfo.fin)}</p>
                      </div>
                      <p className="text-gray-800">
                        This report provides a comprehensive overview of your current financial position and identifies opportunities to help you achieve financial independence.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cashflow Summary */}
            {reportData && (
              <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8 print:border-0 print:shadow-none">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Cashflow Summary</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="p-4 bg-success-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">Total Income</p>
                        <p className="text-2xl font-bold text-success-600">{formatCurrency(reportData.cashflow.income)}</p>
                      </div>
                      <div className="p-4 bg-danger-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                        <p className="text-2xl font-bold text-danger-600">{formatCurrency(reportData.cashflow.expenses)}</p>
                      </div>
                      <div className="p-4 bg-primary-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">Net Income</p>
                        <p className={`text-2xl font-bold ${reportData.cashflow.netIncome >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                          {formatCurrency(reportData.cashflow.netIncome)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Sources</h3>
                        <div className="space-y-2">
                          {reportData.cashflow.sources.map((source, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700">{source.description}</span>
                              <span className="font-medium text-gray-900">{formatCurrency(source.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Expenses</h3>
                        <div className="space-y-2">
                          {reportData.cashflow.expenseCategories
                            .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
                            .slice(0, 5)
                            .map((expense, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">{expense.description}</span>
                                <span className="font-medium text-gray-900">{formatCurrency(expense.amount)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-xs">
                      <Pie data={cashflowPieData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Balance Sheet */}
            {reportData && (
              <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8 print:border-0 print:shadow-none">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Balance Sheet</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="p-4 bg-success-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">Total Assets</p>
                        <p className="text-2xl font-bold text-success-600">{formatCurrency(reportData.balanceSheet.assets)}</p>
                      </div>
                      <div className="p-4 bg-danger-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">Total Liabilities</p>
                        <p className="text-2xl font-bold text-danger-600">{formatCurrency(reportData.balanceSheet.liabilities)}</p>
                      </div>
                      <div className="p-4 bg-primary-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">Net Worth</p>
                        <p className={`text-2xl font-bold ${reportData.balanceSheet.netWorth >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                          {formatCurrency(reportData.balanceSheet.netWorth)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Assets</h3>
                        <div className="space-y-2">
                          {reportData.balanceSheet.assetDetails
                            .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
                            .slice(0, 5)
                            .map((asset, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">{asset.description}</span>
                                <span className="font-medium text-gray-900">{formatCurrency(asset.amount)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Liabilities</h3>
                        <div className="space-y-2">
                          {reportData.balanceSheet.liabilityDetails
                            .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
                            .slice(0, 5)
                            .map((liability, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">{liability.description}</span>
                                <span className="font-medium text-gray-900">{formatCurrency(liability.amount)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-full">
                      <Bar 
                        data={netWorthBarData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: true,
                          scales: {
                            y: {
                              beginAtZero: true
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Life Insurance Overview */}
            {reportData && (
              <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8 print:border-0 print:shadow-none">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Life Insurance Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-primary-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Coverage</p>
                    <p className="text-2xl font-bold text-primary-600">{formatCurrency(reportData.insurance.totalCoverage)}</p>
                  </div>
                  <div className="p-4 bg-secondary-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Estimated Needs</p>
                    <p className="text-2xl font-bold text-secondary-600">{formatCurrency(getInsuranceNeeds())}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Coverage Gap</p>
                    <p className={`text-2xl font-bold ${insuranceGap <= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {insuranceGap <= 0 ? 'No Gap' : formatCurrency(insuranceGap)}
                    </p>
                  </div>
                </div>
                
                {reportData.insurance.policies.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Insurance Carrier
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Coverage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Annual Premium
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Beneficiary
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.insurance.policies.map((policy, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {policy.carrier}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {policy.policyType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(policy.coverageAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(policy.annualPremium)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {policy.beneficiary}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 text-center">No life insurance policies recorded</p>
                  </div>
                )}
              </div>
            )}

            {/* Financial Goals */}
            {reportData && (
              <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8 print:border-0 print:shadow-none">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Financial Goals</h2>
                
                {reportData.goals.length > 0 ? (
                  <div className="space-y-6">
                    {reportData.goals.map((goal, index) => {
                      const progress = Math.min((parseFloat(goal.currentAmount || 0) / parseFloat(goal.targetAmount)) * 100, 100);
                      const today = new Date();
                      const targetDate = new Date(goal.targetDate);
                      const monthsLeft = Math.max(0, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24 * 30)));
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{goal.title}</h4>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {goal.category || 'General'}
                                </span>
                              </div>
                              {goal.description && (
                                <p className="text-gray-600 text-sm">{goal.description}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-600 text-sm">Current Amount</p>
                              <p className="font-semibold text-gray-900">{formatCurrency(goal.currentAmount || 0)}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-600 text-sm">Target Amount</p>
                              <p className="font-semibold text-gray-900">{formatCurrency(goal.targetAmount)}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-600 text-sm">Target Date</p>
                              <p className="font-semibold text-gray-900">{new Date(goal.targetDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className="text-sm font-medium text-primary-600">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-600">Months Remaining</p>
                              <p className="font-semibold text-gray-900">{monthsLeft} months</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-600">Monthly Required</p>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(
                                  monthsLeft === 0 ? 0 : 
                                  (parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount || 0)) / monthsLeft
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 text-center">No financial goals recorded</p>
                  </div>
                )}
              </div>
            )}

            {/* Estate Planning */}
            {reportData && (
              <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8 print:border-0 print:shadow-none">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Estate Planning Summary</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Estate Planning Checklist</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'will', label: 'Last Will & Testament' },
                        { key: 'powerOfAttorney', label: 'Power of Attorney' },
                        { key: 'healthcareDirective', label: 'Healthcare Directive' },
                        { key: 'trust', label: 'Trust Documents' },
                        { key: 'beneficiaryDesignations', label: 'Beneficiary Designations' },
                        { key: 'guardianship', label: 'Guardianship Documents' },
                        { key: 'emergencyFund', label: 'Emergency Fund' },
                        { key: 'taxPlanning', label: 'Tax Planning Strategy' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <span className={`p-1 rounded-full ${
                            reportData.estatePlanning[item.key]?.completed 
                            ? 'bg-success-100 text-success-600' 
                            : 'bg-gray-100 text-gray-400'
                          }`}>
                            <SafeIcon 
                              icon={reportData.estatePlanning[item.key]?.completed ? FiCheck : FiX} 
                              className="w-4 h-4"
                            />
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            {reportData.estatePlanning[item.key]?.lastUpdated && (
                              <p className="text-xs text-gray-500">
                                Last updated: {reportData.estatePlanning[item.key].lastUpdated}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Legacy Wishes & Special Instructions</h3>
                    {reportData.legacy_wishes ? (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-line">{reportData.legacy_wishes}</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 text-center">No legacy wishes recorded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {reportData && (
              <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8 print:border-0 print:shadow-none">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Key Recommendations</h2>
                
                <div className="space-y-4">
                  {/* Cashflow Recommendations */}
                  {reportData.cashflow.netIncome < 0 && (
                    <div className="p-4 border-l-4 border-danger-500 bg-danger-50 rounded-r-lg">
                      <h4 className="font-semibold text-danger-700">Negative Cash Flow</h4>
                      <p className="text-danger-600">
                        Your expenses exceed your income by {formatCurrency(Math.abs(reportData.cashflow.netIncome))} monthly.
                        Consider reviewing discretionary spending to balance your budget.
                      </p>
                    </div>
                  )}
                  
                  {reportData.cashflow.netIncome > 0 && reportData.cashflow.netIncome < (reportData.cashflow.income * 0.2) && (
                    <div className="p-4 border-l-4 border-secondary-500 bg-secondary-50 rounded-r-lg">
                      <h4 className="font-semibold text-secondary-700">Improve Savings Rate</h4>
                      <p className="text-secondary-600">
                        Your current savings rate is {Math.round((reportData.cashflow.netIncome / reportData.cashflow.income) * 100)}%.
                        Consider increasing to 20% or more for long-term financial independence.
                      </p>
                    </div>
                  )}
                  
                  {/* Insurance Recommendations */}
                  {insuranceGap > 0 && (
                    <div className="p-4 border-l-4 border-danger-500 bg-danger-50 rounded-r-lg">
                      <h4 className="font-semibold text-danger-700">Life Insurance Gap</h4>
                      <p className="text-danger-600">
                        Your current life insurance coverage may be insufficient by approximately {formatCurrency(insuranceGap)}.
                        Consider additional coverage to protect your family.
                      </p>
                    </div>
                  )}
                  
                  {/* Estate Planning Recommendations */}
                  {!reportData.estatePlanning.will?.completed && (
                    <div className="p-4 border-l-4 border-secondary-500 bg-secondary-50 rounded-r-lg">
                      <h4 className="font-semibold text-secondary-700">Create a Will</h4>
                      <p className="text-secondary-600">
                        You don't have a will in place. This is a fundamental estate planning document that ensures
                        your assets are distributed according to your wishes.
                      </p>
                    </div>
                  )}
                  
                  {/* Net Worth Recommendations */}
                  {reportData.balanceSheet.liabilities > (reportData.balanceSheet.assets * 0.5) && (
                    <div className="p-4 border-l-4 border-secondary-500 bg-secondary-50 rounded-r-lg">
                      <h4 className="font-semibold text-secondary-700">Debt Reduction Strategy</h4>
                      <p className="text-secondary-600">
                        Your debt-to-asset ratio is {Math.round((reportData.balanceSheet.liabilities / reportData.balanceSheet.assets) * 100)}%.
                        Consider prioritizing debt reduction to improve your financial stability.
                      </p>
                    </div>
                  )}
                  
                  {/* Emergency Fund Recommendations */}
                  {!reportData.estatePlanning.emergencyFund?.completed && (
                    <div className="p-4 border-l-4 border-primary-500 bg-primary-50 rounded-r-lg">
                      <h4 className="font-semibold text-primary-700">Build Emergency Fund</h4>
                      <p className="text-primary-600">
                        An emergency fund of 3-6 months of expenses will provide financial security in case of unexpected events.
                        Consider making this a priority.
                      </p>
                    </div>
                  )}

                  {/* If no specific recommendations are needed */}
                  {reportData.cashflow.netIncome >= (reportData.cashflow.income * 0.2) &&
                   insuranceGap <= 0 &&
                   reportData.estatePlanning.will?.completed &&
                   reportData.balanceSheet.liabilities <= (reportData.balanceSheet.assets * 0.5) &&
                   reportData.estatePlanning.emergencyFund?.completed && (
                    <div className="p-4 border-l-4 border-success-500 bg-success-50 rounded-r-lg">
                      <h4 className="font-semibold text-success-700">Strong Financial Foundation</h4>
                      <p className="text-success-600">
                        You've established a solid financial foundation. Consider optimizing your investment strategy
                        to accelerate progress toward your long-term goals and financial independence.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Report Footer */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8 print:border-0 print:shadow-none">
              <div className="border-t border-gray-100 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Disclaimer</h3>
                    <p className="text-sm text-gray-600">
                      This report is based on the information provided and is intended for educational and informational purposes only.
                      It does not constitute financial, legal, or tax advice. Please consult with qualified professionals before making
                      financial decisions. ProsperityFIN™ is not responsible for any actions taken based on this report.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Report generated on:</p>
                    <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600 mt-4">Document ID:</p>
                    <p className="text-sm font-medium text-gray-900">FIN-{clientId.substring(0, 8)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientFinancialReport;