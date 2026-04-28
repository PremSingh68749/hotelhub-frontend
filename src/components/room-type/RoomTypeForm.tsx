'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../lib/store';
import { createRoomType, updateRoomType } from '../../lib/slices/roomTypeSlice';
import { RoomType, CreateRoomTypeInput, UpdateRoomTypeInput } from '../../graphql/room-type';
import { useRouter } from 'next/navigation';

interface RoomTypeFormProps {
  hotelId: number;
  roomType?: RoomType;
  onSuccess?: () => void;
}

export default function RoomTypeForm({ hotelId, roomType, onSuccess }: RoomTypeFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error } = useSelector((state: RootState) => state.roomType);
  
  const [formData, setFormData] = useState<CreateRoomTypeInput | UpdateRoomTypeInput>({
    name: roomType?.name || '',
    description: roomType?.description || '',
    basePrice: roomType?.basePrice || 0,
    maxOccupancy: roomType?.maxOccupancy || 1,
    size: roomType?.size || 0,
    bedType: roomType?.bedType || '',
    amenities: roomType?.amenities || '',
    isActive: roomType?.isActive ?? true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (roomType) {
        // Update existing room type
        await dispatch(updateRoomType({
          id: roomType.id,
          input: formData as UpdateRoomTypeInput,
          hotelId
        })).unwrap();
      } else {
        // Create new room type
        await dispatch(createRoomType({
          input: formData as CreateRoomTypeInput,
          hotelId
        })).unwrap();
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/hotel-owner/hotels/${hotelId}/room-types`);
      }
    } catch (error) {
      console.error('Failed to save room type:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {roomType ? 'Edit Room Type' : 'Create Room Type'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Room Type Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Deluxe Room, Suite, etc."
          />
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
            placeholder="Describe the room type features and amenities"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
              Base Price (₹) *
            </label>
            <input
              type="number"
              id="basePrice"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="maxOccupancy" className="block text-sm font-medium text-gray-700 mb-2">
              Max Occupancy *
            </label>
            <input
              type="number"
              id="maxOccupancy"
              name="maxOccupancy"
              value={formData.maxOccupancy}
              onChange={handleInputChange}
              required
              min="1"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="1-20 guests"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
              Room Size (sq ft) *
            </label>
            <input
              type="number"
              id="size"
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Room size in square feet"
            />
          </div>

          <div>
            <label htmlFor="bedType" className="block text-sm font-medium text-gray-700 mb-2">
              Bed Type *
            </label>
            <select
              id="bedType"
              name="bedType"
              value={formData.bedType}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select bed type</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Queen">Queen</option>
              <option value="King">King</option>
              <option value="Twin">Twin</option>
              <option value="Sofa Bed">Sofa Bed</option>
              <option value="Bunk Bed">Bunk Bed</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 mb-2">
            Amenities
          </label>
          <textarea
            id="amenities"
            name="amenities"
            value={formData.amenities}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter amenities separated by commas (e.g., WiFi, TV, Air Conditioning, Mini Bar)"
          />
          <p className="mt-1 text-sm text-gray-500">
            Separate multiple amenities with commas
          </p>
        </div>

        {roomType && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active (available for booking)
            </label>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push(`/hotel-owner/hotels/${hotelId}/room-types`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (roomType ? 'Update Room Type' : 'Create Room Type')}
          </button>
        </div>
      </form>
    </div>
  );
}
