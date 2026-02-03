import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Bid {
  id: string;
  driverId: string;
  driverName: string;
  driverRating: number;
  driverAvatar?: string;
  vehicleType: string;
  vehiclePlate: string;
  amount: number;
  eta: number; // minutes
  createdAt: string;
}

export interface Trip {
  id: string;
  riderId: string;
  driverId?: string;
  status: 'pending' | 'accepted' | 'arriving' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  pickup: Location;
  dropoff: Location;
  fare?: number;
  distance?: number;
  duration?: number;
  acceptedBid?: Bid;
  driverLocation?: Location;
  createdAt: string;
  completedAt?: string;
}

export interface FareEstimate {
  estimatedFare: number;
  distance: number;
  duration: number;
  breakdown: {
    baseFare: number;
    distanceCharge: number;
    timeCharge: number;
    total: number;
  };
}

interface TripState {
  currentTrip: Trip | null;
  tripHistory: Trip[];
  currentBids: Bid[];
  fareEstimate: FareEstimate | null;
  driverLocation: Location | null;
  isLoading: boolean;
}

const initialState: TripState = {
  currentTrip: null,
  tripHistory: [],
  currentBids: [],
  fareEstimate: null,
  driverLocation: null,
  isLoading: false,
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setCurrentTrip: (state, action: PayloadAction<Trip | null>) => {
      state.currentTrip = action.payload;
    },
    updateTripStatus: (state, action: PayloadAction<Trip['status']>) => {
      if (state.currentTrip) {
        state.currentTrip.status = action.payload;
      }
    },
    setTripHistory: (state, action: PayloadAction<Trip[]>) => {
      state.tripHistory = action.payload;
    },
    addBid: (state, action: PayloadAction<Bid>) => {
      const exists = state.currentBids.find(b => b.id === action.payload.id);
      if (!exists) {
        state.currentBids.push(action.payload);
      }
    },
    setBids: (state, action: PayloadAction<Bid[]>) => {
      state.currentBids = action.payload;
    },
    clearBids: (state) => {
      state.currentBids = [];
    },
    setFareEstimate: (state, action: PayloadAction<FareEstimate | null>) => {
      state.fareEstimate = action.payload;
    },
    setDriverLocation: (state, action: PayloadAction<Location | null>) => {
      state.driverLocation = action.payload;
    },
    setTripLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearTrip: (state) => {
      state.currentTrip = null;
      state.currentBids = [];
      state.fareEstimate = null;
      state.driverLocation = null;
    },
  },
});

export const {
  setCurrentTrip,
  updateTripStatus,
  setTripHistory,
  addBid,
  setBids,
  clearBids,
  setFareEstimate,
  setDriverLocation,
  setTripLoading,
  clearTrip,
} = tripSlice.actions;

export default tripSlice.reducer;
