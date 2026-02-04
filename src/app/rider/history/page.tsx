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
  Car
} from 'lucide-react';
import type { RootState } from '@/store';
import { Card } from '@/components/ui/card';
import { LoadingScreen } from '@/components/ui/loading';
import { riderService, Trip } from '@/lib/services';

export default function RiderHistoryPage() {
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
    if (userType === 'driver') {
      router.replace('/driver/history');
      return;
    }
    loadTrips();
  }, [isAuthenticated, userType, router]);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      const data = await riderService.getTripHistory(50);
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
          <div className="space-y-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onClick={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  const statusColors: Record<string, string> = {
    completed: 'bg-primary/10 text-primary',
    cancelled: 'bg-danger/10 text-danger',
    pending: 'bg-accent/10 text-accent',
    in_progress: 'bg-blue-100 text-blue-600',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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
    <Card className="p-4" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-500">{formatDate(trip.createdAt)}</span>
          <Clock size={14} className="text-gray-400 ml-2" />
          <span className="text-sm text-gray-500">{formatTime(trip.createdAt)}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[trip.status] || 'bg-gray-100 text-gray-600'}`}>
          {trip.status.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-500">Pickup</p>
            <p className="text-dark text-sm font-medium truncate">{trip.pickupAddress}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-danger mt-1.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-500">Dropoff</p>
            <p className="text-dark text-sm font-medium truncate">{trip.dropoffAddress}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <DollarSign size={16} className="text-accent" />
            <span className="font-semibold text-dark">
              ${(trip.actualFare || trip.estimatedFare).toFixed(2)}
            </span>
          </div>
          {trip.driver && (
            <div className="flex items-center gap-1">
              <Star size={14} className="text-accent fill-accent" />
              <span className="text-sm text-gray-600">{trip.driver.rating?.toFixed(1) || '5.0'}</span>
            </div>
          )}
        </div>
        <ChevronRight size={20} className="text-gray-400" />
      </div>
    </Card>
  );
}
