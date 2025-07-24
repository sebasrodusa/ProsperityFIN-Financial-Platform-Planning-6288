import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import logDev from '../../utils/logDev';

const { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBriefcase, FiUsers, FiPlus, FiTrash2, FiSave, FiX } = FiIcons;

const ClientForm = ({ initialData, onSubmit, onCancel, isEditing }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    address: '',
    employer_name: '',
    has_access: false,
    is_archived: false,
    target_revenue: '',
    // Store spouse data in spouse_info JSONB column
    spouse_info: {
      name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      employer_name: ''
    },
    // Store children data in children_info JSONB column
    children_info: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        date_of_birth: initialData.date_of_birth || initialData.dateOfBirth || '',
        gender: initialData.gender || '',
        marital_status: initialData.marital_status || initialData.maritalStatus || '',
        address: initialData.address || '',
        employer_name: initialData.employer_name || initialData.employerName || '',
        has_access: initialData.has_access || initialData.hasAccess || false,
        is_archived: initialData.is_archived || initialData.isArchived || false,
        target_revenue: initialData.target_revenue || initialData.targetRevenue || '',
        spouse_info: initialData.spouse_info || initialData.spouse || {
          name: '',
          email: '',
          phone: '',
          date_of_birth: '',
          gender: '',
          employer_name: ''
        },
        children_info: initialData.children_info || initialData.children || []
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle spouse change to use spouse_info
  const handleSpouseChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      spouse_info: {
        ...prev.spouse_info,
        [name]: value
      }
    }));
  };

  // Handle children change to use children_info
  const handleChildChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      children_info: prev.children_info.map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      )
    }));
  };

  const handleAddChild = () => {
    setFormData(prev => ({
      ...prev,
      children_info: [...prev.children_info, { name: '', date_of_birth: '' }]
    }));
  };

  const handleRemoveChild = (index) => {
    setFormData(prev => ({
      ...prev,
      children_info: prev.children_info.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      logDev('Preparing client data for Supabase:', formData);

      // Base client data without any CRM fields or metadata
      const baseData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        marital_status: formData.marital_status || null,
        address: formData.address || null,
        employer_name: formData.employer_name || null,
        has_access: formData.has_access || false,
        is_archived: formData.is_archived || false,
        target_revenue: formData.target_revenue ? parseFloat(formData.target_revenue) : null,
        spouse_info: formData.spouse_info || null,
        children_info: formData.children_info || null
      };

      let dataToSubmit;

      if (isEditing && initialData?.id) {
        // For updates only send the base data and updated timestamp
        const updateData = {
          ...baseData,
          updated_at: new Date().toISOString()
        };
        dataToSubmit = updateData;
      } else {
        // For new clients include creation metadata only. CRM data is handled
        // separately via the CrmContext after the client record is created.
        dataToSubmit = {
          ...baseData,
          advisor_id: user?.id,
          created_by: user?.id,
          created_at: new Date().toISOString()
        };
      }

      logDev('Client data prepared for submission:', dataToSubmit);
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Error preparing client data:', error);
      alert(`Failed to save client: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              name="date_of_birth"
              value={formData.date_of_birth}
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
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marital Status
          </label>
          <select
            name="marital_status"
            value={formData.marital_status}
            onChange={handleInputChange}
            className="form-input"
          >
            <option value="">Select marital status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="separated">Separated</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <div className="relative">
          <SafeIcon icon={FiMapPin} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="form-input pl-10 h-20 resize-none"
            placeholder="Enter full address"
          />
        </div>
      </div>

      {/* Employment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employer Name
          </label>
          <div className="relative">
            <SafeIcon icon={FiBriefcase} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="employer_name"
              value={formData.employer_name}
              onChange={handleInputChange}
              className="form-input pl-10"
              placeholder="Enter employer name"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Revenue
          </label>
          <input
            type="number"
            name="target_revenue"
            value={formData.target_revenue}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter target revenue"
          />
        </div>
      </div>

      {/* Spouse Information */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spouse Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spouse Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.spouse_info.name}
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
              value={formData.spouse_info.email}
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
              value={formData.spouse_info.phone}
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
              name="date_of_birth"
              value={formData.spouse_info.date_of_birth}
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
              value={formData.spouse_info.gender}
              onChange={handleSpouseChange}
              className="form-input"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spouse Employer
            </label>
            <input
              type="text"
              name="employer_name"
              value={formData.spouse_info.employer_name}
              onChange={handleSpouseChange}
              className="form-input"
              placeholder="Enter spouse employer"
            />
          </div>
        </div>
      </div>

      {/* Children Information */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Children Information</h3>
          <button
            type="button"
            onClick={handleAddChild}
            className="btn-secondary flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Child</span>
          </button>
        </div>
        <div className="space-y-4">
          {formData.children_info.map((child, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <input
                  type="text"
                  value={child.name}
                  onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                  className="form-input"
                  placeholder="Child name"
                />
              </div>
              <div className="w-40">
                <input
                  type="date"
                  value={child.date_of_birth}
                  onChange={(e) => handleChildChange(index, 'date_of_birth', e.target.value)}
                  className="form-input"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveChild(index)}
                className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Access Settings */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="has_access"
              checked={formData.has_access}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Grant portal access
            </label>
          </div>
          {isEditing && (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_archived"
                checked={formData.is_archived}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Archive client
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          <SafeIcon icon={FiX} className="w-4 h-4 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="spinner w-4 h-4 mr-2" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <SafeIcon icon={FiSave} className="w-4 h-4 mr-2" />
              {isEditing ? 'Update Client' : 'Create Client'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
