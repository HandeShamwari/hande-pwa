'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ArrowLeft, 
  User,
  Bell,
  Shield,
  MapPin,
  Moon,
  Globe,
  LogOut,
  ChevronRight,
  Smartphone,
  Volume2,
  Navigation
} from 'lucide-react';
import type { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DriverSettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [rideAlerts, setRideAlerts] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'rider') {
      router.replace('/rider');
      return;
    }
  }, [isAuthenticated, userType, router]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      dispatch(logout());
      router.replace('/login');
    }
  };

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
        {/* Account */}
        <SettingsSection title="Account">
          <SettingsItem
            icon={<User size={20} className="text-primary" />}
            label="Edit Profile"
            onClick={() => router.push('/driver/profile')}
          />
          <SettingsItem
            icon={<Shield size={20} className="text-primary" />}
            label="Privacy & Security"
            onClick={() => {}}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsToggle
            icon={<Bell size={20} className="text-primary" />}
            label="Push Notifications"
            description="Receive ride requests and updates"
            value={notifications}
            onChange={setNotifications}
          />
          <SettingsToggle
            icon={<Navigation size={20} className="text-primary" />}
            label="Ride Alerts"
            description="Get notified of nearby ride requests"
            value={rideAlerts}
            onChange={setRideAlerts}
          />
          <SettingsToggle
            icon={<Volume2 size={20} className="text-primary" />}
            label="Sound Effects"
            description="Play sounds for new rides"
            value={soundEffects}
            onChange={setSoundEffects}
          />
        </SettingsSection>

        {/* Driving Preferences */}
        <SettingsSection title="Driving Preferences">
          <SettingsToggle
            icon={<Smartphone size={20} className="text-primary" />}
            label="Auto-Accept Rides"
            description="Automatically accept matching rides"
            value={autoAccept}
            onChange={setAutoAccept}
          />
          <SettingsToggle
            icon={<Moon size={20} className="text-primary" />}
            label="Night Mode"
            description="Darker interface while driving at night"
            value={nightMode}
            onChange={setNightMode}
          />
          <SettingsToggle
            icon={<MapPin size={20} className="text-primary" />}
            label="Share Location"
            description="Allow riders to see your live location"
            value={shareLocation}
            onChange={setShareLocation}
          />
        </SettingsSection>

        {/* App Settings */}
        <SettingsSection title="App">
          <SettingsItem
            icon={<Globe size={20} className="text-primary" />}
            label="Language"
            value="English"
            onClick={() => {}}
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About">
          <SettingsItem
            icon={<Shield size={20} className="text-gray-400" />}
            label="Terms of Service"
            onClick={() => {}}
          />
          <SettingsItem
            icon={<Shield size={20} className="text-gray-400" />}
            label="Privacy Policy"
            onClick={() => {}}
          />
        </SettingsSection>

        {/* Logout */}
        <Card className="overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-danger/10 rounded-full flex items-center justify-center">
              <LogOut size={20} className="text-danger" />
            </div>
            <span className="font-medium text-danger">Log Out</span>
          </button>
        </Card>

        <p className="text-center text-sm text-gray-400 pt-4">
          Hande v1.0.0
        </p>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">{title.toUpperCase()}</h3>
      <Card className="overflow-hidden divide-y divide-gray-100">{children}</Card>
    </div>
  );
}

function SettingsItem({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <span className="flex-1 text-left font-medium text-dark">{label}</span>
      {value && <span className="text-gray-500">{value}</span>}
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}

function SettingsToggle({
  icon,
  label,
  description,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-dark">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full transition-colors ${
          value ? 'bg-primary' : 'bg-gray-300'
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
