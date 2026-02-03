'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Phone, MessageCircle, X, Star, Navigation, MapPin, Clock, AlertCircle } from 'lucide-react';
import type { RootState } from '@/store';
import type { Trip, Bid } from '@/store/slices/tripSlice';
import { setCurrentTrip, clearTrip, addBid, setBids } from '@/store/slices/tripSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import tripsApi from '@/api/trips';

interface ActiveTripProps {
  trip: Trip;
  onComplete: () => void;
}

export function ActiveTrip({ trip, onComplete }: ActiveTripProps) {
  const dispatch = useDispatch();
  const { currentBids } = useSelector((state: RootState) => state.trip);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Poll for bids when pending
  useEffect(() => {
    if (trip.status !== 'pending') return;

    const fetchBids = async () => {
      try {
        const bids = await tripsApi.getBids(trip.id);
        dispatch(setBids(bids));
      } catch (err) {
        console.error('Failed to fetch bids:', err);
      }
    };

    fetchBids();
    const interval = setInterval(fetchBids, 5000);
    return () => clearInterval(interval);
  }, [trip.id, trip.status, dispatch]);

  // Poll for trip updates
  useEffect(() => {
    if (trip.status === 'pending') return;

    const fetchTrip = async () => {
      try {
        const updatedTrip = await tripsApi.getById(trip.id);
        dispatch(setCurrentTrip(updatedTrip));
        
        if (updatedTrip.status === 'completed' || updatedTrip.status === 'cancelled') {
          onComplete();
        }
      } catch (err) {
        console.error('Failed to fetch trip:', err);
      }
    };

    const interval = setInterval(fetchTrip, 3000);
    return () => clearInterval(interval);
  }, [trip.id, trip.status, dispatch, onComplete]);

  const handleAcceptBid = async (bid: Bid) => {
    setIsLoading(true);
    setError('');

    try {
      const updatedTrip = await tripsApi.acceptBid(trip.id, bid.id);
      dispatch(setCurrentTrip(updatedTrip));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept bid');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this trip?')) return;

    setIsLoading(true);
    try {
      await tripsApi.cancel(trip.id);
      dispatch(clearTrip());
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel trip');
    } finally {
      setIsLoading(false);
    }
  };

  // Waiting for bids
  if (trip.status === 'pending') {
    return (
      <div className="p-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-dark">Finding drivers...</h2>
          <p className="text-sm text-gray-500 mt-1">
            {currentBids.length === 0 
              ? 'Waiting for drivers to place bids' 
              : `${currentBids.length} driver${currentBids.length > 1 ? 's' : ''} interested`}
          </p>
        </div>

        {/* Bids List */}
        {currentBids.length > 0 && (
          <div className="space-y-3 mb-4">
            <h3 className="text-sm font-medium text-gray-500">Available Drivers</h3>
            {currentBids.map((bid) => (
              <div
                key={bid.id}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedBid?.id === bid.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedBid(bid)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-dark">{bid.driverName}</p>
                      <div className="flex items-center text-accent">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm ml-1">{bid.driverRating?.toFixed(1) || '5.0'}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {bid.vehicleType} • {bid.vehiclePlate} • {bid.eta} min away
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">${bid.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-danger text-sm text-center mb-4">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          {selectedBid && (
            <Button
              fullWidth
              onClick={() => handleAcceptBid(selectedBid)}
              isLoading={isLoading}
            >
              Accept ${selectedBid.amount.toFixed(2)}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Active Trip (accepted/arriving/in_progress)
  const statusMessages = {
    accepted: 'Driver is on the way',
    arriving: 'Driver is arriving',
    arrived: 'Driver has arrived',
    in_progress: 'Trip in progress',
    completed: 'Trip completed',
    cancelled: 'Trip cancelled',
  };

  return (
    <div className="p-4">
      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-dark">
            {statusMessages[trip.status as keyof typeof statusMessages] || 'Trip active'}
          </h2>
          {trip.status === 'arriving' && (
            <p className="text-sm text-gray-500">ETA: 2 minutes</p>
          )}
        </div>
        {trip.status !== 'in_progress' && (
          <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Driver Info */}
      {trip.acceptedBid && (
        <Card variant="outlined" padding="md" className="mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-dark">{trip.acceptedBid.driverName}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-accent">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm ml-1">{trip.acceptedBid.driverRating?.toFixed(1) || '5.0'}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">{trip.acceptedBid.vehiclePlate}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">${trip.fare?.toFixed(2) || trip.acceptedBid.amount.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{trip.acceptedBid.vehicleType}</p>
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
      )}

      {/* Trip Progress */}
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center">
          <div className={`w-3 h-3 rounded-full ${trip.status === 'in_progress' ? 'bg-accent' : 'bg-primary'}`} />
          <div className="w-0.5 h-12 bg-gray-300" />
          <div className={`w-3 h-3 ${trip.status === 'in_progress' ? 'bg-primary' : 'bg-gray-300'}`} 
               style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
        </div>
        <div className="flex-1">
          <div className="mb-6">
            <p className="text-sm text-gray-500">Pickup</p>
            <p className="text-dark font-medium truncate">{trip.pickup.address || 'Pickup location'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dropoff</p>
            <p className="text-dark font-medium truncate">{trip.dropoff.address || 'Dropoff location'}</p>
          </div>
        </div>
      </div>

      {/* Safety Note */}
      <div className="mt-4 p-3 bg-info/10 rounded-xl flex items-start gap-3">
        <AlertCircle size={20} className="text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-dark">Safety tip</p>
          <p className="text-gray-500">Verify the car and plate number before getting in.</p>
        </div>
      </div>
    </div>
  );
}
