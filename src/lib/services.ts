/**
 * API Services Layer
 * All API calls for Hande PWA
 */

import api from './api';

// ==============================================================================
// TYPES
// ==============================================================================

export interface Trip {
  id: string;
  riderId: string;
  driverId?: string;
  status: 'pending' | 'accepted' | 'arriving' | 'in_progress' | 'completed' | 'cancelled';
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  dropoffAddress: string;
  estimatedFare: number;
  actualFare?: number;
  distance?: number;
  duration?: number;
  createdAt: string;
  completedAt?: string;
  driver?: {
    firstName: string;
    lastName: string;
    phone: string;
    rating?: number;
    vehiclePlate?: string;
    vehicleType?: string;
    vehicleColor?: string;
  };
}

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'home' | 'work' | 'other';
  isDefault?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary?: boolean;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  type: 'sedan' | 'suv' | 'van' | 'motorcycle';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface Document {
  id: string;
  type: 'license' | 'registration' | 'insurance' | 'profile_photo' | 'vehicle_photo';
  status: 'pending' | 'approved' | 'rejected';
  url: string;
  rejectionReason?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyFeeStatus {
  isPaid: boolean;
  paidUntil?: string;
  daysRemaining: number;
  canGoOnline: boolean;
}

export interface DailyFeePayment {
  id: string;
  amount: number;
  days: number;
  paidAt: string;
  validUntil: string;
}

export interface Wallet {
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface PaymentHistory {
  id: string;
  type: 'trip_payment' | 'wallet_topup' | 'daily_fee' | 'payout';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
}

export interface DriverStats {
  totalTrips: number;
  totalEarnings: number;
  todayTrips: number;
  todayEarnings: number;
  weekTrips: number;
  weekEarnings: number;
  rating: number;
  acceptanceRate: number;
  completionRate: number;
}

export interface RiderStats {
  totalTrips: number;
  totalSpent: number;
  favoriteDestinations: string[];
  rating: number;
}

export interface DriverEarnings {
  period: string;
  totalEarnings: number;
  tripCount: number;
  dailyFeePaid: number;
  netEarnings: number;
  breakdown: {
    date: string;
    trips: number;
    earnings: number;
  }[];
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  description: string;
  createdAt: string;
  updatedAt: string;
}

// ==============================================================================
// RIDER SERVICES
// ==============================================================================

export const riderService = {
  // Profile
  async getProfile() {
    const { data } = await api.get('/riders/profile');
    return data;
  },

  async updateProfile(dto: { firstName?: string; lastName?: string; phone?: string }) {
    const { data } = await api.put('/riders/profile', dto);
    return data;
  },

  async getStats(): Promise<RiderStats> {
    const { data } = await api.get('/riders/stats');
    return data;
  },

  // Trip History
  async getTripHistory(limit = 20): Promise<Trip[]> {
    const { data } = await api.get(`/trips/rider/history?limit=${limit}`);
    return data;
  },

  // Saved Locations
  async getSavedLocations(): Promise<SavedLocation[]> {
    const { data } = await api.get('/riders/locations');
    return data;
  },

  async createSavedLocation(dto: Omit<SavedLocation, 'id'>): Promise<SavedLocation> {
    const { data } = await api.post('/riders/locations', dto);
    return data;
  },

  async updateSavedLocation(id: string, dto: Partial<SavedLocation>): Promise<SavedLocation> {
    const { data } = await api.put(`/riders/locations/${id}`, dto);
    return data;
  },

  async deleteSavedLocation(id: string): Promise<void> {
    await api.delete(`/riders/locations/${id}`);
  },

  // Emergency Contacts
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    const { data } = await api.get('/riders/emergency-contacts');
    return data;
  },

  async createEmergencyContact(dto: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    const { data } = await api.post('/riders/emergency-contacts', dto);
    return data;
  },

  async updateEmergencyContact(id: string, dto: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const { data } = await api.put(`/riders/emergency-contacts/${id}`, dto);
    return data;
  },

  async deleteEmergencyContact(id: string): Promise<void> {
    await api.delete(`/riders/emergency-contacts/${id}`);
  },
};

// ==============================================================================
// DRIVER SERVICES
// ==============================================================================

export const driverService = {
  // Profile
  async getProfile() {
    const { data } = await api.get('/drivers/profile');
    return data;
  },

  async updateProfile(dto: { firstName?: string; lastName?: string; phone?: string }) {
    const { data } = await api.put('/drivers/profile', dto);
    return data;
  },

  // Status
  async getStatus() {
    const { data } = await api.get('/drivers/status');
    return data;
  },

  async goOnline(latitude: number, longitude: number) {
    const { data } = await api.post('/drivers/online', { latitude, longitude });
    return data;
  },

  async goOffline(reason?: string) {
    const { data } = await api.post('/drivers/offline', { reason });
    return data;
  },

  // Stats & Earnings
  async getStats(): Promise<DriverStats> {
    const { data } = await api.get('/drivers/stats');
    return data;
  },

  async getEarnings(period: 'today' | 'week' | 'month' | 'all' = 'week'): Promise<DriverEarnings> {
    const { data } = await api.get(`/drivers/earnings?period=${period}`);
    return data;
  },

  // Trip History
  async getTripHistory(limit = 20): Promise<Trip[]> {
    const { data } = await api.get(`/trips/driver/history?limit=${limit}`);
    return data;
  },

  // Daily Fee ($1/day subscription)
  async getDailyFeeStatus(): Promise<DailyFeeStatus> {
    const { data } = await api.get('/drivers/daily-fee/status');
    return data;
  },

  async payDailyFee(days = 1, paymentMethod = 'wallet'): Promise<DailyFeePayment> {
    const { data } = await api.post('/drivers/daily-fee/pay', { days, paymentMethod });
    return data;
  },

  async getDailyFeeHistory(limit = 20): Promise<DailyFeePayment[]> {
    const { data } = await api.get(`/drivers/daily-fee/history?limit=${limit}`);
    return data;
  },

  // Subscription (legacy - keeping for compatibility)
  async getSubscription() {
    const { data } = await api.get('/drivers/subscription');
    return data;
  },

  async subscribe(paymentMethod: string) {
    const { data } = await api.post('/drivers/subscribe', { paymentMethod });
    return data;
  },

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    const { data } = await api.get('/drivers/vehicles');
    return data;
  },

  async createVehicle(dto: Omit<Vehicle, 'id' | 'isActive' | 'isVerified' | 'createdAt'>): Promise<Vehicle> {
    const { data } = await api.post('/drivers/vehicles', dto);
    return data;
  },

  async updateVehicle(id: string, dto: Partial<Vehicle>): Promise<Vehicle> {
    const { data } = await api.put(`/drivers/vehicles/${id}`, dto);
    return data;
  },

  async deleteVehicle(id: string): Promise<void> {
    await api.delete(`/drivers/vehicles/${id}`);
  },

  async setActiveVehicle(id: string): Promise<Vehicle> {
    const { data } = await api.post(`/drivers/vehicles/${id}/activate`);
    return data;
  },

  // Location
  async updateLocation(latitude: number, longitude: number, heading?: number) {
    const { data } = await api.post('/drivers/location', { latitude, longitude, heading });
    return data;
  },

  // Shifts
  async startShift(latitude: number, longitude: number) {
    const { data } = await api.post('/drivers/shift/start', { latitude, longitude });
    return data;
  },

  async endShift() {
    const { data } = await api.post('/drivers/shift/end');
    return data;
  },

  async getCurrentShift() {
    const { data } = await api.get('/drivers/shift/current');
    return data;
  },

  async getShiftHistory(limit = 20) {
    const { data } = await api.get(`/drivers/shift/history?limit=${limit}`);
    return data;
  },
};

