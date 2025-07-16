import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import logDev from '../../utils/logDev';

const { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiSearch } = FiIcons;

const CATEGORIES = [
  { id: 'retirement', name: 'Retirement' },
  { id: 'wealth_building', name: 'Wealth Building' },
  { id: 'protection', name: 'Protection' },
  { id: 'executive', name: 'Executive Benefits' },
  { id: 'estate_planning', name: 'Estate Planning' },
  { id: 'business', name: 'Business' },
  { id: 'other', name: 'Other' }
];

const StrategiesManager = () => {
  const { isAdmin } = useAuth();
  logDev('StrategiesManager isAdmin:', isAdmin);
  const [strategies, setStrategies] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    productIds: []
  });
  const [saving, setSaving] = useState(false);

  // Fetch strategies and products
  useEffect(() => {
    if (!isAdmin) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch strategies
        const { data: strategiesData, error: strategiesError } = await supabase
          .from('strategies_pf')
          .select(`
            *,
            strategy_products_pf(
              product_id
            )
          `)
          .order('name');

        if (strategiesError) throw strategiesError;

        // Fetch products for dropdown
        const { data: productsData, error: productsError } = await supabase
          .from('products_pf')
          .select('*')
          .order('name');

        if (productsError) throw productsError;

        setStrategies(strategiesData || []);
        setProducts(productsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load strategies. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const handleAddStrategy = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      productIds: []
    });
    setIsAddModalOpen(true);
  };

  const handleEditStrategy = (strategy) => {
    // Transform strategy_products_pf array to array of product_ids
    const productIds = strategy.strategy_products_pf
      ? strategy.strategy_products_pf.map(sp => sp.product_id)
      : [];

    setSelectedStrategy(strategy);
    setFormData({
      name: strategy.name,
      description: strategy.description || '',
      category: strategy.category || '',
      productIds
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteStrategy = async (id) => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      try {
        const { error } = await supabase
          .from('strategies_pf')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Update local state
        setStrategies(strategies.filter(strategy => strategy.id !== id));
      } catch (err) {
        console.error('Error deleting strategy:', err);
        alert('Failed to delete strategy. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedStrategy) {
        // Update existing strategy
        const { data, error } = await supabase
          .from('strategies_pf')
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            updated_at: new Date()
          })
          .eq('id', selectedStrategy.id)
          .select();

        if (error) throw error;

        // Delete existing product associations
        const { error: deleteError } = await supabase
          .from('strategy_products_pf')
          .delete()
          .eq('strategy_id', selectedStrategy.id);

        if (deleteError) throw deleteError;

        // Add new product associations
        if (formData.productIds.length > 0) {
          const productAssociations = formData.productIds.map(productId => ({
            strategy_id: selectedStrategy.id,
            product_id: productId
          }));

          const { error: insertError } = await supabase
            .from('strategy_products_pf')
            .insert(productAssociations);

          if (insertError) throw insertError;
        }

        // Refresh strategies
        const { data: refreshedData, error: refreshError } = await supabase
          .from('strategies_pf')
          .select(`
            *,
            strategy_products_pf(
              product_id
            )
          `)
          .order('name');

        if (refreshError) throw refreshError;
        setStrategies(refreshedData || []);
        setIsEditModalOpen(false);
      } else {
        // Create new strategy
        const { data, error } = await supabase
          .from('strategies_pf')
          .insert({
            name: formData.name,
            description: formData.description,
            category: formData.category
          })
          .select();

        if (error) throw error;

        // Add product associations if any
        if (formData.productIds.length > 0 && data && data.length > 0) {
          const productAssociations = formData.productIds.map(productId => ({
            strategy_id: data[0].id,
            product_id: productId
          }));

          const { error: insertError } = await supabase
            .from('strategy_products_pf')
            .insert(productAssociations);

          if (insertError) throw insertError;
        }

        // Refresh strategies
        const { data: refreshedData, error: refreshError } = await supabase
          .from('strategies_pf')
          .select(`
            *,
            strategy_products_pf(
              product_id
            )
          `)
          .order('name');

        if (refreshError) throw refreshError;
        setStrategies(refreshedData || []);
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error('Error saving strategy:', err);
      alert('Failed to save strategy. Please try again.');
    } finally {
      setSaving(false);
      setSelectedStrategy(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductSelectionChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      productIds: selectedOptions
    }));
  };

  const filteredStrategies = strategies.filter(strategy =>
    strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (strategy.description && strategy.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isAdmin) {
    return <p className="text-red-500">You do not have permission to manage strategies.</p>;
  }

  const getCategoryName = (categoryId) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
        <p className="text-danger-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn-secondary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search strategies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        <button
          onClick={handleAddStrategy}
          className="btn-primary flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Strategy</span>
        </button>
      </div>

      {filteredStrategies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No strategies found. Add your first strategy.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strategy Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Associated Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStrategies.map((strategy) => (
                <tr key={strategy.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{strategy.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {strategy.category ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                          {getCategoryName(strategy.category)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {strategy.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {strategy.strategy_products_pf && strategy.strategy_products_pf.length > 0 ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">
                          {strategy.strategy_products_pf.length} products
                        </span>
                      ) : (
                        'No products'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditStrategy(strategy)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <SafeIcon icon={FiEdit} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStrategy(strategy.id)}
                        className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Strategy Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Strategy"
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strategy Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., LIRP (Life Insurance Retirement Plan)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-input h-24 resize-none"
              placeholder="Brief description of this financial strategy..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associated Products
            </label>
            <select
              multiple
              name="productIds"
              value={formData.productIds}
              onChange={handleProductSelectionChange}
              className="form-input h-32"
            >
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} {product.type ? `(${product.type})` : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Hold Ctrl/Cmd key to select multiple products
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  <span>Save Strategy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Strategy Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Strategy"
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strategy Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., LIRP (Life Insurance Retirement Plan)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-input h-24 resize-none"
              placeholder="Brief description of this financial strategy..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associated Products
            </label>
            <select
              multiple
              name="productIds"
              value={formData.productIds}
              onChange={handleProductSelectionChange}
              className="form-input h-32"
            >
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} {product.type ? `(${product.type})` : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Hold Ctrl/Cmd key to select multiple products
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  <span>Update Strategy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StrategiesManager;