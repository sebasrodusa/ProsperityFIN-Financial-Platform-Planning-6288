import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { useAuthContext } from './AuthContext';
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
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  logDev('DataProvider rendering, user:', user?.id);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      logDev('Fetching data from Supabase...');

      // Fetch clients
      let { data: clientsData, error: clientsError } = await supabase
        .from('clients_pf')
        .select('*')
        .eq('advisor_id', user.id);
      if (clientsError) throw clientsError;

      // Fetch users
      let { data: usersData, error: usersError } = await supabase
        .from('users_pf')
        .select('*')
        .eq('advisor_id', user.id);
      if (usersError) throw usersError;

      // Fetch proposals
      let { data: proposalsData, error: proposalsError } = await supabase
        .from('projections_pf')
        .select('*')
        .eq('advisor_id', user.id);
      if (proposalsError) throw proposalsError;

      logDev('Data fetched successfully:', {
        clients: clientsData.length,
        users: usersData.length,
        proposals: proposalsData.length
      });

      setClients(clientsData || []);
      setUsers(usersData || []);
      setProposals(proposalsData || []);
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for clients
  const addClient = async (client) => {
    try {
      const { data, error } = await supabase
        .from('clients_pf')
        .insert({ ...client, advisor_id: user.id })
        .select();
      if (error) throw error;

      const newClient = data && data.length > 0 ? data[0] : { ...client, advisor_id: user.id };
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  };

  const updateClient = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('clients_pf')
        .update(updates)
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
    await fetchData();
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

export default DataProvider;