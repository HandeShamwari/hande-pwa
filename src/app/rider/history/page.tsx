'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 safe-area-top">
        <button onClick={() => router.back()} className="text-black font-medium">
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-black mt-4">Trip History</h1>
      </div>

      {/* Content */}
      <div className="px-6 flex-1">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {trips.length === 0 ? (
          <div className="bg-gray-100 rounded-xl p-8 text-center">
            <p className="text-gray-500">No trips yet</p>
            <p className="text-sm text-gray-400 mt-1">Your completed trips will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-gray-100 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm text-gray-500">{formatDate(trip.createdAt)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                    trip.status === 'completed' ? 'bg-primary/20 text-primary' :
                    trip.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {trip.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <p className="text-sm text-black truncate">{trip.pickupAddress}</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-black mt-1.5 shrink-0" />
                    <p className="text-sm text-black truncate">{trip.dropoffAddress}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-semibold text-black">
                    ${(trip.actualFare || trip.estimatedFare).toFixed(2)}
                  </span>
                  {trip.driver && (
                    <span className="text-sm text-gray-500">
                      {trip.driver.rating?.toFixed(1) || '5.0'} ★
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-8" />
    </div>
  );
}
