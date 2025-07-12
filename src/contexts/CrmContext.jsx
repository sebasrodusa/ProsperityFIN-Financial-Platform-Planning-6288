import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import supabase from '../lib/supabase';

// Status stages
export const CLIENT_STATUSES = [
  { id: 'initial_meeting_completed', label: 'Initial Meeting Completed' },
  { id: 'follow_up_meeting', label: 'Follow-up for Meeting' },
  { id: 'interested_not_ready', label: 'Interested but Not Ready' },
  { id: 'create_proposal', label: 'Create Proposal' },
  { id: 'follow_up_decision', label: 'Follow-up for Decision' },
  { id: 'application_submitted', label: 'Application Submitted' },
  { id: 'client_won', label: 'Client (won)' }
];

const CrmContext = createContext();

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};

export const CrmProvider = ({ children }) => {
  const { user } = useAuth();
  const [clientStatuses, setClientStatuses] = useState({});
  const [statusHistory, setStatusHistory] = useState({});
  const [clientTasks, setClientTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for client statuses, history and tasks
  const mockData = {
    statuses: {
      '1': { clientId: '1', status: 'initial_meeting_completed', updatedAt: '2023-12-01T10:30:00Z' },
      '2': { clientId: '2', status: 'follow_up_meeting', updatedAt: '2023-12-02T14:15:00Z' },
      '4': { clientId: '4', status: 'create_proposal', updatedAt: '2023-12-05T09:45:00Z' }
    },
    history: {
      '1': [
        {
          id: '101',
          clientId: '1',
          status: 'initial_meeting_completed',
          notes: 'First meeting went well. Client interested in retirement planning.',
          createdAt: '2023-12-01T10:30:00Z'
        }
      ],
      '2': [
        {
          id: '201',
          clientId: '2',
          status: 'initial_meeting_completed',
          notes: 'Discussed college funding options.',
          createdAt: '2023-11-28T13:00:00Z'
        },
        {
          id: '202',
          clientId: '2',
          status: 'follow_up_meeting',
          notes: 'Scheduling follow-up to present retirement options.',
          createdAt: '2023-12-02T14:15:00Z'
        }
      ],
      '4': [
        {
          id: '401',
          clientId: '4',
          status: 'initial_meeting_completed',
          notes: 'Comprehensive review of current financial situation.',
          createdAt: '2023-11-20T11:00:00Z'
        },
        {
          id: '402',
          clientId: '4',
          status: 'follow_up_meeting',
          notes: 'Presented initial findings and recommendations.',
          createdAt: '2023-11-30T15:30:00Z'
        },
        {
          id: '403',
          clientId: '4',
          status: 'create_proposal',
          notes: 'Client interested in LIRP strategy. Working on proposal.',
          createdAt: '2023-12-05T09:45:00Z'
        }
      ]
    },
    tasks: {
      '1': [
        {
          id: '1001',
          clientId: '1',
          taskName: 'Send follow-up email',
          description: 'Include retirement planning resources',
          dueDate: '2023-12-08',
          completed: true,
          createdAt: '2023-12-01T11:00:00Z',
          updatedAt: '2023-12-02T09:30:00Z'
        }
      ]
    }
  };

  // Load client CRM data
  useEffect(() => {
    const loadCrmData = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real implementation, this would fetch from Supabase
        // For now, we'll use mock data
        setClientStatuses(mockData.statuses);
        setStatusHistory(mockData.history);
        setClientTasks(mockData.tasks);
      } catch (err) {
        console.error('Error loading CRM data:', err);
        setError('Failed to load CRM data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadCrmData();
    }
  }, [user]);

  // Update client status
  const updateClientStatus = async (clientId, newStatus, notes = '') => {
    try {
      const timestamp = new Date().toISOString();

      // Update status
      const updatedStatuses = {
        ...clientStatuses,
        [clientId]: { clientId, status: newStatus, updatedAt: timestamp }
      };
      setClientStatuses(updatedStatuses);

      // Add to history
      const historyEntry = {
        id: Date.now().toString(),
        clientId,
        status: newStatus,
        notes,
        createdAt: timestamp
      };
      const clientHistory = statusHistory[clientId] || [];
      const updatedHistory = {
        ...statusHistory,
        [clientId]: [...clientHistory, historyEntry]
      };
      setStatusHistory(updatedHistory);

      // In a real implementation, would save to Supabase here
      return { success: true };
    } catch (err) {
      console.error('Error updating client status:', err);
      return { success: false, error: err.message };
    }
  };

  // Add task for client
  const addClientTask = async (clientId, taskData) => {
    try {
      const timestamp = new Date().toISOString();
      const newTask = {
        id: Date.now().toString(),
        clientId,
        ...taskData,
        completed: false,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const clientTaskList = clientTasks[clientId] || [];
      const updatedTasks = {
        ...clientTasks,
        [clientId]: [...clientTaskList, newTask]
      };
      setClientTasks(updatedTasks);

      // In a real implementation, would save to Supabase here
      return { success: true, task: newTask };
    } catch (err) {
      console.error('Error adding client task:', err);
      return { success: false, error: err.message };
    }
  };

  // Update task
  const updateClientTask = async (clientId, taskId, updates) => {
    try {
      const timestamp = new Date().toISOString();
      const clientTaskList = clientTasks[clientId] || [];
      const updatedClientTasks = clientTaskList.map(task =>
        task.id === taskId ? { ...task, ...updates, updatedAt: timestamp } : task
      );

      const updatedTasks = {
        ...clientTasks,
        [clientId]: updatedClientTasks
      };
      setClientTasks(updatedTasks);

      // In a real implementation, would save to Supabase here
      return { success: true };
    } catch (err) {
      console.error('Error updating client task:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete task
  const deleteClientTask = async (clientId, taskId) => {
    try {
      const clientTaskList = clientTasks[clientId] || [];
      const updatedClientTasks = clientTaskList.filter(task => task.id !== taskId);

      const updatedTasks = {
        ...clientTasks,
        [clientId]: updatedClientTasks
      };
      setClientTasks(updatedTasks);

      // In a real implementation, would delete from Supabase here
      return { success: true };
    } catch (err) {
      console.error('Error deleting client task:', err);
      return { success: false, error: err.message };
    }
  };

  // Get client status
  const getClientStatus = (clientId) => {
    return clientStatuses[clientId] || { clientId, status: 'initial_meeting_completed', updatedAt: new Date().toISOString() };
  };

  // Get client history
  const getClientHistory = (clientId) => {
    return statusHistory[clientId] || [];
  };

  // Get client tasks
  const getClientTasks = (clientId) => {
    return clientTasks[clientId] || [];
  };

  const value = {
    loading,
    error,
    updateClientStatus,
    addClientTask,
    updateClientTask,
    deleteClientTask,
    getClientStatus,
    getClientHistory,
    getClientTasks
  };

  return (
    <CrmContext.Provider value={value}>
      {children}
    </CrmContext.Provider>
  );
};

export default CrmProvider;