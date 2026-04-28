import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  GET_ROOMS_QUERY,
  GET_ROOM_QUERY,
  SEARCH_ROOMS_QUERY,
  GET_ROOM_COUNT_QUERY,
  CREATE_ROOM_MUTATION,
  UPDATE_ROOM_MUTATION,
  DELETE_ROOM_MUTATION,
  UPDATE_ROOM_STATUS_MUTATION,
  Room,
  CreateRoomInput,
  UpdateRoomInput,
  SearchRoomsInput,
  RoomsResponse,
  RoomResponse,
  SearchRoomsResponse,
  RoomCountResponse,
  CreateRoomResponse,
  UpdateRoomResponse,
  DeleteRoomResponse,
  UpdateRoomStatusResponse
} from '../../graphql/room';
import { client } from '../apollo-client';

interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
  searchResults: Room[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  rooms: [],
  currentRoom: null,
  searchResults: [],
  totalCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const getRooms = createAsyncThunk(
  'room/getRooms',
  async ({ hotelId, roomTypeId }: { hotelId?: number; roomTypeId?: number }, { rejectWithValue }) => {
    try {
      const response = await client.query({
        query: GET_ROOMS_QUERY,
        variables: { hotelId, roomTypeId },
        fetchPolicy: 'network-only',
      });
      
      return (response.data as RoomsResponse).rooms;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch rooms');
    }
  }
);

export const getRoom = createAsyncThunk(
  'room/getRoom',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await client.query({
        query: GET_ROOM_QUERY,
        variables: { id },
      });
      
      return (response.data as RoomResponse).room;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch room');
    }
  }
);

export const searchRooms = createAsyncThunk(
  'room/searchRooms',
  async (searchInput: SearchRoomsInput, { rejectWithValue }) => {
    try {
      const response = await client.query({
        query: SEARCH_ROOMS_QUERY,
        variables: { searchInput },
      });
      
      return (response.data as SearchRoomsResponse).searchRooms;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search rooms');
    }
  }
);

export const getRoomCount = createAsyncThunk(
  'room/getRoomCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await client.query({
        query: GET_ROOM_COUNT_QUERY,
      });
      
      return (response.data as RoomCountResponse).roomCount;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get room count');
    }
  }
);

export const createRoom = createAsyncThunk(
  'room/createRoom',
  async ({ input, roomTypeId }: { input: CreateRoomInput; roomTypeId: number }, { rejectWithValue }) => {
    try {
      const response = await client.mutate({
        mutation: CREATE_ROOM_MUTATION,
        variables: { createRoomInput: input, roomTypeId },
      });
      
      return (response.data as CreateRoomResponse).createRoom;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create room');
    }
  }
);

export const updateRoom = createAsyncThunk(
  'room/updateRoom',
  async ({ id, input, hotelId }: { id: number; input: UpdateRoomInput; hotelId: number }, { rejectWithValue }) => {
    try {
      const response = await client.mutate({
        mutation: UPDATE_ROOM_MUTATION,
        variables: { id, updateRoomInput: input, hotelId },
      });
      
      return (response.data as UpdateRoomResponse).updateRoom;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update room');
    }
  }
);

export const deleteRoom = createAsyncThunk(
  'room/deleteRoom',
  async ({ id, hotelId }: { id: number; hotelId: number }, { rejectWithValue }) => {
    try {
      const response = await client.mutate({
        mutation: DELETE_ROOM_MUTATION,
        variables: { id, hotelId },
      });
      
      return { id, response: (response.data as DeleteRoomResponse).deleteRoom };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete room');
    }
  }
);

export const updateRoomStatus = createAsyncThunk(
  'room/updateRoomStatus',
  async ({ id, status, hotelId }: { id: number; status: string; hotelId: number }, { rejectWithValue }) => {
    try {
      const response = await client.mutate({
        mutation: UPDATE_ROOM_STATUS_MUTATION,
        variables: { id, status, hotelId },
      });
      
      return (response.data as UpdateRoomStatusResponse).updateRoomStatus;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update room status');
    }
  }
);

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    // Get Rooms
    builder
      .addCase(getRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload;
      })
      .addCase(getRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Room
    builder
      .addCase(getRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRoom = action.payload;
      })
      .addCase(getRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search Rooms
    builder
      .addCase(searchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Room Count
    builder
      .addCase(getRoomCount.fulfilled, (state, action) => {
        state.totalCount = action.payload;
      })
      .addCase(getRoomCount.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Create Room
    builder
      .addCase(createRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms.push(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Room
    builder
      .addCase(updateRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.rooms.findIndex(room => room.id === action.payload.id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
        if (state.currentRoom?.id === action.payload.id) {
          state.currentRoom = action.payload;
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Room
    builder
      .addCase(deleteRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = state.rooms.filter(room => room.id !== action.payload.id);
        if (state.currentRoom?.id === action.payload.id) {
          state.currentRoom = null;
        }
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Room Status
    builder
      .addCase(updateRoomStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRoomStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.rooms.findIndex(room => room.id === action.payload.id);
        if (index !== -1) {
          state.rooms[index] = {
            ...state.rooms[index],
            status: action.payload.status
          };
        }
        if (state.currentRoom?.id === action.payload.id) {
          state.currentRoom = {
            ...state.currentRoom,
            status: action.payload.status
          };
        }
      })
      .addCase(updateRoomStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentRoom, clearSearchResults } = roomSlice.actions;
export default roomSlice.reducer;
