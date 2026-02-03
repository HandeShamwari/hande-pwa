import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'rider' | 'driver' | 'both';
}

export interface RiderProfile {
  id: string;
  userId: string;
  rating?: number;
  totalTrips: number;
}

export interface DriverProfile {
  id: string;
  userId: string;
  rating?: number;
  totalTrips: number;
  isOnline: boolean;
  isSubscribed: boolean;
  subscriptionExpiresAt?: string;
  vehicleId?: string;
  vehicleType?: string;
  vehiclePlate?: string;
}

interface AuthState {
  user: User | null;
  rider: RiderProfile | null;
  driver: DriverProfile | null;
  token: string | null;
  userType: 'rider' | 'driver';
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  rider: null,
  driver: null,
  token: null,
  userType: 'rider',
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string; rider?: RiderProfile; driver?: DriverProfile }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.rider = action.payload.rider || null;
      state.driver = action.payload.driver || null;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setUserType: (state, action: PayloadAction<'rider' | 'driver'>) => {
      state.userType = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateDriver: (state, action: PayloadAction<Partial<DriverProfile>>) => {
      if (state.driver) {
        state.driver = { ...state.driver, ...action.payload };
      }
    },
    updateRider: (state, action: PayloadAction<Partial<RiderProfile>>) => {
      if (state.rider) {
        state.rider = { ...state.rider, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.rider = null;
      state.driver = null;
      state.token = null;
      state.isAuthenticated = false;
      state.userType = 'rider';
    },
  },
});

export const {
  setCredentials,
  setUserType,
  updateUser,
  updateDriver,
  updateRider,
  setLoading,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
