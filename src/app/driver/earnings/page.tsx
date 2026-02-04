'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { LoadingScreen } from '@/components/ui/loading';
import { driverService, DriverEarnings, DriverStats } from '@/lib/services';

type Period = 'today' | 'week' | 'month' | 'all';

export default function DriverEarningsPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [earnings, setEarnings] = useState<DriverEarnings | null>(null);
  const [period, setPeriod] = useState<Period>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'rider') {
      router.replace('/rider/wallet');
      return;
    }
    loadData();
  }, [isAuthenticated, userType, router]);

  useEffect(() => {
    if (isAuthenticated && userType === 'driver') {
      loadEarnings();
    }
  }, [period]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData, earningsData] = await Promise.all([
        driverService.getStats(),
        driverService.getEarnings(period),
      ]);
      setStats(statsData);
      setEarnings(earningsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEarnings = async () => {
    try {
      const earningsData = await driverService.getEarnings(period);
      setEarnings(earningsData);
    } catch (err) {
      // Silent fail, keep existing data
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 safe-area-top">
        <button onClick={() => router.back()} className="text-black font-medium">
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-black mt-4">Earnings</h1>
      </div>

      {/* Total Earnings */}
      <div className="px-6 mb-4">
        <div className="bg-primary rounded-xl p-6 text-white">
          <p className="text-white/70 text-sm mb-1">Total Earnings ({period})</p>
          <p className="text-4xl font-bold">${earnings?.totalEarnings?.toFixed(2) || '0.00'}</p>
          <div className="flex gap-4 mt-4 text-sm">
            <span>{earnings?.tripCount || 0} trips</span>
            <span>· ${earnings?.dailyFeePaid?.toFixed(2) || '0'} fees paid</span>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="px-6 mb-4">
        <div className="bg-gray-100 rounded-xl p-1 flex">
          {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                period === p ? 'bg-white text-black shadow-sm' : 'text-gray-600'
              }`}
            >
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 flex-1">
        {error && (
          <div className="bg-red-50 rounded-xl p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-2xl font-bold text-black">{stats?.acceptanceRate?.toFixed(0) || 0}%</p>
            <p className="text-sm text-gray-500">Acceptance</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-2xl font-bold text-black">{stats?.completionRate?.toFixed(0) || 0}%</p>
            <p className="text-sm text-gray-500">Completion</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-100 rounded-xl mb-4">
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500">Today</p>
              <p className="text-lg font-bold text-black">${stats?.todayEarnings?.toFixed(0) || 0}</p>
              <p className="text-xs text-gray-400">{stats?.todayTrips || 0} trips</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500">Week</p>
              <p className="text-lg font-bold text-black">${stats?.weekEarnings?.toFixed(0) || 0}</p>
              <p className="text-xs text-gray-400">{stats?.weekTrips || 0} trips</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-black">${stats?.totalEarnings?.toFixed(0) || 0}</p>
              <p className="text-xs text-gray-400">{stats?.totalTrips || 0} trips</p>
            </div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <p className="text-sm text-gray-500 mb-2">Daily Breakdown</p>
        <div className="space-y-2">
          {earnings?.breakdown && earnings.breakdown.length > 0 ? (
            earnings.breakdown.map((day) => (
              <div key={day.date} className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">{formatDate(day.date)}</p>
                  <p className="text-sm text-gray-500">{day.trips} trips</p>
                </div>
                <p className="font-semibold text-black">${day.earnings.toFixed(2)}</p>
              </div>
            ))
          ) : (
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <p className="text-gray-500">No earnings data</p>
            </div>
          )}
        </div>
      </div>

      {/* Payout Button */}
      <div className="px-6 py-8">
        <button
          onClick={() => router.push('/driver/daily-fee')}
          className="w-full py-4 bg-black text-white font-semibold rounded-xl"
        >
          Manage Payouts
        </button>
      </div>
    </div>
  );
}
