import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useSupabaseWithClerk } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import logDev from '../../utils/logDev';

const { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiSearch, FiUpload, FiLink } = FiIcons;

const RATINGS = ['A++', 'A+', 'A', 'A-', 'B++', 'B+', 'B', 'B-', 'C++', 'C+', 'C', 'C-'];

const CarriersManager = () => {
  const { isAdmin } = useAuth();
  logDev('CarriersManager isAdmin:', isAdmin);
  const { getSupabaseClient } = useSupabaseWithClerk();
  const [carriers, setCarriers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    rating: '',
    established: '',
    logo_url: '',
    productIds: []
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch carriers and products
  useEffect(() => {
    if (!isAdmin) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const supabase = await getSupabaseClient();

      try {
        // Fetch carriers with product associations
        const { data: carriersData, error: carriersError } = await supabase
          .from('carriers_pf')
          .select(`
            *,
            carrier_products_pf(
              product_id
            )
          `)
          .order('name');

        if (carriersError) throw carriersError;

        // Fetch products for dropdown
        const { data: productsData, error: productsError } = await supabase
          .from('products_pf')
          .select('*')
          .order('name');

        if (productsError) throw productsError;

        setCarriers(carriersData || []);
        setProducts(productsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load carriers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const handleAddCarrier = () => {
    setFormData({
      name: '',
      rating: '',
      established: '',
      logo_url: '',
      productIds: []
    });
    setLogoFile(null);
    setLogoPreview(null);
    setIsAddModalOpen(true);
  };

  const handleEditCarrier = (carrier) => {
    // Transform carrier_products_pf array to array of product_ids
    const productIds = carrier.carrier_products_pf
      ? carrier.carrier_products_pf.map(cp => cp.product_id)
      : [];

    setSelectedCarrier(carrier);
    setFormData({
      name: carrier.name,
      rating: carrier.rating || '',
      established: carrier.established || '',
      logo_url: carrier.logo_url || '',
      productIds
    });
    setLogoPreview(carrier.logo_url);
    setLogoFile(null);
    setIsEditModalOpen(true);
  };

  const handleDeleteCarrier = async (id) => {
    if (window.confirm('Are you sure you want to delete this carrier?')) {
      try {
        const supabase = await getSupabaseClient();
        // Delete the carrier logo from storage if it exists
        const carrier = carriers.find(c => c.id === id);
        if (carrier && carrier.logo_url && carrier.logo_url.includes('storage.googleapis.com')) {
          const path = carrier.logo_url.split('/').pop();
          if (path) {
            const { error: storageError } = await supabase.storage
              .from('carrier-logos')
              .remove([path]);
            
            if (storageError) {
              console.error('Error deleting logo:', storageError);
              // Continue with deletion even if logo removal fails
            }
          }
        }

        // Delete the carrier from the database
        const { error } = await supabase
          .from('carriers_pf')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Update local state
        setCarriers(carriers.filter(carrier => carrier.id !== id));
      } catch (err) {
        console.error('Error deleting carrier:', err);
        alert('Failed to delete carrier. Please try again.');
      }
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (file, carrierId) => {
    if (!file) return formData.logo_url; // Return existing URL if no new file
    const supabase = await getSupabaseClient();

    try {
      // Generate a unique file name to prevent conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${carrierId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('carrier-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          }
        });

      if (error) throw error;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('carrier-logos')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading logo:', err);
      throw err;
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUploadProgress(0);

    const supabase = await getSupabaseClient();

    try {
      let logoUrl = formData.logo_url;
      
      if (selectedCarrier) {
        // Upload logo if a new file is selected
        if (logoFile) {
          logoUrl = await uploadLogo(logoFile, selectedCarrier.id);
        }

        // Update existing carrier
        const { data, error } = await supabase
          .from('carriers_pf')
          .update({
            name: formData.name,
            rating: formData.rating,
            established: formData.established,
            logo_url: logoUrl,
            updated_at: new Date()
          })
          .eq('id', selectedCarrier.id)
          .select();

        if (error) throw error;

        // Delete existing product associations
        const { error: deleteError } = await supabase
          .from('carrier_products_pf')
          .delete()
          .eq('carrier_id', selectedCarrier.id);

        if (deleteError) throw deleteError;

        // Add new product associations
        if (formData.productIds.length > 0) {
          const productAssociations = formData.productIds.map(productId => ({
            carrier_id: selectedCarrier.id,
            product_id: productId
          }));

          const { error: insertError } = await supabase
            .from('carrier_products_pf')
            .insert(productAssociations);

          if (insertError) throw insertError;
        }

        // Refresh carriers
        const { data: refreshedData, error: refreshError } = await supabase
          .from('carriers_pf')
          .select(`
            *,
            carrier_products_pf(
              product_id
            )
          `)
          .order('name');

        if (refreshError) throw refreshError;
        setCarriers(refreshedData || []);
        setIsEditModalOpen(false);
      } else {
        // Create new carrier
        const { data, error } = await supabase
          .from('carriers_pf')
          .insert({
            name: formData.name,
            rating: formData.rating,
            established: formData.established,
            logo_url: '' // Placeholder, will update after upload
          })
          .select();

        if (error) throw error;

        // Upload logo if provided
        if (logoFile && data && data.length > 0) {
          logoUrl = await uploadLogo(logoFile, data[0].id);
          
          // Update carrier with logo URL
          const { error: updateError } = await supabase
            .from('carriers_pf')
            .update({ logo_url: logoUrl })
            .eq('id', data[0].id);

          if (updateError) throw updateError;
        }

        // Add product associations if any
        if (formData.productIds.length > 0 && data && data.length > 0) {
          const productAssociations = formData.productIds.map(productId => ({
            carrier_id: data[0].id,
            product_id: productId
          }));

          const { error: insertError } = await supabase
            .from('carrier_products_pf')
            .insert(productAssociations);

          if (insertError) throw insertError;
        }

        // Refresh carriers
        const { data: refreshedData, error: refreshError } = await supabase
          .from('carriers_pf')
          .select(`
            *,
            carrier_products_pf(
              product_id
            )
          `)
          .order('name');

        if (refreshError) throw refreshError;
        setCarriers(refreshedData || []);
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error('Error saving carrier:', err);
      alert('Failed to save carrier. Please try again.');
    } finally {
      setSaving(false);
      setSelectedCarrier(null);
      setUploadProgress(0);
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

  const filteredCarriers = carriers.filter(carrier =>
    carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (carrier.rating && carrier.rating.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (carrier.established && carrier.established.includes(searchTerm))
  );

  if (!isAdmin) {
    return <p className="text-red-500">You do not have permission to manage carriers.</p>;
  }

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
            placeholder="Search carriers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        <button
          onClick={handleAddCarrier}
          className="btn-primary flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Carrier</span>
        </button>
      </div>

      {filteredCarriers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No carriers found. Add your first carrier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCarriers.map((carrier) => (
            <div key={carrier.id} className="card hover:shadow-medium transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {carrier.logo_url ? (
                    <img
                      src={carrier.logo_url}
                      alt={carrier.name}
                      className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-1"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/64?text=Logo';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                      <SafeIcon icon={FiLink} className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{carrier.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {carrier.rating && (
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full text-xs">
                          {carrier.rating} Rating
                        </span>
                      )}
                      {carrier.established && <span>Est. {carrier.established}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 mb-4">
                <div className="text-sm text-gray-600">
                  {carrier.carrier_products_pf && carrier.carrier_products_pf.length > 0 ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-success-100 text-success-800">
                      {carrier.carrier_products_pf.length} products available
                    </span>
                  ) : (
                    <span className="text-gray-500">No products associated</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEditCarrier(carrier)}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <SafeIcon icon={FiEdit} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCarrier(carrier.id)}
                  className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Carrier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Carrier"
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carrier Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., MassMutual"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">Select Rating</option>
                {RATINGS.map(rating => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Established Year
              </label>
              <input
                type="text"
                name="established"
                value={formData.established}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 1956"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carrier Logo
            </label>
            <div className="flex items-center space-x-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-24 h-24 object-contain rounded-lg bg-gray-50 p-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-danger-100 text-danger-600 rounded-full hover:bg-danger-200"
                  >
                    <SafeIcon icon={FiX} className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                  <SafeIcon icon={FiLink} className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <label className="btn-secondary flex items-center justify-center space-x-2 cursor-pointer">
                  <SafeIcon icon={FiUpload} className="w-4 h-4" />
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Recommended size: 400x400px. Max 2MB.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Products
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
                  <span>Save Carrier</span>
                </>
              )}
            </button>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                Uploading logo: {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </form>
      </Modal>

      {/* Edit Carrier Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Carrier"
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carrier Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., MassMutual"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">Select Rating</option>
                {RATINGS.map(rating => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Established Year
              </label>
              <input
                type="text"
                name="established"
                value={formData.established}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 1956"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carrier Logo
            </label>
            <div className="flex items-center space-x-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-24 h-24 object-contain rounded-lg bg-gray-50 p-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                      setFormData(prev => ({ ...prev, logo_url: '' }));
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-danger-100 text-danger-600 rounded-full hover:bg-danger-200"
                  >
                    <SafeIcon icon={FiX} className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                  <SafeIcon icon={FiLink} className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <label className="btn-secondary flex items-center justify-center space-x-2 cursor-pointer">
                  <SafeIcon icon={FiUpload} className="w-4 h-4" />
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Recommended size: 400x400px. Max 2MB.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Products
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
                  <span>Update Carrier</span>
                </>
              )}
            </button>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                Uploading logo: {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default CarriersManager;