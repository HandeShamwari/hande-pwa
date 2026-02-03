'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { MapPin, Clock, DollarSign, Car, X, ChevronRight } from 'lucide-react';
import type { Location } from '@/store/slices/tripSlice';
import { setCurrentTrip, setFareEstimate, setBids } from '@/store/slices/tripSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import tripsApi from '@/api/trips';

interface TripBookingProps {
  pickup: Location;
  dropoff: Location;
  onBook: () => void;
  onClose: () => void;
}

const VEHICLE_TYPES = [
  { id: 'hatchback', name: 'Hatchback', icon: '🚗', multiplier: 0.9 },
  { id: 'sedan', name: 'Sedan', icon: '🚙', multiplier: 1.0 },
  { id: 'suv', name: 'SUV', icon: '🚐', multiplier: 1.3 },
];

export function TripBooking({ pickup, dropoff, onBook, onClose }: TripBookingProps) {
  const dispatch = useDispatch();
  const [selectedVehicle, setSelectedVehicle] = useState('sedan');
  const [fareEstimate, setFareEstimateState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');

  // Get fare estimate
  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const estimate = await tripsApi.estimateFare({
          pickup,
          dropoff,
          vehicleType: selectedVehicle,
        });
        setFareEstimateState(estimate);
        dispatch(setFareEstimate(estimate));
      } catch (err) {
        console.error('Failed to get fare estimate:', err);
        // Use fallback calculation
        const distance = calculateDistance(pickup, dropoff);
        const duration = Math.round(distance * 3); // ~3 min per km
        const baseFare = 2.5;
        const distanceCharge = distance * 1.0;
        const timeCharge = duration * 0.25;
        const total = Math.max(baseFare + distanceCharge + timeCharge, 5);
        
        setFareEstimateState({
          estimatedFare: total,
          distance,
          duration,
          breakdown: { baseFare, distanceCharge, timeCharge, total },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstimate();
  }, [pickup, dropoff, selectedVehicle, dispatch]);

  const handleBook = async () => {
    setError('');
    setIsBooking(true);

    try {
      const trip = await tripsApi.create({
        pickup,
        dropoff,
        vehicleType: selectedVehicle,
      });
      
      dispatch(setCurrentTrip(trip));
      dispatch(setBids([]));
      onBook();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request ride. Please try again.');
      setIsBooking(false);
    }
  };

  const getVehicleFare = (multiplier: number) => {
    if (!fareEstimate) return 0;
    return (fareEstimate.estimatedFare * multiplier).toFixed(2);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-dark">Choose your ride</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X size={24} className="text-gray-500" />
        </button>
      </div>

      {/* Route Summary */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-bg rounded-xl">
        <div className="flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-0.5 h-8 bg-gray-300" />
          <div className="w-2 h-2 bg-accent" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-dark truncate">{pickup.address || 'Pickup location'}</p>
          <div className="h-4" />
          <p className="text-sm text-dark truncate">{dropoff.address || 'Dropoff location'}</p>
        </div>
        {fareEstimate && (
          <div className="text-right">
            <p className="text-xs text-gray-500">{fareEstimate.distance?.toFixed(1)} km</p>
            <p className="text-xs text-gray-500">{fareEstimate.duration} min</p>
          </div>
        )}
      </div>

      {/* Vehicle Options */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {VEHICLE_TYPES.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                selectedVehicle === vehicle.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-3xl">{vehicle.icon}</span>
              <div className="flex-1 text-left">
                <p className="font-semibold text-dark">{vehicle.name}</p>
                <p className="text-sm text-gray-500">
                  {fareEstimate?.duration} min away
                </p>
              </div>
              <p className="text-lg font-bold text-dark">
                ${getVehicleFare(vehicle.multiplier)}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Fare Breakdown */}
      {fareEstimate && (
        <div className="mb-4 p-3 bg-gray-bg rounded-xl">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Base fare</span>
            <span className="text-dark">${fareEstimate.breakdown?.baseFare?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Distance ({fareEstimate.distance?.toFixed(1)} km)</span>
            <span className="text-dark">${fareEstimate.breakdown?.distanceCharge?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Time ({fareEstimate.duration} min)</span>
            <span className="text-dark">${fareEstimate.breakdown?.timeCharge?.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-semibold">
            <span className="text-dark">Estimated total</span>
            <span className="text-dark">${getVehicleFare(VEHICLE_TYPES.find(v => v.id === selectedVehicle)?.multiplier || 1)}</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-danger text-sm text-center mb-4">{error}</p>
      )}

      {/* Book Button */}
      <Button fullWidth size="lg" onClick={handleBook} isLoading={isBooking}>
        Request {VEHICLE_TYPES.find(v => v.id === selectedVehicle)?.name}
      </Button>

      {/* No surge pricing note */}
      <p className="text-xs text-center text-gray-500 mt-3">
        No surge pricing. Drivers keep 100% - they only pay <span className="price-highlight">$1</span>/day.
      </p>
    </div>
  );
}

// Haversine formula for distance
function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.latitude)) * Math.cos(toRad(loc2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
