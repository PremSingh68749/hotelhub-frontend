// Mapping between checkbox keys and amenity names
export const AMENITY_MAPPING: Record<string, string> = {
  hasParking: 'Parking',
  hasWiFi: 'WiFi',
  hasPool: 'Pool',
  hasGym: 'Gym',
  hasSpa: 'Spa',
  hasRestaurant: 'Restaurant',
  hasBar: 'Bar',
  hasRoomService: 'Room Service',
  hasMeetingRooms: 'Meeting Rooms',
  hasBusinessCenter: 'Business Center',
  hasPetFriendly: 'Pet Friendly',
  hasAirportShuttle: 'Airport Shuttle',
  hasConcierge: 'Concierge',
  has24HourFrontDesk: '24 Hour Front Desk',
  hasAirConditioning: 'Air Conditioning',
  hasHeating: 'Heating',
  hasElevator: 'Elevator',
  hasDisabledAccess: 'Disabled Access'
};

// Default amenities state (all unchecked)
export const DEFAULT_AMENITIES_STATE: Record<string, boolean> = {
  hasParking: false,
  hasWiFi: false,
  hasPool: false,
  hasGym: false,
  hasSpa: false,
  hasRestaurant: false,
  hasBar: false,
  hasRoomService: false,
  hasMeetingRooms: false,
  hasBusinessCenter: false,
  hasPetFriendly: false,
  hasAirportShuttle: false,
  hasConcierge: false,
  has24HourFrontDesk: false,
  hasAirConditioning: false,
  hasHeating: false,
  hasElevator: false,
  hasDisabledAccess: false
};

// Convert boolean amenities state to string array
export function amenitiesStateToArray(amenitiesState: Record<string, boolean>): string[] {
  return Object.entries(amenitiesState)
    .filter(([key, value]) => value && AMENITY_MAPPING[key])
    .map(([key]) => AMENITY_MAPPING[key]);
}

// Convert string array to boolean amenities state
export function amenitiesArrayToState(amenities: string[]): Record<string, boolean> {
  const state = { ...DEFAULT_AMENITIES_STATE };
  
  // Create reverse mapping (name -> key)
  const reverseMapping: Record<string, string> = {};
  Object.entries(AMENITY_MAPPING).forEach(([key, name]) => {
    reverseMapping[name] = key;
  });
  
  amenities.forEach(amenity => {
    const key = reverseMapping[amenity];
    if (key) {
      state[key] = true;
    }
  });
  
  return state;
}
