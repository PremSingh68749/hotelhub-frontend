'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../../../lib/store';
import { CREATE_HOTEL_WITH_URLS_MUTATION } from '../../../graphql/hotel';
import { client } from '../../../lib/apollo-client';
import { fileUploadService } from '../../../services/file-upload.service';
import { CreateHotelWithUrlsInput, ImageUrlInput, CreateHotelResponse } from '../../../graphql/hotel';
import { StarRating } from '../../../components/StarRating';
import { CustomPhoneInput } from '../../../components/PhoneInput';
import { LocationSelect } from '../../../components/LocationSelect';
import { IndiaPincodeAutocomplete } from '../../../components/IndiaPincodeAutocomplete';
import Link from 'next/link';

export default function CreateHotelForm() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateHotelWithUrlsInput>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'IN',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    rating: 0,
    totalRooms: 0,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    hasParking: false,
    hasWiFi: false,
    hasPool: false,
    hasGym: false,
    hasSpa: false,
    hasRestaurant: false,
    hasBar: false,
    hasRoomService: false,
    hasMeetingRooms: false,
    hasBusinessCenter: false,
    hasPetFriendly: false,
    hasAirportShuttle: false,
    hasConcierge: false,
    has24HourFrontDesk: false,
    hasAirConditioning: false,
    hasHeating: false,
    hasElevator: false,
    hasDisabledAccess: false,
    images: { images: [] }
  });

  // Monitor form state changes
  useEffect(() => {
    console.log('Form state updated:', formData);
  }, [formData]);

  // Monitor error state changes  
  useEffect(() => {
    console.log('Error state updated:', error);
  }, [error]);

  // File upload handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      return;
    }

    setUploadedFiles(files);
    setIsUploading(true);
    setError(null);
    setImageError(null); // Clear image error when user uploads files

    try {
      const uploadedUrls = await fileUploadService.uploadHotelImages(files);
      
      console.log('Files uploaded successfully:', uploadedUrls);
      
      // Convert uploaded URLs to ImageUrlInput format
      const hasExistingImages = (formData.images?.images?.length || 0) > 0;
      const newImages = uploadedUrls.map((url: string, index: number) => ({
        url,
        altText: `Hotel image ${index + 1}`,
        caption: `Image ${index + 1}`,
        isPrimary: !hasExistingImages && index === 0,
        sortOrder: (formData.images?.images?.length || 0) + index + 1
      }));

      setFormData((prev: CreateHotelWithUrlsInput) => ({
        ...prev,
        images: {
          images: [...(prev.images?.images || []), ...newImages]
        }
      }));

      // Clear uploaded files and reset input
      setUploadedFiles([]);
      if (e.target) {
        e.target.value = '';
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev: CreateHotelWithUrlsInput) => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (type === 'number') {
      setFormData((prev: CreateHotelWithUrlsInput) => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData((prev: CreateHotelWithUrlsInput) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageAdd = () => {
    const newImage: ImageUrlInput = {
      url: '',
      altText: '',
      caption: '',
      isPrimary: formData.images?.images?.length === 0,
      sortOrder: (formData.images?.images?.length || 0) + 1
    };
    
    setFormData((prev: CreateHotelWithUrlsInput) => ({
      ...prev,
      images: {
        images: [...(prev.images?.images || []), newImage]
      }
    }));
  };

  const handleImageChange = (index: number, field: keyof ImageUrlInput, value: any) => {
    setFormData((prev: CreateHotelWithUrlsInput) => ({
      ...prev,
      images: {
        images: prev.images?.images?.map((img: ImageUrlInput, i: number) => 
          i === index ? { ...img, [field]: value } : img
        ) || []
      }
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData((prev: CreateHotelWithUrlsInput) => ({
      ...prev,
      rating
    }));
    // Clear rating error when user selects a rating
    if (rating > 0) {
      setRatingError(null);
    }
  };

  const handlePhoneChange = (phone: string) => {
    setFormData((prev: CreateHotelWithUrlsInput) => ({
      ...prev,
      phone
    }));
  };

  const handleLocationChange = (field: 'country' | 'state' | 'city', value: string) => {
    setFormData((prev: CreateHotelWithUrlsInput) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePincodeChange = (pincodeInfo: any) => {
    setFormData((prev: CreateHotelWithUrlsInput) => ({
      ...prev,
      postalCode: pincodeInfo.pincode,
      city: pincodeInfo.city,
      state: pincodeInfo.state,
      country: pincodeInfo.country
    }));
  };

  const handleImageRemove = (urlToRemove: string) => {
    setFormData((prev: CreateHotelWithUrlsInput) => ({
      ...prev,
      images: {
        images: prev.images?.images?.filter(image => image.url !== urlToRemove) || []
      }
    }));
  };

  const setPrimaryImage = (index: number) => {
    setFormData((prev: CreateHotelWithUrlsInput) => ({
      ...prev,
      images: {
        images: prev.images?.images?.map((img: ImageUrlInput, i: number) => ({
          ...img,
          isPrimary: i === index
        })) || []
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    // Validate required fields
    if (!formData.rating || formData.rating === 0) {
      setRatingError('Please select a hotel rating');
      setIsLoading(false);
      return;
    }
    
    // Validate images (minimum 1 required)
    if (!formData.images || !formData.images.images || formData.images.images.length === 0) {
      setImageError('At least 1 hotel image is required');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Submitting form with data:', formData); // Debug log
      
      const response = await client.mutate<CreateHotelResponse>({
        mutation: CREATE_HOTEL_WITH_URLS_MUTATION,
        variables: {
          input: {
            ...formData,
            rating: parseFloat(formData.rating.toFixed(1)),
            totalRooms: formData.totalRooms || undefined
          }
        }
      });

      console.log('API Response:', response); // Debug log

      if (response.data?.createHotelWithUrls) {
        console.log('Hotel created successfully'); // Debug log
        setSuccess(true);
        // Redirect immediately to dashboard
        router.push('/hotel-owner');
      } else {
        console.log('API call failed'); // Debug log
        setError('Failed to create hotel. Please try again.');
      }
    } catch (err: any) {
      console.error('Error creating hotel:', err); // Debug log
      setError(err.message || 'Failed to create hotel. Please check the form and try again.');
      // Form data is preserved - user can fix errors and retry
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel Created Successfully!</h2>
          <p className="text-gray-600 mb-4">Your hotel has been created and is now ready for management.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/hotel-owner" 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Create New Hotel</h1>
          <p className="text-gray-600 mt-2">Fill in the details to create your hotel</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Name <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  aria-required="true"
                  aria-describedby="name-help"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter hotel name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                />
                <p id="name-help" className="mt-1 text-sm text-gray-500">The official name of your hotel</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Contact
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  aria-describedby="email-help"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@hotel.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                />
                <p id="email-help" className="mt-1 text-sm text-gray-500">Contact email for bookings</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <CustomPhoneInput
                  value={formData.phone || ''}
                  onChange={handlePhoneChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full"
                />
                <p id="phone-help" className="mt-1 text-sm text-gray-500">Main contact phone number</p>
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  aria-describedby="website-help"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.hotelwebsite.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                />
                <p id="website-help" className="mt-1 text-sm text-gray-500">Hotel website URL</p>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Hotel Description <span className="text-red-500" aria-label="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                aria-required="true"
                aria-describedby="description-help"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your hotel, its unique features, and what guests can expect..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y text-gray-900 placeholder-gray-500"
              />
              <p id="description-help" className="mt-1 text-sm text-gray-500">Provide a detailed description of your hotel (minimum 50 characters recommended)</p>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Address Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  aria-required="true"
                  aria-describedby="address-help"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street, Suite 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                />
                <p id="address-help" className="mt-1 text-sm text-gray-500">Complete street address including suite/apartment number</p>
              </div>

              <IndiaPincodeAutocomplete
                onPincodeChange={handlePincodeChange}
                onCityChange={(city: string) => handleLocationChange('city', city)}
                onStateChange={(state: string) => handleLocationChange('state', state)}
                onCountryChange={(country: string) => handleLocationChange('country', country)}
                disabled={isLoading}
                placeholder="Enter 6-digit PIN code"
                className="w-full"
              />
            </div>
          </div>

          {/* Hotel Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Hotel Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Rating <span className="text-red-500" aria-label="required">*</span>
                </label>
                <StarRating
                  rating={formData.rating || 0}
                  onRatingChange={handleRatingChange}
                  size="md"
                />
                {ratingError && (
                  <p className="mt-1 text-sm text-red-600" id="rating-error">
                    {ratingError}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="totalRooms" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Rooms
                </label>
                <input
                  type="number"
                  id="totalRooms"
                  name="totalRooms"
                  min="0"
                  value={formData.totalRooms || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  placeholder="Number of rooms"
                />
              </div>

              <div>
                <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Time
                </label>
                <input
                  type="time"
                  id="checkInTime"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Time
                </label>
                <input
                  type="time"
                  id="checkOutTime"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Hotel Amenities</h2>
            
            <fieldset className="space-y-4">
              <legend className="sr-only">Select available hotel amenities</legend>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(formData).filter(([key, value]) => key.startsWith('has') && typeof value === 'boolean').map(([key, value]) => {
                  const amenityName = key.replace('has', '').replace(/([A-Z])/g, ' $1').trim();
                  const amenityId = `amenity-${key}`;
                  
                  return (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={amenityId}
                        name={key}
                        checked={value as boolean}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500 border-gray-300 rounded"
                        aria-describedby={`${amenityId}-desc`}
                      />
                      <label htmlFor={amenityId} className="ml-2 text-sm text-gray-700 font-medium cursor-pointer">
                        {amenityName}
                      </label>
                      <span id={`${amenityId}-desc`} className="sr-only">
                        Toggle {amenityName} amenity
                      </span>
                    </div>
                  );
                })}
              </div>
            </fieldset>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tip:</span> Select all amenities that your hotel offers to help guests find what they're looking for.
              </p>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Hotel Images <span className="text-red-500" aria-label="required">*</span></h2>

            {formData.images?.images?.map((image: ImageUrlInput, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Image {index + 1} {image.url ? '✓' : ''}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleImageRemove(image.url)}
                      className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {image.url && (
                  <div className="mt-4">
                    <div className="relative group">
                      <img
                        src={image.url}
                        alt={`Hotel image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleImageRemove(image.url)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Selected Files Preview */}
            <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Automatic on selection)
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
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading images...
                  </div>
                )}

                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ {uploadedFiles.length} file(s) selected and ready for upload
                    </p>
                    <div className="mt-2 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-sm text-gray-700 truncate">
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = uploadedFiles.filter((_, i) => i !== index);
                              setUploadedFiles(newFiles);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/hotel-owner"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
