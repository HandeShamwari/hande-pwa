'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Menu, 
  Power, 
  MapPin, 
  DollarSign,
  Clock,
  Navigation,
  AlertCircle
} from 'lucide-react';
import type { RootState } from '@/store';
import { updateDriver } from '@/store/slices/authSlice';
import { setCurrentLocation } from '@/store/slices/locationSlice';
import {
  setDriverStatus,
  setNearbyTrips,
  setDailyFee,
  setEarnings,
  setActiveTrip,
} from '@/store/slices/driverSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingScreen, LoadingOverlay } from '@/components/ui/loading';
import { DynamicMap } from '@/components/map/dynamic-map';
import { BottomSheet } from '@/components/map/bottom-sheet';
import { DrawerMenu } from '@/components/shared/drawer-menu';
import { TripRequestCard } from '@/components/driver/trip-request-card';
import { DriverActiveTrip } from '@/components/driver/driver-active-trip';
import { DailyFeeAlert } from '@/components/driver/daily-fee-alert';
import driversApi from '@/api/drivers';

export default function DriverPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, userType, driver } = useSelector((state: RootState) => state.auth);
  const { currentLocation } = useSelector((state: RootState) => state.location);
  const { 
    status, 
    nearbyTrips, 
    activeTrip, 
    dailyFee, 
    earnings 
  } = useSelector((state: RootState) => state.driver);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState('');

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType !== 'driver') {
      router.replace('/rider');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, userType, router]);

  // Get current location and watch for updates
  useEffect(() => {
    let watchId: number;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          dispatch(setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true }
      );

      // Watch position when online
      if (status === 'online') {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const loc = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            dispatch(setCurrentLocation(loc));
            // Broadcast to server
            driversApi.updateLocation(loc).catch(console.error);
          },
          (error) => console.error('Watch position error:', error),
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      }
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [dispatch, status]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feeStatus, earningsData] = await Promise.all([
          driversApi.getDailyFeeStatus(),
          driversApi.getEarnings(),
        ]);
        dispatch(setDailyFee(feeStatus));
        dispatch(setEarnings(earningsData));

        // Check for active trip
        const activeTrip = await driversApi.getActiveTrip();
        if (activeTrip) {
          dispatch(setActiveTrip(activeTrip));
          dispatch(setDriverStatus('in_progress'));
        }
      } catch (err) {
        console.error('Failed to fetch driver data:', err);
      }
    };

    if (!isLoading) {
      fetchData();
    }
  }, [dispatch, isLoading]);

  // Poll for nearby trips when online
  useEffect(() => {
    if (status !== 'online' || !currentLocation) return;

    const fetchTrips = async () => {
      try {
        const trips = await driversApi.getAvailableTrips(
          currentLocation.latitude,
          currentLocation.longitude
        );
        dispatch(setNearbyTrips(trips));
      } catch (err) {
        console.error('Failed to fetch nearby trips:', err);
      }
    };

    fetchTrips();
    const interval = setInterval(fetchTrips, 10000);
    return () => clearInterval(interval);
  }, [status, currentLocation, dispatch]);

  const handleGoOnline = async () => {
    if (!currentLocation) {
      setError('Unable to get your location. Please enable location services.');
      return;
    }

    // Check if subscription is active
    if (dailyFee && !dailyFee.isPaid && !dailyFee.graceEndsAt) {
      setError('Please pay your daily fee to go online.');
      return;
    }

    setIsToggling(true);
    setError('');

    try {
      dispatch(setDriverStatus('going_online'));
      await driversApi.goOnline(currentLocation);
      dispatch(setDriverStatus('online'));
      dispatch(updateDriver({ isOnline: true }));
    } catch (err: any) {
      dispatch(setDriverStatus('offline'));
      setError(err.response?.data?.message || 'Failed to go online');
    } finally {
      setIsToggling(false);
    }
  };

  const handleGoOffline = async () => {
    setIsToggling(true);
    setError('');

    try {
      await driversApi.goOffline();
      dispatch(setDriverStatus('offline'));
      dispatch(updateDriver({ isOnline: false }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to go offline');
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const isOnline = status === 'online' || status === 'going_online';

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0">
        <DynamicMap
          center={currentLocation || { latitude: -17.8292, longitude: 31.0522 }}
          nearbyDrivers={[]} // Don't show other drivers
          driverLocation={activeTrip?.pickup}
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 safe-area-top z-10">
        <div className="flex items-center justify-between">
          {/* Menu Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <Menu size={24} className="text-dark" />
          </button>

          {/* Status Indicator */}
          <div className={`px-4 py-2 rounded-full shadow-lg flex items-center gap-2 ${
            isOnline ? 'bg-primary text-white' : 'bg-white text-dark'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-white animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="font-medium">
              {status === 'going_online' ? 'Connecting...' : isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Earnings Quick View */}
          {earnings && (
            <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
              <DollarSign size={18} className="text-primary" />
              <span className="font-semibold text-dark">${earnings.today.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Current Location Button */}
      <button
        onClick={() => {/* Pan to current location */}}
        className="absolute right-4 bottom-[35%] w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-10"
      >
        <Navigation size={24} className="text-primary" />
      </button>

      {/* Bottom Sheet */}
      <BottomSheet 
        isOpen={true}
        height={activeTrip ? '45%' : nearbyTrips.length > 0 ? '50%' : '30%'}
      >
        {/* Active Trip View */}
        {activeTrip ? (
          <DriverActiveTrip
            trip={activeTrip}
            onComplete={() => {
              dispatch(setActiveTrip(null));
              dispatch(setDriverStatus('online'));
            }}
          />
        ) : (
          <div className="p-4">
            {/* Daily Fee Alert */}
            {dailyFee && !dailyFee.isPaid && (
              <DailyFeeAlert
                dailyFee={dailyFee}
                onPayNow={() => router.push('/driver/daily-fee')}
              />
            )}

            {/* Online/Offline Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-dark">
                  {isOnline ? 'You\'re Online' : 'You\'re Offline'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isOnline 
                    ? `${nearbyTrips.length} trip${nearbyTrips.length !== 1 ? 's' : ''} nearby`
                    : 'Go online to start receiving trips'}
                </p>
              </div>
              <button
                onClick={isOnline ? handleGoOffline : handleGoOnline}
                disabled={isToggling}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isOnline 
                    ? 'bg-danger text-white' 
                    : 'bg-primary text-white'
                } ${isToggling ? 'opacity-50' : ''}`}
              >
                <Power size={28} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-danger/10 rounded-xl flex items-start gap-2">
                <AlertCircle size={18} className="text-danger flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            {/* Earnings Summary */}
            {earnings && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-bg rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-dark">${earnings.today.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <div className="bg-gray-bg rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-dark">{earnings.totalTrips}</p>
                  <p className="text-xs text-gray-500">Trips</p>
                </div>
                <div className="bg-gray-bg rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-dark">${earnings.thisWeek.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">This Week</p>
                </div>
              </div>
            )}

            {/* Nearby Trip Requests */}
            {isOnline && nearbyTrips.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Available Trips</h3>
                <div className="space-y-3">
                  {nearbyTrips.slice(0, 3).map((trip) => (
                    <TripRequestCard
                      key={trip.id}
                      trip={trip}
                      onBid={() => router.push(`/driver/bid/${trip.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* $1/day reminder */}
            {!isOnline && driver?.isSubscribed && (
              <div className="mt-4 p-3 bg-primary/10 rounded-xl text-center">
                <p className="text-sm text-dark">
                  Your <span className="price-highlight font-bold">$1</span>/day subscription is active
                </p>
                <p className="text-xs text-gray-500 mt-1">Keep 100% of your earnings</p>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* Drawer Menu */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userType="driver"
      />

      {/* Loading Overlay */}
      {isToggling && <LoadingOverlay message={isOnline ? 'Going offline...' : 'Going online...'} />}
    </div>
  );
}
