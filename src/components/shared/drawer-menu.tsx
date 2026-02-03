'use client';

import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  User,
  Clock,
  Wallet,
  MapPin,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  Car,
  DollarSign,
  BarChart3,
  FileText,
  AlertCircle,
  Users,
} from 'lucide-react';
import type { RootState } from '@/store';
import { logout, setUserType } from '@/store/slices/authSlice';
import { clearAuthToken } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'rider' | 'driver';
}

export function DrawerMenu({ isOpen, onClose, userType }: DrawerMenuProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, rider, driver } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    clearAuthToken();
    dispatch(logout());
    router.replace('/login');
  };

  const handleSwitchRole = () => {
    const newRole = userType === 'rider' ? 'driver' : 'rider';
    dispatch(setUserType(newRole));
    router.replace(`/${newRole}`);
    onClose();
  };

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  const riderMenuItems = [
    { icon: User, label: 'Profile', path: '/rider/profile' },
    { icon: Clock, label: 'Trip History', path: '/rider/history' },
    { icon: Wallet, label: 'Wallet', path: '/rider/wallet' },
    { icon: MapPin, label: 'Saved Places', path: '/rider/places' },
    { icon: Users, label: 'Emergency Contacts', path: '/rider/emergency' },
    { icon: Settings, label: 'Settings', path: '/rider/settings' },
    { icon: HelpCircle, label: 'Help', path: '/rider/help' },
  ];

  const driverMenuItems = [
    { icon: User, label: 'Profile', path: '/driver/profile' },
    { icon: DollarSign, label: 'Earnings', path: '/driver/earnings' },
    { icon: Clock, label: 'Trip History', path: '/driver/history' },
    { icon: BarChart3, label: 'Statistics', path: '/driver/stats' },
    { icon: Car, label: 'Vehicles', path: '/driver/vehicles' },
    { icon: FileText, label: 'Documents', path: '/driver/documents' },
    { icon: Wallet, label: 'Daily Fee', path: '/driver/daily-fee' },
    { icon: Settings, label: 'Settings', path: '/driver/settings' },
    { icon: HelpCircle, label: 'Help', path: '/driver/help' },
  ];

  const menuItems = userType === 'rider' ? riderMenuItems : driverMenuItems;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 animate-slide-up shadow-2xl safe-area-top safe-area-bottom flex flex-col">
        {/* Header */}
        <div className="p-6 bg-primary">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold text-lg">{user?.name || 'User'}</h2>
              <div className="flex items-center gap-1 text-white/80">
                <Star size={14} fill="currentColor" />
                <span className="text-sm">
                  {userType === 'rider' 
                    ? rider?.rating?.toFixed(1) || '5.0' 
                    : driver?.rating?.toFixed(1) || '5.0'}
                </span>
              </div>
            </div>
          </div>

          {/* Role indicator */}
          <div className="mt-4 flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm capitalize">
              {userType}
            </span>
            {driver?.isSubscribed && userType === 'driver' && (
              <span className="px-3 py-1 bg-accent/20 rounded-full text-accent text-sm">
                Subscribed
              </span>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors"
            >
              <item.icon size={22} className="text-gray-500" />
              <span className="text-dark">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          {/* Switch Role */}
          {(user?.role === 'both' || (user?.role === 'rider' && driver) || (user?.role === 'driver' && rider)) && (
            <Button
              variant="outline"
              fullWidth
              onClick={handleSwitchRole}
              className="mb-3"
            >
              <Car size={18} className="mr-2" />
              Switch to {userType === 'rider' ? 'Driver' : 'Rider'}
            </Button>
          )}

          {/* Become a Driver (for riders without driver profile) */}
          {userType === 'rider' && !driver && (
            <button
              onClick={() => navigateTo('/register/driver')}
              className="w-full flex items-center justify-center gap-2 p-3 mb-3 bg-accent/10 rounded-xl text-accent font-medium"
            >
              <Car size={18} />
              <span>Become a Driver - <span className="font-bold">$1</span>/day</span>
            </button>
          )}

          {/* Logout */}
          <Button
            variant="ghost"
            fullWidth
            onClick={handleLogout}
            className="text-danger hover:bg-danger/10"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
