import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Location, Trip, Bid } from './tripSlice';

export type DriverStatus = 
  | 'offline'
  | 'going_online'
  | 'online'
  | 'viewing_request'
  | 'bidding'
  | 'bid_pending'
  | 'accepted'
  | 'arriving'
  | 'arrived'
  | 'in_progress'
  | 'completing';

export interface NearbyTrip {
  id: string;
  pickup: Location;
  dropoff: Location;
  riderId: string;
  riderName: string;
  riderRating?: number;
  estimatedFare: number;
  distance: number;
  createdAt: string;
}

export interface DailyFee {
  isPaid: boolean;
  amount: number;
  dueDate: string;
  graceEndsAt?: string;
  penalty?: number;
}

export interface Earnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalTrips: number;
  pendingPayout: number;
}

interface DriverState {
  status: DriverStatus;
  nearbyTrips: NearbyTrip[];
  currentRequest: NearbyTrip | null;
  activeTrip: Trip | null;
  myBids: Bid[];
  dailyFee: DailyFee | null;
  earnings: Earnings | null;
  onlineTime: number; // seconds
  isLoading: boolean;
}

const initialState: DriverState = {
  status: 'offline',
  nearbyTrips: [],
  currentRequest: null,
  activeTrip: null,
  myBids: [],
  dailyFee: null,
  earnings: null,
  onlineTime: 0,
  isLoading: false,
};

// Valid status transitions
const validTransitions: Record<DriverStatus, DriverStatus[]> = {
  offline: ['going_online'],
  going_online: ['online', 'offline'],
  online: ['offline', 'viewing_request', 'bidding'],
  viewing_request: ['online', 'bidding'],
  bidding: ['online', 'bid_pending'],
  bid_pending: ['online', 'accepted'],
  accepted: ['arriving', 'online'],
  arriving: ['arrived'],
  arrived: ['in_progress'],
  in_progress: ['completing'],
  completing: ['online', 'offline'],
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    setDriverStatus: (state, action: PayloadAction<DriverStatus>) => {
      const newStatus = action.payload;
      if (validTransitions[state.status]?.includes(newStatus) || newStatus === 'offline') {
        state.status = newStatus;
      }
    },
    setNearbyTrips: (state, action: PayloadAction<NearbyTrip[]>) => {
      state.nearbyTrips = action.payload;
    },
    addNearbyTrip: (state, action: PayloadAction<NearbyTrip>) => {
      const exists = state.nearbyTrips.find(t => t.id === action.payload.id);
      if (!exists) {
        state.nearbyTrips.unshift(action.payload);
      }
    },
    removeNearbyTrip: (state, action: PayloadAction<string>) => {
      state.nearbyTrips = state.nearbyTrips.filter(t => t.id !== action.payload);
    },
    setCurrentRequest: (state, action: PayloadAction<NearbyTrip | null>) => {
      state.currentRequest = action.payload;
      if (action.payload) {
        state.status = 'viewing_request';
      }
    },
    setActiveTrip: (state, action: PayloadAction<Trip | null>) => {
      state.activeTrip = action.payload;
    },
    updateActiveTripStatus: (state, action: PayloadAction<Trip['status']>) => {
      if (state.activeTrip) {
        state.activeTrip.status = action.payload;
      }
    },
    addMyBid: (state, action: PayloadAction<Bid>) => {
      state.myBids.push(action.payload);
    },
    clearMyBids: (state) => {
      state.myBids = [];
    },
    setDailyFee: (state, action: PayloadAction<DailyFee | null>) => {
      state.dailyFee = action.payload;
    },
    setEarnings: (state, action: PayloadAction<Earnings | null>) => {
      state.earnings = action.payload;
    },
    incrementOnlineTime: (state, action: PayloadAction<number>) => {
      state.onlineTime += action.payload;
    },
    resetOnlineTime: (state) => {
      state.onlineTime = 0;
    },
    setDriverLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetDriverState: (state) => {
      state.status = 'offline';
      state.nearbyTrips = [];
      state.currentRequest = null;
      state.activeTrip = null;
      state.myBids = [];
      state.onlineTime = 0;
    },
  },
});

export const {
  setDriverStatus,
  setNearbyTrips,
  addNearbyTrip,
  removeNearbyTrip,
  setCurrentRequest,
  setActiveTrip,
  updateActiveTripStatus,
  addMyBid,
  clearMyBids,
  setDailyFee,
  setEarnings,
  incrementOnlineTime,
  resetOnlineTime,
  setDriverLoading,
  resetDriverState,
} = driverSlice.actions;

export default driverSlice.reducer;
