'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Phone, MessageCircle, Navigation, MapPin, Star, Check } from 'lucide-react';
import type { Trip } from '@/store/slices/tripSlice';
import { setActiveTrip, updateActiveTripStatus } from '@/store/slices/driverSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import driversApi from '@/api/drivers';

interface DriverActiveTripProps {
  trip: Trip;
  onComplete: () => void;
}

export function DriverActiveTrip({ trip, onComplete }: DriverActiveTripProps) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateStatus = async (action: 'arrive' | 'start' | 'complete') => {
    setIsLoading(true);
    setError('');

    try {
      let updatedTrip: Trip;
      
      switch (action) {
        case 'arrive':
          updatedTrip = await driversApi.arriveAtPickup(trip.id);
          dispatch(updateActiveTripStatus('arrived'));
          break;
        case 'start':
          updatedTrip = await driversApi.startTrip(trip.id);
          dispatch(updateActiveTripStatus('in_progress'));
          break;
        case 'complete':
          updatedTrip = await driversApi.completeTrip(trip.id);
          dispatch(setActiveTrip(null));
          onComplete();
          return;
      }
      
      dispatch(setActiveTrip(updatedTrip));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update trip status');
    } finally {
      setIsLoading(false);
    }
  };

  const openNavigation = (location: { latitude: number; longitude: number }) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const getStatusInfo = () => {
    switch (trip.status) {
      case 'accepted':
        return {
          title: 'Head to Pickup',
          subtitle: trip.pickup.address || 'Navigate to pickup location',
          action: 'Arrived at Pickup',
          actionType: 'arrive' as const,
          navLocation: trip.pickup,
        };
      case 'arriving':
      case 'arrived':
        return {
          title: 'At Pickup Location',
          subtitle: 'Waiting for rider',
          action: 'Start Trip',
          actionType: 'start' as const,
          navLocation: trip.pickup,
        };
      case 'in_progress':
        return {
          title: 'Trip in Progress',
          subtitle: trip.dropoff.address || 'Navigate to destination',
          action: 'Complete Trip',
          actionType: 'complete' as const,
          navLocation: trip.dropoff,
        };
      default:
        return {
          title: 'Trip Active',
          subtitle: 'Continue with trip',
          action: 'Update',
          actionType: 'arrive' as const,
          navLocation: trip.pickup,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="p-4">
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-dark">{statusInfo.title}</h2>
          <p className="text-sm text-gray-500">{statusInfo.subtitle}</p>
        </div>
        <button
          onClick={() => openNavigation(statusInfo.navLocation)}
          className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white"
        >
          <Navigation size={24} />
        </button>
      </div>

      {/* Trip Progress */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`flex-1 h-2 rounded-full ${
          ['accepted', 'arriving', 'arrived', 'in_progress'].includes(trip.status) 
            ? 'bg-primary' 
            : 'bg-gray-200'
        }`} />
        <div className={`flex-1 h-2 rounded-full ${
          ['arrived', 'in_progress'].includes(trip.status) 
            ? 'bg-primary' 
            : 'bg-gray-200'
        }`} />
        <div className={`flex-1 h-2 rounded-full ${
          trip.status === 'in_progress' 
            ? 'bg-primary' 
            : 'bg-gray-200'
        }`} />
      </div>

      {/* Rider Info */}
      <Card variant="outlined" padding="md" className="mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-dark">Rider</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-accent">
                <Star size={14} fill="currentColor" />
                <span className="text-sm ml-1">4.9</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">${trip.fare?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="flex gap-3 mt-4">
          <Button variant="outline" size="sm" className="flex-1">
            <Phone size={18} className="mr-2" />
            Call
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <MessageCircle size={18} className="mr-2" />
            Message
          </Button>
        </div>
      </Card>

      {/* Route */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex flex-col items-center">
          <div className={`w-3 h-3 rounded-full ${
            trip.status === 'in_progress' ? 'bg-gray-300' : 'bg-primary'
          }`} />
          <div className="w-0.5 h-12 bg-gray-300" />
          <div className={`w-3 h-3 ${
            trip.status === 'in_progress' ? 'bg-primary' : 'bg-gray-300'
          }`} style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
        </div>
        <div className="flex-1">
          <div className="mb-6">
            <p className="text-xs text-gray-500">Pickup</p>
            <p className="text-dark font-medium truncate">{trip.pickup.address || 'Pickup location'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Dropoff</p>
            <p className="text-dark font-medium truncate">{trip.dropoff.address || 'Dropoff location'}</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-danger text-sm text-center mb-4">{error}</p>
      )}

      {/* Action Button */}
      <Button
        fullWidth
        size="lg"
        onClick={() => handleUpdateStatus(statusInfo.actionType)}
        isLoading={isLoading}
      >
        <Check size={20} className="mr-2" />
        {statusInfo.action}
      </Button>
    </div>
  );
}
