'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '../../lib/store';
import { logout } from '../../lib/slices/authSlice';
import Link from 'next/link';
import AuthGuard from '../../components/AuthGuard';
import { UserType } from '../../graphql/auth';
import { useState, useEffect } from 'react';
import { GET_HOTELS_BY_OWNER_QUERY } from '../../graphql/hotel';
import { client } from '../../lib/apollo-client';

export default function HotelOwnerDashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [hotelsData, setHotelsData] = useState<any>(null);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsError, setHotelsError] = useState<string | null>(null);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  useEffect(() => {
    const fetchHotels = async () => {
      if (user?.userType === UserType.HOTEL_OWNER) {
        setHotelsLoading(true);
        setHotelsError(null);
        try {
          const response = await client.query({
            query: GET_HOTELS_BY_OWNER_QUERY,
            variables: { limit: 10, offset: 0 },
            fetchPolicy: 'network-only', // Bypass cache and fetch fresh data
          });
          setHotelsData(response.data);
        } catch (error: any) {
          setHotelsError(error.message || 'Failed to load hotels');
        } finally {
          setHotelsLoading(false);
        }
      }
    };

    fetchHotels();
  }, [user]);

  // Redirect non-hotel owners
  if (user?.userType !== UserType.HOTEL_OWNER) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-xl text-gray-700 mb-8">This dashboard is only available to hotel owners.</p>
            <Link 
              href="/dashboard" 
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow" role="navigation" aria-label="Hotel owner navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-2xl font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1">
                  HotelHub
                </Link>
                <div className="hidden md:flex space-x-4">
                  <Link 
                    href="/" 
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Home
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700" aria-label="Welcome message">
                    Welcome, <span className="font-medium">{user?.name || 'Hotel Owner'}</span>!
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium" role="status" aria-label="User role">
                    Hotel Owner
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Welcome Header */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Hotel Owner Dashboard
              </h1>
              <p className="text-xl text-gray-700">
                Manage your hotels, room types, and rooms
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Hotel</h3>
                <p className="text-gray-600 mb-4">Add a new hotel to your portfolio</p>
                <Link 
                  href="/hotel-owner/create-hotel" 
                  className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  aria-label="Create a new hotel"
                >
                  Create Hotel
                </Link>
              </div>
            </div>

            {/* My Hotels Overview */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">My Hotels</h2>
              </div>
              <div className="p-6">
                {hotelsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-600">Loading your hotels...</p>
                  </div>
                ) : hotelsError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">Error loading hotels: {hotelsError}</p>
                  </div>
                ) : hotelsData?.hotelsByOwner?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotelsData.hotelsByOwner.map((hotel: any) => (
                      <div key={hotel.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="mb-4">
                          {hotel.images && hotel.images.length > 0 && (
                            <img 
                              src={hotel.images.find((img: any) => img.isPrimary)?.url || hotel.images[0].url} 
                              alt={hotel.name}
                              className="w-full h-32 object-cover rounded-md"
                            />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{hotel.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{hotel.address}, {hotel.city}</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            hotel.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {hotel.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {hotel.roomTypes?.length || 0} room types
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Link 
                            href={`/hotel-owner/hotel/${hotel.id}`}
                            className="flex-1 text-center bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                          >
                            View Details
                          </Link>
                          <Link 
                            href={`/hotel-owner/hotel/${hotel.id}/edit`}
                            className="flex-1 text-center bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">You haven't created any hotels yet.</p>
                    <Link 
                      href="/hotel-owner/create-hotel" 
                      className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Create Your First Hotel
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Hotels</h3>
                <p className="text-3xl font-bold text-indigo-600">{hotelsData?.hotelsByOwner?.length || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Hotels</h3>
                <p className="text-3xl font-bold text-green-600">
                  {hotelsData?.hotelsByOwner?.filter((hotel: any) => hotel.isActive).length || 0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Room Types</h3>
                <p className="text-3xl font-bold text-indigo-600">
                  {hotelsData?.hotelsByOwner?.reduce((total: number, hotel: any) => total + (hotel.roomTypes?.length || 0), 0) || 0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Company</h3>
                <p className="text-lg font-medium text-gray-700">{user?.companyName || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
