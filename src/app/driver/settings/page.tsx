'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronRight } from 'lucide-react';
import type { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';

export default function DriverSettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  
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
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 pt-14 pb-4 safe-area-top">
        <button onClick={() => router.back()} className="text-black font-medium">← Back</button>
        <h1 className="text-xl font-semibold text-black mt-4">Settings</h1>
      </div>

      <div className="px-6 flex-1 space-y-6">
        <SettingsSection title="Account">
          <SettingsItem icon="👤" label="Edit Profile" onClick={() => router.push('/driver/profile')} />
          <SettingsItem icon="🔒" label="Privacy & Security" onClick={() => {}} border />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsToggle icon="🔔" label="Push Notifications" description="Receive ride requests and updates" value={notifications} onChange={setNotifications} />
          <SettingsToggle icon="📍" label="Ride Alerts" description="Get notified of nearby ride requests" value={rideAlerts} onChange={setRideAlerts} border />
          <SettingsToggle icon="🔊" label="Sound Effects" description="Play sounds for new rides" value={soundEffects} onChange={setSoundEffects} border />
        </SettingsSection>

        <SettingsSection title="Driving Preferences">
          <SettingsToggle icon="🚗" label="Auto-Accept Rides" description="Automatically accept matching rides" value={autoAccept} onChange={setAutoAccept} />
          <SettingsToggle icon="🌙" label="Night Mode" description="Darker interface while driving at night" value={nightMode} onChange={setNightMode} border />
          <SettingsToggle icon="📍" label="Share Location" description="Allow riders to see your live location" value={shareLocation} onChange={setShareLocation} border />
        </SettingsSection>

        <SettingsSection title="App">
          <SettingsItem icon="🌐" label="Language" value="English" onClick={() => {}} />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsItem icon="📄" label="Terms of Service" onClick={() => {}} />
          <SettingsItem icon="🔐" label="Privacy Policy" onClick={() => {}} border />
        </SettingsSection>

        <div className="bg-gray-100 rounded-xl overflow-hidden">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4">
            <span className="text-xl">🚪</span>
            <span className="font-medium text-red-500">Log Out</span>
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 pb-8">Hande v1.0.0</p>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <div className="bg-gray-100 rounded-xl overflow-hidden">{children}</div>
    </div>
  );
}

function SettingsItem({ icon, label, value, onClick, border = false }: { icon: string; label: string; value?: string; onClick: () => void; border?: boolean }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 hover:bg-gray-200 transition-colors ${border ? 'border-t border-gray-200' : ''}`}>
      <span className="text-xl">{icon}</span>
      <span className="flex-1 text-left font-medium text-black">{label}</span>
      {value && <span className="text-gray-500">{value}</span>}
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}

function SettingsToggle({ icon, label, description, value, onChange, border = false }: { icon: string; label: string; description?: string; value: boolean; onChange: (value: boolean) => void; border?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 ${border ? 'border-t border-gray-200' : ''}`}>
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="font-medium text-black">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button onClick={() => onChange(!value)} className={`w-12 h-7 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-gray-300'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
