import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  GET_ROOM_TYPES_QUERY,
  GET_ROOM_TYPE_QUERY,
  SEARCH_ROOM_TYPES_QUERY,
  CREATE_ROOM_TYPE_MUTATION,
  UPDATE_ROOM_TYPE_MUTATION,
  DELETE_ROOM_TYPE_MUTATION,
  TOGGLE_ROOM_TYPE_ACTIVE_STATUS_MUTATION,
  RoomType,
  CreateRoomTypeInput,
  UpdateRoomTypeInput,
  SearchRoomTypesInput,
  RoomTypesResponse,
  RoomTypeResponse,
  SearchRoomTypesResponse,
  CreateRoomTypeResponse,
  UpdateRoomTypeResponse,
  DeleteRoomTypeResponse,
  ToggleRoomTypeStatusResponse
} from '../../graphql/room-type';
import { client } from '../apollo-client';

interface RoomTypeState {
  roomTypes: RoomType[];
  currentRoomType: RoomType | null;
  searchResults: RoomType[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: RoomTypeState = {
  roomTypes: [],
  currentRoomType: null,
  searchResults: [],
  isLoading: false,
  error: null,
  totalCount: 0,
};

// Async thunks
export const getRoomTypes = createAsyncThunk(
  'roomType/getRoomTypes',
  async (hotelId: number | undefined, { rejectWithValue }) => {
    try {
      const response = await client.query({
        query: GET_ROOM_TYPES_QUERY,
        variables: { hotelId },
        fetchPolicy: 'network-only',
      });
      
      return (response.data as RoomTypesResponse).roomTypes;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch room types');
    }
  }
);

export const getRoomType = createAsyncThunk(
  'roomType/getRoomType',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await client.query({
        query: GET_ROOM_TYPE_QUERY,
        variables: { id },
      });
      
      return (response.data as RoomTypeResponse).roomType;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch room type');
    }
  }
);

export const searchRoomTypes = createAsyncThunk(
  'roomType/searchRoomTypes',
  async (searchInput: SearchRoomTypesInput, { rejectWithValue }) => {
    try {
      const response = await client.query({
        query: SEARCH_ROOM_TYPES_QUERY,
        variables: { searchInput },
      });
      
      return (response.data as SearchRoomTypesResponse).searchRoomTypes;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search room types');
    }
  }
);

export const createRoomType = createAsyncThunk(
  'roomType/createRoomType',
  async ({ input, hotelId }: { input: CreateRoomTypeInput; hotelId: number }, { rejectWithValue }) => {
    try {
      const response = await client.mutate({
        mutation: CREATE_ROOM_TYPE_MUTATION,
        variables: { createRoomTypeInput: input, hotelId },
      });
      
      return (response.data as CreateRoomTypeResponse).createRoomType;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create room type');
    }
  }
);

export const updateRoomType = createAsyncThunk(
  'roomType/updateRoomType',
  async ({ id, input, hotelId }: { id: number; input: UpdateRoomTypeInput; hotelId: number }, { rejectWithValue }) => {
    try {
      const response = await client.mutate({
        mutation: UPDATE_ROOM_TYPE_MUTATION,
        variables: { id, updateRoomTypeInput: input, hotelId },
      });
      
      return (response.data as UpdateRoomTypeResponse).updateRoomType;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update room type');
    }
  }
);

export const deleteRoomType = createAsyncThunk(
  'roomType/deleteRoomType',
  async ({ id, hotelId }: { id: number; hotelId: number }, { rejectWithValue }) => {
    try {
      const response = await client.mutate({
        mutation: DELETE_ROOM_TYPE_MUTATION,
        variables: { id, hotelId },
      });
      
      return { id, response: (response.data as DeleteRoomTypeResponse).deleteRoomType };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete room type');
    }
  }
);

export const toggleRoomTypeActiveStatus = createAsyncThunk(
  'roomType/toggleRoomTypeActiveStatus',
  async ({ id, isActive, hotelId }: { id: number; isActive: boolean; hotelId: number }, { rejectWithValue }) => {
    try {
      const response = await client.mutate({
        mutation: TOGGLE_ROOM_TYPE_ACTIVE_STATUS_MUTATION,
        variables: { id, isActive, hotelId },
      });
      
      return (response.data as ToggleRoomTypeStatusResponse).toggleRoomTypeActiveStatus;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle room type status');
    }
  }
);

const roomTypeSlice = createSlice({
  name: 'roomType',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRoomType: (state) => {
      state.currentRoomType = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    // Get Room Types
    builder
      .addCase(getRoomTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRoomTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roomTypes = action.payload;
      })
      .addCase(getRoomTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Room Type
    builder
      .addCase(getRoomType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRoomType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRoomType = action.payload;
      })
      .addCase(getRoomType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search Room Types
    builder
      .addCase(searchRoomTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchRoomTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchRoomTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Room Type
    builder
      .addCase(createRoomType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRoomType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roomTypes.push(action.payload);
      })
      .addCase(createRoomType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Room Type
    builder
      .addCase(updateRoomType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRoomType.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.roomTypes.findIndex(rt => rt.id === action.payload.id);
        if (index !== -1) {
          state.roomTypes[index] = action.payload;
        }
        if (state.currentRoomType?.id === action.payload.id) {
          state.currentRoomType = action.payload;
        }
      })
      .addCase(updateRoomType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Room Type
    builder
      .addCase(deleteRoomType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRoomType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roomTypes = state.roomTypes.filter(rt => rt.id !== action.payload.id);
        if (state.currentRoomType?.id === action.payload.id) {
          state.currentRoomType = null;
        }
      })
      .addCase(deleteRoomType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Toggle Room Type Active Status
    builder
      .addCase(toggleRoomTypeActiveStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleRoomTypeActiveStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.roomTypes.findIndex(rt => rt.id === action.payload.id);
        if (index !== -1) {
          state.roomTypes[index] = {
            ...state.roomTypes[index],
            isActive: action.payload.isActive
          };
        }
        if (state.currentRoomType?.id === action.payload.id) {
          state.currentRoomType = {
            ...state.currentRoomType,
            isActive: action.payload.isActive
          };
        }
      })
      .addCase(toggleRoomTypeActiveStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentRoomType, clearSearchResults } = roomTypeSlice.actions;
export default roomTypeSlice.reducer;
