'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { RootState } from '@/store';
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

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

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
        
        {/* Rating */}
        <p className="text-gray-500 mt-1">
          {rider?.rating?.toFixed(1) || '5.0'} ★ · {rider?.totalTrips || 0} trips
        </p>
      </div>

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
              <p className="text-xl font-semibold text-black">{rider?.totalTrips || 0}</p>
              <p className="text-xs text-gray-500">Trips</p>
            </div>
            <div className="border-x border-gray-200">
              <p className="text-xl font-semibold text-black">{rider?.rating?.toFixed(1) || '5.0'}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-black">0</p>
              <p className="text-xs text-gray-500">Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 mt-6 flex-1">
        <div className="bg-gray-100 rounded-xl overflow-hidden">
          <MenuItem label="Saved Places" onClick={() => router.push('/rider/places')} />
          <MenuItem label="Emergency Contacts" onClick={() => router.push('/rider/emergency')} border />
          <MenuItem label="Trip History" onClick={() => router.push('/rider/history')} border />
          <MenuItem label="Settings" onClick={() => router.push('/rider/settings')} border />
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
