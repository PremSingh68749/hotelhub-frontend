'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../lib/store';
import { getRoomTypes, deleteRoomType, toggleRoomTypeActiveStatus } from '../../lib/slices/roomTypeSlice';
import { RoomType } from '../../graphql/room-type';
import { useState, useEffect } from 'react';
import RoomTypeForm from './RoomTypeForm';

interface RoomTypeListProps {
  hotelId: number;
}

export default function RoomTypeList({ hotelId }: RoomTypeListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { roomTypes, isLoading, error } = useSelector((state: RootState) => state.roomType);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | undefined>(undefined);

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

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedRoomType(undefined);
    setIsModalOpen(true);
  };

  const openViewModal = (roomType: RoomType) => {
    setModalMode('view');
    setSelectedRoomType(roomType);
    setIsModalOpen(true);
  };

  const openEditModal = (roomType: RoomType) => {
    setModalMode('edit');
    setSelectedRoomType(roomType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoomType(undefined);
  };

  const handleModalSuccess = () => {
    closeModal();
    dispatch(getRoomTypes(hotelId));
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Room Types</h3>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Room Type
        </button>
      </div>

      {roomTypes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No room types found for this hotel.</p>
          <button
            onClick={openCreateModal}
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Create First Room Type
          </button>
        </div>
      ) : (
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
                <span className="font-medium">{roomType.roomSize} sq ft</span>
              </div>
              <div className="flex justify-between">
                <span>Bed Type:</span>
                <span className="font-medium">{roomType.bedType}</span>
              </div>
            </div>

            {roomType.amenities && roomType.amenities.trim().length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-1">Amenities:</p>
                <div className="flex flex-wrap gap-1">
                  {roomType.amenities.split(',').map((amenity: string, index: number) => (
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
              <button
                onClick={() => openViewModal(roomType)}
                className="flex-1 text-center bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
              >
                View
              </button>
              <button
                onClick={() => openEditModal(roomType)}
                className="flex-1 text-center bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Edit
              </button>
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
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === 'create' && 'Create Room Type'}
                  {modalMode === 'view' && 'View Room Type'}
                  {modalMode === 'edit' && 'Edit Room Type'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <RoomTypeForm
                hotelId={hotelId}
                roomType={selectedRoomType}
                mode={modalMode}
                onSuccess={handleModalSuccess}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
