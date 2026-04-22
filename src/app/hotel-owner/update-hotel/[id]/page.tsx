'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../lib/store';
import { GET_HOTEL_BY_ID_QUERY, UPDATE_HOTEL_WITH_URLS_MUTATION } from '../../../../graphql/hotel';
import { client } from '../../../../lib/apollo-client';
import { Hotel, UpdateHotelWithUrlsInput } from '../../../../graphql/hotel';
import { StarRating } from '../../../../components/StarRating';
import { CustomPhoneInput } from '../../../../components/PhoneInput';
import { LocationSelect } from '../../../../components/LocationSelect';
import { IndiaPincodeAutocomplete } from '../../../../components/IndiaPincodeAutocomplete';
import { showSuccessToast, showErrorToast } from '../../../../lib/toast';

export default function UpdateHotelPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const hotelId = params.id as string;

  // Form state
  const [formData, setFormData] = useState<UpdateHotelWithUrlsInput>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    rating: 0,
    newImages: { images: [] },
    deleteImageIds: []
  });

  useEffect(() => {
    if (!hotelId) {
      setError('Hotel ID is required');
      setLoading(false);
      return;
    }

    fetchHotelDetails();
  }, [hotelId]);

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await client.query({
        query: GET_HOTEL_BY_ID_QUERY,
        variables: { id: parseInt(hotelId) },
        fetchPolicy: 'network-only'
      });

      const result = response.data as { hotel: Hotel };
      if (result.hotel) {
        // Verify the hotel belongs to the current user
        const hotelData = result.hotel;
        if (hotelData.ownerId !== user?.id) {
          setError('You are not authorized to update this hotel');
          return;
        }
        setHotel(hotelData);
        
        // Populate form with existing data
        setFormData({
          name: hotelData.name || '',
          description: hotelData.description || '',
          address: hotelData.address || '',
          city: hotelData.city || '',
          state: hotelData.state || '',
          country: hotelData.country || '',
          postalCode: hotelData.postalCode || '',
          phone: hotelData.phone || '',
          email: hotelData.email || '',
          website: hotelData.website || '',
          rating: hotelData.rating || 0,
          newImages: { images: [] },
          deleteImageIds: []
        });
      } else {
        setError('Hotel not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hotel details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    if (rating > 0) {
      setRatingError(null);
    }
  };

  const handleLocationChange = (location: any) => {
    setFormData(prev => ({
      ...prev,
      city: location.city,
      state: location.state,
      country: location.country
    }));
  };

  const handlePincodeChange = (pincodeData: any) => {
    setFormData(prev => ({
      ...prev,
      city: pincodeData.city,
      state: pincodeData.state,
      country: pincodeData.country,
      postalCode: pincodeData.postalCode
    }));
    setImageError(null);
  };

  // File upload handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      return;
    }

    setUploadedFiles(files);
    setIsUploading(true);
    setError(null);
    setImageError(null);

    try {
      // TODO: Implement file upload service
      // For now, just simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccessToast('Files uploaded successfully');
      setUploadedFiles([]);
      if (e.target) {
        e.target.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = (url: string) => {
    if (hotel?.images) {
      const imageToRemove = hotel.images.find((img: any) => img.url === url);
      if (imageToRemove?.id) {
        setFormData(prev => ({
          ...prev,
          deleteImageIds: [...(prev.deleteImageIds || []), imageToRemove.id]
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate required fields
    if (!formData.rating || formData.rating === 0) {
      setRatingError('Please select a hotel rating');
      setSubmitting(false);
      return;
    }
    
    // Validate images (minimum 1 required)
    const currentImages = hotel?.images?.filter((img: any) => 
      !formData.deleteImageIds?.includes(img.id)
    ) || [];
    const newImages = formData.newImages?.images || [];
    
    if (currentImages.length === 0 && newImages.length === 0) {
      setImageError('At least 1 hotel image is required');
      setSubmitting(false);
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      const response = await client.mutate({
        mutation: UPDATE_HOTEL_WITH_URLS_MUTATION,
        variables: {
          id: parseInt(hotelId),
          input: {
            ...formData,
            rating: parseFloat((formData.rating || 0).toFixed(1))
          }
        }
      });

      const updateResult = response.data as { updateHotelWithUrls: Hotel };
      if (updateResult?.updateHotelWithUrls) {
        showSuccessToast('Hotel updated successfully!');
        router.push(`/hotel-owner/view-hotel/${hotelId}`);
      } else {
        setError('Failed to update hotel');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update hotel');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h3 className="text-red-800 font-medium mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
          <Link
            href="/hotel-owner"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hotel not found</h3>
          <Link
            href="/hotel-owner"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/hotel-owner/view-hotel/${hotelId}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-2 inline-block"
              >
                &larr; Back to Hotel Details
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Update Hotel</h1>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Name <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <CustomPhoneInput
                  value={formData.phone || ''}
                  onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Describe your hotel..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hotel Rating <span className="text-red-500" aria-label="required">*</span>
              </label>
              <StarRating
                rating={formData.rating || 0}
                onRatingChange={handleRatingChange}
                size="md"
              />
              {ratingError && (
                <p className="text-sm text-red-600" id="rating-error">
                  {ratingError}
                </p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Address Information</h2>
            
            <div className="mb-4">
              <IndiaPincodeAutocomplete
                onPincodeChange={handlePincodeChange}
                onCityChange={(city: string) => setFormData(prev => ({ ...prev, city }))}
                onStateChange={(state: string) => setFormData(prev => ({ ...prev, state }))}
                onCountryChange={(country: string) => setFormData(prev => ({ ...prev, country }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <LocationSelect
                onCountryChange={(country: string) => setFormData(prev => ({ ...prev, country }))}
                onStateChange={(state: string) => setFormData(prev => ({ ...prev, state }))}
                onCityChange={(city: string) => setFormData(prev => ({ ...prev, city }))}
              />
            </div>

            <div className="mt-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter street address"
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Hotel Images <span className="text-red-500" aria-label="required">*</span></h2>

            {hotel?.images?.filter((img: any) => 
              !formData.deleteImageIds?.includes(img.id)
            )?.map((image: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Image {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleImageRemove(image.url)}
                    className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
                <img
                  src={image.url}
                  alt={image.altText || `Hotel image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            ))}

            {/* Upload New Images */}
            <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload New Images
              </label>
              <div className="flex flex-col space-y-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
                
                {imageError && (
                  <p className="text-sm text-red-600" id="image-error">
                    {imageError}
                  </p>
                )}
                
                {isUploading && (
                  <div className="text-sm text-blue-600 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Uploading images...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <Link
              href={`/hotel-owner/view-hotel/${hotelId}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Hotel'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
