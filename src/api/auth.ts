import api, { setAuthToken, clearAuthToken } from '@/lib/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'rider' | 'driver';
}

export interface DriverRegisterData extends RegisterData {
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePlate: string;
  vehicleColor: string;
  licenseNumber: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
    role: 'rider' | 'driver' | 'both';
  };
  token: string;
  rider?: {
    id: string;
    userId: string;
    rating?: number;
    totalTrips: number;
  };
  driver?: {
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
  };
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    setAuthToken(response.data.token);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    setAuthToken(response.data.token);
    return response.data;
  },

  registerDriver: async (data: DriverRegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/driver', data);
    setAuthToken(response.data.token);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuthToken();
    }
  },

  me: async (): Promise<AuthResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  switchRole: async (role: 'rider' | 'driver'): Promise<AuthResponse> => {
    const response = await api.post('/auth/switch-role', { role });
    return response.data;
  },

  verifyPhone: async (code: string): Promise<void> => {
    await api.post('/auth/verify-phone', { code });
  },

  sendVerificationCode: async (phone: string): Promise<void> => {
    await api.post('/auth/send-code', { phone });
  },
};

export default authApi;
