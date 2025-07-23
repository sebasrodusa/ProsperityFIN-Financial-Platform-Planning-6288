import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from '../lib/supabaseClient';
import { useAuthContext } from './AuthContext';
import { useCrm } from './CrmContext';
import logDev from '../utils/logDev';

const DataContext = createContext();

// Export the custom hook
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuthContext();
  const { initializeClientCrm } = useCrm();
  const supabase = useSupabase();
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  logDev('DataProvider rendering, user:', user?.id);

  // Load data when user changes
  useEffect(() => {
    if (user && supabase) {
      fetchData();
    }
  }, [user, supabase]);

  const fetchData = async () => {
    if (!supabase) {
      console.error('Supabase client not available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      logDev('Fetching data from Supabase...');

      let clientsData = [];
      let usersData = [];
      let proposalsData = [];

      if (user.role === 'client') {
        // Clients only need their own record and related advisor data
        const { data: client, error: clientError } = await supabase
          .from('clients_pf')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (clientError) throw clientError;

        const advisorId = client?.advisor_id || null;

        const { data: uData, error: uError } = await supabase
          .from('users_pf')
          .select('*')
          .eq('advisor_id', advisorId);
        if (uError) throw uError;

        const { data: pData, error: pError } = await supabase
          .from('projections_pf')
          .select('*')
          .eq('advisor_id', advisorId);
        if (pError) throw pError;

        clientsData = client ? [client] : [];
        usersData = uData || [];
        proposalsData = pData || [];
      } else {
        // Advisors/managers/admins fetch by advisor id
          const { data: cData, error: cError } = await supabase
            .from('clients_pf')
            .select('*')
            .eq('advisor_id', user.id);
        if (cError) throw cError;

          const { data: uData, error: uError } = await supabase
            .from('users_pf')
            .select('*')
            .eq('advisor_id', user.id);
        if (uError) throw uError;

          const { data: pData, error: pError } = await supabase
            .from('projections_pf')
            .select('*')
            .eq('advisor_id', user.id);
        if (pError) throw pError;

        clientsData = cData || [];
        usersData = uData || [];
        proposalsData = pData || [];
      }

      logDev('Data fetched successfully:', {
        clients: clientsData.length,
        users: usersData.length,
        proposals: proposalsData.length
      });

      setClients(clientsData);
      setUsers(usersData);
      setProposals(proposalsData);
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for clients
  const addClient = async (client) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      // Strip any CRM related fields before inserting. CRM records are managed
      // separately via the CrmContext.
      const {
        crm_status,
        crm_notes,
        crm_tasks,
        status_history,
        last_activity,
        ...cleanClient
      } = client;

      const { data: { user: supaUser }, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;

      const { data, error } = await supabase
        .from('clients_pf')
        .insert({ ...cleanClient, advisor_id: supaUser.id })
        .select();
      if (error) throw error;

      const newClient = data && data.length > 0 ? data[0] : { ...client, advisor_id: supaUser.id };
      setClients(prev => [...prev, newClient]);

      // Initialize CRM records for the newly created client
      initializeClientCrm(newClient.id);

      return newClient;
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  };

  const updateClient = async (id, updates) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      // Remove any CRM related fields from the update payload.
      const {
        crm_status,
        crm_notes,
        crm_tasks,
        status_history,
        last_activity,
        ...cleanUpdates
      } = updates;

      const { data, error } = await supabase
        .from('clients_pf')
        .update(cleanUpdates)
        .eq('id', id)
        .select();
      if (error) throw error;

      const updated = data && data.length > 0 ? data[0] : { id, ...updates };
      setClients(prev => prev.map(client => client.id === id ? { ...client, ...updated } : client));
      return updated;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const deleteClient = async (id) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { error } = await supabase
        .from('clients_pf')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setClients(prev => prev.filter(client => client.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  // CRUD operations for users
  const addUser = async (userData) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { data, error } = await supabase
        .from('users_pf')
        .insert({ ...userData, advisor_id: user.id })
        .select();
      if (error) throw error;

      const newUser = data && data.length > 0 ? data[0] : { ...userData, advisor_id: user.id };
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (id, updates) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { data, error } = await supabase
        .from('users_pf')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) throw error;

      const updated = data && data.length > 0 ? data[0] : { id, ...updates };
      setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updated } : user));
      return updated;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { error } = await supabase
        .from('users_pf')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  // CRUD operations for proposals
  const addProposal = async (proposal) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { data, error } = await supabase
        .from('projections_pf')
        .insert({ ...proposal, advisor_id: user.id })
        .select();
      if (error) throw error;

      const newProposal = data && data.length > 0 ? data[0] : { ...proposal, advisor_id: user.id };
      setProposals(prev => [...prev, newProposal]);
      return newProposal;
    } catch (error) {
      console.error('Error adding proposal:', error);
      throw error;
    }
  };

  const updateProposal = async (id, updates) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { data, error } = await supabase
        .from('projections_pf')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) throw error;

      const updated = data && data.length > 0 ? data[0] : { id, ...updates };
      setProposals(prev => prev.map(proposal => proposal.id === id ? { ...proposal, ...updated } : proposal));
      return updated;
    } catch (error) {
      console.error('Error updating proposal:', error);
      throw error;
    }
  };

  const deleteProposal = async (id) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { error } = await supabase
        .from('projections_pf')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setProposals(prev => prev.filter(proposal => proposal.id !== id));
    } catch (error) {
      console.error('Error deleting proposal:', error);
      throw error;
    }
  };

  // Refresh data
  const refreshData = async () => {
    if (supabase) {
      await fetchData();
    }
  };

  const value = {
    clients,
    users,
    proposals,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    addUser,
    updateUser,
    deleteUser,
    addProposal,
    updateProposal,
    deleteProposal,
    refreshData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
