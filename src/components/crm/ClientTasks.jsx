import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiEdit3, FiSave, FiX, FiCheckSquare, FiSquare, FiClock, FiCalendar, FiAlertTriangle } = FiIcons;

const ClientTasks = ({ tasks = [], onTasksChange, clientName }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTask, setNewTask] = useState({ name: '', dueDate: '', priority: 'medium' });
  const [editTask, setEditTask] = useState({ name: '', dueDate: '', priority: 'medium' });

  const handleAddTask = () => {
    if (newTask.name.trim()) {
      const task = {
        id: Date.now().toString(),
        name: newTask.name.trim(),
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        completed: false,
        createdAt: new Date().toISOString()
      };
      onTasksChange([...tasks, task]);
      setNewTask({ name: '', dueDate: '', priority: 'medium' });
      setIsAddingTask(false);
    }
  };

  const handleEditTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setEditTask({
      name: task.name,
      dueDate: task.dueDate,
      priority: task.priority
    });
    setEditingTaskId(taskId);
  };

  const handleSaveEdit = () => {
    if (editTask.name.trim()) {
      const updatedTasks = tasks.map(task =>
        task.id === editingTaskId
          ? { 
              ...task, 
              name: editTask.name.trim(),
              dueDate: editTask.dueDate,
              priority: editTask.priority,
              updatedAt: new Date().toISOString()
            }
          : task
      );
      onTasksChange(updatedTasks);
      setEditingTaskId(null);
      setEditTask({ name: '', dueDate: '', priority: 'medium' });
    }
  };

  const handleToggleComplete = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : null }
        : task
    );
    onTasksChange(updatedTasks);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onTasksChange(tasks.filter(task => task.id !== taskId));
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-danger-600 bg-danger-50';
      case 'medium': return 'text-secondary-600 bg-secondary-50';
      case 'low': return 'text-success-600 bg-success-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  // Sort tasks: incomplete first, then by due date, then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    if (a.dueDate && b.dueDate) {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      if (dateA !== dateB) {
        return dateA - dateB;
      }
    }
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <SafeIcon icon={FiCheckSquare} className="w-5 h-5" />
          <span>Tasks</span>
          <span className="text-sm font-normal text-gray-500">
            ({tasks.filter(t => !t.completed).length} pending)
          </span>
        </h3>
        <button
          onClick={() => setIsAddingTask(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Add New Task */}
      <AnimatePresence>
        {isAddingTask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card bg-primary-50 border-primary-200"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name *
                </label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  placeholder={`Add a task for ${clientName}...`}
                  className="form-input w-full"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="form-input w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTask({ name: '', dueDate: '', priority: 'medium' });
                  }}
                  className="btn-secondary"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTask.name.trim()}
                  className="btn-primary"
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4 mr-2" />
                  Save Task
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence>
          {sortedTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`card hover:shadow-medium transition-shadow ${
                task.completed ? 'bg-gray-50 opacity-75' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Completion Checkbox */}
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  className={`p-1 rounded transition-colors ${
                    task.completed 
                      ? 'text-success-600 hover:text-success-700' 
                      : 'text-gray-400 hover:text-primary-600'
                  }`}
                >
                  <SafeIcon icon={task.completed ? FiCheckSquare : FiSquare} className="w-5 h-5" />
                </button>

                {/* Task Content */}
                <div className="flex-1">
                  {editingTaskId === task.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTask.name}
                        onChange={(e) => setEditTask({ ...editTask, name: e.target.value })}
                        className="form-input w-full"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={editTask.dueDate}
                          onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                          className="form-input w-full"
                        />
                        <select
                          value={editTask.priority}
                          onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
                          className="form-input w-full"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingTaskId(null);
                            setEditTask({ name: '', dueDate: '', priority: 'medium' });
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={!editTask.name.trim()}
                          className="btn-primary"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${
                          task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {task.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {/* Priority Badge */}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          
                          {/* Edit and Delete Buttons */}
                          {!task.completed && (
                            <button
                              onClick={() => handleEditTask(task.id)}
                              className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                            >
                              <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Due Date and Status */}
                      <div className="flex items-center space-x-4 text-sm">
                        {task.dueDate && (
                          <div className={`flex items-center space-x-1 ${
                            task.completed ? 'text-gray-400' :
                            isOverdue(task.dueDate) ? 'text-danger-600' :
                            isDueSoon(task.dueDate) ? 'text-secondary-600' :
                            'text-gray-500'
                          }`}>
                            <SafeIcon icon={
                              isOverdue(task.dueDate) && !task.completed ? FiAlertTriangle : FiCalendar
                            } className="w-4 h-4" />
                            <span>
                              {isOverdue(task.dueDate) && !task.completed ? 'Overdue: ' : 'Due: '}
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        )}
                        
                        {task.completed && task.completedAt && (
                          <div className="flex items-center space-x-1 text-success-600">
                            <SafeIcon icon={FiCheckSquare} className="w-4 h-4" />
                            <span>Completed: {formatDate(task.completedAt)}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {tasks.length === 0 && !isAddingTask && (
        <div className="text-center py-8 text-gray-500">
          <SafeIcon icon={FiCheckSquare} className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No tasks yet</p>
          <p className="text-sm">Add your first task for {clientName}</p>
        </div>
      )}
    </div>
  );
};

export default ClientTasks;