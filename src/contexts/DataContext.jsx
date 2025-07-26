import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseClient } from '../lib/supabaseClient';
import { useAuthContext } from './AuthContext';
import { useCrm } from './CrmContext';
import logDev from '../utils/logDev';
import { camelizeKeys } from "../utils/camelize";
import { decamelizeKeys } from "../utils/decamelize";
import { uploadFile, deleteFile } from '../services/publitio';

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
  const [documents, setDocuments] = useState([]);
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
      let documentsData = [];

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

        let userQuery = supabase
          .from('users_pf')
          .select('*');
        if (advisorId === null) {
          userQuery = userQuery.is('advisor_id', null);
        } else {
          userQuery = userQuery.eq('advisor_id', advisorId);
        }
        const { data: uData, error: uError } = await userQuery;
        if (uError) throw uError;

        let proposalQuery = supabase
          .from('projections_pf')
          .select('*');
        if (advisorId === null) {
          proposalQuery = proposalQuery.is('advisor_id', null);
        } else {
          proposalQuery = proposalQuery.eq('advisor_id', advisorId);
        }
        const { data: pData, error: pError } = await proposalQuery;
        if (pError) throw pError;
        let documentsQuery = supabase
          .from('documents_pf')
          .select('*')
          .or(`client_id.eq.${userId},user_id.eq.${userId}`);
        const { data: dData, error: dError } = await documentsQuery;
        if (dError) throw dError;

        clientsData = client ? [client] : [];
        usersData = uData || [];
        proposalsData = pData || [];
        documentsData = dData || [];

        clientsData = clientsData.map(camelizeKeys);
        usersData = usersData.map(camelizeKeys);
        proposalsData = proposalsData.map(camelizeKeys);
        documentsData = documentsData.map(camelizeKeys);
      } else {
        // Advisors/managers fetch by advisor id, admins fetch all
        let clientsQuery = supabase
          .from('clients_pf')
          .select('*');
        let usersQuery = supabase
          .from('users_pf')
          .select('*');
        let proposalsQuery = supabase
          .from('projections_pf')
          .select('*');
        let documentsQuery = supabase
          .from('documents_pf')
          .select('*');

        if (user.role !== 'admin') {
          clientsQuery = clientsQuery.eq('advisor_id', userId);
          usersQuery = usersQuery.eq('advisor_id', userId);
          proposalsQuery = proposalsQuery.eq('advisor_id', userId);
          documentsQuery = documentsQuery.eq('user_id', userId);
        }

        const { data: cData, error: cError } = await clientsQuery;
        if (cError) throw cError;

        const { data: uData, error: uError } = await usersQuery;
        if (uError) throw uError;

        const { data: pData, error: pError } = await proposalsQuery;
        if (pError) throw pError;
        const { data: dData, error: dError } = await documentsQuery;
        if (dError) throw dError;

        clientsData = (cData || []).map(camelizeKeys);
        usersData = (uData || []).map(camelizeKeys);
        proposalsData = (pData || []).map(camelizeKeys);
        documentsData = (dData || []).map(camelizeKeys);
      }

      logDev('Data fetched successfully:', {
        clients: clientsData.length,
        users: usersData.length,
        proposals: proposalsData.length,
        documents: documentsData.length
      });

      setClients(clientsData);
      setUsers(usersData);
      setProposals(proposalsData);
      setDocuments(documentsData);
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
          .insert(
            decamelizeKeys({
              id: userId,
              email: user.email,
              role: user.role || 'advisor',
              fullName: user.full_name || user.email?.split('@')[0] || 'Unknown',
              createdAt: new Date().toISOString()
            })
          )
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
        .insert(
          decamelizeKeys({
            ...cleanClient,
            advisorId: userId,
            createdBy: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        )
        .select()
        .single();

      if (error) {
        console.error('Error inserting client:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert operation');
      }

      setClients(prev => [...prev, camelizeKeys(data)]);

      // Initialize CRM records for the newly created client
      if (initializeClientCrm) {
        try {
          await initializeClientCrm(data.id);
        } catch (crmError) {
          console.error('Error initializing CRM for client:', crmError);
          // Don't throw here - client was created successfully
        }
      }

      return camelizeKeys(data);
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
      cleanUpdates.updatedAt = new Date().toISOString();

      const { data, error } = await supabase
        .from('clients_pf')
        .update(decamelizeKeys(cleanUpdates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const camel = camelizeKeys(data);
        setClients(prev => prev.map(client =>
          client.id === id ? { ...client, ...camel } : client
        ));
        return camel;
      }

      return null;
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
        .insert(
          decamelizeKeys({
            ...cleanUserData,
            advisorId: userId,
            createdAt: new Date().toISOString()
          })
        )
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const camel = camelizeKeys(data);
        setUsers(prev => [...prev, camel]);
        return camel;
      }
      return null;
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
      cleanUpdates.updatedAt = new Date().toISOString();

      const { data, error } = await supabase
        .from('users_pf')
        .update(decamelizeKeys(cleanUpdates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const camel = camelizeKeys(data);
        setUsers(prev => prev.map(user =>
          user.id === id ? { ...user, ...camel } : user
        ));
        return camel;
      }
      return null;
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
        .insert(
          decamelizeKeys({
            ...cleanProposal,
            advisorId: userId,
            createdAt: new Date().toISOString()
          })
        )
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const camel = camelizeKeys(data);
        setProposals(prev => [...prev, camel]);
        return camel;
      }
      return null;
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
      cleanUpdates.updatedAt = new Date().toISOString();

      const { data, error } = await supabase
        .from('projections_pf')
        .update(decamelizeKeys(cleanUpdates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const camel = camelizeKeys(data);
        setProposals(prev => prev.map(proposal =>
          proposal.id === id ? { ...proposal, ...camel } : proposal
        ));
        return camel;
      }
      return null;
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

  const fetchDocuments = async () => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const userId = user.supabaseId || user.id;
      let query = supabase
        .from('documents_pf')
        .select('*');

      if (user.role === 'client') {
        query = query.or(`client_id.eq.${userId},user_id.eq.${userId}`);
      } else if (user.role !== 'admin') {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const docs = (data || []).map(camelizeKeys);
      setDocuments(docs);
      return docs;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  };

  const addDocument = async ({ file, name, clientId }) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    if (!file) {
      throw new Error('File required');
    }

    try {
      const upload = await uploadFile(file, 'documents');
      const userId = user.supabaseId || user.id;
      const { data, error } = await supabase
        .from('documents_pf')
        .insert(
          decamelizeKeys({
            userId,
            clientId,
            name: name || file.name,
            publitioId: upload.public_id,
            url: upload.url,
            createdAt: new Date().toISOString(),
          })
        )
        .select()
        .single();

      if (error) throw error;

      const doc = camelizeKeys(data);
      setDocuments((prev) => [...prev, doc]);
      return doc;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  };

  const deleteDocument = async (id) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const doc = documents.find((d) => d.id === id);
      if (doc?.publitioId) {
        try {
          await deleteFile(doc.publitioId);
        } catch (e) {
          console.error('Error deleting file from Publitio:', e);
        }
      }

      const { error } = await supabase
        .from('documents_pf')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
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
    documents,
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
    fetchDocuments,
    addDocument,
    deleteDocument,
    refreshData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
