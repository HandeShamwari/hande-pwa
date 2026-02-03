import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Location } from './tripSlice';

export interface SavedLocation extends Location {
  id: string;
  name: string;
  type: 'home' | 'work' | 'favorite';
}

interface LocationState {
  currentLocation: Location | null;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  savedLocations: SavedLocation[];
  recentAddresses: Location[];
  isTracking: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | null;
}

const initialState: LocationState = {
  currentLocation: null,
  pickupLocation: null,
  dropoffLocation: null,
  savedLocations: [],
  recentAddresses: [],
  isTracking: false,
  permissionStatus: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
    },
    setPickupLocation: (state, action: PayloadAction<Location | null>) => {
      state.pickupLocation = action.payload;
    },
    setDropoffLocation: (state, action: PayloadAction<Location | null>) => {
      state.dropoffLocation = action.payload;
    },
    setSavedLocations: (state, action: PayloadAction<SavedLocation[]>) => {
      state.savedLocations = action.payload;
    },
    addRecentAddress: (state, action: PayloadAction<Location>) => {
      // Keep only last 10 addresses
      state.recentAddresses = [
        action.payload,
        ...state.recentAddresses.filter(
          (a) => a.latitude !== action.payload.latitude || a.longitude !== action.payload.longitude
        ),
      ].slice(0, 10);
    },
    setIsTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    setPermissionStatus: (state, action: PayloadAction<LocationState['permissionStatus']>) => {
      state.permissionStatus = action.payload;
    },
    clearLocations: (state) => {
      state.pickupLocation = null;
      state.dropoffLocation = null;
    },
  },
});

export const {
  setCurrentLocation,
  setPickupLocation,
  setDropoffLocation,
  setSavedLocations,
  addRecentAddress,
  setIsTracking,
  setPermissionStatus,
  clearLocations,
} = locationSlice.actions;

export default locationSlice.reducer;
