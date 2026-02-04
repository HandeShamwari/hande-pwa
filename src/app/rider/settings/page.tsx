'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { clearAuthToken } from '@/lib/api';
import { LoadingScreen } from '@/components/ui/loading';

export default function RiderSettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, userType } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'driver') {
      router.replace('/driver/settings');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, userType, router]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      clearAuthToken();
      dispatch(logout());
      router.replace('/login');
    }
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
        <h1 className="text-xl font-semibold text-black mt-4">Settings</h1>
      </div>

      {/* Content */}
      <div className="px-6 flex-1 space-y-6">
        {/* Account */}
        <div>
          <p className="text-sm text-gray-500 mb-2">Account</p>
          <div className="space-y-2">
            <button 
              onClick={() => router.push('/rider/profile')}
              className="w-full bg-gray-100 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="font-medium text-black">Edit Profile</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            <button 
              onClick={() => {}}
              className="w-full bg-gray-100 rounded-xl p-4 flex items-center justify-between"
            >
              <p className="font-medium text-black">Privacy</p>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <p className="text-sm text-gray-500 mb-2">Preferences</p>
          <div className="space-y-2">
            <button 
              onClick={() => {}}
              className="w-full bg-gray-100 rounded-xl p-4 flex items-center justify-between"
            >
              <p className="font-medium text-black">Notifications</p>
              <span className="text-gray-400">→</span>
            </button>
            <button 
              onClick={() => {}}
              className="w-full bg-gray-100 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="font-medium text-black">Language</p>
                <p className="text-sm text-gray-500">English</p>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Legal */}
        <div>
          <p className="text-sm text-gray-500 mb-2">Legal</p>
          <div className="space-y-2">
            <button 
              onClick={() => {}}
              className="w-full bg-gray-100 rounded-xl p-4 flex items-center justify-between"
            >
              <p className="font-medium text-black">Terms of Service</p>
              <span className="text-gray-400">→</span>
            </button>
            <button 
              onClick={() => {}}
              className="w-full bg-gray-100 rounded-xl p-4 flex items-center justify-between"
            >
              <p className="font-medium text-black">Privacy Policy</p>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 border border-red-500 text-red-500 font-semibold rounded-xl"
        >
          Log Out
        </button>

        {/* Version */}
        <p className="text-center text-sm text-gray-400">
          Hande v1.0.0
        </p>
      </div>

      <div className="h-8" />
    </div>
  );
}
