'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  MapPin, 
  Navigation, 
  Menu, 
  Search, 
  Clock,
  Star,
  X
} from 'lucide-react';
import type { RootState } from '@/store';
import { setPickupLocation, setDropoffLocation, setCurrentLocation } from '@/store/slices/locationSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingScreen } from '@/components/ui/loading';
import { DynamicMap } from '@/components/map/dynamic-map';
import { BottomSheet } from '@/components/map/bottom-sheet';
import { LocationSearch } from '@/components/rider/location-search';
import { TripBooking } from '@/components/rider/trip-booking';
import { ActiveTrip } from '@/components/rider/active-trip';
import { DrawerMenu } from '@/components/shared/drawer-menu';

type ViewState = 'idle' | 'searching' | 'booking' | 'waiting' | 'active';

export default function RiderPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, userType } = useSelector((state: RootState) => state.auth);
  const { currentLocation, pickupLocation, dropoffLocation } = useSelector((state: RootState) => state.location);
  const { currentTrip } = useSelector((state: RootState) => state.trip);
  
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'driver') {
      router.replace('/driver');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, userType, router]);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          dispatch(setCurrentLocation(loc));
          if (!pickupLocation) {
            dispatch(setPickupLocation(loc));
          }
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true }
      );
    }
  }, [dispatch, pickupLocation]);

  // Determine view state based on trip
  useEffect(() => {
    if (currentTrip) {
      if (['pending'].includes(currentTrip.status)) {
        setViewState('waiting');
      } else if (['accepted', 'arriving', 'in_progress'].includes(currentTrip.status)) {
        setViewState('active');
      }
    }
  }, [currentTrip]);

  const handleSearchClick = () => {
    setViewState('searching');
  };

  const handleLocationSelected = (type: 'pickup' | 'dropoff', location: any) => {
    if (type === 'pickup') {
      dispatch(setPickupLocation(location));
    } else {
      dispatch(setDropoffLocation(location));
    }
    
    if (pickupLocation && (type === 'dropoff' || dropoffLocation)) {
      setViewState('booking');
    }
  };

  const handleBookingComplete = () => {
    setViewState('waiting');
  };

  const handleTripComplete = () => {
    setViewState('idle');
  };

  const handleClose = () => {
    setViewState('idle');
    dispatch(setDropoffLocation(null));
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* Map - Always visible (70% of screen) */}
      <div className="absolute inset-0">
        <DynamicMap
          center={currentLocation || { latitude: -17.8292, longitude: 31.0522 }}
          pickupLocation={pickupLocation}
          dropoffLocation={dropoffLocation}
          driverLocation={currentTrip?.driverLocation}
          showRoute={viewState === 'booking' || viewState === 'active'}
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 safe-area-top z-10">
        <div className="flex items-center gap-3">
          {/* Menu Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <Menu size={24} className="text-dark" />
          </button>

          {/* Search Bar (idle state only) */}
          {viewState === 'idle' && (
            <button
              onClick={handleSearchClick}
              className="flex-1 bg-white rounded-full shadow-lg px-4 py-3 flex items-center gap-3"
            >
              <Search size={20} className="text-gray-400" />
              <span className="text-gray-400">Where to?</span>
            </button>
          )}
        </div>
      </div>

      {/* Current Location Button */}
      <button
        onClick={() => {
          if (currentLocation) {
            // Pan map to current location
          }
        }}
        className="absolute right-4 bottom-[35%] w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-10"
      >
        <Navigation size={24} className="text-primary" />
      </button>

      {/* Bottom Sheet Content */}
      <BottomSheet 
        isOpen={true}
        height={viewState === 'idle' ? '30%' : viewState === 'searching' ? '70%' : '45%'}
      >
        {/* Idle State - Quick Actions */}
        {viewState === 'idle' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-dark mb-4">Good {getGreeting()}, {user?.firstName}</h2>
            
            {/* Quick Destinations */}
            <div className="space-y-3">
              <QuickDestination
                icon={<MapPin className="text-primary" />}
                title="Set pickup location"
                subtitle={pickupLocation?.address || 'Current location'}
                onClick={() => setViewState('searching')}
              />
              
              <QuickDestination
                icon={<Clock className="text-accent" />}
                title="Recent trips"
                subtitle="View your trip history"
                onClick={() => router.push('/rider/history')}
              />
            </div>

            {/* $1/day banner */}
            <div className="mt-4 bg-primary/10 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark">Drivers earn more with Hande</p>
                <p className="text-xs text-gray-500">No commissions, just <span className="price-highlight">$1</span>/day</p>
              </div>
              <Button size="sm" onClick={() => router.push('/register/driver')}>
                Drive
              </Button>
            </div>
          </div>
        )}

        {/* Searching State */}
        {viewState === 'searching' && (
          <LocationSearch
            onLocationSelected={handleLocationSelected}
            onClose={handleClose}
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
          />
        )}

        {/* Booking State */}
        {viewState === 'booking' && (
          <TripBooking
            pickup={pickupLocation!}
            dropoff={dropoffLocation!}
            onBook={handleBookingComplete}
            onClose={handleClose}
          />
        )}

        {/* Waiting for Driver / Active Trip */}
        {(viewState === 'waiting' || viewState === 'active') && currentTrip && (
          <ActiveTrip
            trip={currentTrip}
            onComplete={handleTripComplete}
          />
        )}
      </BottomSheet>

      {/* Drawer Menu */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userType="rider"
      />
    </div>
  );
}

// Helper Components
function QuickDestination({ 
  icon, 
  title, 
  subtitle, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  subtitle: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-gray-bg rounded-xl hover:bg-gray-100 transition-colors"
    >
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-dark">{title}</p>
        <p className="text-sm text-gray-500 truncate">{subtitle}</p>
      </div>
    </button>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