// ==============================================================================
// DOCUMENTS SERVICE
// ==============================================================================

export const documentsService = {
  async getDocuments(): Promise<Document[]> {
    const { data } = await api.get('/documents');
    return data;
  },

  async getDocumentStatus(): Promise<{ required: string[]; uploaded: string[]; pending: string[]; approved: string[]; rejected: string[] }> {
    const { data } = await api.get('/documents/status');
    return data;
  },

  async uploadDocument(dto: { type: Document['type']; url: string; expiresAt?: string }): Promise<Document> {
    const { data } = await api.post('/documents', dto);
    return data;
  },

  async updateDocument(id: string, dto: { url?: string; expiresAt?: string }): Promise<Document> {
    const { data } = await api.put(`/documents/${id}`, dto);
    return data;
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};

// ==============================================================================
// PAYMENTS SERVICE
// ==============================================================================

export const paymentsService = {
  // Rider
  async getWallet(): Promise<Wallet> {
    const { data } = await api.get('/payments/wallet');
    return data;
  },

  async getPaymentHistory(limit = 20): Promise<PaymentHistory[]> {
    const { data } = await api.get(`/payments/history?limit=${limit}`);
    return data;
  },

  async processPayment(tripId: string, amount: number, paymentMethod: string) {
    const { data } = await api.post('/payments/process', { tripId, amount, paymentMethod });
    return data;
  },

  // Driver
  async getDriverWallet(): Promise<Wallet> {
    const { data } = await api.get('/payments/driver/wallet');
    return data;
  },

  async getDriverPaymentHistory(limit = 20): Promise<PaymentHistory[]> {
    const { data } = await api.get(`/payments/driver/history?limit=${limit}`);
    return data;
  },

  async requestPayout(amount: number) {
    const { data } = await api.post('/payments/driver/payout', { amount });
    return data;
  },
};

// ==============================================================================
// TRIPS SERVICE
// ==============================================================================

export const tripsService = {
  async estimateFare(dto: {
    pickupLatitude: number;
    pickupLongitude: number;
    dropoffLatitude: number;
    dropoffLongitude: number;
  }) {
    const { data } = await api.post('/trips/estimate', dto);
    return data;
  },

  async requestTrip(dto: {
    pickupLatitude: number;
    pickupLongitude: number;
    pickupAddress: string;
    dropoffLatitude: number;
    dropoffLongitude: number;
    dropoffAddress: string;
    vehicleType?: string;
  }): Promise<Trip> {
    const { data } = await api.post('/trips/request', dto);
    return data;
  },

  async getTrip(id: string): Promise<Trip> {
    const { data } = await api.get(`/trips/${id}`);
    return data;
  },

  async cancelTrip(id: string, reason?: string): Promise<Trip> {
    const { data } = await api.put(`/trips/${id}/status`, { status: 'cancelled', reason });
    return data;
  },

  async getNearbyTrips(): Promise<Trip[]> {
    const { data } = await api.get('/trips/nearby/available');
    return data;
  },

  async acceptTrip(id: string): Promise<Trip> {
    const { data } = await api.post(`/trips/${id}/accept`);
    return data;
  },

  async startTrip(id: string): Promise<Trip> {
    const { data } = await api.put(`/trips/${id}/status`, { status: 'in_progress' });
    return data;
  },

  async completeTrip(id: string): Promise<Trip> {
    const { data } = await api.put(`/trips/${id}/status`, { status: 'completed' });
    return data;
  },
};

// ==============================================================================
// SUPPORT SERVICE
// ==============================================================================

export const supportService = {
  async getTickets(): Promise<SupportTicket[]> {
    const { data } = await api.get('/support/tickets');
    return data;
  },

  async createTicket(dto: { subject: string; category: string; description: string; priority?: string }): Promise<SupportTicket> {
    const { data } = await api.post('/support/tickets', dto);
    return data;
  },

  async getTicket(id: string): Promise<SupportTicket> {
    const { data } = await api.get(`/support/tickets/${id}`);
    return data;
  },

  async closeTicket(id: string): Promise<SupportTicket> {
    const { data } = await api.put(`/support/tickets/${id}/close`);
    return data;
  },
};
