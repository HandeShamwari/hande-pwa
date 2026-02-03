import api from '@/lib/api';
import type { Location, Trip, Bid, FareEstimate } from '@/store/slices/tripSlice';

export interface CreateTripData {
  pickup: Location;
  dropoff: Location;
  vehicleType?: string;
}

export interface FareEstimateRequest {
  pickup: Location;
  dropoff: Location;
  vehicleType?: string;
}

export const tripsApi = {
  // Fare estimation
  estimateFare: async (data: FareEstimateRequest): Promise<FareEstimate> => {
    const response = await api.post('/trips/estimate', data);
    return response.data;
  },

  // Create trip request
  create: async (data: CreateTripData): Promise<Trip> => {
    const response = await api.post('/trips', data);
    return response.data;
  },

  // Get trip by ID
  getById: async (id: string): Promise<Trip> => {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  // Get bids for a trip
  getBids: async (tripId: string): Promise<Bid[]> => {
    const response = await api.get(`/trips/${tripId}/bids`);
    return response.data;
  },

  // Accept a bid
  acceptBid: async (tripId: string, bidId: string): Promise<Trip> => {
    const response = await api.post(`/trips/${tripId}/bids/${bidId}/accept`);
    return response.data;
  },

  // Cancel trip
  cancel: async (tripId: string, reason?: string): Promise<void> => {
    await api.post(`/trips/${tripId}/cancel`, { reason });
  },

  // Rate trip
  rate: async (tripId: string, rating: number, comment?: string): Promise<void> => {
    await api.post(`/trips/${tripId}/rate`, { rating, comment });
  },

  // Get trip history
  history: async (page = 1, limit = 20): Promise<{ trips: Trip[]; total: number }> => {
    const response = await api.get('/trips/history', { params: { page, limit } });
    return response.data;
  },

  // Get current/active trip
  getCurrent: async (): Promise<Trip | null> => {
    const response = await api.get('/trips/current');
    return response.data;
  },

  // Get nearby trips (for drivers)
  getNearby: async (lat: number, lng: number, radius = 10): Promise<Trip[]> => {
    const response = await api.get('/trips/nearby', { params: { lat, lng, radius } });
    return response.data;
  },
};

export default tripsApi;
