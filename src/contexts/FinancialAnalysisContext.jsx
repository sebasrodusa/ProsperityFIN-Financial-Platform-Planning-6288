import React, { createContext, useContext, useState, useCallback } from 'react';

// Import supabase but wrap usage in try/catch to prevent crashes
import supabase from '../lib/supabase';

const FinancialAnalysisContext = createContext();

export const useFinancialAnalysis = () => {
  const context = useContext(FinancialAnalysisContext);
  if (!context) {
    throw new Error('useFinancialAnalysis must be used within a FinancialAnalysisProvider');
  }
  return context;
};

export const FinancialAnalysisProvider = ({ children }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock financial data for clients
  const mockFinancialData = {
    '1': {
      id: 'analysis-1',
      client_id: '1',
      created_at: '2024-01-20T10:30:00Z',
      updated_at: '2024-06-01T14:45:00Z',
      income_sources_fa7: [
        { id: 1, category: 'primary', description: 'Primary Income', amount: 120000, frequency: 'annual' },
        { id: 2, category: 'investment', description: 'Investment Income', amount: 18000, frequency: 'annual' },
        { id: 3, category: 'real_estate', description: 'Real Estate Income', amount: 36000, frequency: 'annual' }
      ],
      expenses_fa7: [
        { id: 'housing_mortgage', category: 'Housing', description: 'Mortgage or Rent', amount: 3200, frequency: 'monthly' },
        { id: 'transportation_auto_loan', category: 'Transportation', description: 'Auto Loan / Lease', amount: 450, frequency: 'monthly' },
        { id: 'living_groceries', category: 'Living Expenses', description: 'Groceries', amount: 800, frequency: 'monthly' },
        { id: 'living_dining', category: 'Living Expenses', description: 'Dining Out', amount: 600, frequency: 'monthly' },
        { id: 'debt_credit_card', category: 'Debt Payments', description: 'Credit Card', amount: 350, frequency: 'monthly' },
        { id: 'communication_cable_internet', category: 'Communication & Services', description: 'Cable & Internet', amount: 150, frequency: 'monthly' }
      ],
      assets_fa7: [
        { id: 1, category: 'real_estate', description: 'Primary Residence', amount: 850000 },
        { id: 2, category: 'investments', description: 'Stock Portfolio', amount: 325000 },
        { id: 3, category: '401k_403b', description: '401(k)', amount: 420000 },
        { id: 4, category: 'checking', description: 'Checking Account', amount: 15000 },
        { id: 5, category: 'savings', description: 'Savings Account', amount: 65000 }
      ],
      liabilities_fa7: [
        { id: 1, category: 'mortgage', description: 'Home Mortgage', amount: 425000, interestRate: 4.2 },
        { id: 2, category: 'auto_loan', description: 'Car Loan', amount: 28000, interestRate: 3.9 },
        { id: 3, category: 'credit_card', description: 'Credit Card 1', amount: 4500, interestRate: 18.99 },
        { id: 4, category: 'credit_card', description: 'Credit Card 2', amount: 2800, interestRate: 16.5 }
      ],
      insurance_policies_fa7: [
        { id: 1, carrier: 'State Farm', policyType: 'Term Life', coverageAmount: 1000000, annualPremium: 1200, issueDate: '2021-05-15', beneficiary: 'Jane Smith' },
        { id: 2, carrier: 'Northwestern Mutual', policyType: 'Whole Life', coverageAmount: 500000, annualPremium: 3600, issueDate: '2018-08-22', beneficiary: 'Jane Smith' }
      ],
      financial_goals_fa7: [
        { id: 1, title: 'Retirement', description: 'Retire by age 60', targetAmount: 2500000, currentAmount: 420000, targetDate: '2035-01-01', priority: 'high', category: 'Retirement' },
        { id: 2, title: 'College Fund', description: 'Fund for children\'s education', targetAmount: 300000, currentAmount: 85000, targetDate: '2028-09-01', priority: 'medium', category: 'Education' },
        { id: 3, title: 'Vacation Home', description: 'Purchase vacation property', targetAmount: 450000, currentAmount: 75000, targetDate: '2027-06-01', priority: 'low', category: 'Home Purchase' }
      ],
      estateChecklist: {
        will: { completed: true, lastUpdated: '2023-04-10', notes: 'Updated after birth of second child' },
        powerOfAttorney: { completed: true, lastUpdated: '2023-04-10', notes: 'Spouse designated as POA' },
        healthcareDirective: { completed: true, lastUpdated: '2023-04-10', notes: 'Includes DNR provisions' },
        trust: { completed: false, lastUpdated: '', notes: '' },
        beneficiaryDesignations: { completed: true, lastUpdated: '2023-05-22', notes: 'Updated 401k beneficiaries' },
        guardianship: { completed: true, lastUpdated: '2023-04-10', notes: 'Sister designated as guardian for minor children' },
        emergencyFund: { completed: true, lastUpdated: '2023-02-15', notes: '6 months of expenses in high-yield savings' },
        taxPlanning: { completed: false, lastUpdated: '', notes: '' }
      },
      legacyWishes: 'I would like 10% of my estate to be donated to the American Cancer Society. My collection of antique watches should go to my son James. My daughter Emma should receive my grandmother\'s jewelry collection.'
    },
    '2': {
      id: 'analysis-2',
      client_id: '2',
      created_at: '2024-02-15T09:15:00Z',
      updated_at: '2024-05-20T11:30:00Z',
      income_sources_fa7: [
        { id: 1, category: 'primary', description: 'Primary Income', amount: 95000, frequency: 'annual' },
        { id: 2, category: 'spouse', description: 'Spouse Income', amount: 85000, frequency: 'annual' },
        { id: 3, category: 'investment', description: 'Investment Income', amount: 6000, frequency: 'annual' }
      ],
      expenses_fa7: [
        { id: 'housing_mortgage', category: 'Housing', description: 'Mortgage or Rent', amount: 2800, frequency: 'monthly' },
        { id: 'transportation_auto_loan', category: 'Transportation', description: 'Auto Loan / Lease', amount: 650, frequency: 'monthly' },
        { id: 'living_groceries', category: 'Living Expenses', description: 'Groceries', amount: 750, frequency: 'monthly' },
        { id: 'living_dining', category: 'Living Expenses', description: 'Dining Out', amount: 500, frequency: 'monthly' },
        { id: 'family_childcare', category: 'Family', description: 'Child Sitting & Care', amount: 1200, frequency: 'monthly' },
        { id: 'debt_credit_card', category: 'Debt Payments', description: 'Credit Card', amount: 400, frequency: 'monthly' }
      ],
      assets_fa7: [
        { id: 1, category: 'real_estate', description: 'Primary Residence', amount: 650000 },
        { id: 2, category: 'investments', description: 'Stock Portfolio', amount: 120000 },
        { id: 3, category: '401k_403b', description: '401(k)', amount: 285000 },
        { id: 4, category: 'roth_ira', description: 'Roth IRA', amount: 95000 },
        { id: 5, category: 'checking', description: 'Checking Account', amount: 12000 },
        { id: 6, category: 'savings', description: 'Savings Account', amount: 48000 }
      ],
      liabilities_fa7: [
        { id: 1, category: 'mortgage', description: 'Home Mortgage', amount: 385000, interestRate: 3.8 },
        { id: 2, category: 'auto_loan', description: 'Car Loan 1', amount: 32000, interestRate: 4.2 },
        { id: 3, category: 'auto_loan', description: 'Car Loan 2', amount: 18000, interestRate: 3.5 },
        { id: 4, category: 'student_loan', description: 'Student Loan', amount: 42000, interestRate: 5.8 },
        { id: 5, category: 'credit_card', description: 'Credit Card', amount: 5200, interestRate: 17.5 }
      ],
      insurance_policies_fa7: [
        { id: 1, carrier: 'MetLife', policyType: 'Term Life', coverageAmount: 750000, annualPremium: 950, issueDate: '2022-03-10', beneficiary: 'David Johnson' },
        { id: 2, carrier: 'Prudential', policyType: 'Term Life', coverageAmount: 500000, annualPremium: 820, issueDate: '2022-03-15', beneficiary: 'Emily Johnson' }
      ],
      financial_goals_fa7: [
        { id: 1, title: 'Retirement', description: 'Retire by age 65', targetAmount: 2000000, currentAmount: 380000, targetDate: '2040-01-01', priority: 'high', category: 'Retirement' },
        { id: 2, title: 'College Fund', description: 'Fund for child\'s education', targetAmount: 200000, currentAmount: 35000, targetDate: '2030-09-01', priority: 'high', category: 'Education' },
        { id: 3, title: 'Home Renovation', description: 'Kitchen and bathroom remodel', targetAmount: 75000, currentAmount: 15000, targetDate: '2025-06-01', priority: 'medium', category: 'Home' }
      ],
      estateChecklist: {
        will: { completed: true, lastUpdated: '2022-08-15', notes: 'Created with family attorney' },
        powerOfAttorney: { completed: true, lastUpdated: '2022-08-15', notes: 'Spouse designated as POA' },
        healthcareDirective: { completed: true, lastUpdated: '2022-08-15', notes: '' },
        trust: { completed: false, lastUpdated: '', notes: 'Planning to establish in next 2 years' },
        beneficiaryDesignations: { completed: true, lastUpdated: '2022-09-05', notes: 'All accounts updated' },
        guardianship: { completed: true, lastUpdated: '2022-08-15', notes: 'Brother designated as guardian for child' },
        emergencyFund: { completed: true, lastUpdated: '2023-01-10', notes: '4 months of expenses saved' },
        taxPlanning: { completed: false, lastUpdated: '', notes: 'Need to schedule with CPA' }
      },
      legacyWishes: 'I would like my vintage camera collection to be donated to the local photography museum. My personal journals should remain private and be given to my spouse only.'
    },
    '4': {
      id: 'analysis-4',
      client_id: '4',
      created_at: '2024-01-25T14:20:00Z',
      updated_at: '2024-05-30T16:45:00Z',
      income_sources_fa7: [
        { id: 1, category: 'primary', description: 'Primary Income', amount: 175000, frequency: 'annual' },
        { id: 2, category: 'spouse', description: 'Spouse Income', amount: 110000, frequency: 'annual' },
        { id: 3, category: 'investment', description: 'Investment Income', amount: 22000, frequency: 'annual' },
        { id: 4, category: 'real_estate', description: 'Rental Income', amount: 24000, frequency: 'annual' }
      ],
      expenses_fa7: [
        { id: 'housing_mortgage', category: 'Housing', description: 'Mortgage or Rent', amount: 3800, frequency: 'monthly' },
        { id: 'housing_utilities', category: 'Housing', description: 'Water, Gas & Sewer', amount: 350, frequency: 'monthly' },
        { id: 'transportation_auto_loan', category: 'Transportation', description: 'Auto Loan / Lease', amount: 950, frequency: 'monthly' },
        { id: 'living_groceries', category: 'Living Expenses', description: 'Groceries', amount: 1200, frequency: 'monthly' },
        { id: 'living_dining', category: 'Living Expenses', description: 'Dining Out', amount: 900, frequency: 'monthly' },
        { id: 'family_education', category: 'Family', description: 'Educational', amount: 1500, frequency: 'monthly' },
        { id: 'debt_credit_card', category: 'Debt Payments', description: 'Credit Card', amount: 600, frequency: 'monthly' }
      ],
      assets_fa7: [
        { id: 1, category: 'real_estate', description: 'Primary Residence', amount: 850000 },
        { id: 2, category: 'real_estate', description: 'Rental Property', amount: 400000 },
        { id: 3, category: 'investments', description: 'Stock Portfolio', amount: 200000 },
        { id: 4, category: '401k_403b', description: '401(k)', amount: 450000 },
        { id: 5, category: 'roth_ira', description: 'Roth IRA', amount: 75000 },
        { id: 6, category: 'checking', description: 'Checking Account', amount: 25000 },
        { id: 7, category: 'savings', description: 'Savings Account', amount: 75000 },
        { id: 8, category: 'vehicles', description: 'Vehicles', amount: 35000 }
      ],
      liabilities_fa7: [
        { id: 1, category: 'mortgage', description: 'Home Mortgage', amount: 550000, interestRate: 4.0 },
        { id: 2, category: 'mortgage', description: 'Rental Property Mortgage', amount: 300000, interestRate: 4.2 },
        { id: 3, category: 'auto_loan', description: 'Car Loan', amount: 35000, interestRate: 3.8 },
        { id: 4, category: 'student_loan', description: 'Student Loans', amount: 45000, interestRate: 5.2 },
        { id: 5, category: 'credit_card', description: 'Credit Cards', amount: 8000, interestRate: 16.9 }
      ],
      insurance_policies_fa7: [
        { id: 1, carrier: 'MassMutual', policyType: 'Whole Life', coverageAmount: 1000000, annualPremium: 4200, issueDate: '2019-11-20', beneficiary: 'Jane Smith' },
        { id: 2, carrier: 'State Farm', policyType: 'Term Life', coverageAmount: 500000, annualPremium: 1200, issueDate: '2020-05-12', beneficiary: 'Jane Smith' }
      ],
      financial_goals_fa7: [
        { id: 1, title: 'Early Retirement', description: 'Retire by age 60', targetAmount: 2500000, currentAmount: 525000, targetDate: '2035-01-01', priority: 'high', category: 'Retirement' },
        { id: 2, title: 'College Fund - Child 1', description: 'Education fund for Michael', targetAmount: 150000, currentAmount: 35000, targetDate: '2028-09-01', priority: 'high', category: 'Education' },
        { id: 3, title: 'College Fund - Child 2', description: 'Education fund for Emily', targetAmount: 150000, currentAmount: 25000, targetDate: '2030-09-01', priority: 'high', category: 'Education' },
        { id: 4, title: 'Vacation Home', description: 'Purchase vacation property', targetAmount: 450000, currentAmount: 75000, targetDate: '2027-06-01', priority: 'medium', category: 'Home Purchase' }
      ],
      estateChecklist: {
        will: { completed: true, lastUpdated: '2023-04-10', notes: 'Updated after birth of second child' },
        powerOfAttorney: { completed: true, lastUpdated: '2023-04-10', notes: 'Spouse designated as POA' },
        healthcareDirective: { completed: true, lastUpdated: '2023-04-10', notes: 'Includes DNR provisions' },
        trust: { completed: false, lastUpdated: '', notes: '' },
        beneficiaryDesignations: { completed: true, lastUpdated: '2023-05-22', notes: 'Updated 401k beneficiaries' },
        guardianship: { completed: true, lastUpdated: '2023-04-10', notes: 'Sister designated as guardian for minor children' },
        emergencyFund: { completed: true, lastUpdated: '2023-02-15', notes: '6 months of expenses in high-yield savings' },
        taxPlanning: { completed: false, lastUpdated: '', notes: 'Need to schedule with tax professional' }
      },
      insuranceCalculator: {
        annualIncome: 175000,
        yearsToReplace: 20,
        finalExpenses: 25000,
        educationFund: 300000,
        existingCoverage: 1500000,
        liquidAssets: 100000,
        retirementAccounts: 525000
      },
      legacyWishes: 'I would like 10% of my estate to be donated to the American Cancer Society. My collection of antique watches should go to my son Michael. My daughter Emily should receive my grandmother\'s jewelry collection.'
    }
  };

  // Load analysis data
  const loadAnalysis = useCallback(async (clientId) => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have mock data for this client
      if (mockFinancialData[clientId]) {
        // Use a deep copy to prevent reference issues
        const analysisData = JSON.parse(JSON.stringify(mockFinancialData[clientId]));
        setAnalysis(analysisData);
      } else {
        // If no mock data, create empty template
        setAnalysis({
          id: `new-analysis-${clientId}`,
          client_id: clientId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          income_sources_fa7: [],
          expenses_fa7: [],
          assets_fa7: [],
          liabilities_fa7: [],
          insurance_policies_fa7: [],
          financial_goals_fa7: [],
          estateChecklist: {
            will: { completed: false, lastUpdated: '', notes: '' },
            powerOfAttorney: { completed: false, lastUpdated: '', notes: '' },
            healthcareDirective: { completed: false, lastUpdated: '', notes: '' },
            trust: { completed: false, lastUpdated: '', notes: '' },
            beneficiaryDesignations: { completed: false, lastUpdated: '', notes: '' },
            guardianship: { completed: false, lastUpdated: '', notes: '' },
            emergencyFund: { completed: false, lastUpdated: '', notes: '' },
            taxPlanning: { completed: false, lastUpdated: '', notes: '' }
          },
          legacyWishes: ''
        });
      }
    } catch (err) {
      console.error('Error loading analysis:', err);
      setError('Failed to load financial analysis data. Using local data instead.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save or update analysis data
  const saveAnalysis = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      // For now, just simulate a successful save
      console.log('Saving analysis data:', data);
      
      const savedAnalysis = {
        ...data,
        id: data.id || 'new-analysis-id',
        updated_at: new Date().toISOString()
      };
      
      setAnalysis(savedAnalysis);

      // Update the mock data for future reference
      if (data.client_id && mockFinancialData[data.client_id]) {
        mockFinancialData[data.client_id] = savedAnalysis;
      }
      
      return savedAnalysis;
    } catch (err) {
      console.error('Error saving analysis:', err);
      setError('Failed to save analysis. Data is stored locally only.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Save income sources - with fallback
  const saveIncomeSources = useCallback(async (analysisId, sources) => {
    try {
      console.log('Saving income sources for analysis:', analysisId, sources);
      // Success simulation
      return { success: true, data: sources };
    } catch (err) {
      console.error('Error saving income sources:', err);
      setError('Failed to save income sources. Using local data only.');
      return { success: false, error: err.message };
    }
  }, []);

  // Save expenses - with fallback
  const saveExpenses = useCallback(async (analysisId, expenses) => {
    try {
      console.log('Saving expenses for analysis:', analysisId, expenses);
      // Success simulation
      return { success: true, data: expenses };
    } catch (err) {
      console.error('Error saving expenses:', err);
      setError('Failed to save expenses. Using local data only.');
      return { success: false, error: err.message };
    }
  }, []);

  const value = {
    analysis,
    loading,
    error,
    loadAnalysis,
    saveAnalysis,
    saveIncomeSources,
    saveExpenses,
  };

  return (
    <FinancialAnalysisContext.Provider value={value}>
      {children}
    </FinancialAnalysisContext.Provider>
  );
};