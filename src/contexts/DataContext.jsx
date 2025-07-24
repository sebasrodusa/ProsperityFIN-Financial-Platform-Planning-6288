import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseClient } from '../lib/supabaseClient';
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
  const supabase = useSupabaseClient();
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

      // Use consistent user ID throughout
      const userId = user.supabaseId || user.id;

      if (user.role === 'client') {
        // Clients only need their own record and related advisor data
        const { data: client, error: clientError } = await supabase
          .from('clients_pf')
          .select('*')
          .eq('id', userId)
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
          .eq('advisor_id', userId);
        if (cError) throw cError;

        const { data: uData, error: uError } = await supabase
          .from('users_pf')
          .select('*')
          .eq('advisor_id', userId);
        if (uError) throw uError;

        const { data: pData, error: pError } = await supabase
          .from('projections_pf')
          .select('*')
          .eq('advisor_id', userId);
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
      // Strip any CRM related fields and ID before inserting
      const {
        id, // ALWAYS exclude id when inserting - let DB generate it
        crm_status,
        crm_notes,
        crm_tasks,
        status_history,
        last_activity,
        ...cleanClient
      } = client;

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use consistent user ID
      const userId = user.supabaseId || user.id;

      // Ensure the authenticated user exists in users_pf
      const { data: existingUser, error: userErr } = await supabase
        .from('users_pf')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (userErr) {
        console.error('Error checking user existence:', userErr);
        throw userErr;
      }
      
      if (!existingUser) {
        // If user doesn't exist in users_pf, create them first
        const { data: newUserData, error: createUserErr } = await supabase
          .from('users_pf')
          .insert({
            id: userId,
            email: user.email,
            role: user.role || 'advisor',
            full_name: user.full_name || user.email?.split('@')[0] || 'Unknown',
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createUserErr) {
          console.error('Error creating user in users_pf:', createUserErr);
          throw createUserErr;
        }
      }

      // Now insert the client with proper advisor_id
      const { data, error } = await supabase
        .from('clients_pf')
        .insert({
          ...cleanClient,
          advisor_id: userId,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting client:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert operation');
      }

      setClients(prev => [...prev, data]);

      // Initialize CRM records for the newly created client
      if (initializeClientCrm) {
        try {
          await initializeClientCrm(data.id);
        } catch (crmError) {
          console.error('Error initializing CRM for client:', crmError);
          // Don't throw here - client was created successfully
        }
      }

      return data;
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
      // Remove any CRM related fields and ID from the update payload
      const {
        id: removeId, // Never update the ID
        crm_status,
        crm_notes,
        crm_tasks,
        status_history,
        last_activity,
        created_at, // Don't update created_at
        ...cleanUpdates
      } = updates;

      // Add updated_at timestamp
      cleanUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('clients_pf')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setClients(prev => prev.map(client => 
          client.id === id ? { ...client, ...data } : client
        ));
      }
      
      return data;
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
      const { id, ...cleanUserData } = userData;
      const userId = user.supabaseId || user.id;

      const { data, error } = await supabase
        .from('users_pf')
        .insert({ 
          ...cleanUserData, 
          advisor_id: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setUsers(prev => [...prev, data]);
      }
      return data;
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
      // Remove id and created_at from updates
      const { id: removeId, created_at, ...cleanUpdates } = updates;
      cleanUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('users_pf')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, ...data } : user
        ));
      }
      return data;
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
      const { id, ...cleanProposal } = proposal;
      const userId = user.supabaseId || user.id;

      const { data, error } = await supabase
        .from('projections_pf')
        .insert({ 
          ...cleanProposal, 
          advisor_id: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProposals(prev => [...prev, data]);
      }
      return data;
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
      const { id: removeId, created_at, ...cleanUpdates } = updates;
      cleanUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('projections_pf')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProposals(prev => prev.map(proposal => 
          proposal.id === id ? { ...proposal, ...data } : proposal
        ));
      }
      return data;
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
