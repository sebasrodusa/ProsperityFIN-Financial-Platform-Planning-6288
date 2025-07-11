import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2 } = FiIcons;

const ClientForm = React.memo(({ 
  initialData = null, 
  onSubmit, 
  onCancel,
  isEditing = false 
}) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    address: '',
    employerName: '',
    spouse: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      employerName: ''
    },
    children: []
  });

  // Initialize form data when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        spouse: initialData.spouse || {
          name: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          employerName: ''
        },
        children: initialData.children || []
      });
    } else {
      // Reset form for new client
      setFormData({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        address: '',
        employerName: '',
        spouse: {
          name: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          employerName: ''
        },
        children: []
      });
    }
  }, [initialData]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSpouseChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      spouse: {
        ...prev.spouse,
        [field]: value
      }
    }));
  }, []);

  const handleChildChange = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map((child, i) => 
        i === index ? { ...child, [field]: value } : child
      )
    }));
  }, []);

  const addChild = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      children: [...prev.children, { name: '', dateOfBirth: '' }]
    }));
  }, []);

  const removeChild = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const cleanedFormData = {
      ...formData,
      spouse: formData.maritalStatus === 'married' ? formData.spouse : null,
      children: formData.children.filter(child => child.name && child.dateOfBirth)
    };

    if (!isEditing) {
      cleanedFormData.advisorId = user.id;
      cleanedFormData.avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';
    }

    onSubmit(cleanedFormData);
  }, [formData, isEditing, user.id, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="form-input"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="form-input"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="form-input"
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              required
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="form-input"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marital Status *
            </label>
            <select
              required
              value={formData.maritalStatus}
              onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
              className="form-input"
            >
              <option value="">Select status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="form-input"
              placeholder="Enter full address"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employer Name
            </label>
            <input
              type="text"
              value={formData.employerName}
              onChange={(e) => handleInputChange('employerName', e.target.value)}
              className="form-input"
              placeholder="Enter employer name"
            />
          </div>
        </div>
      </div>

      {/* Spouse Information Section */}
      {formData.maritalStatus === 'married' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Spouse Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spouse's Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.spouse.name}
                onChange={(e) => handleSpouseChange('name', e.target.value)}
                className="form-input"
                placeholder="Enter spouse's name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spouse's Email
              </label>
              <input
                type="email"
                value={formData.spouse.email}
                onChange={(e) => handleSpouseChange('email', e.target.value)}
                className="form-input"
                placeholder="Enter spouse's email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spouse's Phone
              </label>
              <input
                type="tel"
                value={formData.spouse.phone}
                onChange={(e) => handleSpouseChange('phone', e.target.value)}
                className="form-input"
                placeholder="Enter spouse's phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spouse's Date of Birth
              </label>
              <input
                type="date"
                value={formData.spouse.dateOfBirth}
                onChange={(e) => handleSpouseChange('dateOfBirth', e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spouse's Gender
              </label>
              <select
                value={formData.spouse.gender}
                onChange={(e) => handleSpouseChange('gender', e.target.value)}
                className="form-input"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spouse's Employer
              </label>
              <input
                type="text"
                value={formData.spouse.employerName}
                onChange={(e) => handleSpouseChange('employerName', e.target.value)}
                className="form-input"
                placeholder="Enter spouse's employer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Children Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Children</h4>
          <button
            type="button"
            onClick={addChild}
            className="btn-secondary flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Child</span>
          </button>
        </div>
        <div className="space-y-4">
          {formData.children.map((child, index) => (
            <div key={`child-${index}`} className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={child.name}
                  onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                  className="form-input"
                  placeholder="Child's name"
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  value={child.dateOfBirth}
                  onChange={(e) => handleChildChange(index, 'dateOfBirth', e.target.value)}
                  className="form-input"
                />
              </div>
              <button
                type="button"
                onClick={() => removeChild(index)}
                className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {isEditing ? 'Update Client' : 'Add Client'}
        </button>
      </div>
    </form>
  );
});

ClientForm.displayName = 'ClientForm';

export default ClientForm;