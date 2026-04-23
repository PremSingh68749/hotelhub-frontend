'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../lib/store';
import { GET_HOTEL_BY_ID_QUERY, DELETE_HOTEL_MUTATION } from '../../../../graphql/hotel';
import { client } from '../../../../lib/apollo-client';
import { Hotel } from '../../../../graphql/hotel';
import { StarRating } from '../../../../components/StarRating';
import { showSuccessToast, showErrorToast } from '../../../../lib/toast';
import HotelDetailSkeleton from '../../../../components/HotelDetailSkeleton';

export default function ViewHotelPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const hotelId = params.id as string;

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
        fetchPolicy: 'cache-first', // Try cache first for better performance
        errorPolicy: 'all'
      });

      const result = response.data as { hotel?: Hotel } | undefined;
      if (result?.hotel) {
        const hotelData = result.hotel;
        console.log('Hotel data:', hotelData);
        console.log('User ID:', user?.id);
        console.log({user})
        setHotel(hotelData);
      } else {
        setError('Hotel not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hotel details');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handleDeleteHotel = async () => {
    if (!confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await client.mutate({
        mutation: DELETE_HOTEL_MUTATION,
        variables: {
          id: parseInt(hotelId)
        }
      });

      const deleteResult = response.data as { deleteHotel: { success: boolean; message: string } };
      if (deleteResult?.deleteHotel?.success) {
        showSuccessToast(deleteResult.deleteHotel.message || 'Hotel deleted successfully');
        router.push('/hotel-owner');
      } else {
        showErrorToast('Failed to delete hotel');
      }
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to delete hotel');
    }
  };

  if (loading && isInitialLoad) {
    return <HotelDetailSkeleton />;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/hotel-owner"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-2 inline-block"
              >
                &larr; Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Hotel Details</h1>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/hotel-owner/update-hotel/${hotel.id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit Hotel
              </Link>
              <button
                onClick={handleDeleteHotel}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete Hotel
              </button>
            </div>
          </div>
        </div>

        {/* Hotel Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {hotel.name}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Basic Information */}
              <div className="col-span-1">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-900">Rating</dt>
                    <dd className="mt-1">
                      <StarRating rating={hotel.rating || 0} onRatingChange={() => {}} disabled={true} size="sm" />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-600">{hotel.phone || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900">Email</dt>
                    <dd className="mt-1 text-sm text-gray-600">{hotel.email || 'N/A'}</dd>
                  </div>
                </dl>
              </div>

              {/* Address Information */}
              <div className="col-span-1">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Address</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-900">Street Address</dt>
                    <dd className="mt-1 text-sm text-gray-600">{hotel.address}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900">City</dt>
                    <dd className="mt-1 text-sm text-gray-600">{hotel.city}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900">State</dt>
                    <dd className="mt-1 text-sm text-gray-600">{hotel.state}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900">Country</dt>
                    <dd className="mt-1 text-sm text-gray-600">{hotel.country}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900">PIN Code</dt>
                    <dd className="mt-1 text-sm text-gray-600">{hotel.postalCode}</dd>
                  </div>
                </dl>
              </div>

              {/* Additional Information */}
              <div className="col-span-1">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Information</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-900">Description</dt>
                    <dd className="mt-1 text-sm text-gray-600">
                      {hotel.description || 'No description provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900">Created</dt>
                    <dd className="mt-1 text-sm text-gray-600">
                      {new Date(hotel.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-600">
                      {new Date(hotel.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((amenity) => (
                  <span
                    key={amenity.id}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      amenity.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {amenity.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hotel Images */}
          {hotel.images && hotel.images.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Hotel Images</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hotel.images.map((image, index) => (
                  <div key={image.id || index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.altText || `Hotel image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm">{image.caption || `Image ${index + 1}`}</p>
                      {image.isPrimary && (
                        <span className="inline-block bg-indigo-600 text-xs px-2 py-1 rounded">Primary</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

                  </div>
      </div>
    </div>
  );
}
