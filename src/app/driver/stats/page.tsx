'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { LoadingScreen } from '@/components/ui/loading';
import { driverService, DriverStats } from '@/lib/services';

export default function DriverStatsPage() {
  const router = useRouter();
  const { isAuthenticated, userType, driver } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'rider') {
      router.replace('/rider');
      return;
    }
    loadStats();
  }, [isAuthenticated, userType, router]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await driverService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const rating = stats?.rating || driver?.rating || 5.0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 safe-area-top">
        <button onClick={() => router.back()} className="text-black font-medium">
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-black mt-4">Statistics</h1>
      </div>

      {/* Rating */}
      <div className="px-6 mb-4">
        <div className="bg-primary rounded-xl p-6 text-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-black">{rating.toFixed(1)}</span>
            </div>
            <div>
              <p className="text-white/70 text-sm">Your Rating</p>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= Math.round(rating) ? 'text-accent' : 'text-white/30'}>
                    ★
                  </span>
                ))}
              </div>
              <p className="text-white/70 text-sm mt-2">Based on {stats?.totalTrips || 0} trips</p>
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

        {/* Performance */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-2xl font-bold text-black">{stats?.acceptanceRate?.toFixed(0) || 0}%</p>
            <p className="text-sm text-gray-500">Acceptance Rate</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-2xl font-bold text-black">{stats?.completionRate?.toFixed(0) || 0}%</p>
            <p className="text-sm text-gray-500">Completion Rate</p>
          </div>
        </div>

        {/* Trips */}
        <p className="text-sm text-gray-500 mb-2">Trip Statistics</p>
        <div className="bg-gray-100 rounded-xl mb-4">
          <div className="p-4 flex justify-between">
            <span className="text-black">Total Trips</span>
            <span className="font-semibold text-black">{stats?.totalTrips || 0}</span>
          </div>
          <div className="p-4 flex justify-between border-t border-gray-200">
            <span className="text-black">Today</span>
            <span className="font-semibold text-black">{stats?.todayTrips || 0}</span>
          </div>
          <div className="p-4 flex justify-between border-t border-gray-200">
            <span className="text-black">This Week</span>
            <span className="font-semibold text-black">{stats?.weekTrips || 0}</span>
          </div>
        </div>

        {/* Earnings */}
        <p className="text-sm text-gray-500 mb-2">Earnings</p>
        <div className="bg-gray-100 rounded-xl mb-4">
          <div className="p-4 flex justify-between">
            <span className="text-black">Total Earnings</span>
            <span className="font-semibold text-primary">${stats?.totalEarnings?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="p-4 flex justify-between border-t border-gray-200">
            <span className="text-black">Today</span>
            <span className="font-semibold text-black">${stats?.todayEarnings?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="p-4 flex justify-between border-t border-gray-200">
            <span className="text-black">This Week</span>
            <span className="font-semibold text-black">${stats?.weekEarnings?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {/* Achievements */}
        <p className="text-sm text-gray-500 mb-2">Achievements</p>
        <div className="grid grid-cols-3 gap-3">
          <div className={`rounded-xl p-4 text-center ${(stats?.totalTrips || 0) >= 10 ? 'bg-primary/20' : 'bg-gray-100'}`}>
            <p className="text-2xl mb-1">🏆</p>
            <p className={`text-xs font-medium ${(stats?.totalTrips || 0) >= 10 ? 'text-primary' : 'text-gray-400'}`}>
              10 Trips
            </p>
          </div>
          <div className={`rounded-xl p-4 text-center ${(stats?.rating || 0) >= 4.9 ? 'bg-primary/20' : 'bg-gray-100'}`}>
            <p className="text-2xl mb-1">⭐</p>
            <p className={`text-xs font-medium ${(stats?.rating || 0) >= 4.9 ? 'text-primary' : 'text-gray-400'}`}>
              5-Star
            </p>
          </div>
          <div className={`rounded-xl p-4 text-center ${(stats?.totalEarnings || 0) >= 100 ? 'bg-primary/20' : 'bg-gray-100'}`}>
            <p className="text-2xl mb-1">💰</p>
            <p className={`text-xs font-medium ${(stats?.totalEarnings || 0) >= 100 ? 'text-primary' : 'text-gray-400'}`}>
              $100+
            </p>
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
