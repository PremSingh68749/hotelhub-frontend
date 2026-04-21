import { gql } from '@apollo/client';

// Enums matching backend
export enum MealPlan {
  NONE = 'NONE',
  BREAKFAST_ONLY = 'BREAKFAST_ONLY',
  BREAKFAST_LUNCH = 'BREAKFAST_LUNCH',
  BREAKFAST_LUNCH_DINNER = 'BREAKFAST_LUNCH_DINNER',
  ALL_MEALS = 'ALL_MEALS'
}

export enum PropertyType {
  HOTEL = 'HOTEL',
  RESORT = 'RESORT',
  GUEST_HOUSE = 'GUEST_HOUSE',
  APARTMENT = 'APARTMENT',
  VILLA = 'VILLA'
}

// GraphQL Queries
export const SEARCH_HOTELS_QUERY = gql`
  query SearchHotels($input: SearchHotelsInput!) {
    searchHotels(input: $input) {
      id
      name
      address
      city
      state
      country
      postalCode
      latitude
      longitude
      phone
      email
      website
      description
      mealPlan
      propertyType
      checkInTime
      checkOutTime
      cancellationPolicy
      petPolicy
      parkingInfo
      isActive
      isVerified
      createdAt
      updatedAt
    }
  }
`;

export const GET_HOTELS_QUERY = gql`
  query GetHotels($limit: Int, $offset: Int) {
    hotels(limit: $limit, offset: $offset) {
      id
      name
      address
      city
      state
      country
      postalCode
      latitude
      longitude
      phone
      email
      website
      description
      mealPlan
      propertyType
      checkInTime
      checkOutTime
      cancellationPolicy
      petPolicy
      parkingInfo
      isActive
      isVerified
      createdAt
      updatedAt
    }
  }
`;

export const GET_HOTEL_BY_ID_QUERY = gql`
  query GetHotelById($id: Int!) {
    hotel(id: $id) {
      id
      name
      address
      city
      state
      country
      postalCode
      latitude
      longitude
      phone
      email
      website
      description
      mealPlan
      propertyType
      checkInTime
      checkOutTime
      cancellationPolicy
      petPolicy
      parkingInfo
      isActive
      isVerified
      createdAt
      updatedAt
    }
  }
`;

export const GET_HOTEL_COUNT_QUERY = gql`
  query GetHotelCount {
    hotelCount
  }
`;

export const SEARCH_NEARBY_QUERY = gql`
  query SearchNearby($latitude: Number!, $longitude: Number!, $radiusKm: Int) {
    searchNearby(latitude: $latitude, longitude: $longitude, radiusKm: $radiusKm) {
      id
      name
      address
      city
      state
      country
      postalCode
      latitude
      longitude
      phone
      email
      website
      description
      mealPlan
      propertyType
      checkInTime
      checkOutTime
      cancellationPolicy
      petPolicy
      parkingInfo
      isActive
      isVerified
      createdAt
      updatedAt
    }
  }
`;

export const ADVANCED_HOTEL_AUTOCOMPLETE_QUERY = gql`
  query AdvancedHotelAutocomplete($query: String!) {
    advancedHotelAutocomplete(query: $query)
  }
`;

