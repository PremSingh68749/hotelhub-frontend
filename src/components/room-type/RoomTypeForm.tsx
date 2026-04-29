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
  onCancel?: () => void;
  mode?: 'create' | 'view' | 'edit';
}

export default function RoomTypeForm({ hotelId, roomType, onSuccess, onCancel, mode = 'create' }: RoomTypeFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error } = useSelector((state: RootState) => state.roomType);
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  // Parse CSV amenities into boolean flags for checkboxes
  const parseAmenitiesToBooleans = (amenitiesCsv: string | undefined | null) => {
    if (!amenitiesCsv) return {};
    const amenitiesList = amenitiesCsv.split(',').map(a => a.trim());
    return {
      hasAirConditioning: amenitiesList.includes('Air Conditioning'),
      hasHeating: amenitiesList.includes('Heating'),
      hasPrivateBathroom: amenitiesList.includes('Private Bathroom'),
      hasKitchen: amenitiesList.includes('Kitchen'),
      hasBalcony: amenitiesList.includes('Balcony'),
      hasSeaView: amenitiesList.includes('Sea View'),
      hasMountainView: amenitiesList.includes('Mountain View'),
      hasCityView: amenitiesList.includes('City View'),
      isSmokingAllowed: amenitiesList.includes('Smoking Allowed'),
      isPetFriendly: amenitiesList.includes('Pet Friendly'),
    };
  };

  const [formData, setFormData] = useState<CreateRoomTypeInput | UpdateRoomTypeInput>(() => {
    const booleanFlags = parseAmenitiesToBooleans(roomType?.amenities);
    // Backend returns 'adults', 'children' but form uses 'maxAdults', 'maxChildren'
    return {
      name: roomType?.name || '',
      description: roomType?.description || '',
      basePrice: roomType?.basePrice || undefined,
      maxOccupancy: roomType?.maxOccupancy || undefined,
      maxAdults: (roomType as any)?.adults || (roomType as any)?.maxAdults || undefined,
      maxChildren: (roomType as any)?.children || (roomType as any)?.maxChildren || undefined,
      roomSize: roomType?.roomSize || undefined,
      numberOfBeds: roomType?.numberOfBeds || undefined,
      bedType: roomType?.bedType || '',
      amenities: roomType?.amenities || '',
      hasAirConditioning: booleanFlags.hasAirConditioning ?? false,
      hasHeating: booleanFlags.hasHeating ?? false,
      hasPrivateBathroom: booleanFlags.hasPrivateBathroom ?? false,
      hasKitchen: booleanFlags.hasKitchen ?? false,
      hasBalcony: booleanFlags.hasBalcony ?? false,
      hasSeaView: booleanFlags.hasSeaView ?? false,
      hasMountainView: booleanFlags.hasMountainView ?? false,
      hasCityView: booleanFlags.hasCityView ?? false,
      isSmokingAllowed: booleanFlags.isSmokingAllowed ?? false,
      isPetFriendly: booleanFlags.isPetFriendly ?? false,
    };
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (isViewMode) return;
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) :
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const buildAmenitiesCSV = (): string => {
    const amenitiesList: string[] = [];
    if (formData.hasAirConditioning) amenitiesList.push('Air Conditioning');
    if (formData.hasHeating) amenitiesList.push('Heating');
    if (formData.hasPrivateBathroom) amenitiesList.push('Private Bathroom');
    if (formData.hasKitchen) amenitiesList.push('Kitchen');
    if (formData.hasBalcony) amenitiesList.push('Balcony');
    if (formData.hasSeaView) amenitiesList.push('Sea View');
    if (formData.hasMountainView) amenitiesList.push('Mountain View');
    if (formData.hasCityView) amenitiesList.push('City View');
    if (formData.isSmokingAllowed) amenitiesList.push('Smoking Allowed');
    if (formData.isPetFriendly) amenitiesList.push('Pet Friendly');
    return amenitiesList.join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const amenitiesCSV = buildAmenitiesCSV();

      if (roomType) {
        // Update existing room type - include isActive
        const updateData = {
          name: formData.name,
          description: formData.description,
          basePrice: formData.basePrice,
          maxOccupancy: formData.maxOccupancy,
          maxAdults: formData.maxAdults,
          maxChildren: formData.maxChildren,
          roomSize: formData.roomSize,
          numberOfBeds: formData.numberOfBeds,
          bedType: formData.bedType,
          amenities: amenitiesCSV,
          images: formData.images,
          isActive: roomType.isActive,
        };
        await dispatch(updateRoomType({
          id: Number(roomType.id),
          input: updateData as UpdateRoomTypeInput,
          hotelId
        })).unwrap();
      } else {
        // Create new room type - don't include isActive
        const createData = {
          name: formData.name,
          description: formData.description,
          basePrice: formData.basePrice,
          maxOccupancy: formData.maxOccupancy,
          maxAdults: formData.maxAdults,
          maxChildren: formData.maxChildren,
          roomSize: formData.roomSize,
          numberOfBeds: formData.numberOfBeds,
          bedType: formData.bedType,
          amenities: amenitiesCSV,
          images: formData.images,
        };
        await dispatch(createRoomType({
          input: createData as CreateRoomTypeInput,
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
    <div className="max-w-2xl mx-auto bg-white">
      {!onCancel && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isViewMode ? 'View Room Type' : isEditMode ? 'Edit Room Type' : 'Create Room Type'}
        </h2>
      )}

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
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
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
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
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
              value={formData.basePrice || ''}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
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
              value={formData.maxOccupancy || ''}
              onChange={handleInputChange}
              required
              min="1"
              max="20"
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
              placeholder="Total guests"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="maxAdults" className="block text-sm font-medium text-gray-700 mb-2">
              Adults *
            </label>
            <input
              type="number"
              id="maxAdults"
              name="maxAdults"
              value={formData.maxAdults || ''}
              onChange={handleInputChange}
              required
              min="1"
              max="20"
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
              placeholder="Adult guests"
            />
          </div>

          <div>
            <label htmlFor="maxChildren" className="block text-sm font-medium text-gray-700 mb-2">
              Children *
            </label>
            <input
              type="number"
              id="maxChildren"
              name="maxChildren"
              value={formData.maxChildren || ''}
              onChange={handleInputChange}
              required
              min="0"
              max="10"
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
              placeholder="Children guests"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="roomSize" className="block text-sm font-medium text-gray-700 mb-2">
              Room Size (sq ft) *
            </label>
            <input
              type="number"
              id="roomSize"
              name="roomSize"
              value={formData.roomSize || ''}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
              placeholder="Room size in square feet"
            />
          </div>

          <div>
            <label htmlFor="numberOfBeds" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Beds *
            </label>
            <input
              type="number"
              id="numberOfBeds"
              name="numberOfBeds"
              value={formData.numberOfBeds || ''}
              onChange={handleInputChange}
              required
              min="1"
              max="10"
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
              placeholder="Number of beds"
            />
          </div>
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
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-100"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Room Features & Amenities
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasAirConditioning"
                name="hasAirConditioning"
                checked={formData.hasAirConditioning}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                disabled={isViewMode}
              />
              <label htmlFor="hasAirConditioning" className="ml-2 block text-sm text-gray-900">
                Air Conditioning
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasHeating"
                name="hasHeating"
                checked={formData.hasHeating}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                disabled={isViewMode}
              />
              <label htmlFor="hasHeating" className="ml-2 block text-sm text-gray-900">
                Heating
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasPrivateBathroom"
                name="hasPrivateBathroom"
                checked={formData.hasPrivateBathroom}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                disabled={isViewMode}
              />
              <label htmlFor="hasPrivateBathroom" className="ml-2 block text-sm text-gray-900">
                Private Bathroom
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasKitchen"
                name="hasKitchen"
                checked={formData.hasKitchen}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                disabled={isViewMode}
              />
              <label htmlFor="hasKitchen" className="ml-2 block text-sm text-gray-900">
                Kitchen
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasBalcony"
                name="hasBalcony"
                checked={formData.hasBalcony}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                disabled={isViewMode}
              />
              <label htmlFor="hasBalcony" className="ml-2 block text-sm text-gray-900">
                Balcony
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasSeaView"
                name="hasSeaView"
                checked={formData.hasSeaView}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                disabled={isViewMode}
              />
              <label htmlFor="hasSeaView" className="ml-2 block text-sm text-gray-900">
                Sea View
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasMountainView"
                name="hasMountainView"
                checked={formData.hasMountainView}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                disabled={isViewMode}
              />
              <label htmlFor="hasMountainView" className="ml-2 block text-sm text-gray-900">
                Mountain View
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasCityView"
                name="hasCityView"
                checked={formData.hasCityView}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                disabled={isViewMode}
              />
              <label htmlFor="hasCityView" className="ml-2 block text-sm text-gray-900">
                City View
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isSmokingAllowed"
                name="isSmokingAllowed"
                checked={formData.isSmokingAllowed}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                disabled={isViewMode}
              />
              <label htmlFor="isSmokingAllowed" className="ml-2 block text-sm text-gray-900">
                Smoking Allowed
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPetFriendly"
                name="isPetFriendly"
                checked={formData.isPetFriendly}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                disabled={isViewMode}
              />
              <label htmlFor="isPetFriendly" className="ml-2 block text-sm text-gray-900">
                Pet Friendly
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel ? onCancel : () => router.push(`/hotel-owner/hotels/${hotelId}/room-types`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>
          {!isViewMode && (
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : (isEditMode ? 'Update Room Type' : 'Create Room Type')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
