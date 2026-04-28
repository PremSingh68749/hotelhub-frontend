'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../lib/store';
import { getRoomTypes, deleteRoomType, toggleRoomTypeActiveStatus } from '../../lib/slices/roomTypeSlice';
import { RoomType } from '../../graphql/room-type';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RoomTypeListProps {
  hotelId: number;
}

export default function RoomTypeList({ hotelId }: RoomTypeListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { roomTypes, isLoading, error } = useSelector((state: RootState) => state.roomType);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getRoomTypes(hotelId));
  }, [dispatch, hotelId]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this room type?')) return;
    
    setDeletingId(id);
    try {
      await dispatch(deleteRoomType({ id, hotelId })).unwrap();
    } catch (error) {
      console.error('Failed to delete room type:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      await dispatch(toggleRoomTypeActiveStatus({ 
        id, 
        isActive: !currentStatus, 
        hotelId 
      })).unwrap();
    } catch (error) {
      console.error('Failed to toggle room type status:', error);
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-600">Loading room types...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading room types: {error}</p>
      </div>
    );
  }

  if (roomTypes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No room types found for this hotel.</p>
        <Link 
          href={`/hotel-owner/hotels/${hotelId}/room-types/create`}
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Create First Room Type
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Room Types</h3>
        <Link 
          href={`/hotel-owner/hotels/${hotelId}/room-types/create`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Room Type
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomTypes.map((roomType: RoomType) => (
          <div key={roomType.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-semibold text-gray-900">{roomType.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                roomType.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {roomType.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {roomType.description && (
              <p className="text-gray-600 text-sm mb-3">{roomType.description}</p>
            )}
            
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span className="font-medium">₹{roomType.basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Occupancy:</span>
                <span className="font-medium">{roomType.maxOccupancy} guests</span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-medium">{roomType.size} sq ft</span>
              </div>
              <div className="flex justify-between">
                <span>Bed Type:</span>
                <span className="font-medium">{roomType.bedType}</span>
              </div>
            </div>

            {roomType.amenities && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-1">Amenities:</p>
                <div className="flex flex-wrap gap-1">
                  {roomType.amenities.split(',').map((amenity, index) => (
                    <span 
                      key={index} 
                      className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {amenity.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Link 
                href={`/hotel-owner/hotels/${hotelId}/room-types/${roomType.id}`}
                className="flex-1 text-center bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
              >
                View
              </Link>
              <Link 
                href={`/hotel-owner/hotels/${hotelId}/room-types/${roomType.id}/edit`}
                className="flex-1 text-center bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Edit
              </Link>
              <button
                onClick={() => handleToggleStatus(roomType.id, roomType.isActive)}
                disabled={togglingId === roomType.id}
                className={`flex-1 text-center px-3 py-1 rounded text-sm ${
                  roomType.isActive 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {togglingId === roomType.id ? '...' : (roomType.isActive ? 'Deactivate' : 'Activate')}
              </button>
              <button
                onClick={() => handleDelete(roomType.id)}
                disabled={deletingId === roomType.id}
                className="flex-1 text-center bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === roomType.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
