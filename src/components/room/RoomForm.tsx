'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../lib/store';
import { createRoom, updateRoom } from '../../lib/slices/roomSlice';
import { getRoomTypes } from '../../lib/slices/roomTypeSlice';
import { Room, CreateRoomInput, UpdateRoomInput } from '../../graphql/room';
import { RoomType } from '../../graphql/room-type';
import { useRouter, useSearchParams } from 'next/navigation';

interface RoomFormProps {
  hotelId: number;
  room?: Room;
  onSuccess?: () => void;
}

export default function RoomForm({ hotelId, room, onSuccess }: RoomFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, error } = useSelector((state: RootState) => state.room);
  const { roomTypes } = useSelector((state: RootState) => state.roomType);
  
  const [formData, setFormData] = useState<CreateRoomInput | UpdateRoomInput>({
    roomNumber: room?.roomNumber || '',
    floor: room?.floor || '',
    customPrice: room?.customPrice || undefined,
    description: room?.description || '',
    status: room?.status || 'AVAILABLE',
  });

  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number>(
    room?.roomTypeId || Number(searchParams.get('roomTypeId')) || 0
  );

  useEffect(() => {
    dispatch(getRoomTypes(hotelId));
  }, [dispatch, hotelId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoomTypeId) {
      alert('Please select a room type');
      return;
    }
    
    try {
      if (room) {
        // Update existing room
        await dispatch(updateRoom({
          id: room.id,
          input: formData as UpdateRoomInput,
          hotelId
        })).unwrap();
      } else {
        // Create new room
        await dispatch(createRoom({
          input: formData as CreateRoomInput,
          roomTypeId: selectedRoomTypeId
        })).unwrap();
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/hotel-owner/hotels/${hotelId}/rooms`);
      }
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {room ? 'Edit Room' : 'Create Room'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Room Number *
            </label>
            <input
              type="text"
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 101, A-201, etc."
            />
          </div>

          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">
              Floor
            </label>
            <input
              type="text"
              id="floor"
              name="floor"
              value={formData.floor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Ground, 1st, 2nd, etc."
            />
          </div>
        </div>

        <div>
          <label htmlFor="roomTypeId" className="block text-sm font-medium text-gray-700 mb-2">
            Room Type *
          </label>
          <select
            id="roomTypeId"
            name="roomTypeId"
            value={selectedRoomTypeId}
            onChange={(e) => setSelectedRoomTypeId(Number(e.target.value))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a room type</option>
            {roomTypes
              .filter(rt => rt.isActive)
              .map((roomType: RoomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name} - ₹{roomType.basePrice} ({roomType.maxOccupancy} guests)
                </option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="customPrice" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Price (₹)
          </label>
          <input
            type="number"
            id="customPrice"
            name="customPrice"
            value={formData.customPrice || ''}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Leave empty to use room type base price"
          />
          <p className="mt-1 text-sm text-gray-500">
            Optional: Override the room type's base price
          </p>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="CLEANING">Cleaning</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Additional details about this specific room"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push(`/hotel-owner/hotels/${hotelId}/rooms`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (room ? 'Update Room' : 'Create Room')}
          </button>
        </div>
      </form>
    </div>
  );
}
