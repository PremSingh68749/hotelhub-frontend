'use client';

import { useEffect, useState } from 'react';
import RoomTypeForm from '../../../../../../components/room-type/RoomTypeForm';

export default function CreateRoomTypePage() {
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
          <p className="text-gray-600">Please select a valid hotel to create a room type.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <RoomTypeForm hotelId={hotelId} />
        </div>
      </div>
    </div>
  );
}
