'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Car,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import type { RootState } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-8 safe-area-top">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Earnings</h1>
        </div>

        {/* Total Earnings Card */}
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <div className="p-6">
            <p className="text-white/70 text-sm mb-1">Total Earnings ({period})</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                ${earnings?.totalEarnings?.toFixed(2) || '0.00'}
              </span>
              {earnings?.netEarnings !== undefined && (
                <span className="text-sm text-white/70">
                  (Net: ${earnings.netEarnings.toFixed(2)})
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Car size={16} className="text-white/70" />
                <span className="text-white/90">{earnings?.tripCount || 0} trips</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-accent" />
                <span className="text-white/90">
                  ${earnings?.dailyFeePaid?.toFixed(2) || '0'} fees
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Period Selector */}
      <div className="px-4 -mt-4">
        <Card className="p-2">
          <div className="flex">
            {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium capitalize transition-colors ${
                  period === p
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p === 'all' ? 'All Time' : p}
              </button>
            ))}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard
            icon={<TrendingUp size={20} className="text-primary" />}
            value={`${stats?.acceptanceRate?.toFixed(0) || 0}%`}
            label="Acceptance Rate"
          />
          <StatCard
            icon={<Clock size={20} className="text-accent" />}
            value={`${stats?.completionRate?.toFixed(0) || 0}%`}
            label="Completion Rate"
          />
        </div>

        {/* Quick Stats */}
        <Card className="mb-4">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <QuickStat
              label="Today"
              trips={stats?.todayTrips || 0}
              earnings={stats?.todayEarnings || 0}
            />
            <QuickStat
              label="This Week"
              trips={stats?.weekTrips || 0}
              earnings={stats?.weekEarnings || 0}
            />
            <QuickStat
              label="Total"
              trips={stats?.totalTrips || 0}
              earnings={stats?.totalEarnings || 0}
            />
          </div>
        </Card>

        {/* Earnings Breakdown */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 px-1">
            DAILY BREAKDOWN
          </h3>
          <Card>
            {earnings?.breakdown && earnings.breakdown.length > 0 ? (
              earnings.breakdown.map((day, index) => (
                <DayBreakdown
                  key={day.date}
                  date={day.date}
                  trips={day.trips}
                  earnings={day.earnings}
                  showDivider={index > 0}
                />
              ))
            ) : (
              <div className="p-6 text-center">
                <DollarSign size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No earnings data for this period</p>
              </div>
            )}
          </Card>
        </div>

        {/* Payout Button */}
        <div className="mt-6">
          <Button fullWidth onClick={() => router.push('/driver/daily-fee')}>
            <DollarSign size={18} className="mr-2" />
            Manage Payouts
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-dark">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function QuickStat({
  label,
  trips,
  earnings,
}: {
  label: string;
  trips: number;
  earnings: number;
}) {
  return (
    <div className="p-4 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-dark">${earnings.toFixed(0)}</p>
      <p className="text-xs text-gray-400">{trips} trips</p>
    </div>
  );
}

function DayBreakdown({
  date,
  trips,
  earnings,
  showDivider,
}: {
  date: string;
  trips: number;
  earnings: number;
  showDivider: boolean;
}) {
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className={`flex items-center justify-between p-4 ${showDivider ? 'border-t border-gray-100' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Calendar size={18} className="text-primary" />
        </div>
        <div>
          <p className="font-medium text-dark">{formatDate(date)}</p>
          <p className="text-sm text-gray-500">{trips} trips</p>
        </div>
      </div>
      <p className="font-semibold text-dark">${earnings.toFixed(2)}</p>
    </div>
  );
}
