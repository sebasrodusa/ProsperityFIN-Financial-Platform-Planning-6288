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

const PRODUCT_TYPES = [
  { id: 'life_insurance', name: 'Life Insurance' },
  { id: 'annuity', name: 'Annuity' },
  { id: 'investment', name: 'Investment' },
  { id: 'protection', name: 'Protection' },
  { id: 'retirement', name: 'Retirement' },
  { id: 'other', name: 'Other' }
];

const ProductsManager = () => {
  const { isAdmin } = useAuth();
  logDev('ProductsManager isAdmin:', isAdmin);
  const [products, setProducts] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    strategyIds: []
  });
  const [saving, setSaving] = useState(false);

  // Fetch products and strategies
  useEffect(() => {
    if (!isAdmin) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch products with strategy associations
        const { data: productsData, error: productsError } = await supabase
          .from('products_pf')
          .select(`
            *,
            strategy_products_pf(
              strategy_id
            )
          `)
          .order('name');

        if (productsError) throw productsError;

        // Fetch strategies for dropdown
        const { data: strategiesData, error: strategiesError } = await supabase
          .from('strategies_pf')
          .select('*')
          .order('name');

        if (strategiesError) throw strategiesError;

        setProducts(productsData || []);
        setStrategies(strategiesData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const handleAddProduct = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      strategyIds: []
    });
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (product) => {
    // Transform strategy_products_pf array to array of strategy_ids
    const strategyIds = product.strategy_products_pf
      ? product.strategy_products_pf.map(sp => sp.strategy_id)
      : [];

    setSelectedProduct(product);
    setFormData({
      name: product.name,
      type: product.type || '',
      description: product.description || '',
      strategyIds
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products_pf')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Update local state
        setProducts(products.filter(product => product.id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedProduct) {
        // Update existing product
        const { data, error } = await supabase
          .from('products_pf')
          .update({
            name: formData.name,
            type: formData.type,
            description: formData.description,
            updated_at: new Date()
          })
          .eq('id', selectedProduct.id)
          .select();

        if (error) throw error;

        // Delete existing strategy associations
        const { error: deleteError } = await supabase
          .from('strategy_products_pf')
          .delete()
          .eq('product_id', selectedProduct.id);

        if (deleteError) throw deleteError;

        // Add new strategy associations
        if (formData.strategyIds.length > 0) {
          const strategyAssociations = formData.strategyIds.map(strategyId => ({
            product_id: selectedProduct.id,
            strategy_id: strategyId
          }));

          const { error: insertError } = await supabase
            .from('strategy_products_pf')
            .insert(strategyAssociations);

          if (insertError) throw insertError;
        }

        // Refresh products
        const { data: refreshedData, error: refreshError } = await supabase
          .from('products_pf')
          .select(`
            *,
            strategy_products_pf(
              strategy_id
            )
          `)
          .order('name');

        if (refreshError) throw refreshError;
        setProducts(refreshedData || []);
        setIsEditModalOpen(false);
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products_pf')
          .insert({
            name: formData.name,
            type: formData.type,
            description: formData.description
          })
          .select();

        if (error) throw error;

        // Add strategy associations if any
        if (formData.strategyIds.length > 0 && data && data.length > 0) {
          const strategyAssociations = formData.strategyIds.map(strategyId => ({
            product_id: data[0].id,
            strategy_id: strategyId
          }));

          const { error: insertError } = await supabase
            .from('strategy_products_pf')
            .insert(strategyAssociations);

          if (insertError) throw insertError;
        }

        // Refresh products
        const { data: refreshedData, error: refreshError } = await supabase
          .from('products_pf')
          .select(`
            *,
            strategy_products_pf(
              strategy_id
            )
          `)
          .order('name');

        if (refreshError) throw refreshError;
        setProducts(refreshedData || []);
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
      setSelectedProduct(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStrategySelectionChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      strategyIds: selectedOptions
    }));
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.type && product.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isAdmin) {
    return <p className="text-red-500">You do not have permission to manage products.</p>;
  }

  const getTypeName = (typeId) => {
    const type = PRODUCT_TYPES.find(t => t.id === typeId);
    return type ? type.name : typeId;
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
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        <button
          onClick={handleAddProduct}
          className="btn-primary flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No products found. Add your first product.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Associated Strategies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {product.type ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                          {getTypeName(product.type)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {product.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {product.strategy_products_pf && product.strategy_products_pf.length > 0 ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">
                          {product.strategy_products_pf.length} strategies
                        </span>
                      ) : (
                        'No strategies'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <SafeIcon icon={FiEdit} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
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

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Whole Life Insurance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select Type</option>
              {PRODUCT_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
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
              placeholder="Brief description of this product..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associated Strategies
            </label>
            <select
              multiple
              name="strategyIds"
              value={formData.strategyIds}
              onChange={handleStrategySelectionChange}
              className="form-input h-32"
            >
              {strategies.map(strategy => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Hold Ctrl/Cmd key to select multiple strategies
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
                  <span>Save Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Whole Life Insurance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select Type</option>
              {PRODUCT_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
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
              placeholder="Brief description of this product..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associated Strategies
            </label>
            <select
              multiple
              name="strategyIds"
              value={formData.strategyIds}
              onChange={handleStrategySelectionChange}
              className="form-input h-32"
            >
              {strategies.map(strategy => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Hold Ctrl/Cmd key to select multiple strategies
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
                  <span>Update Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsManager;