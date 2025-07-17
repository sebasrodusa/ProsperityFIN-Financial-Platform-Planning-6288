import React, { createContext, useContext, useState, useCallback } from 'react';
import supabase from '../lib/supabase';
import { useAuthContext } from './AuthContext';
import logDev from '../utils/logDev';

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
  const { user } = useAuthContext();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  logDev('FinancialAnalysisProvider rendering, user:', user?.id);

  // Load analysis data for a specific client
  // If createIfMissing is false, do not insert a new record when none exists
  const loadAnalysis = useCallback(async (clientId, createIfMissing = true) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('financial_analyses_pf')
        .select('*')
        .eq('client_id', clientId);

      if (user.role !== 'client') {
        query = query.eq('created_by', user.id);
      }

      const { data, error: fetchError } = await query
        // Order newest first and limit to a single row to avoid PGRST116 when duplicates exist
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setAnalysis(data);
      } else if (createIfMissing) {
        const newAnalysis = {
          client_id: clientId,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          income_sources: [],
          expenses: [],
          assets: [],
          liabilities: [],
          insurance_policies: [],
          financial_goals: [],
          estate_checklist: {
            will: { completed: false, lastUpdated: '', notes: '' },
            powerOfAttorney: { completed: false, lastUpdated: '', notes: '' },
            healthcareDirective: { completed: false, lastUpdated: '', notes: '' },
            trust: { completed: false, lastUpdated: '', notes: '' },
            beneficiaryDesignations: { completed: false, lastUpdated: '', notes: '' },
            guardianship: { completed: false, lastUpdated: '', notes: '' },
            emergencyFund: { completed: false, lastUpdated: '', notes: '' },
            taxPlanning: { completed: false, lastUpdated: '', notes: '' }
          },
          legacy_wishes: ''
        };

        const { data: inserted, error: insertError } = await supabase
          .from('financial_analyses_pf')
          .insert(newAnalysis)
          .select()
          .maybeSingle();

        if (insertError) throw insertError;
        setAnalysis(inserted || { ...newAnalysis });
      } else {
        setAnalysis(null);
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
      setSaving(true);
      setError(null);

      const payload = {
        ...data,
        updated_at: new Date().toISOString()
      };

      if (user.role !== 'client') {
        payload.created_by = user.id;
      }

      let saved;
      if (payload.id) {
        let updateQuery = supabase
          .from('financial_analyses_pf')
          .update(payload)
          .eq('id', payload.id);

        if (user.role === 'client') {
          updateQuery = updateQuery.eq('client_id', user.id);
        } else {
          updateQuery = updateQuery.eq('created_by', user.id);
        }

        const { data: updated, error } = await updateQuery
          .select()
          .maybeSingle();

        if (error) throw error;
        saved = updated || payload;
      } else {
        const insertPayload = { ...payload };
        if (user.role !== 'client') {
          insertPayload.created_by = user.id;
        }

        const { data: inserted, error } = await supabase
          .from('financial_analyses_pf')
          .insert(insertPayload)
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
      setSaving(false);
    }
  }, [user]);

  // Update income sources only
  const saveIncomeSources = useCallback(async (analysisId, sources) => {
    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('financial_analyses_pf')
        .update({
          income_sources: sources,
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId)
        .eq('created_by', user.id)
        .select()
        .maybeSingle();

      if (error) throw error;

      setAnalysis((prev) => (prev ? { ...prev, income_sources: sources } : prev));
      return { success: true, data };
    } catch (err) {
      console.error('Error saving income sources:', err);
      setError('Failed to save income sources. Using local data only.');
      setAnalysis((prev) => (prev ? { ...prev, income_sources: sources } : prev));
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [user]);

  // Update expenses only
  const saveExpenses = useCallback(async (analysisId, expenses) => {
    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('financial_analyses_pf')
        .update({
          expenses: expenses,
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId)
        .eq('created_by', user.id)
        .select()
        .maybeSingle();

      if (error) throw error;

      setAnalysis((prev) => (prev ? { ...prev, expenses: expenses } : prev));
      return { success: true, data };
    } catch (err) {
      console.error('Error saving expenses:', err);
      setError('Failed to save expenses. Using local data only.');
      setAnalysis((prev) => (prev ? { ...prev, expenses: expenses } : prev));
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [user]);

  const value = {
    analysis,
    loading,
    saving,
    error,
    loadAnalysis,
    saveAnalysis,
    saveIncomeSources,
    saveExpenses,
    setAnalysis,
  };

  return (
    <FinancialAnalysisContext.Provider value={value}>
      {children}
    </FinancialAnalysisContext.Provider>
  );
};

// Add default export
export default FinancialAnalysisProvider;
