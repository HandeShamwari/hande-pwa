'use client';

import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import {
  X,
  User,
  Clock,
  Wallet,
  MapPin,
  Settings,
  HelpCircle,
  LogOut,
  Car,
  DollarSign,
  BarChart3,
  FileText,
  Users,
  ChevronRight,
} from 'lucide-react';
import type { RootState } from '@/store';
import { logout, setUserType } from '@/store/slices/authSlice';
import { clearAuthToken } from '@/lib/api';

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
      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl safe-area-top safe-area-bottom flex flex-col">
        {/* Header */}
        <div className="px-6 pt-14 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
          >
            <X size={24} />
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Hande"
              width={60}
              height={60}
              priority
            />
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl">
            <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 text-xl font-semibold">
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-black font-semibold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-400 text-sm capitalize">{userType}</p>
            </div>
            {driver?.isSubscribed && userType === 'driver' && (
              <span className="px-2 py-1 bg-primary/10 rounded-full text-primary text-xs font-medium">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors mb-1"
            >
              <item.icon size={22} className="text-gray-400" />
              <span className="text-black flex-1 text-left">{item.label}</span>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 space-y-3">
          {/* Switch Role */}
          {rider && driver && (
            <button
              onClick={handleSwitchRole}
              className="w-full py-4 bg-gray-100 text-black font-semibold rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all"
            >
              Switch to {userType === 'rider' ? 'Driver' : 'Rider'}
            </button>
          )}

          {/* Become a Driver */}
          {userType === 'rider' && !driver && (
            <button
              onClick={() => navigateTo('/register/driver')}
              className="w-full py-4 bg-black text-white font-semibold rounded-xl hover:bg-black/90 active:scale-[0.98] transition-all"
            >
              Become a Driver — <span className="text-accent">$1</span>/day
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-4 text-red-500 font-semibold rounded-xl hover:bg-red-50 active:scale-[0.98] transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
