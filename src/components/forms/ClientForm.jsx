import React, { useState, useEffect } from 'react';
import Toggle from '../ui/Toggle';

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

  // Add this field to the form
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

  // Rest of the form code...
};

export default ClientForm;