import { gql } from '@apollo/client';

// Room Type Queries
export const GET_ROOM_TYPES_QUERY = gql`
  query GetRoomTypes($hotelId: Int) {
    roomTypes(hotelId: $hotelId) {
      id
      name
      description
      basePrice
      maxOccupancy
      roomSize
      bedType
      amenities
      images
      isActive
      hotelId
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const GET_ROOM_TYPE_QUERY = gql`
  query GetRoomType($id: Int!) {
    roomType(id: $id) {
      id
      name
      description
      basePrice
      maxOccupancy
      roomSize
      bedType
      amenities
      images
      isActive
      hotelId
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const SEARCH_ROOM_TYPES_QUERY = gql`
  query SearchRoomTypes($searchInput: SearchRoomTypesInput!) {
    searchRoomTypes(searchInput: $searchInput) {
      id
      name
      description
      basePrice
      maxOccupancy
      roomSize
      bedType
      amenities
      images
      isActive
      hotelId
      __typename
    }
  }
`;

// Room Type Mutations
export const CREATE_ROOM_TYPE_MUTATION = gql`
  mutation CreateRoomType($createRoomTypeInput: CreateRoomTypeInput!, $hotelId: Int!) {
    createRoomType(createRoomTypeInput: $createRoomTypeInput, hotelId: $hotelId) {
      id
      name
      description
      basePrice
      maxOccupancy
      roomSize
      bedType
      amenities
      images
      isActive
      hotelId
      __typename
    }
  }
`;

export const UPDATE_ROOM_TYPE_MUTATION = gql`
  mutation UpdateRoomType($id: Int!, $updateRoomTypeInput: UpdateRoomTypeInput!, $hotelId: Int!) {
    updateRoomType(id: $id, updateRoomTypeInput: $updateRoomTypeInput, hotelId: $hotelId) {
      id
      name
      description
      basePrice
      maxOccupancy
      roomSize
      bedType
      amenities
      images
      isActive
      hotelId
      __typename
    }
  }
`;

export const DELETE_ROOM_TYPE_MUTATION = gql`
  mutation DeleteRoomType($id: Int!, $hotelId: Int!) {
    deleteRoomType(id: $id, hotelId: $hotelId) {
      success
      message
      roomType {
        id
        name
      }
    }
  }
`;

export const TOGGLE_ROOM_TYPE_ACTIVE_STATUS_MUTATION = gql`
  mutation ToggleRoomTypeActiveStatus($id: Int!, $isActive: Boolean!, $hotelId: Int!) {
    toggleRoomTypeActiveStatus(id: $id, isActive: $isActive, hotelId: $hotelId) {
      id
      name
      isActive
    }
  }
`;

// TypeScript interfaces
export interface RoomType {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  maxOccupancy: number;
  roomSize: number;
  bedType: string;
  amenities: string;
  images?: string[];
  isActive: boolean;
  hotelId: number;
  createdAt: string;
  updatedAt: string;
  __typename?: string;
}

export interface CreateRoomTypeInput {
  name: string;
  description?: string;
  basePrice: number;
  maxOccupancy: number;
  roomSize: number;
  bedType: string;
  amenities: string;
  images?: string[];
  isActive?: boolean;
}

export interface UpdateRoomTypeInput {
  name?: string;
  description?: string;
  basePrice?: number;
  maxOccupancy?: number;
  roomSize?: number;
  bedType?: string;
  amenities?: string;
  images?: string[];
  isActive?: boolean;
}

export interface SearchRoomTypesInput {
  hotelId?: number;
  name?: string;
  bedType?: string;
  minPrice?: number;
  maxPrice?: number;
  minOccupancy?: number;
  maxOccupancy?: number;
  isActive?: boolean;
}

// Response interfaces
export interface CreateRoomTypeResponse {
  createRoomType: RoomType;
}

export interface UpdateRoomTypeResponse {
  updateRoomType: RoomType;
}

export interface DeleteRoomTypeResponse {
  deleteRoomType: {
    success: boolean;
    message: string;
    roomType: {
      id: number;
      name: string;
    };
  };
}

export interface ToggleRoomTypeStatusResponse {
  toggleRoomTypeActiveStatus: {
    id: number;
    name: string;
    isActive: boolean;
  };
}

export interface RoomTypesResponse {
  roomTypes: RoomType[];
}

export interface RoomTypeResponse {
  roomType: RoomType | null;
}

export interface SearchRoomTypesResponse {
  searchRoomTypes: RoomType[];
}
