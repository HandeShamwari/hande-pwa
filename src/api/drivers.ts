import api from '@/lib/api';
import type { Location, Trip, Bid } from '@/store/slices/tripSlice';
import type { DailyFee, Earnings, NearbyTrip } from '@/store/slices/driverSlice';

export interface PlaceBidData {
  tripId: string;
  amount: number;
  eta?: number;
}

export const driversApi = {
  // Status management
  getStatus: async (): Promise<{ isOnline: boolean; status: string }> => {
    const response = await api.get('/drivers/status');
    return response.data;
  },

  goOnline: async (location: Location): Promise<void> => {
    await api.post('/drivers/online', { latitude: location.latitude, longitude: location.longitude });
  },

  goOffline: async (): Promise<void> => {
    await api.post('/drivers/offline');
  },

  // Location updates
  updateLocation: async (location: Location): Promise<void> => {
    await api.post('/drivers/location', location);
  },

  // Trip management
  getAvailableTrips: async (lat: number, lng: number): Promise<NearbyTrip[]> => {
    const response = await api.get('/trips/nearby', { params: { lat, lng } });
    return response.data;
  },

  placeBid: async (data: PlaceBidData): Promise<Bid> => {
    const response = await api.post(`/bids`, data);
    return response.data;
  },

  getMyBids: async (): Promise<Bid[]> => {
    const response = await api.get('/bids/my-bids');
    return response.data;
  },

  // Active trip management
  getActiveTrip: async (): Promise<Trip | null> => {
    const response = await api.get('/drivers/active-trip');
    return response.data;
  },

  updateTripStatus: async (tripId: string, status: string): Promise<Trip> => {
    const response = await api.patch(`/trips/${tripId}/status`, { status });
    return response.data;
  },

  // Arrive at pickup
  arriveAtPickup: async (tripId: string): Promise<Trip> => {
    const response = await api.post(`/trips/${tripId}/arrive`);
    return response.data;
  },

  // Start trip
  startTrip: async (tripId: string): Promise<Trip> => {
    const response = await api.post(`/trips/${tripId}/start`);
    return response.data;
  },

  // Complete trip
  completeTrip: async (tripId: string): Promise<Trip> => {
    const response = await api.post(`/trips/${tripId}/complete`);
    return response.data;
  },

  // Daily fee ($1/day)
  getDailyFeeStatus: async (): Promise<DailyFee> => {
    const response = await api.get('/drivers/daily-fee/status');
    return response.data;
  },

  payDailyFee: async (method: string): Promise<void> => {
    await api.post('/drivers/daily-fee/pay', { paymentMethod: method });
  },

  getDailyFeeHistory: async (): Promise<{ payments: any[]; total: number }> => {
    const response = await api.get('/drivers/daily-fee/history');
    return response.data;
  },

  // Earnings
  getEarnings: async (): Promise<Earnings> => {
    const response = await api.get('/drivers/earnings');
    return response.data;
  },

  // Trip history
  getTripHistory: async (page = 1, limit = 20): Promise<{ trips: Trip[]; total: number }> => {
    const response = await api.get('/drivers/trips/history', { params: { page, limit } });
    return response.data;
  },

  // Subscription
  getSubscription: async (): Promise<{ isActive: boolean; expiresAt: string | null }> => {
    const response = await api.get('/drivers/subscription');
    return response.data;
  },

  subscribe: async (method: string): Promise<void> => {
    await api.post('/drivers/subscribe', { paymentMethod: method });
  },

  // Shift management
  startShift: async (): Promise<void> => {
    await api.post('/drivers/shift/start');
  },

  endShift: async (): Promise<{ earnings: number; trips: number; duration: number }> => {
    const response = await api.post('/drivers/shift/end');
    return response.data;
  },

  getCurrentShift: async (): Promise<{ startedAt: string; earnings: number; trips: number } | null> => {
    const response = await api.get('/drivers/shift/current');
    return response.data;
  },
};

export default driversApi;
