'use client';

import { useSelector } from 'react-redux';
import { RootState } from '../../../../../lib/store';
import RoomTypeList from '../../../../../components/room-type/RoomTypeList';
import { useEffect, useState } from 'react';

export default function RoomTypesPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [hotelId, setHotelId] = useState<number | null>(null);

  useEffect(() => {
    // Extract hotelId from URL
    const pathSegments = window.location.pathname.split('/');
    const hotelIdIndex = pathSegments.indexOf('hotels') + 1;
    if (hotelIdIndex < pathSegments.length) {
      setHotelId(Number(pathSegments[hotelIdIndex]));
    }
  }, []);

  if (!hotelId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Hotel ID</h1>
          <p className="text-gray-600">Please select a valid hotel to manage room types.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Types Management</h1>
            <p className="text-gray-600">Manage room types for your hotel</p>
          </div>
          
          <RoomTypeList hotelId={hotelId} />
        </div>
      </div>
    </div>
  );
}
