import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiTarget, FiTrendingUp } = FiIcons;

const FinancialGoalsSection = ({ goals = [], onGoalsChange }) => {
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    priority: 'medium',
    category: ''
  });

  const handleAddGoal = useCallback(() => {
    if (newGoal.title && newGoal.targetAmount && newGoal.targetDate) {
      onGoalsChange([...goals, { ...newGoal, id: Date.now() }]);
      setNewGoal({
        title: '',
        description: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        priority: 'medium',
        category: ''
      });
    }
  }, [newGoal, goals, onGoalsChange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (current, target) => {
    if (!current || !target) return 0;
    return Math.min((parseFloat(current) / parseFloat(target)) * 100, 100);
  };

  const calculateMonthsToTarget = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return Math.max(0, diffMonths);
  };

  const calculateMonthlyRequired = (currentAmount, targetAmount, targetDate) => {
    const monthsLeft = calculateMonthsToTarget(targetDate);
    if (monthsLeft === 0) return 0;
    
    const amountNeeded = parseFloat(targetAmount) - parseFloat(currentAmount || 0);
    return Math.max(0, amountNeeded / monthsLeft);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-danger-100 text-danger-800';
      case 'medium': return 'bg-secondary-100 text-secondary-800';
      case 'low': return 'bg-success-100 text-success-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Goals Overview */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Financial Goals Overview</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <SafeIcon icon={FiTarget} className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary-600">{goals.length}</p>
            <p className="text-sm text-gray-600">Total Goals</p>
          </div>
          <div className="text-center p-4 bg-success-50 rounded-lg">
            <SafeIcon icon={FiTrendingUp} className="w-8 h-8 text-success-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-success-600">
              {goals.filter(g => calculateProgress(g.currentAmount, g.targetAmount) >= 100).length}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center p-4 bg-secondary-50 rounded-lg">
            <SafeIcon icon={FiTarget} className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-secondary-600">
              {formatCurrency(goals.reduce((sum, goal) => sum + parseFloat(goal.targetAmount || 0), 0))}
            </p>
            <p className="text-sm text-gray-600">Total Target</p>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Financial Goals</h3>
        </div>
        
        <div className="space-y-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const monthsLeft = calculateMonthsToTarget(goal.targetDate);
            const monthlyRequired = calculateMonthlyRequired(goal.currentAmount, goal.targetAmount, goal.targetDate);
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{goal.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                        {goal.priority} priority
                      </span>
                      {goal.category && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {goal.category}
                        </span>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onGoalsChange(goals.filter(g => g.id !== goal.id))}
                    className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Amount</p>
                    <input
                      type="number"
                      value={goal.currentAmount}
                      onChange={(e) => {
                        const updated = goals.map(g =>
                          g.id === goal.id ? { ...g, currentAmount: e.target.value } : g
                        );
                        onGoalsChange(updated);
                      }}
                      className="form-input mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target Amount</p>
                    <input
                      type="number"
                      value={goal.targetAmount}
                      onChange={(e) => {
                        const updated = goals.map(g =>
                          g.id === goal.id ? { ...g, targetAmount: e.target.value } : g
                        );
                        onGoalsChange(updated);
                      }}
                      className="form-input mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target Date</p>
                    <input
                      type="date"
                      value={goal.targetDate}
                      onChange={(e) => {
                        const updated = goals.map(g =>
                          g.id === goal.id ? { ...g, targetDate: e.target.value } : g
                        );
                        onGoalsChange(updated);
                      }}
                      className="form-input mt-1"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <select
                      value={goal.priority}
                      onChange={(e) => {
                        const updated = goals.map(g =>
                          g.id === goal.id ? { ...g, priority: e.target.value } : g
                        );
                        onGoalsChange(updated);
                      }}
                      className="form-input mt-1"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-primary-600">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Goal Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Amount Needed</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(Math.max(0, parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount || 0)))}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Months Remaining</p>
                    <p className="font-semibold text-gray-900">
                      {monthsLeft} months
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Monthly Required</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(monthlyRequired)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add New Goal */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Add New Financial Goal</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Title *
              </label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="form-input"
                placeholder="e.g., Emergency Fund, House Down Payment"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="form-input"
              >
                <option value="">Select category</option>
                <option value="Emergency Fund">Emergency Fund</option>
                <option value="Retirement">Retirement</option>
                <option value="Home Purchase">Home Purchase</option>
                <option value="Education">Education</option>
                <option value="Travel">Travel</option>
                <option value="Investment">Investment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              className="form-input h-20 resize-none"
              placeholder="Describe your financial goal..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount *
              </label>
              <input
                type="number"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                className="form-input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Amount
              </label>
              <input
                type="number"
                value={newGoal.currentAmount}
                onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                className="form-input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date *
              </label>
              <input
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                className="form-input"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAddGoal}
            className="btn-primary flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialGoalsSection;