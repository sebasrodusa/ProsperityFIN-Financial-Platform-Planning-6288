import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { useSupabaseWithClerk } from '../lib/supabaseClient';
import logDev from '../utils/logDev';

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
  const { user } = useAuthContext();
  const { getSupabaseClient } = useSupabaseWithClerk();
  const [clientStatuses, setClientStatuses] = useState({});
  const [statusHistory, setStatusHistory] = useState({});
  const [clientTasks, setClientTasks] = useState({});
  const [clientNotes, setClientNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  logDev('CrmProvider rendering, user:', user?.id);

  // Load client CRM data
  useEffect(() => {
    const loadCrmData = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = await getSupabaseClient();

        const { data: statusData, error: statusError } = await supabase
          .from('crm_client_statuses_pf')
          .select('*')
          .eq('advisor_id', user.id);

        if (statusError) throw statusError;

        const statuses = {};
        (statusData || []).forEach(row => {
          statuses[row.client_id] = {
            clientId: row.client_id,
            status: row.status,
            updatedAt: row.updated_at
          };
        });

        const { data: historyData, error: historyError } = await supabase
          .from('crm_status_history_pf')
          .select('*')
          .eq('advisor_id', user.id);

        if (historyError) throw historyError;

        const history = {};
        (historyData || []).forEach(row => {
          if (!history[row.client_id]) history[row.client_id] = [];
          history[row.client_id].push({
            id: row.id,
            clientId: row.client_id,
            status: row.status,
            notes: row.notes,
            createdAt: row.created_at
          });
        });

        const { data: tasksData, error: tasksError } = await supabase
          .from('crm_client_tasks_pf')
          .select('*')
          .eq('advisor_id', user.id);

        if (tasksError) throw tasksError;

        const tasks = {};
        (tasksData || []).forEach(task => {
          if (!tasks[task.client_id]) tasks[task.client_id] = [];
          tasks[task.client_id].push({
            id: task.id,
            clientId: task.client_id,
            taskName: task.task_name,
            description: task.description,
            dueDate: task.due_date,
            completed: task.completed,
            createdAt: task.created_at,
            updatedAt: task.updated_at
          });
        });

        const { data: notesData, error: notesError } = await supabase
          .from('crm_client_notes_pf')
          .select('*')
          .eq('advisor_id', user.id);

        if (notesError) throw notesError;

        const notes = {};
        (notesData || []).forEach(noteRow => {
          if (!notes[noteRow.client_id]) notes[noteRow.client_id] = [];
          notes[noteRow.client_id].push({
            id: noteRow.id,
            clientId: noteRow.client_id,
            note: noteRow.note,
            createdAt: noteRow.created_at,
            updatedAt: noteRow.updated_at
          });
        });

        setClientStatuses(statuses);
        setStatusHistory(history);
        setClientTasks(tasks);
        setClientNotes(notes);
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
      const supabase = await getSupabaseClient();
      
      const { data: statusData, error: statusError } = await supabase
        .from('crm_client_statuses_pf')
        .upsert({
          client_id: clientId,
          status: newStatus,
          updated_at: timestamp,
          advisor_id: user.id
        })
        .select()
        .single();

      if (statusError) throw statusError;

      setClientStatuses(prev => ({
        ...prev,
        [clientId]: {
          clientId: statusData.client_id,
          status: statusData.status,
          updatedAt: statusData.updated_at
        }
      }));

      const { data: historyEntry, error: historyError } = await supabase
        .from('crm_status_history_pf')
        .insert({
          client_id: clientId,
          status: newStatus,
          notes,
          created_at: timestamp,
          advisor_id: user.id
        })
        .select()
        .single();

      if (historyError) throw historyError;

      setStatusHistory(prev => ({
        ...prev,
        [clientId]: [
          ...(prev[clientId] || []),
          {
            id: historyEntry.id,
            clientId: historyEntry.client_id,
            status: historyEntry.status,
            notes: historyEntry.notes,
            createdAt: historyEntry.created_at
          }
        ]
      }));

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
      const supabase = await getSupabaseClient();
      
      const { data: task, error } = await supabase
        .from('crm_client_tasks_pf')
        .insert({
          client_id: clientId,
          task_name: taskData.taskName,
          description: taskData.description,
          due_date: taskData.dueDate,
          completed: false,
          created_at: timestamp,
          updated_at: timestamp,
          advisor_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setClientTasks(prev => ({
        ...prev,
        [clientId]: [
          ...(prev[clientId] || []),
          {
            id: task.id,
            clientId: task.client_id,
            taskName: task.task_name,
            description: task.description,
            dueDate: task.due_date,
            completed: task.completed,
            createdAt: task.created_at,
            updatedAt: task.updated_at
          }
        ]
      }));

      return { success: true, task };
    } catch (err) {
      console.error('Error adding client task:', err);
      return { success: false, error: err.message };
    }
  };

  // Update task
  const updateClientTask = async (clientId, taskId, updates) => {
    try {
      const timestamp = new Date().toISOString();
      const supabase = await getSupabaseClient();

      const { taskName, dueDate, ...otherUpdates } = updates || {};

      const payload = {
        ...otherUpdates,
        ...(taskName !== undefined && { task_name: taskName }),
        ...(dueDate !== undefined && { due_date: dueDate }),
        updated_at: timestamp
      };

      const { data, error } = await supabase
        .from('crm_client_tasks_pf')
        .update(payload)
        .eq('id', taskId)
        .eq('client_id', clientId)
        .select()
        .single();

      if (error) throw error;

      setClientTasks(prev => ({
        ...prev,
        [clientId]: (prev[clientId] || []).map(task => 
          task.id === taskId ? {
            id: data.id,
            clientId: data.client_id,
            taskName: data.task_name,
            description: data.description,
            dueDate: data.due_date,
            completed: data.completed,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          } : task
        )
      }));

      return { success: true };
    } catch (err) {
      console.error('Error updating client task:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete task
  const deleteClientTask = async (clientId, taskId) => {
    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase
        .from('crm_client_tasks_pf')
        .delete()
        .eq('id', taskId)
        .eq('client_id', clientId);

      if (error) throw error;

      setClientTasks(prev => ({
        ...prev,
        [clientId]: (prev[clientId] || []).filter(task => task.id !== taskId)
      }));

      return { success: true };
    } catch (err) {
      console.error('Error deleting client task:', err);
      return { success: false, error: err.message };
    }
  };

  // Get client status
  const getClientStatus = (clientId) => {
    return clientStatuses[clientId] || { 
      clientId, 
      status: 'initial_meeting_completed', 
      updatedAt: new Date().toISOString() 
    };
  };

  // Get client history
  const getClientHistory = (clientId) => {
    return statusHistory[clientId] || [];
  };

  // Get client tasks
  const getClientTasks = (clientId) => {
    return clientTasks[clientId] || [];
  };

  // Get client notes
  const getClientNotes = (clientId) => {
    return clientNotes[clientId] || [];
  };

  // Add note
  const addClientNote = async (clientId, noteText) => {
    try {
      const timestamp = new Date().toISOString();
      const supabase = await getSupabaseClient();

      const { data: note, error } = await supabase
        .from('crm_client_notes_pf')
        .insert({
          client_id: clientId,
          note: noteText,
          created_at: timestamp,
          updated_at: timestamp,
          advisor_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setClientNotes(prev => ({
        ...prev,
        [clientId]: [
          {
            id: note.id,
            clientId: note.client_id,
            note: note.note,
            createdAt: note.created_at,
            updatedAt: note.updated_at
          },
          ...(prev[clientId] || [])
        ]
      }));

      return { success: true, note };
    } catch (err) {
      console.error('Error adding client note:', err);
      return { success: false, error: err.message };
    }
  };

  // Update note
  const updateClientNote = async (clientId, noteId, noteText) => {
    try {
      const timestamp = new Date().toISOString();
      const supabase = await getSupabaseClient();

      const { data, error } = await supabase
        .from('crm_client_notes_pf')
        .update({ note: noteText, updated_at: timestamp })
        .eq('id', noteId)
        .eq('client_id', clientId)
        .select()
        .single();

      if (error) throw error;

      setClientNotes(prev => ({
        ...prev,
        [clientId]: (prev[clientId] || []).map(noteItem =>
          noteItem.id === noteId
            ? {
                id: data.id,
                clientId: data.client_id,
                note: data.note,
                createdAt: data.created_at,
                updatedAt: data.updated_at
              }
            : noteItem
        )
      }));

      return { success: true };
    } catch (err) {
      console.error('Error updating client note:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete note
  const deleteClientNote = async (clientId, noteId) => {
    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase
        .from('crm_client_notes_pf')
        .delete()
        .eq('id', noteId)
        .eq('client_id', clientId);

      if (error) throw error;

      setClientNotes(prev => ({
        ...prev,
        [clientId]: (prev[clientId] || []).filter(note => note.id !== noteId)
      }));

      return { success: true };
    } catch (err) {
      console.error('Error deleting client note:', err);
      return { success: false, error: err.message };
    }
  };

  // Initialize CRM records for a newly created client
  const initializeClientCrm = async (clientId) => {
    try {
      const timestamp = new Date().toISOString();
      const supabase = await getSupabaseClient();

      const { data: statusData, error: statusError } = await supabase
        .from('crm_client_statuses_pf')
        .insert({
          client_id: clientId,
          status: 'initial_meeting',
          updated_at: timestamp,
          advisor_id: user.id
        })
        .select()
        .single();

      if (statusError) throw statusError;

      const { data: historyEntry, error: historyError } = await supabase
        .from('crm_status_history_pf')
        .insert({
          client_id: clientId,
          status: 'initial_meeting',
          notes: 'Initial status set',
          created_at: timestamp,
          advisor_id: user.id
        })
        .select()
        .single();

      if (historyError) throw historyError;

      setClientStatuses(prev => ({
        ...prev,
        [clientId]: {
          clientId: statusData.client_id,
          status: statusData.status,
          updatedAt: statusData.updated_at
        }
      }));

      setStatusHistory(prev => ({
        ...prev,
        [clientId]: [
          {
            id: historyEntry.id,
            clientId: historyEntry.client_id,
            status: historyEntry.status,
            notes: historyEntry.notes,
            createdAt: historyEntry.created_at
          }
        ]
      }));

      setClientTasks(prev => ({ ...prev, [clientId]: [] }));
      setClientNotes(prev => ({ ...prev, [clientId]: [] }));

      return { success: true };
    } catch (err) {
      console.error('Error initializing client CRM data:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    loading,
    error,
    updateClientStatus,
    addClientTask,
    updateClientTask,
    deleteClientTask,
    getClientNotes,
    addClientNote,
    updateClientNote,
    deleteClientNote,
    getClientStatus,
    getClientHistory,
    getClientTasks,
    initializeClientCrm
  };

  return (
    <CrmContext.Provider value={value}>
      {children}
    </CrmContext.Provider>
  );
};

export default CrmProvider;