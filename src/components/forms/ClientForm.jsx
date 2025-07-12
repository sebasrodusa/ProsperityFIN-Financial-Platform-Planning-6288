import React, { useState, useEffect } from 'react';
import Toggle from '../ui/Toggle';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBriefcase, FiUsers, FiDollarSign, FiArchive } = FiIcons;

const ClientForm = ({ initialData, onSubmit, onCancel, isEditing }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    address: '',
    employerName: '',
    hasAccess: false,
    isArchived: false,
    targetRevenue: '',
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        hasAccess: initialData.hasAccess || false,
        isArchived: initialData.isArchived || false,
        targetRevenue: initialData.targetRevenue || '',
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
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpouseChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      spouse: {
        ...prev.spouse,
        [name]: value
      }
    }));
  };

  const handleAddChild = () => {
    setFormData(prev => ({
      ...prev,
      children: [...prev.children, { name: '', dateOfBirth: '' }]
    }));
  };

  const handleChildChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      )
    }));
  };

  const handleRemoveChild = (index) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <SafeIcon icon={FiUser} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="form-input pl-10"
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <SafeIcon icon={FiMail} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="form-input pl-10"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <SafeIcon icon={FiPhone} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input pl-10"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <SafeIcon icon={FiCalendar} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="form-input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
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
              Marital Status
            </label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleInputChange}
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
              Address
            </label>
            <div className="relative">
              <SafeIcon icon={FiMapPin} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-input pl-10"
                placeholder="Enter address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employer
            </label>
            <div className="relative">
              <SafeIcon icon={FiBriefcase} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="employerName"
                value={formData.employerName}
                onChange={handleInputChange}
                className="form-input pl-10"
                placeholder="Enter employer name"
              />
            </div>
          </div>

          {/* New Target Revenue Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Revenue
            </label>
            <div className="relative">
              <SafeIcon icon={FiDollarSign} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                name="targetRevenue"
                value={formData.targetRevenue}
                onChange={handleInputChange}
                className="form-input pl-10"
                placeholder="Potential revenue value"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Estimated revenue value for pipeline calculations
            </p>
          </div>
        </div>
      </div>

      {/* Spouse Information (if married) */}
      {formData.maritalStatus === 'married' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spouse Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spouse Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.spouse.name}
                onChange={handleSpouseChange}
                className="form-input"
                placeholder="Enter spouse name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spouse Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.spouse.email}
                onChange={handleSpouseChange}
                className="form-input"
                placeholder="Enter spouse email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spouse Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.spouse.phone}
                onChange={handleSpouseChange}
                className="form-input"
                placeholder="Enter spouse phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spouse Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.spouse.dateOfBirth}
                onChange={handleSpouseChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spouse Gender
              </label>
              <select
                name="gender"
                value={formData.spouse.gender}
                onChange={handleSpouseChange}
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
                Spouse Employer
              </label>
              <input
                type="text"
                name="employerName"
                value={formData.spouse.employerName}
                onChange={handleSpouseChange}
                className="form-input"
                placeholder="Enter spouse employer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Children Information */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Children</h3>
          <button
            type="button"
            onClick={handleAddChild}
            className="btn-secondary flex items-center space-x-2"
          >
            <SafeIcon icon={FiUsers} className="w-4 h-4" />
            <span>Add Child</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {formData.children.map((child, index) => (
            <div key={index} className="flex items-center space-x-4">
              <input
                type="text"
                value={child.name}
                onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                className="form-input flex-1"
                placeholder="Child name"
              />
              <input
                type="date"
                value={child.dateOfBirth}
                onChange={(e) => handleChildChange(index, 'dateOfBirth', e.target.value)}
                className="form-input w-40"
              />
              <button
                type="button"
                onClick={() => handleRemoveChild(index)}
                className="btn-danger"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Portal Access Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Portal Access</span>
            <Toggle
              enabled={formData.hasAccess}
              onChange={(enabled) => setFormData({ ...formData, hasAccess: enabled })}
              size="sm"
            />
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Enable client access to the financial portal
          </p>
        </div>
        
        {/* Archive Toggle */}
        <div className="mb-4">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              <SafeIcon icon={FiArchive} className="inline-block w-4 h-4 mr-1 text-gray-500" />
              Archive Client
            </span>
            <Toggle
              enabled={formData.isArchived}
              onChange={(enabled) => setFormData({ ...formData, isArchived: enabled })}
              size="sm"
            />
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Archived clients won't appear in the CRM pipeline
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {isEditing ? 'Update Client' : 'Add Client'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;