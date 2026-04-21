import { gql } from '@apollo/client';

// Room Type Mutations for Hotel Owners
export const CREATE_ROOM_TYPE_WITH_IMAGES_MUTATION = gql`
  mutation CreateRoomTypeWithImages($input: CreateRoomTypeWithImagesInput!) {
    createRoomTypeWithImages(input: $input) {
      id
      name
      description
      basePrice
      maxOccupancy
      roomCount
      isActive
      hotelId
      createdAt
      updatedAt
      images {
        id
        url
        altText
        caption
        isPrimary
        sortOrder
      }
    }
  }
`;

export const UPDATE_ROOM_TYPE_WITH_IMAGES_MUTATION = gql`
  mutation UpdateRoomTypeWithImages($id: Int!, $input: UpdateRoomTypeWithImagesInput!) {
    updateRoomTypeWithImages(id: $id, input: $input) {
      id
      name
      description
      basePrice
      maxOccupancy
      roomCount
      isActive
      hotelId
      createdAt
      updatedAt
      images {
        id
        url
        altText
        caption
        isPrimary
        sortOrder
      }
    }
  }
`;

// Room Type Queries
export const GET_ROOM_TYPES_BY_HOTEL_QUERY = gql`
  query GetRoomTypesByHotel($hotelId: Int!) {
    roomTypesByHotel(hotelId: $hotelId) {
      id
      name
      description
      basePrice
      maxOccupancy
      roomCount
      isActive
      hotelId
      createdAt
      updatedAt
      images {
        id
        url
        altText
        caption
        isPrimary
        sortOrder
      }
    }
  }
`;

export const GET_ROOM_TYPE_BY_ID_QUERY = gql`
  query GetRoomTypeById($id: Int!) {
    roomType(id: $id) {
      id
      name
      description
      basePrice
      maxOccupancy
      roomCount
      isActive
      hotelId
      createdAt
      updatedAt
      images {
        id
        url
        altText
        caption
        isPrimary
        sortOrder
      }
    }
  }
`;

// TypeScript interfaces
export interface RoomType {
  id: number;
  name: string;
  description?: string;
  basePrice?: number;
  maxOccupancy?: number;
  roomCount?: number;
  isActive?: boolean;
  hotelId?: number;
  createdAt: string;
  updatedAt: string;
  images?: RoomTypeImage[];
}

export interface RoomTypeImage {
  id: number;
  url: string;
  altText?: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface CreateRoomTypeWithImagesInput {
  hotelId: number;
  name: string;
  description?: string;
  basePrice?: number;
  maxOccupancy?: number;
  roomCount?: number;
  bedType?: string;
  size?: string;
  images?: ImageUrlInput[];
}

export interface UpdateRoomTypeWithImagesInput {
  name?: string;
  description?: string;
  basePrice?: number;
  maxOccupancy?: number;
  roomCount?: number;
  bedType?: string;
  size?: string;
  newImages?: ImageUrlInput[];
  deleteImageIds?: number[];
}

export interface ImageUrlInput {
  url: string;
  altText?: string;
  caption?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

// Response interfaces
export interface CreateRoomTypeResponse {
  createRoomTypeWithImages: RoomType;
}

export interface UpdateRoomTypeResponse {
  updateRoomTypeWithImages: RoomType;
}

export interface RoomTypesByHotelResponse {
  roomTypesByHotel: RoomType[];
}

export interface RoomTypeByIdResponse {
  roomType: RoomType | null;
}
