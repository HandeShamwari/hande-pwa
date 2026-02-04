'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar,
  Clock,
  DollarSign,
  Star,
  ChevronRight,
  Car,
  User
} from 'lucide-react';
import type { RootState } from '@/store';
import { Card } from '@/components/ui/card';
import { LoadingScreen } from '@/components/ui/loading';
import { driverService, Trip } from '@/lib/services';

export default function DriverHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'rider') {
      router.replace('/rider/history');
      return;
    }
    loadTrips();
  }, [isAuthenticated, userType, router]);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      const data = await driverService.getTripHistory(50);
      setTrips(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load trip history');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Group trips by date
  const groupedTrips = trips.reduce((acc, trip) => {
    const date = new Date(trip.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(trip);
    return acc;
  }, {} as Record<string, Trip[]>);

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 safe-area-top shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-dark" />
          </button>
          <h1 className="text-xl font-semibold text-dark">Trip History</h1>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-4 pt-4">
        <Card className="p-4">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{trips.length}</p>
              <p className="text-xs text-gray-500">Total Trips</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">
                ${trips.reduce((sum, t) => sum + (t.actualFare || t.estimatedFare), 0).toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">Total Earned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-dark">
                {trips.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <Card className="p-4 bg-danger/10 border-danger/20 mb-4">
            <p className="text-danger text-sm">{error}</p>
          </Card>
        )}

        {trips.length === 0 ? (
          <Card className="p-8 text-center">
            <Car size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-dark mb-2">No trips yet</h3>
            <p className="text-gray-500 text-sm">Your completed trips will appear here</p>
          </Card>
        ) : (
          Object.entries(groupedTrips).map(([date, dayTrips]) => (
            <div key={date} className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">
                {formatDateHeader(date)}
              </h3>
              <div className="space-y-3">
                {dayTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatDateHeader(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'TODAY';
  if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY';
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  }).toUpperCase();
}

function TripCard({ trip }: { trip: Trip }) {
  const statusColors: Record<string, string> = {
    completed: 'bg-primary/10 text-primary',
    cancelled: 'bg-danger/10 text-danger',
    pending: 'bg-accent/10 text-accent',
    in_progress: 'bg-blue-100 text-blue-600',
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm text-gray-500">{formatTime(trip.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[trip.status] || 'bg-gray-100 text-gray-600'}`}>
            {trip.status.replace('_', ' ')}
          </span>
          <span className="font-bold text-accent">
            ${(trip.actualFare || trip.estimatedFare).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
          <p className="text-dark text-sm truncate flex-1">{trip.pickupAddress}</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-danger mt-1.5" />
          <p className="text-dark text-sm truncate flex-1">{trip.dropoffAddress}</p>
        </div>
      </div>

      {trip.distance && (
        <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t border-gray-100">
          <span>{trip.distance.toFixed(1)} km</span>
          {trip.duration && <span>{Math.round(trip.duration)} min</span>}
        </div>
      )}
    </Card>
  );
}
