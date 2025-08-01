import React, { useState, useEffect, useMemo } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useSupabaseClient } from '../../lib/supabaseClient';
import LoadingSpinner from '../ui/LoadingSpinner';

const { FiShield, FiTrendingUp, FiDollarSign, FiHeart, FiUsers, FiAward, FiAlertTriangle } = FiIcons;

const StrategySelector = ({ selectedStrategy, onStrategyChange, selectedProduct, onProductChange }) => {
  const [strategies, setStrategies] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const supabase = useSupabaseClient();
  const categories = useMemo(
    () => Array.from(new Set(strategies.map((s) => s.category))),
    [strategies]
  );

  // Fetch strategies from Supabase
  useEffect(() => {
    const fetchStrategies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data: strategiesData, error: strategiesError } = await supabase
          .from('strategies_pf')
          .select(`
            id,
            name,
            description,
            category,
            is_featured,
            strategy_products_pf!strategy_products_pf_strategy_id_fkey(
              product_id,
              products_pf(*)
            )
          `)
          .order('is_featured', { ascending: false })
          .order('name');
        
        if (strategiesError) throw strategiesError;
        
        // Process the data to include product information
        const processedStrategies = strategiesData.map(strategy => ({
          id: strategy.id,
          name: strategy.name,
          description: strategy.description || '',
          category: strategy.category || 'other',
          is_featured: strategy.is_featured || false,
          products: strategy.strategy_products_pf.map(sp => sp.products_pf) || []
        }));
        
        setStrategies(processedStrategies);
      } catch (err) {
        console.error('Error fetching strategies:', err);
        setError('Failed to load strategies. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStrategies();
  }, []);

  // Update available products when strategy is selected
  useEffect(() => {
    if (selectedStrategy) {
      const strategy = strategies.find(s => String(s.id) === String(selectedStrategy));
      if (strategy) {
        setAvailableProducts(strategy.products);
        
        // Reset product selection if current selection is not available
        if (selectedProduct && !strategy.products.find(p => String(p.id) === String(selectedProduct))) {
          onProductChange(null);
        }
      }
    } else {
      setAvailableProducts([]);
      onProductChange(null);
    }
  }, [selectedStrategy, strategies, selectedProduct, onProductChange]);

  const getIconForCategory = (category) => {
    switch (category) {
      case 'retirement': return FiTrendingUp;
      case 'wealth_building': return FiDollarSign;
      case 'protection': return FiShield;
      case 'executive': return FiAward;
      case 'estate_planning': return FiHeart;
      case 'business': return FiUsers;
      default: return FiTrendingUp;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'retirement': return 'bg-primary-50 border-primary-200 text-primary-800';
      case 'protection': return 'bg-success-50 border-success-200 text-success-800';
      case 'wealth_building': return 'bg-secondary-50 border-secondary-200 text-secondary-800';
      case 'executive': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'estate_planning': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'business': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Financial Strategy</h3>
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Financial Strategy</h3>
        <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-danger-600" />
            <p className="text-danger-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredStrategies =
    selectedCategory === 'all'
      ? strategies
      : strategies.filter((s) => s.category === selectedCategory);

  const featuredIds = filteredStrategies
    .filter(s => s.is_featured)
    .slice(0, 3)
    .map(s => s.id);

  const displayStrategies = [
    ...filteredStrategies.filter(s => featuredIds.includes(s.id)),
    ...filteredStrategies.filter(s => !featuredIds.includes(s.id))
  ];

  return (
    <div className="space-y-6">
      {/* Strategy Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Select Financial Strategy</h3>
        <div className="mb-4">
          <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input"
          >
            <option value="all">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayStrategies.map((strategy) => (
              <button
                key={strategy.id}
                type="button"
                onClick={() => onStrategyChange(String(strategy.id))}
                className={`p-2 md:p-3 text-left border-2 rounded-lg transition-all ${
                  selectedStrategy === String(strategy.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(strategy.category)}`}>
                    <SafeIcon icon={getIconForCategory(strategy.category)} className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{strategy.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(strategy.category)}`}>
                        {strategy.category.replace('_', ' ')}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {strategy.products.length} products available
                      </span>
                      {strategy.is_featured && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-secondary-100 text-secondary-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Product Selection */}
      {selectedStrategy && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Select Product Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onProductChange(String(product.id))}
                className={`p-2 md:p-3 text-left border-2 rounded-lg transition-all ${
                  selectedProduct === String(product.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-600 capitalize">{product.type.replace('_', ' ')}</div>
              </button>
            ))}
          </div>
          
          {availableProducts.length === 0 && (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600">No products available for this strategy. Please select a different strategy.</p>
            </div>
          )}
        </div>
      )}

      {!selectedStrategy && (
        <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
          <p className="text-secondary-800">Please select a financial strategy to continue.</p>
        </div>
      )}
    </div>
  );
};

export default StrategySelector;
