import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../contexts/DataContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logDev from '../utils/logDev';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import StrategySelector from '../components/proposals/StrategySelector';
import CarrierSelector from '../components/proposals/CarrierSelector';
import ProductConfiguration from '../components/proposals/ProductConfiguration';
import ProposalPDF from '../components/proposals/ProposalPDF';
import { getTransformedImage } from '../services/publitio';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useSupabaseClient } from '../lib/supabaseClient';
import { decamelizeKeys } from '../utils/decamelize';
import { DEFAULT_AVATAR_URL } from '../utils/constants';

const { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiSend, FiCalendar, FiUser, FiDownload, FiPrinter } = FiIcons;

// Import strategy and product data
const FINANCIAL_STRATEGIES = [
  {
    id: 'lirp',
    name: 'LIRP (Life Insurance Retirement Plan)',
    description: 'Tax-free retirement income through life insurance cash value',
    category: 'retirement',
    products: ['whole_life', 'universal_life', 'variable_universal_life', 'indexed_universal_life']
  },
  {
    id: 'infinite_banking',
    name: 'Infinite Banking',
    description: 'Become your own bank using whole life insurance',
    category: 'wealth_building',
    products: ['whole_life', 'universal_life']
  },
  {
    id: 'income_protection',
    name: 'Income Protection',
    description: 'Protect your income with disability and life insurance',
    category: 'protection',
    products: ['term_life', 'whole_life', 'disability_insurance']
  },
  {
    id: 'executive_bonus_eb162',
    name: 'Executive Bonus Plan (EB162)',
    description: 'Tax-advantaged executive compensation strategy',
    category: 'executive',
    products: ['whole_life', 'universal_life', 'variable_universal_life']
  },
  {
    id: 'sep_ira',
    name: 'SEP IRA',
    description: 'Simplified Employee Pension for small businesses',
    category: 'retirement',
    products: ['annuity', 'mutual_funds', 'life_insurance']
  },
  {
    id: 'simple_ira',
    name: 'SIMPLE IRA',
    description: 'Savings Incentive Match Plan for Employees',
    category: 'retirement',
    products: ['annuity', 'mutual_funds']
  },
  {
    id: 'charity_trust',
    name: 'Charitable Trust',
    description: 'Tax-efficient charitable giving strategy',
    category: 'estate_planning',
    products: ['whole_life', 'universal_life', 'annuity']
  },
  {
    id: 'annuity_income',
    name: 'Annuity Income Strategy',
    description: 'Guaranteed lifetime income through annuities',
    category: 'retirement',
    products: ['fixed_annuity', 'variable_annuity', 'indexed_annuity']
  }
];

const PRODUCT_TYPES = {
  term_life: { name: 'Term Life Insurance', type: 'life_insurance' },
  whole_life: { name: 'Whole Life Insurance', type: 'life_insurance' },
  universal_life: { name: 'Universal Life Insurance', type: 'life_insurance' },
  variable_universal_life: { name: 'Variable Universal Life', type: 'life_insurance' },
  indexed_universal_life: { name: 'Indexed Universal Life', type: 'life_insurance' },
  fixed_annuity: { name: 'Fixed Annuity', type: 'annuity' },
  variable_annuity: { name: 'Variable Annuity', type: 'annuity' },
  indexed_annuity: { name: 'Indexed Annuity', type: 'annuity' },
  disability_insurance: { name: 'Disability Insurance', type: 'protection' },
  mutual_funds: { name: 'Mutual Funds', type: 'investment' }
};

