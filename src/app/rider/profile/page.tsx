'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Camera,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Edit2
} from 'lucide-react';
import type { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingScreen } from '@/components/ui/loading';

export default function RiderProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, rider, userType } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'driver') {
      router.replace('/driver/profile');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, userType, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-20 safe-area-top">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">My Profile</h1>
        </div>
      </div>

      {/* Profile Card - Overlapping Header */}
      <div className="px-4 -mt-12">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.firstName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-primary" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <Camera size={14} className="text-white" />
              </button>
            </div>

            {/* Name & Rating */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-dark">
                {user?.firstName} {user?.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Star size={16} className="text-accent fill-accent" />
                <span className="text-gray-600">
                  {rider?.rating?.toFixed(1) || '5.0'} Rating
                </span>
              </div>
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Edit2 size={20} className="text-gray-500" />
            </button>
          </div>
        </Card>
      </div>

      {/* Info Section */}
      <div className="px-4 mt-4">
        <Card>
          <ProfileItem
            icon={<Mail size={20} className="text-primary" />}
            label="Email"
            value={user?.email || 'Not set'}
          />
          <ProfileItem
            icon={<Phone size={20} className="text-primary" />}
            label="Phone"
            value={user?.phone || 'Not set'}
            showDivider
          />
        </Card>
      </div>

      {/* Stats Section */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">STATISTICS</h3>
        <Card>
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <StatItem
              icon={<MapPin size={18} className="text-primary" />}
              value={rider?.totalTrips?.toString() || '0'}
              label="Trips"
            />
            <StatItem
              icon={<Clock size={18} className="text-accent" />}
              value="0"
              label="Hours"
            />
            <StatItem
              icon={<Star size={18} className="text-yellow-500" />}
              value={rider?.rating?.toFixed(1) || '5.0'}
              label="Rating"
            />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-4 pb-8">
        <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">QUICK ACTIONS</h3>
        <Card>
          <ActionItem
            label="Edit Profile"
            onClick={() => router.push('/rider/settings')}
          />
          <ActionItem
            label="Saved Places"
            onClick={() => router.push('/rider/places')}
            showDivider
          />
          <ActionItem
            label="Emergency Contacts"
            onClick={() => router.push('/rider/emergency')}
            showDivider
          />
          <ActionItem
            label="Trip History"
            onClick={() => router.push('/rider/history')}
            showDivider
          />
        </Card>
      </div>
    </div>
  );
}

function ProfileItem({ 
  icon, 
  label, 
  value,
  showDivider = false
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  showDivider?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 p-4 ${showDivider ? 'border-t border-gray-100' : ''}`}>
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-dark font-medium">{value}</p>
      </div>
    </div>
  );
}

function StatItem({ 
  icon, 
  value, 
  label 
}: { 
  icon: React.ReactNode; 
  value: string; 
  label: string;
}) {
  return (
    <div className="flex flex-col items-center py-4">
      {icon}
      <span className="text-xl font-bold text-dark mt-1">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

function ActionItem({ 
  label, 
  onClick,
  showDivider = false
}: { 
  label: string; 
  onClick: () => void;
  showDivider?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 ${showDivider ? 'border-t border-gray-100' : ''}`}
    >
      <span className="text-dark">{label}</span>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}
