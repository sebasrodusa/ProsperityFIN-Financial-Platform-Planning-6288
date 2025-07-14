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

// Export the provider component directly
export const FinancialAnalysisProvider = ({ children }) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('FinancialAnalysisProvider rendering, user:', user?.id);

  // ... rest of the provider implementation ...

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

// Add default export
export default FinancialAnalysisProvider;