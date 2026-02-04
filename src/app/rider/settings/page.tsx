'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ArrowLeft, 
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  ChevronRight,
  LogOut,
  Trash2
} from 'lucide-react';
import type { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { clearAuthToken } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Call delete account API
      alert('Account deletion is not yet implemented');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 safe-area-top shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-dark" />
          </button>
          <h1 className="text-xl font-semibold text-dark">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Account Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">ACCOUNT</h3>
          <Card>
            <SettingsItem
              icon={<User size={20} className="text-primary" />}
              title="Edit Profile"
              subtitle={user?.email}
              onClick={() => router.push('/rider/profile')}
            />
            <SettingsItem
              icon={<Shield size={20} className="text-primary" />}
              title="Privacy"
              subtitle="Manage your data"
              onClick={() => {}}
              showDivider
            />
          </Card>
        </div>

        {/* Preferences Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">PREFERENCES</h3>
          <Card>
            <SettingsItem
              icon={<Bell size={20} className="text-accent" />}
              title="Notifications"
              subtitle="Push, email, SMS"
              onClick={() => {}}
            />
            <SettingsItem
              icon={<Globe size={20} className="text-accent" />}
              title="Language"
              subtitle="English"
              onClick={() => {}}
              showDivider
            />
            <SettingsItem
              icon={<Moon size={20} className="text-accent" />}
              title="Appearance"
              subtitle="Light mode"
              onClick={() => {}}
              showDivider
            />
          </Card>
        </div>

        {/* Support Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">SUPPORT</h3>
          <Card>
            <SettingsItem
              icon={<Shield size={20} className="text-gray-500" />}
              title="Terms of Service"
              onClick={() => {}}
            />
            <SettingsItem
              icon={<Shield size={20} className="text-gray-500" />}
              title="Privacy Policy"
              onClick={() => {}}
              showDivider
            />
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            fullWidth
            onClick={handleLogout}
            className="text-danger border-danger hover:bg-danger/10"
          >
            <LogOut size={18} className="mr-2" />
            Log Out
          </Button>

          <button
            onClick={handleDeleteAccount}
            className="w-full text-sm text-gray-400 hover:text-danger text-center py-2"
          >
            Delete Account
          </button>
        </div>

        {/* Version */}
        <p className="text-center text-sm text-gray-400 pt-4">
          Hande v1.0.0
        </p>
      </div>
    </div>
  );
}

function SettingsItem({
  icon,
  title,
  subtitle,
  onClick,
  showDivider = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  showDivider?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 ${showDivider ? 'border-t border-gray-100' : ''}`}
    >
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-dark">{title}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}
