import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiCalendar, FiClock, FiEdit, FiTrash2 } = FiIcons;

const TaskList = ({ tasks, onToggleComplete, onEdit, onDelete }) => {
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

  // Group tasks by completion status
  const pendingTasks = tasks.filter(task => !task.completed)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

  const completedTasks = tasks.filter(task => task.completed)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <div className="space-y-6">
      {/* Pending Tasks */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">Pending Tasks ({pendingTasks.length})</h3>
        {pendingTasks.length > 0 ? (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-4 ${
                  isTaskOverdue(task.dueDate) ? 'bg-danger-50 border-danger-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start">
                  <button
                    onClick={() => onToggleComplete(task.id, task.completed)}
                    className="mt-1 p-1 rounded-full flex-shrink-0 bg-gray-100 text-gray-400 hover:bg-gray-200"
                  >
                    <SafeIcon icon={FiCheck} className="w-4 h-4" />
                  </button>

                  <div className="ml-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {task.taskName}
                        </h4>
                        
                        {task.dueDate && (
                          <div className="flex items-center mt-1">
                            <SafeIcon
                              icon={FiCalendar}
                              className={isTaskOverdue(task.dueDate) ? 'text-danger-500 w-3 h-3' : 'text-gray-400 w-3 h-3'}
                            />
                            <span
                              className={`text-xs ml-1 ${
                                isTaskOverdue(task.dueDate) ? 'text-danger-500 font-medium' : 'text-gray-500'
                              }`}
                            >
                              {formatDate(task.dueDate)}
                              {isTaskOverdue(task.dueDate) && ' (Overdue)'}
                            </span>
                          </div>
                        )}
                        
                        {task.description && (
                          <p className="text-sm mt-2 text-gray-600">{task.description}</p>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-2">
                        <button
                          onClick={() => onEdit(task)}
                          className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <SafeIcon icon={FiEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(task.id)}
                          className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
            No pending tasks
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">Completed Tasks ({completedTasks.length})</h3>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 bg-gray-50 border-gray-200"
              >
                <div className="flex items-start">
                  <button
                    onClick={() => onToggleComplete(task.id, task.completed)}
                    className="mt-1 p-1 rounded-full flex-shrink-0 bg-success-100 text-success-600"
                  >
                    <SafeIcon icon={FiCheck} className="w-4 h-4" />
                  </button>

                  <div className="ml-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-500 line-through">
                          {task.taskName}
                        </h4>
                        
                        {task.dueDate && (
                          <div className="flex items-center mt-1">
                            <SafeIcon icon={FiCalendar} className="w-3 h-3 text-gray-400" />
                            <span className="text-xs ml-1 text-gray-400">
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        )}
                        
                        {task.description && (
                          <p className="text-sm mt-2 text-gray-400">{task.description}</p>
                        )}

                        <div className="mt-2 text-xs text-gray-400 flex items-center">
                          <SafeIcon icon={FiClock} className="w-3 h-3 mr-1" />
                          <span>Completed on {formatDateTime(task.updatedAt)}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-2">
                        <button
                          onClick={() => onDelete(task.id)}
                          className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;