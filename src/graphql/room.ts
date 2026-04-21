import { gql } from '@apollo/client';

// Room Mutations for Hotel Owners
export const CREATE_ROOM_WITH_IMAGES_MUTATION = gql`
  mutation CreateRoomWithImages($input: CreateRoomWithImagesInput!) {
    createRoomWithImages(input: $input) {
      id
      roomNumber
      floor
      hotelId
      roomTypeId
      customPrice
      description
      notes
      isSmokingAllowed
      isPetFriendly
      hasMinibar
      hasSafe
      hasBalcony
      hasBathtub
      hasShower
      hasKitchenette
      hasWorkDesk
      hasTV
      hasWiFi
      hasAirConditioning
      hasHeating
      isActive
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

export const UPDATE_ROOM_WITH_IMAGES_MUTATION = gql`
  mutation UpdateRoomWithImages($id: Int!, $input: UpdateRoomWithImagesInput!) {
    updateRoomWithImages(id: $id, input: $input) {
      id
      roomNumber
      floor
      hotelId
      roomTypeId
      customPrice
      description
      notes
      isSmokingAllowed
      isPetFriendly
      hasMinibar
      hasSafe
      hasBalcony
      hasBathtub
      hasShower
      hasKitchenette
      hasWorkDesk
      hasTV
      hasWiFi
      hasAirConditioning
      hasHeating
      isActive
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

// Room Queries
export const GET_ROOMS_BY_HOTEL_QUERY = gql`
  query GetRoomsByHotel($hotelId: Int!) {
    roomsByHotel(hotelId: $hotelId) {
      id
      roomNumber
      floor
      hotelId
      roomTypeId
      customPrice
      description
      notes
      isSmokingAllowed
      isPetFriendly
      hasMinibar
      hasSafe
      hasBalcony
      hasBathtub
      hasShower
      hasKitchenette
      hasWorkDesk
      hasTV
      hasWiFi
      hasAirConditioning
      hasHeating
      isActive
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

export const GET_ROOMS_BY_ROOM_TYPE_QUERY = gql`
  query GetRoomsByRoomType($roomTypeId: Int!) {
    roomsByRoomType(roomTypeId: $roomTypeId) {
      id
      roomNumber
      floor
      hotelId
      roomTypeId
      customPrice
      description
      notes
      isSmokingAllowed
      isPetFriendly
      hasMinibar
      hasSafe
      hasBalcony
      hasBathtub
      hasShower
      hasKitchenette
      hasWorkDesk
      hasTV
      hasWiFi
      hasAirConditioning
      hasHeating
      isActive
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

export const GET_ROOM_BY_ID_QUERY = gql`
  query GetRoomById($id: Int!) {
    room(id: $id) {
      id
      roomNumber
      floor
      hotelId
      roomTypeId
      customPrice
      description
      notes
      isSmokingAllowed
      isPetFriendly
      hasMinibar
      hasSafe
      hasBalcony
      hasBathtub
      hasShower
      hasKitchenette
      hasWorkDesk
      hasTV
      hasWiFi
      hasAirConditioning
      hasHeating
      isActive
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
export interface Room {
  id: number;
  roomNumber: string;
  floor?: string;
  hotelId?: number;
  roomTypeId?: number;
  customPrice?: number;
  description?: string;
  notes?: string;
  isSmokingAllowed?: boolean;
  isPetFriendly?: boolean;
  hasMinibar?: boolean;
  hasSafe?: boolean;
  hasBalcony?: boolean;
  hasBathtub?: boolean;
  hasShower?: boolean;
  hasKitchenette?: boolean;
  hasWorkDesk?: boolean;
  hasTV?: boolean;
  hasWiFi?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  images?: RoomImage[];
}

export interface RoomImage {
  id: number;
  url: string;
  altText?: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface CreateRoomWithImagesInput {
  roomNumber: string;
  floor?: string;
  hotelId: number;
  roomTypeId: number;
  customPrice?: number;
  description?: string;
  notes?: string;
  isSmokingAllowed?: boolean;
  isPetFriendly?: boolean;
  hasMinibar?: boolean;
  hasSafe?: boolean;
  hasBalcony?: boolean;
  hasBathtub?: boolean;
  hasShower?: boolean;
  hasKitchenette?: boolean;
  hasWorkDesk?: boolean;
  hasTV?: boolean;
  hasWiFi?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  images?: ImageUrlInput[];
}

export interface UpdateRoomWithImagesInput {
  roomNumber?: string;
  floor?: string;
  customPrice?: number;
  description?: string;
  notes?: string;
  isSmokingAllowed?: boolean;
  isPetFriendly?: boolean;
  hasMinibar?: boolean;
  hasSafe?: boolean;
  hasBalcony?: boolean;
  hasBathtub?: boolean;
  hasShower?: boolean;
  hasKitchenette?: boolean;
  hasWorkDesk?: boolean;
  hasTV?: boolean;
  hasWiFi?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
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
export interface CreateRoomResponse {
  createRoomWithImages: Room;
}

export interface UpdateRoomResponse {
  updateRoomWithImages: Room;
}

export interface RoomsByHotelResponse {
  roomsByHotel: Room[];
}

export interface RoomsByRoomTypeResponse {
  roomsByRoomType: Room[];
}

export interface RoomByIdResponse {
  room: Room | null;
}
