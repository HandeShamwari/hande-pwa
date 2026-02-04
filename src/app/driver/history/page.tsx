'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 safe-area-top">
        <button onClick={() => router.back()} className="text-black font-medium">
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-black mt-4">Trip History</h1>
      </div>

      {/* Summary Stats */}
      <div className="px-6 mb-4">
        <div className="bg-gray-100 rounded-xl">
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-black">{trips.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                ${trips.reduce((sum, t) => sum + (t.actualFare || t.estimatedFare), 0).toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">Earned</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-black">
                {trips.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 flex-1">
        {error && (
          <div className="bg-red-50 rounded-xl p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {trips.length === 0 ? (
          <div className="bg-gray-100 rounded-xl p-8 text-center">
            <p className="text-lg font-medium text-black mb-2">No trips yet</p>
            <p className="text-gray-500 text-sm">Your completed trips will appear here</p>
          </div>
        ) : (
          Object.entries(groupedTrips).map(([date, dayTrips]) => (
            <div key={date} className="mb-6">
              <p className="text-sm text-gray-500 mb-2">{formatDateHeader(date)}</p>
              <div className="space-y-2">
                {dayTrips.map((trip) => (
                  <div key={trip.id} className="bg-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm text-gray-500">{formatTime(trip.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          trip.status === 'completed' ? 'bg-primary/20 text-primary' :
                          trip.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {trip.status.replace('_', ' ')}
                        </span>
                        <span className="font-bold text-black">
                          ${(trip.actualFare || trip.estimatedFare).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <p className="text-black text-sm truncate flex-1">{trip.pickupAddress}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                        <p className="text-black text-sm truncate flex-1">{trip.dropoffAddress}</p>
                      </div>
                    </div>
                    {trip.distance && (
                      <div className="flex gap-4 text-sm text-gray-500 pt-2 mt-2 border-t border-gray-200">
                        <span>{trip.distance.toFixed(1)} km</span>
                        {trip.duration && <span>{Math.round(trip.duration)} min</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="h-8" />
    </div>
  );
}