const DEFAULT_CARRIERS = [
  {
    id: 'ethos',
    name: 'Ethos',
    logo: DEFAULT_AVATAR_URL,
    products: ['term_life', 'whole_life', 'universal_life'],
    rating: 'A+',
    established: '2016'
  },
  {
    id: 'fg',
    name: 'F&G (Fidelity & Guaranty)',
    logo: DEFAULT_AVATAR_URL,
    products: ['fixed_annuity', 'indexed_annuity', 'universal_life'],
    rating: 'A',
    established: '1959'
  },
  {
    id: 'ameritas',
    name: 'Ameritas',
    logo: DEFAULT_AVATAR_URL,
    products: ['whole_life', 'universal_life', 'variable_universal_life', 'disability_insurance'],
    rating: 'A+',
    established: '1887'
  },
  {
    id: 'mutual_omaha',
    name: 'Mutual of Omaha',
    logo: DEFAULT_AVATAR_URL,
    products: ['term_life', 'whole_life', 'universal_life', 'disability_insurance'],
    rating: 'A+',
    established: '1909'
  },
  {
    id: 'american_national',
    name: 'American National',
    logo: DEFAULT_AVATAR_URL,
    products: ['whole_life', 'universal_life', 'variable_universal_life', 'fixed_annuity'],
    rating: 'A',
    established: '1905'
  },
  {
    id: 'american_equity',
    name: 'American Equity',
    logo: DEFAULT_AVATAR_URL,
    products: ['fixed_annuity', 'indexed_annuity', 'variable_annuity'],
    rating: 'A-',
    established: '1995'
  }
];

