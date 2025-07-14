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

  console.log('FinancialAnalysisProvider rendering, user:', user?.id);

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
        console.log('No financial analysis found in Supabase, inserting new row');
        const newAnalysis = {
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
        };

        const { data: inserted, error: insertError } = await supabase
          .from('financial_analyses_pf')
          .insert(newAnalysis)
          .select()
          .maybeSingle();

        if (insertError) throw insertError;
        setAnalysis(inserted || { ...newAnalysis });
      }
    } catch (err) {
      console.error('Error loading analysis:', err);
      setError('Failed to load financial analysis data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save or update analysis data
  const saveAnalysis = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...data,
        updated_at: new Date().toISOString()
      };

      let saved;
      if (payload.id) {
        const { data: updated, error } = await supabase
          .from('financial_analyses_pf')
          .update(payload)
          .eq('id', payload.id)
          .select()
          .maybeSingle();

        if (error) throw error;
        saved = updated || payload;
      } else {
        const { data: inserted, error } = await supabase
          .from('financial_analyses_pf')
          .insert(payload)
          .select()
          .maybeSingle();

        if (error) throw error;
        saved = inserted || payload;
      }

      setAnalysis(saved);
      return saved;
    } catch (err) {
      console.error('Error saving analysis:', err);
      setError('Failed to save analysis. Using local data only.');
      setAnalysis(data);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save income sources - with fallback
  const saveIncomeSources = useCallback(async (analysisId, sources) => {
    try {
      setLoading(true);
      console.log('Saving income sources for analysis:', analysisId, sources);

      const { data, error } = await supabase
        .from('financial_analyses_pf')
        .update({
          income_sources_fa7: sources,
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId)
        .select()
        .maybeSingle();

      if (error) throw error;

      setAnalysis(prev => prev ? { ...prev, income_sources_fa7: sources } : prev);
      return { success: true, data };
    } catch (err) {
      console.error('Error saving income sources:', err);
      setError('Failed to save income sources. Using local data only.');
      setAnalysis(prev => prev ? { ...prev, income_sources_fa7: sources } : prev);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Save expenses - with fallback
  const saveExpenses = useCallback(async (analysisId, expenses) => {
    try {
      setLoading(true);
      console.log('Saving expenses for analysis:', analysisId, expenses);

      const { data, error } = await supabase
        .from('financial_analyses_pf')
        .update({
          expenses_fa7: expenses,
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId)
        .select()
        .maybeSingle();

      if (error) throw error;

      setAnalysis(prev => prev ? { ...prev, expenses_fa7: expenses } : prev);
      return { success: true, data };
    } catch (err) {
      console.error('Error saving expenses:', err);
      setError('Failed to save expenses. Using local data only.');
      setAnalysis(prev => prev ? { ...prev, expenses_fa7: expenses } : prev);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
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