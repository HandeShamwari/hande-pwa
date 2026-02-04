'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ChevronRight } from 'lucide-react';
import type { RootState } from '@/store';
import { LoadingScreen } from '@/components/ui/loading';

export default function DriverProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, driver, userType } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'rider') {
      router.replace('/rider/profile');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, userType, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  const isSubscribed = driver?.isSubscribed;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 safe-area-top">
        <button
          onClick={() => router.back()}
          className="text-black font-medium"
        >
          ← Back
        </button>
      </div>

      {/* Profile Section */}
      <div className="px-6 py-8 flex flex-col items-center">
        {/* Avatar */}
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden mb-4">
          {user?.profileImage ? (
            <img 
              src={user.profileImage} 
              alt={user.firstName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-gray-600">{initials}</span>
          )}
        </div>
        
        {/* Name */}
        <h1 className="text-xl font-semibold text-black">
          {user?.firstName} {user?.lastName}
        </h1>
        
        {/* Rating & Status */}
        <p className="text-gray-500 mt-1">
          {driver?.rating?.toFixed(1) || '5.0'} ★ · {driver?.totalTrips || 0} trips
        </p>
        
        {/* Subscription Badge */}
        <div className={`mt-2 px-4 py-1 rounded-full text-sm font-medium ${
          isSubscribed 
            ? 'bg-primary/10 text-primary' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isSubscribed ? 'Active Subscriber' : 'Not Subscribed'}
        </div>
      </div>

      {/* Subscribe Banner (if not subscribed) */}
      {!isSubscribed && (
        <div className="px-6 mb-4">
          <button
            onClick={() => router.push('/driver/daily-fee')}
            className="w-full py-4 bg-black text-white font-semibold rounded-xl"
          >
            Subscribe — $1/day
          </button>
        </div>
      )}

      {/* Info Cards */}
      <div className="px-6 space-y-3">
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Email</p>
          <p className="text-black">{user?.email || 'Not set'}</p>
        </div>
        
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Phone</p>
          <p className="text-black">{user?.phone || 'Not set'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mt-6">
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="text-xl font-semibold text-black">{driver?.totalTrips || 0}</p>
              <p className="text-xs text-gray-500">Trips</p>
            </div>
            <div className="border-x border-gray-200">
              <p className="text-xl font-semibold text-black">{driver?.rating?.toFixed(1) || '5.0'}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-black">$0</p>
              <p className="text-xs text-gray-500">Earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 mt-6 flex-1">
        <div className="bg-gray-100 rounded-xl overflow-hidden">
          <MenuItem label="My Vehicles" onClick={() => router.push('/driver/vehicles')} />
          <MenuItem label="Documents" onClick={() => router.push('/driver/documents')} border />
          <MenuItem label="Earnings" onClick={() => router.push('/driver/earnings')} border />
          <MenuItem label="Daily Fee" onClick={() => router.push('/driver/daily-fee')} border />
          <MenuItem label="Trip History" onClick={() => router.push('/driver/history')} border />
          <MenuItem label="Settings" onClick={() => router.push('/driver/settings')} border />
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  );
}

function MenuItem({ label, onClick, border = false }: { label: string; onClick: () => void; border?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 hover:bg-gray-200 transition-colors ${border ? 'border-t border-gray-200' : ''}`}
    >
      <span className="text-black">{label}</span>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}
