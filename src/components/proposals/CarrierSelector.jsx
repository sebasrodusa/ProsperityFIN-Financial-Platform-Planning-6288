import React, { useState, useEffect } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getTransformedImage } from '../../services/publitio';
import { useSupabaseClient } from '../../lib/supabaseClient';
import LoadingSpinner from '../ui/LoadingSpinner';

const { FiCheck, FiAlertTriangle } = FiIcons;

const CarrierSelector = ({ selectedCarrier, onCarrierChange, selectedProduct }) => {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = useSupabaseClient();

  // Fetch carriers that offer the selected product
  useEffect(() => {
    const fetchCarriers = async () => {
      if (!selectedProduct) {
        setCarriers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get carriers that offer the selected product through the junction table
        const { data: carriersData, error: carriersError } = await supabase
          .from('carriers_pf')
          .select(`
            *,
            carrier_products_pf!carrier_products_pf_carrier_id_fkey(
              product_id
            )
          `)
          .order('name');

        if (carriersError) throw carriersError;

        // Filter carriers that offer the selected product
        const availableCarriers = carriersData.filter(carrier =>
          carrier.carrier_products_pf.some(cp => cp.product_id === selectedProduct)
        );

        setCarriers(availableCarriers);

        // Reset carrier selection if current selection is not available
        if (selectedCarrier && !availableCarriers.find(c => c.id === selectedCarrier)) {
          onCarrierChange(null);
        }
      } catch (err) {
        console.error('Error fetching carriers:', err);
        setError('Failed to load carriers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCarriers();
  }, [selectedProduct, selectedCarrier, onCarrierChange]);

  const getRatingColor = (rating) => {
    if (rating && rating.startsWith('A+')) return 'text-success-600 bg-success-50';
    if (rating && rating.startsWith('A')) return 'text-primary-600 bg-primary-50';
    if (rating && rating.startsWith('B')) return 'text-secondary-600 bg-secondary-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">3. Select Insurance Carrier</h3>
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">3. Select Insurance Carrier</h3>
        <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-danger-600" />
            <p className="text-danger-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">3. Select Insurance Carrier</h3>
        <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
          <p className="text-secondary-800 text-sm">
            Please select a product type first to see available carriers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">3. Select Insurance Carrier</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {carriers.map((carrier) => (
          <button
            key={carrier.id}
            type="button"
            onClick={() => onCarrierChange(carrier.id)}
            className={`p-2 md:p-3 text-left border-2 rounded-lg transition-all relative ${
              selectedCarrier === carrier.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {selectedCarrier === carrier.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiCheck} className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="flex items-start space-x-3">
              {carrier.logo_url ? (
                <img
                  src={getTransformedImage(carrier.logo_url, { width: 96, height: 96 })}
                  alt={carrier.name}
                  className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/48?text=Logo';
                  }}
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-lg font-bold">
                  {carrier.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{carrier.name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getRatingColor(carrier.rating)}`}>
                    {carrier.rating ? `${carrier.rating} Rating` : 'No Rating'}
                  </span>
                </div>
                {carrier.established && (
                  <p className="text-xs text-gray-500 mt-1">Est. {carrier.established}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {carriers.length === 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-600 text-sm">
            No carriers available for the selected product type.
          </p>
        </div>
      )}
    </div>
  );
};

export default CarrierSelector;