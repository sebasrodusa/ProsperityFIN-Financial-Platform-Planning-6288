import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useCrm, CLIENT_STATUSES } from '../contexts/CrmContext';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';

const { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiCheck, FiClock, FiCalendar, FiMessageSquare, FiChevronRight } = FiIcons;

const ClientCrm = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients } = useData();
  const { 
    loading, 
    getClientStatus, 
    getClientHistory, 
    getClientTasks, 
    updateClientStatus, 
    addClientTask, 
    updateClientTask, 
    deleteClientTask 
  } = useCrm();

  const [client, setClient] = useState(null);
  const [clientStatus, setClientStatus] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Modals state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form state
  const [statusForm, setStatusForm] = useState({
    status: '',
    notes: ''
  });

  const [taskForm, setTaskForm] = useState({
    taskName: '',
    description: '',
    dueDate: ''
  });

  // Load client data
  useEffect(() => {
    const clientData = clients.find(c => c.id === clientId);
    if (clientData) {
      setClient(clientData);
    }
  }, [clientId, clients]);

  // Load CRM data
  useEffect(() => {
    if (!loading && client) {
      const status = getClientStatus(clientId);
      const history = getClientHistory(clientId);
      const clientTasks = getClientTasks(clientId);

      setClientStatus(status);
      setStatusHistory(history);
      setTasks(clientTasks);
    }
  }, [loading, client, clientId, getClientStatus, getClientHistory, getClientTasks]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (statusForm.status) {
      const result = await updateClientStatus(clientId, statusForm.status, statusForm.notes);
      if (result.success) {
        // Refresh data
        setClientStatus(getClientStatus(clientId));
        setStatusHistory(getClientHistory(clientId));
        setIsStatusModalOpen(false);
        // Reset form
        setStatusForm({ status: '', notes: '' });
      }
    }
  };

  // Handle task actions
  const handleAddTask = async () => {
    if (taskForm.taskName && taskForm.dueDate) {
      const result = await addClientTask(clientId, taskForm);
      if (result.success) {
        // Refresh tasks
        setTasks(getClientTasks(clientId));
        setIsTaskModalOpen(false);
        // Reset form
        setTaskForm({ taskName: '', description: '', dueDate: '' });
      }
    }
  };

  const handleUpdateTask = async () => {
    if (selectedTask && taskForm.taskName) {
      const result = await updateClientTask(clientId, selectedTask.id, taskForm);
      if (result.success) {
        // Refresh tasks
        setTasks(getClientTasks(clientId));
        setIsTaskModalOpen(false);
        setSelectedTask(null);
        // Reset form
        setTaskForm({ taskName: '', description: '', dueDate: '' });
      }
    }
  };

  const handleTaskEdit = (task) => {
    setSelectedTask(task);
    setTaskForm({
      taskName: task.taskName,
      description: task.description || '',
      dueDate: task.dueDate || ''
    });
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const result = await deleteClientTask(clientId, taskId);
      if (result.success) {
        // Refresh tasks
        setTasks(getClientTasks(clientId));
      }
    }
  };

  const handleToggleTaskCompletion = async (taskId, currentStatus) => {
    const result = await updateClientTask(clientId, taskId, { completed: !currentStatus });
    if (result.success) {
      // Refresh tasks
      setTasks(getClientTasks(clientId));
    }
  };

  // Find the status label
  const getStatusLabel = (statusId) => {
    const status = CLIENT_STATUSES.find(s => s.id === statusId);
    return status ? status.label : 'Unknown';
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Format datetime for display
  const formatDateTime = (dateTimeString) => {
    try {
      return format(new Date(dateTimeString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateTimeString;
    }
  };

  // Check if task is overdue
  const isTaskOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(dueDate);
    return taskDate < today;
  };

  // Get the current step for the status stepper
  const getCurrentStep = () => {
    if (!clientStatus) return 0;
    return CLIENT_STATUSES.findIndex(s => s.id === clientStatus.status);
  };

  if (!client || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <Link
              to={`/clients/${client.id}`}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
              <span>Back to Client Details</span>
            </Link>

            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Client CRM</h1>
                <p className="text-gray-600">Manage relationship with {client.name}</p>
              </div>
            </div>
          </div>

          {/* Status Funnel */}
          <div className="card mb-6">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Sales Funnel Status</h2>
                <button
                  onClick={() => {
                    setStatusForm({ 
                      status: clientStatus?.status || 'initial_meeting_completed', 
                      notes: '' 
                    });
                    setIsStatusModalOpen(true);
                  }}
                  className="btn-primary flex items-center space-x-2"
                >
                  <SafeIcon icon={FiEdit} className="w-4 h-4" />
                  <span>Update Status</span>
                </button>
              </div>
            </div>

            <div className="mb-8">
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Current Status:</span>
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                    {getStatusLabel(clientStatus?.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Last updated: {formatDateTime(clientStatus?.updatedAt)}
                </p>
              </div>
            </div>

            {/* Status Stepper */}
            <div className="overflow-x-auto">
              <div className="flex items-center min-w-max pb-4">
                {CLIENT_STATUSES.map((status, index) => {
                  const currentStep = getCurrentStep();
                  const isActive = index <= currentStep;
                  const isCurrentStep = index === currentStep;
                  
                  return (
                    <div key={status.id} className="flex items-center">
                      <div className={`flex flex-col items-center ${index === 0 ? 'ml-0' : ''}`}>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isActive 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-200 text-gray-600'
                          } ${isCurrentStep ? 'ring-4 ring-primary-100' : ''}`}
                        >
                          {isActive ? <SafeIcon icon={FiCheck} className="w-4 h-4" /> : index + 1}
                        </div>
                        <span className={`mt-2 text-xs text-center max-w-[80px] ${
                          isActive ? 'text-primary-600 font-medium' : 'text-gray-500'
                        }`}>
                          {status.label}
                        </span>
                      </div>
                      
                      {index < CLIENT_STATUSES.length - 1 && (
                        <div className={`w-12 h-0.5 mx-1 ${
                          index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status History */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Status History</h2>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {statusHistory.length > 0 ? (
                  [...statusHistory].reverse().map((entry, index) => (
                    <div key={entry.id} className="border-l-2 border-primary-500 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                            {getStatusLabel(entry.status)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDateTime(entry.createdAt)}
                          </p>
                        </div>
                      </div>
                      {entry.notes && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No status history available
                  </div>
                )}
              </div>
            </div>

            {/* Tasks */}
            <div className="card">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
                  <button
                    onClick={() => {
                      setSelectedTask(null);
                      setTaskForm({ taskName: '', description: '', dueDate: '' });
                      setIsTaskModalOpen(true);
                    }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {tasks.length > 0 ? (
                  tasks
                    .sort((a, b) => {
                      // Sort by completion status first, then by due date
                      if (a.completed !== b.completed) {
                        return a.completed ? 1 : -1;
                      }
                      // Then sort by due date
                      if (!a.dueDate) return 1;
                      if (!b.dueDate) return -1;
                      return new Date(a.dueDate) - new Date(b.dueDate);
                    })
                    .map((task) => (
                      <div
                        key={task.id}
                        className={`border rounded-lg p-4 ${
                          task.completed
                            ? 'bg-gray-50 border-gray-200'
                            : isTaskOverdue(task.dueDate)
                            ? 'bg-danger-50 border-danger-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start">
                          <button
                            onClick={() => handleToggleTaskCompletion(task.id, task.completed)}
                            className={`mt-1 p-1 rounded-full flex-shrink-0 ${
                              task.completed
                                ? 'bg-success-100 text-success-600'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <SafeIcon icon={FiCheck} className="w-4 h-4" />
                          </button>

                          <div className="ml-3 flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className={`font-medium ${
                                  task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                                }`}>
                                  {task.taskName}
                                </h4>
                                
                                {task.dueDate && (
                                  <div className="flex items-center mt-1">
                                    <SafeIcon
                                      icon={FiCalendar}
                                      className={`w-3 h-3 ${
                                        task.completed
                                          ? 'text-gray-400'
                                          : isTaskOverdue(task.dueDate)
                                          ? 'text-danger-500'
                                          : 'text-gray-400'
                                      }`}
                                    />
                                    <span
                                      className={`text-xs ml-1 ${
                                        task.completed
                                          ? 'text-gray-400'
                                          : isTaskOverdue(task.dueDate)
                                          ? 'text-danger-500 font-medium'
                                          : 'text-gray-500'
                                      }`}
                                    >
                                      {formatDate(task.dueDate)}
                                      {isTaskOverdue(task.dueDate) && !task.completed && ' (Overdue)'}
                                    </span>
                                  </div>
                                )}
                                
                                {task.description && (
                                  <p className={`text-sm mt-2 ${
                                    task.completed ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex space-x-2 ml-2">
                                <button
                                  onClick={() => handleTaskEdit(task)}
                                  className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                                >
                                  <SafeIcon icon={FiEdit} className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
                                >
                                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {task.completed && (
                          <div className="mt-2 text-xs text-gray-400 flex items-center">
                            <SafeIcon icon={FiClock} className="w-3 h-3 mr-1" />
                            <span>Completed on {formatDateTime(task.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No tasks available. Add a task to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Client Status"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Status
            </label>
            <select
              value={statusForm.status}
              onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
              className="form-input"
            >
              {CLIENT_STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={statusForm.notes}
              onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
              className="form-input h-32 resize-none"
              placeholder="Add notes about this status change (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStatusUpdate}
              className="btn-primary"
            >
              Update Status
            </button>
          </div>
        </div>
      </Modal>

      {/* Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
          setTaskForm({ taskName: '', description: '', dueDate: '' });
        }}
        title={selectedTask ? "Edit Task" : "Add New Task"}
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name *
            </label>
            <input
              type="text"
              value={taskForm.taskName}
              onChange={(e) => setTaskForm({ ...taskForm, taskName: e.target.value })}
              className="form-input"
              placeholder="Enter task name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="form-input h-20 resize-none"
              placeholder="Enter task description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsTaskModalOpen(false);
                setSelectedTask(null);
                setTaskForm({ taskName: '', description: '', dueDate: '' });
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={selectedTask ? handleUpdateTask : handleAddTask}
              className="btn-primary"
              disabled={!taskForm.taskName || !taskForm.dueDate}
            >
              {selectedTask ? "Update Task" : "Add Task"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientCrm;