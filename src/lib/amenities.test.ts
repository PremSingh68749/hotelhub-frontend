import { describe, it, expect } from 'vitest';
import {
  AMENITY_MAPPING,
  DEFAULT_AMENITIES_STATE,
  amenitiesStateToArray,
  amenitiesArrayToState,
} from './amenities';

describe('AMENITY_MAPPING', () => {
  it('should map all has* keys to readable names', () => {
    expect(AMENITY_MAPPING.hasWiFi).toBe('WiFi');
    expect(AMENITY_MAPPING.hasPool).toBe('Pool');
    expect(AMENITY_MAPPING.hasGym).toBe('Gym');
    expect(AMENITY_MAPPING.hasParking).toBe('Parking');
    expect(AMENITY_MAPPING.hasSpa).toBe('Spa');
    expect(AMENITY_MAPPING.hasRestaurant).toBe('Restaurant');
    expect(AMENITY_MAPPING.hasBar).toBe('Bar');
    expect(AMENITY_MAPPING.hasRoomService).toBe('Room Service');
    expect(AMENITY_MAPPING.hasAirConditioning).toBe('Air Conditioning');
    expect(AMENITY_MAPPING.hasPetFriendly).toBe('Pet Friendly');
  });

  it('should have consistent keys starting with has', () => {
    Object.keys(AMENITY_MAPPING).forEach((key) => {
      expect(key.startsWith('has')).toBe(true);
    });
  });
});

describe('DEFAULT_AMENITIES_STATE', () => {
  it('should have all amenities set to false by default', () => {
    Object.values(DEFAULT_AMENITIES_STATE).forEach((value) => {
      expect(value).toBe(false);
    });
  });

  it('should have the same keys as AMENITY_MAPPING', () => {
    const mappingKeys = Object.keys(AMENITY_MAPPING).sort();
    const stateKeys = Object.keys(DEFAULT_AMENITIES_STATE).sort();
    expect(stateKeys).toEqual(mappingKeys);
  });
});

describe('amenitiesStateToArray', () => {
  it('should return empty array when no amenities are selected', () => {
    const result = amenitiesStateToArray(DEFAULT_AMENITIES_STATE);
    expect(result).toEqual([]);
  });

  it('should return array of selected amenity names', () => {
    const state = {
      ...DEFAULT_AMENITIES_STATE,
      hasWiFi: true,
      hasPool: true,
      hasGym: false,
    };
    const result = amenitiesStateToArray(state);
    expect(result).toContain('WiFi');
    expect(result).toContain('Pool');
    expect(result).not.toContain('Gym');
    expect(result.length).toBe(2);
  });

  it('should handle all amenities selected', () => {
    const allSelected = Object.keys(DEFAULT_AMENITIES_STATE).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    const result = amenitiesStateToArray(allSelected);
    expect(result.length).toBe(Object.keys(AMENITY_MAPPING).length);
  });
});

describe('amenitiesArrayToState', () => {
  it('should return default state for empty array', () => {
    const result = amenitiesArrayToState([]);
    expect(result).toEqual(DEFAULT_AMENITIES_STATE);
  });

  it('should convert amenity names to checked state', () => {
    const amenities = ['WiFi', 'Pool', 'Spa'];
    const result = amenitiesArrayToState(amenities);

    expect(result.hasWiFi).toBe(true);
    expect(result.hasPool).toBe(true);
    expect(result.hasSpa).toBe(true);
    expect(result.hasGym).toBe(false);
    expect(result.hasParking).toBe(false);
  });

  it('should handle unknown amenity names gracefully', () => {
    const amenities = ['WiFi', 'Unknown Amenity'];
    const result = amenitiesArrayToState(amenities);

    expect(result.hasWiFi).toBe(true);
    // Unknown amenities should be ignored
    expect(Object.values(result).filter(Boolean).length).toBe(1);
  });

  it('should be reversible with amenitiesStateToArray', () => {
    const originalAmenities = ['WiFi', 'Pool', 'Gym'];
    const state = amenitiesArrayToState(originalAmenities);
    const result = amenitiesStateToArray(state);

    expect(result.sort()).toEqual(originalAmenities.sort());
  });
});