const ProposalManagement = () => {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const { proposals, clients, users, addProposal, updateProposal, deleteProposal } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState('');
  const failedImages = useRef(new Set());

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    strategy: '',
    productType: '',
    carrier: '',
    // Financial configuration
    initialLumpSum: '',
    monthlyContribution: '',
    annualCOI: '',
    firstYearBonus: '',
    yearsToPay: '20',
    averageReturnPercentage: '6',
    // Benefits
    deathBenefitAmount: '',
    livingBenefits: '',
    terminalIllnessBenefit: '',
    chronicIllnessBenefit: '',
    criticalIllnessBenefit: '',
    averageMonthlyCost: '',
    // Income projections
    tenYearIncome: '',
    lifetimeIncome: ''
  });

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          proposal.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (user?.role === 'advisor') {
      return matchesSearch && proposal.advisorId === user.id;
    }
    return matchesSearch;
  });

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  const availableClients = clients.filter(client => {
    if (user?.role === 'advisor') {
      return client.advisorId === user.id;
    }
    return true;
  });

  const numericFields = [
    'initialLumpSum',
    'monthlyContribution',
    'annualCOI',
    'firstYearBonus',
    'yearsToPay',
    'averageReturnPercentage',
    'deathBenefitAmount',
    'livingBenefits',
    'terminalIllnessBenefit',
    'chronicIllnessBenefit',
    'criticalIllnessBenefit',
    'averageMonthlyCost',
    'tenYearIncome',
    'lifetimeIncome'
  ];

  const cleanNumericFields = (data) => {
    const cleaned = { ...data };
    numericFields.forEach((field) => {
      if (cleaned[field] === '') {
        cleaned[field] = null;
      }
    });
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const proposalData = cleanNumericFields({
        ...formData,
        createdBy: user.id,
        status: selectedProposal ? selectedProposal.status : 'draft'
      });

      const snakeCaseData = decamelizeKeys(proposalData);
      logDev('Saving proposal (snake_case):', snakeCaseData);

      if (selectedProposal) {
        await updateProposal(selectedProposal.id, proposalData);
        setIsEditModalOpen(false);
      } else {
        await addProposal(proposalData);
        setIsAddModalOpen(false);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving proposal to Supabase:', error);
      alert(`Failed to save proposal: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      title: '',
      description: '',
      strategy: '',
      productType: '',
      carrier: '',
      initialLumpSum: '',
      monthlyContribution: '',
      annualCOI: '',
      firstYearBonus: '',
      yearsToPay: '20',
      averageReturnPercentage: '6',
      deathBenefitAmount: '',
      livingBenefits: '',
      terminalIllnessBenefit: '',
      chronicIllnessBenefit: '',
      criticalIllnessBenefit: '',
      averageMonthlyCost: '',
      tenYearIncome: '',
      lifetimeIncome: ''
    });
    setSelectedProposal(null);
    setSelectedStrategyId('');
  };

  const handleEdit = (proposal) => {
    setSelectedProposal(proposal);
    setFormData({
      clientId: proposal.clientId,
      title: proposal.title,
      description: proposal.description,
      strategy: proposal.strategy ? String(proposal.strategy) : '',
      productType: proposal.productType ? String(proposal.productType) : '',
      carrier: proposal.carrier || '',
      initialLumpSum: proposal.initialLumpSum || '',
      monthlyContribution: proposal.monthlyContribution || '',
      annualCOI: proposal.annualCOI || '',
      firstYearBonus: proposal.firstYearBonus || '',
      yearsToPay: proposal.yearsToPay || '20',
      averageReturnPercentage: proposal.averageReturnPercentage || '6',
      deathBenefitAmount: proposal.deathBenefitAmount || '',
      livingBenefits: proposal.livingBenefits || '',
      terminalIllnessBenefit: proposal.terminalIllnessBenefit || '',
      chronicIllnessBenefit: proposal.chronicIllnessBenefit || '',
      criticalIllnessBenefit: proposal.criticalIllnessBenefit || '',
      averageMonthlyCost: proposal.averageMonthlyCost || '',
      tenYearIncome: proposal.tenYearIncome || '',
      lifetimeIncome: proposal.lifetimeIncome || ''
    });
    setSelectedStrategyId(proposal.strategy ? String(proposal.strategy) : '');
    setIsEditModalOpen(true);
  };

  const handleDelete = async (proposalId) => {
    if (window.confirm('Are you sure you want to delete this projection?')) {
      try {
        logDev('Deleting proposal from Supabase:', proposalId);
        
        // Delete from Supabase
        const { error } = await supabase
          .from('projections_pf')
          .delete()
          .eq('id', proposalId);
          
        if (error) throw error;
        
        logDev('Proposal deleted successfully from Supabase');
        
        // Update local state
        deleteProposal(proposalId);
      } catch (error) {
        console.error('Error deleting proposal from Supabase:', error);
        alert(`Failed to delete proposal: ${error.message}`);
      }
    }
  };

  const handleStatusChange = async (proposalId, newStatus) => {
    try {
      logDev('Updating proposal status in Supabase:', proposalId, newStatus);
      
      // Update in Supabase
      const { data, error } = await supabase
        .from('projections_pf')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId)
        .select();
        
      if (error) throw error;
      
      logDev('Proposal status updated successfully in Supabase:', data);
      
      // Update local state
      if (data && data.length > 0) {
        updateProposal(proposalId, data[0]);
      } else {
        updateProposal(proposalId, { status: newStatus });
      }
    } catch (error) {
      console.error('Error updating proposal status in Supabase:', error);
      alert(`Failed to update status: ${error.message}`);
    }
  };

  const handleViewPDF = (proposal) => {
    setSelectedProposal(proposal);
    setIsPDFModalOpen(true);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('proposal-pdf');
    if (!element) return;

    // Ensure fonts and styles are applied
    await document.fonts.ready;
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Ensure images are loaded and use placeholder for failures
    const imgs = element.querySelectorAll('img');
    for (const img of imgs) {
      const originalSrc = img.src;

      if (failedImages.current.has(originalSrc) || originalSrc === DEFAULT_AVATAR_URL) {
        img.src = DEFAULT_AVATAR_URL;
        continue;
      }

      if (!(img.complete && img.naturalWidth > 0)) {
        await new Promise(resolve => {
          img.onload = () => {
            img.onload = null;
            img.onerror = null;
            resolve();
          };
          img.onerror = () => {
            failedImages.current.add(originalSrc);
            img.src = DEFAULT_AVATAR_URL;
            img.onload = null;
            img.onerror = null;
            resolve();
          };
        });
      }
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.6);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        putOnlyUsedFonts: true,
        floatPrecision: 2
      });
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;
      }

      const client = clients.find(c => c.id === selectedProposal.clientId);
      const pdfBlob = pdf.output('blob');
      const sizeMB = pdfBlob.size / (1024 * 1024);
      if (sizeMB > 10) {
        console.warn('PDF too large, additional compression needed');
      }
      const fileName = `${client?.name.replace(/\s+/g, '_')}_Strategy_Projections.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-900">Strategy Projections</h1>
              <p className="text-gray-600">Create and manage financial strategy projections for your clients</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
              <span>Create Projection</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
        </motion.div>

        {/* Projections Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProposals.map((proposal) => {
            const strategy = FINANCIAL_STRATEGIES.find(s => String(s.id) === String(proposal.strategy));
            const product = PRODUCT_TYPES[proposal.productType];
            const carrier = DEFAULT_CARRIERS.find(c => c.id === proposal.carrier);
            return (
              <div
                key={proposal.id}
                className="card hover:shadow-medium transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <StatusBadge status={proposal.status} />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewPDF(proposal)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <SafeIcon icon={FiEye} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(proposal)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <SafeIcon icon={FiEdit} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(proposal.id)}
                      className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{proposal.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{proposal.description}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SafeIcon icon={FiUser} className="w-4 h-4" />
                    <span>{getClientName(proposal.clientId)}</span>
                  </div>
                  {strategy && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="w-4 h-4 bg-primary-100 rounded flex items-center justify-center">
                        <span className="text-primary-600 text-xs">S</span>
                      </span>
                      <span>{strategy.name}</span>
                    </div>
                  )}
                  {product && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="w-4 h-4 bg-secondary-100 rounded flex items-center justify-center">
                        <span className="text-secondary-600 text-xs">P</span>
                      </span>
                      <span>{product.name}</span>
                    </div>
                  )}
                  {carrier && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <img
                        src={getTransformedImage(carrier.logo, { width: 32, height: 32 })}
                        alt={carrier.name}
                        className="w-4 h-4 rounded"
                      />
                      <span>{carrier.name}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                    <span>Created: {proposal.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    {proposal.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange(proposal.id, 'sent')}
                        className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium hover:bg-primary-200 transition-colors flex items-center space-x-1"
                      >
                        <SafeIcon icon={FiSend} className="w-3 h-3" />
                        <span>Send</span>
                      </button>
                    )}
                    {proposal.status === 'sent' && (
                      <button
                        onClick={() => handleStatusChange(proposal.id, 'approved')}
                        className="px-3 py-1 bg-success-100 text-success-800 rounded-full text-xs font-medium hover:bg-success-200 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleViewPDF(proposal)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <SafeIcon icon={FiDownload} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Create/Edit Projection Modal */}
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            resetForm();
          }}
          title={selectedProposal ? 'Edit Strategy Projection' : 'Create Strategy Projection'}
          size="full"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  className="form-input"
                >
                  <option value="">Select a client</option>
                  {availableClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projection Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                  placeholder="Enter projection title"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-input h-24 resize-none"
                placeholder="Brief description of the strategy projection"
              />
            </div>

            {/* Strategy Selection */}
            <StrategySelector
              selectedStrategy={selectedStrategyId}
              onStrategyChange={(strategy) => {
                setSelectedStrategyId(strategy);
                setFormData((prev) => ({
                  ...prev,
                  strategy: strategy ? String(strategy) : '',
                  productType: '',
                  carrier: ''
                }));
              }}
              selectedProduct={formData.productType}
              onProductChange={(productType) =>
                setFormData((prev) => ({
                  ...prev,
                  productType: productType ? String(productType) : '',
                  carrier: ''
                }))
              }
            />

            {/* Carrier Selection */}
            {formData.productType && (
              <CarrierSelector
                selectedCarrier={formData.carrier}
                onCarrierChange={(carrier) => setFormData({...formData, carrier})}
                selectedProduct={formData.productType}
                carriers={DEFAULT_CARRIERS}
              />
            )}

            {/* Product Configuration */}
            {formData.strategy && formData.productType && (
              <ProductConfiguration
                formData={formData}
                onFormDataChange={setFormData}
              />
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : selectedProposal ? 'Update Projection' : 'Create Projection'}
              </button>
            </div>
          </form>
        </Modal>

        {/* PDF Preview Modal */}
        <Modal
          isOpen={isPDFModalOpen}
          onClose={() => {
            setIsPDFModalOpen(false);
            setSelectedProposal(null);
          }}
          title="Projection Preview"
          size="full"
        >
          <div className="mb-4 flex justify-end space-x-3 print:hidden">
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
          {selectedProposal && (
            <ProposalPDF
              proposal={selectedProposal}
              client={clients.find(c => c.id === selectedProposal.clientId)}
              advisor={users.find(u => u.id === selectedProposal.advisorId)}
              carrier={DEFAULT_CARRIERS.find(c => c.id === selectedProposal.carrier)}
              strategy={FINANCIAL_STRATEGIES.find(s => String(s.id) === String(selectedProposal.strategy))}
              product={PRODUCT_TYPES[selectedProposal.productType]}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ProposalManagement;