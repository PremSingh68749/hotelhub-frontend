import { gql } from '@apollo/client';

// Room Queries
export const GET_ROOMS_QUERY = gql`
  query GetRooms($roomTypeId: Int, $hotelId: Int) {
    rooms(roomTypeId: $roomTypeId, hotelId: $hotelId) {
      id
      roomNumber
      floor
      customPrice
      description
      status
      roomTypeId
      hotelId
      createdAt
      updatedAt
    }
  }
`;

export const GET_ROOM_QUERY = gql`
  query GetRoom($id: Int!) {
    room(id: $id) {
      id
      roomNumber
      floor
      customPrice
      description
      status
      roomTypeId
      hotelId
      createdAt
      updatedAt
    }
  }
`;

export const SEARCH_ROOMS_QUERY = gql`
  query SearchRooms($searchInput: SearchRoomsInput!) {
    searchRooms(searchInput: $searchInput) {
      id
      roomNumber
      floor
      customPrice
      description
      status
      roomTypeId
      hotelId
    }
  }
`;

export const GET_ROOM_COUNT_QUERY = gql`
  query GetRoomCount {
    roomCount
  }
`;

// Room Mutations
export const CREATE_ROOM_MUTATION = gql`
  mutation CreateRoom($createRoomInput: CreateRoomInput!, $roomTypeId: Int!) {
    createRoom(createRoomInput: $createRoomInput, roomTypeId: $roomTypeId) {
      id
      roomNumber
      floor
      customPrice
      description
      status
      roomTypeId
      hotelId
    }
  }
`;

export const UPDATE_ROOM_MUTATION = gql`
  mutation UpdateRoom($id: Int!, $updateRoomInput: UpdateRoomInput!, $hotelId: Int!) {
    updateRoom(id: $id, updateRoomInput: $updateRoomInput, hotelId: $hotelId) {
      id
      roomNumber
      floor
      customPrice
      description
      status
      roomTypeId
      hotelId
    }
  }
`;

export const DELETE_ROOM_MUTATION = gql`
  mutation DeleteRoom($id: Int!, $hotelId: Int!) {
    deleteRoom(id: $id, hotelId: $hotelId) {
      success
      message
      room {
        id
        roomNumber
      }
    }
  }
`;

export const UPDATE_ROOM_STATUS_MUTATION = gql`
  mutation UpdateRoomStatus($id: Int!, $status: String!, $hotelId: Int!) {
    updateRoomStatus(id: $id, status: $status, hotelId: $hotelId) {
      id
      roomNumber
      status
    }
  }
`;

// TypeScript interfaces
export interface Room {
  id: number;
  roomNumber: string;
  floor?: string;
  customPrice?: number;
  description?: string;
  status: string;
  roomTypeId: number;
  hotelId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomInput {
  roomNumber: string;
  floor?: string;
  customPrice?: number;
  description?: string;
  status?: string;
}

export interface UpdateRoomInput {
  roomNumber?: string;
  floor?: string;
  customPrice?: number;
  description?: string;
  status?: string;
}

export interface SearchRoomsInput {
  hotelId?: number;
  roomTypeId?: number;
  roomNumber?: string;
  floor?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Response interfaces
export interface CreateRoomResponse {
  createRoom: Room;
}

export interface UpdateRoomResponse {
  updateRoom: Room;
}

export interface DeleteRoomResponse {
  deleteRoom: {
    success: boolean;
    message: string;
    room: {
      id: number;
      roomNumber: string;
    };
  };
}

export interface UpdateRoomStatusResponse {
  updateRoomStatus: {
    id: number;
    roomNumber: string;
    status: string;
  };
}

export interface RoomsResponse {
  rooms: Room[];
}

export interface RoomResponse {
  room: Room | null;
}

export interface SearchRoomsResponse {
  searchRooms: Room[];
}

export interface RoomCountResponse {
  roomCount: number;
}
