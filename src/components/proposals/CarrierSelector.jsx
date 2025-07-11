import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck } = FiIcons;

const DEFAULT_CARRIERS = [
  {
    id: 'ethos',
    name: 'Ethos',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    products: ['term_life', 'whole_life', 'universal_life'],
    rating: 'A+',
    established: '2016'
  },
  {
    id: 'fg',
    name: 'F&G (Fidelity & Guaranty)',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    products: ['fixed_annuity', 'indexed_annuity', 'universal_life'],
    rating: 'A',
    established: '1959'
  },
  {
    id: 'ameritas',
    name: 'Ameritas',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    products: ['whole_life', 'universal_life', 'variable_universal_life', 'disability_insurance'],
    rating: 'A+',
    established: '1887'
  },
  {
    id: 'mutual_omaha',
    name: 'Mutual of Omaha',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    products: ['term_life', 'whole_life', 'universal_life', 'disability_insurance'],
    rating: 'A+',
    established: '1909'
  },
  {
    id: 'american_national',
    name: 'American National',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    products: ['whole_life', 'universal_life', 'variable_universal_life', 'fixed_annuity'],
    rating: 'A',
    established: '1905'
  },
  {
    id: 'american_equity',
    name: 'American Equity',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    products: ['fixed_annuity', 'indexed_annuity', 'variable_annuity'],
    rating: 'A-',
    established: '1995'
  }
];

const CarrierSelector = ({ selectedCarrier, onCarrierChange, selectedProduct, carriers = DEFAULT_CARRIERS }) => {
  // Filter carriers that offer the selected product
  const availableCarriers = selectedProduct 
    ? carriers.filter(carrier => carrier.products.includes(selectedProduct))
    : carriers;

  const getRatingColor = (rating) => {
    if (rating.startsWith('A+')) return 'text-success-600 bg-success-50';
    if (rating.startsWith('A')) return 'text-primary-600 bg-primary-50';
    if (rating.startsWith('B')) return 'text-secondary-600 bg-secondary-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Insurance Carrier</h3>
      
      {!selectedProduct && (
        <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
          <p className="text-secondary-800 text-sm">
            Please select a product type first to see available carriers.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableCarriers.map((carrier) => (
          <button
            key={carrier.id}
            type="button"
            onClick={() => onCarrierChange(carrier.id)}
            className={`p-4 text-left border-2 rounded-lg transition-all relative ${
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
              <img 
                src={carrier.logo} 
                alt={carrier.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{carrier.name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getRatingColor(carrier.rating)}`}>
                    {carrier.rating} Rating
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Est. {carrier.established}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {availableCarriers.length === 0 && selectedProduct && (
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