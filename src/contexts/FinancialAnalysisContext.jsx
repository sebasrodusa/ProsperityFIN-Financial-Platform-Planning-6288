import React, { createContext, useContext, useState, useCallback } from 'react';
import supabase from '../lib/supabase';
import { useAuth } from './AuthContext';

const FinancialAnalysisContext = createContext();

export const useFinancialAnalysis = () => {
  const context = useContext(FinancialAnalysisContext);
  if (!context) {
    throw new Error('useFinancialAnalysis must be used within a FinancialAnalysisProvider');
  }
  return context;
};

export const FinancialAnalysisProvider = ({ children }) => {
  const { user } = useAuth();
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
        {
          id: 1,
          category: 'primary',
          description: 'Primary Income',
          amount: 120000,
          frequency: 'annual'
        },
        // More income sources...
      ],
      expenses_fa7: [
        {
          id: 'housing_mortgage',
          category: 'Housing',
          description: 'Mortgage or Rent',
          amount: 3200,
          frequency: 'monthly'
        },
        // More expenses...
      ],
      // More financial data...
    },
    // More client financial data...
  };

  // Load analysis data
  const loadAnalysis = useCallback(async (clientId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading financial analysis for client:', clientId);
      
      // Fetch from Supabase
      const { data, error: fetchError } = await supabase
        .from('financial_analyses_pf')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      if (data) {
        console.log('Financial analysis loaded from Supabase:', data);
        setAnalysis(data);
      } else {
        console.log('No financial analysis found in Supabase, creating new template');
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
            created_by: user?.id,
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
      }
    } catch (err) {
      console.error('Error loading analysis:', err);
      setError('Failed to load financial analysis data. Using local data instead.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save or update analysis data
  const saveAnalysis = useCallback(async (data) => {
    // Just update the local state for now
    setAnalysis(data);
    return data;
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