// Hotel Management Mutations for Hotel Owners
export const CREATE_HOTEL_WITH_URLS_MUTATION = gql`
  mutation CreateHotelWithUrls($input: CreateHotelWithUrlsInput!) {
    createHotelWithUrls(input: $input) {
      id
      name
      description
      address
      city
      state
      country
      postalCode
      latitude
      longitude
      phone
      email
      website
      rating
      totalReviews
      isActive
      isVerified
      mealPlan
      propertyType
      checkInTime
      checkOutTime
      cancellationPolicy
      petPolicy
      parkingInfo
      ownerId
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

export const UPDATE_HOTEL_WITH_URLS_MUTATION = gql`
  mutation UpdateHotelWithUrls($id: Int!, $input: UpdateHotelWithUrlsInput!) {
    updateHotelWithUrls(id: $id, input: $input) {
      id
      name
      description
      address
      city
      state
      country
      postalCode
      latitude
      longitude
      phone
      email
      website
      rating
      totalReviews
      isActive
      isVerified
      mealPlan
      propertyType
      checkInTime
      checkOutTime
      cancellationPolicy
      petPolicy
      parkingInfo
      ownerId
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

export const GET_HOTELS_BY_OWNER_QUERY = gql`
  query GetHotelsByOwner($limit: Int, $offset: Int) {
    hotelsByOwner(limit: $limit, offset: $offset) {
      id
      name
      description
      address
      city
      state
      country
      postalCode
      latitude
      longitude
      phone
      email
      website
      rating
      totalReviews
      isActive
      isVerified
      mealPlan
      propertyType
      checkInTime
      checkOutTime
      cancellationPolicy
      petPolicy
      parkingInfo
      ownerId
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
      roomTypes {
        id
        name
        description
        basePrice
        maxOccupancy
        roomCount
        isActive
      }
    }
  }
`;

export const TOGGLE_HOTEL_ACTIVE_STATUS_MUTATION = gql`
  mutation ToggleHotelActiveStatus($id: Int!, $isActive: Boolean!, $ownerId: Int!) {
    toggleHotelActiveStatus(id: $id, isActive: $isActive, ownerId: $ownerId) {
      id
      name
      isActive
      updatedAt
    }
  }
`;

export const DELETE_HOTEL_MUTATION = gql`
  mutation DeleteHotel($id: Int!, $ownerId: Int!) {
    deleteHotel(id: $id, ownerId: $ownerId) {
      success
      message
    }
  }
`;



// TypeScript interfaces
export interface Hotel {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
  isVerified: boolean;
  mealPlan?: MealPlan;
  propertyType?: PropertyType;
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  petPolicy?: string;
  parkingInfo?: string;
  ownerId?: number;
  createdAt: string;
  updatedAt: string;
  images?: HotelImage[];
  roomTypes?: RoomType[];
}

export interface HotelImage {
  id: number;
  url: string;
  altText?: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface RoomType {
  id: number;
  name: string;
  description?: string;
  basePrice?: number;
  maxOccupancy?: number;
  roomCount?: number;
  isActive?: boolean;
}

// Hotel Creation and Update Interfaces
export interface CreateHotelWithUrlsInput {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  totalRooms?: number;
  checkInTime?: string;
  checkOutTime?: string;
  hasParking?: boolean;
  hasWiFi?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasSpa?: boolean;
  hasRestaurant?: boolean;
  hasBar?: boolean;
  hasRoomService?: boolean;
  hasMeetingRooms?: boolean;
  hasBusinessCenter?: boolean;
  hasPetFriendly?: boolean;
  hasAirportShuttle?: boolean;
  hasConcierge?: boolean;
  has24HourFrontDesk?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  hasElevator?: boolean;
  hasDisabledAccess?: boolean;
  images?: MultipleImageUrlInput;
}

export interface UpdateHotelWithUrlsInput {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  totalRooms?: number;
  checkInTime?: string;
  checkOutTime?: string;
  hasParking?: boolean;
  hasWiFi?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasSpa?: boolean;
  hasRestaurant?: boolean;
  hasBar?: boolean;
  hasRoomService?: boolean;
  hasMeetingRooms?: boolean;
  hasBusinessCenter?: boolean;
  hasPetFriendly?: boolean;
  hasAirportShuttle?: boolean;
  hasConcierge?: boolean;
  has24HourFrontDesk?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  hasElevator?: boolean;
  hasDisabledAccess?: boolean;
  newImages?: MultipleImageUrlInput;
  deleteImageIds?: number[];
}

export interface ImageUrlInput {
  url: string;
  altText?: string;
  caption?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface MultipleImageUrlInput {
  images?: ImageUrlInput[];
}

export interface SearchHotelsInput {
  searchQuery?: string;
  city?: string;
  state?: string;
  country?: string;
  minRating?: number;
  maxRating?: number;
  minPrice?: number;
  maxPrice?: number;
  mealPlan?: MealPlan;
  propertyType?: PropertyType;
  amenities?: string[];
  adults?: number;
  children?: number;
  checkInDate?: string;
  checkOutDate?: string;
  limit?: number;
  offset?: number;
}

export interface GetHotelsInput {
  limit?: number;
  offset?: number;
}

export interface SearchNearbyInput {
  latitude: number;
  longitude: number;
  radiusKm?: number;
}

export interface HotelSearchResponse {
  searchHotels: Hotel[];
}

export interface HotelsResponse {
  hotels: Hotel[];
}

export interface HotelResponse {
  hotel: Hotel | null;
}

export interface HotelCountResponse {
  hotelCount: number;
}

export interface SearchNearbyResponse {
  searchNearby: Hotel[];
}

export interface AdvancedHotelAutocompleteResponse {
  advancedHotelAutocomplete: string[];
}

// Hotel Management Response Interfaces
export interface CreateHotelResponse {
  createHotelWithUrls: Hotel;
}

export interface UpdateHotelResponse {
  updateHotelWithUrls: Hotel;
}

export interface HotelsByOwnerResponse {
  hotelsByOwner: Hotel[];
}

export interface ToggleHotelStatusResponse {
  toggleHotelActiveStatus: Hotel;
}

export interface DeleteHotelResponse {
  deleteHotel: {
    success: boolean;
    message: string;
  };
}

// Pagination helper interface
export interface PaginatedHotels {
  hotels: Hotel[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}
