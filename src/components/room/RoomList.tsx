'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../lib/store';
import { getRooms, deleteRoom, updateRoomStatus } from '../../lib/slices/roomSlice';
import { Room } from '../../graphql/room';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RoomListProps {
  hotelId: number;
  roomTypeId?: number;
}

export default function RoomList({ hotelId, roomTypeId }: RoomListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { rooms, isLoading, error } = useSelector((state: RootState) => state.room);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getRooms({ hotelId, roomTypeId }));
  }, [dispatch, hotelId, roomTypeId]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    setDeletingId(id);
    try {
      await dispatch(deleteRoom({ id, hotelId })).unwrap();
    } catch (error) {
      console.error('Failed to delete room:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      await dispatch(updateRoomStatus({ 
        id, 
        status: newStatus, 
        hotelId 
      })).unwrap();
    } catch (error) {
      console.error('Failed to update room status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'cleaning':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-600">Loading rooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading rooms: {error}</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No rooms found.</p>
        <Link 
          href={`/hotel-owner/hotels/${hotelId}/rooms/create${roomTypeId ? `?roomTypeId=${roomTypeId}` : ''}`}
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Create First Room
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Rooms {roomTypeId && '(Filtered by Room Type)'}
        </h3>
        <Link 
          href={`/hotel-owner/hotels/${hotelId}/rooms/create${roomTypeId ? `?roomTypeId=${roomTypeId}` : ''}`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Room
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Floor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Custom Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.map((room: Room) => (
              <tr key={room.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {room.roomNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {room.floor || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {room.customPrice ? `₹${room.customPrice}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={room.status}
                    onChange={(e) => handleStatusUpdate(room.id, e.target.value)}
                    disabled={updatingId === room.id}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-indigo-500 ${getStatusColor(room.status)} disabled:opacity-50`}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="CLEANING">Cleaning</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-xs truncate">
                    {room.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link 
                    href={`/hotel-owner/hotels/${hotelId}/rooms/${room.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </Link>
                  <Link 
                    href={`/hotel-owner/hotels/${hotelId}/rooms/${room.id}/edit`}
                    className="text-gray-600 hover:text-gray-900 ml-2"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(room.id)}
                    disabled={deletingId === room.id}
                    className="text-red-600 hover:text-red-900 ml-2 disabled:opacity-50"
                  >
                    {deletingId === room.id ? '...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
