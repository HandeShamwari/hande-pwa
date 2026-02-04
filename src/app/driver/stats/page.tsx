'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  TrendingUp,
  Star,
  Clock,
  Car,
  DollarSign,
  Target,
  Award,
  CheckCircle
} from 'lucide-react';
import type { RootState } from '@/store';
import { Card } from '@/components/ui/card';
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
          <h1 className="text-xl font-semibold text-white">Statistics</h1>
        </div>

        {/* Rating Card */}
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <div className="p-6 flex items-center gap-6">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-dark">
                {stats?.rating?.toFixed(1) || driver?.rating?.toFixed(1) || '5.0'}
              </span>
            </div>
            <div>
              <p className="text-white/70 text-sm">Your Rating</p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={
                      star <= Math.round(stats?.rating || 5)
                        ? 'text-accent fill-accent'
                        : 'text-white/30'
                    }
                  />
                ))}
              </div>
              <p className="text-white/70 text-sm mt-2">
                Based on {stats?.totalTrips || 0} trips
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="p-4 -mt-4">
        {error && (
          <Card className="p-4 bg-danger/10 border-danger/20 mb-4">
            <p className="text-danger text-sm">{error}</p>
          </Card>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard
            icon={<Target size={24} className="text-primary" />}
            value={`${stats?.acceptanceRate?.toFixed(0) || 0}%`}
            label="Acceptance Rate"
            description="Rides accepted"
            color="primary"
          />
          <StatCard
            icon={<CheckCircle size={24} className="text-primary" />}
            value={`${stats?.completionRate?.toFixed(0) || 0}%`}
            label="Completion Rate"
            description="Rides completed"
            color="primary"
          />
        </div>

        {/* Trip Stats */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3 px-1">TRIP STATISTICS</h3>
          <Card>
            <StatRow
              icon={<Car size={20} className="text-primary" />}
              label="Total Trips"
              value={stats?.totalTrips?.toString() || '0'}
            />
            <StatRow
              icon={<Car size={20} className="text-accent" />}
              label="Today's Trips"
              value={stats?.todayTrips?.toString() || '0'}
              showDivider
            />
            <StatRow
              icon={<Car size={20} className="text-blue-500" />}
              label="This Week"
              value={stats?.weekTrips?.toString() || '0'}
              showDivider
            />
          </Card>
        </div>

        {/* Earnings Stats */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3 px-1">EARNINGS</h3>
          <Card>
            <StatRow
              icon={<DollarSign size={20} className="text-accent" />}
              label="Total Earnings"
              value={`$${stats?.totalEarnings?.toFixed(2) || '0.00'}`}
            />
            <StatRow
              icon={<DollarSign size={20} className="text-primary" />}
              label="Today's Earnings"
              value={`$${stats?.todayEarnings?.toFixed(2) || '0.00'}`}
              showDivider
            />
            <StatRow
              icon={<DollarSign size={20} className="text-blue-500" />}
              label="This Week"
              value={`$${stats?.weekEarnings?.toFixed(2) || '0.00'}`}
              showDivider
            />
          </Card>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 px-1">ACHIEVEMENTS</h3>
          <div className="grid grid-cols-3 gap-3">
            <AchievementBadge
              icon={<Award size={24} />}
              label="10 Trips"
              achieved={(stats?.totalTrips || 0) >= 10}
            />
            <AchievementBadge
              icon={<Star size={24} />}
              label="5-Star Rating"
              achieved={(stats?.rating || 0) >= 4.9}
            />
            <AchievementBadge
              icon={<TrendingUp size={24} />}
              label="$100 Earned"
              achieved={(stats?.totalEarnings || 0) >= 100}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  description,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  description: string;
  color: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        {icon}
      </div>
      <p className="text-2xl font-bold text-dark">{value}</p>
      <p className="text-sm font-medium text-dark">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </Card>
  );
}

function StatRow({
  icon,
  label,
  value,
  showDivider = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  showDivider?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-4 ${showDivider ? 'border-t border-gray-100' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <span className="text-dark">{label}</span>
      </div>
      <span className="font-semibold text-dark">{value}</span>
    </div>
  );
}

function AchievementBadge({
  icon,
  label,
  achieved,
}: {
  icon: React.ReactNode;
  label: string;
  achieved: boolean;
}) {
  return (
    <Card className={`p-4 text-center ${achieved ? 'bg-primary/10' : 'bg-gray-50'}`}>
      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
        achieved ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
      }`}>
        {icon}
      </div>
      <p className={`text-xs font-medium ${achieved ? 'text-primary' : 'text-gray-400'}`}>
        {label}
      </p>
    </Card>
  );
}
