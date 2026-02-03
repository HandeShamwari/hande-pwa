'use client';

import { MapPin, Clock, DollarSign, Navigation } from 'lucide-react';
import type { NearbyTrip } from '@/store/slices/driverSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TripRequestCardProps {
  trip: NearbyTrip;
  onBid: () => void;
}

export function TripRequestCard({ trip, onBid }: TripRequestCardProps) {
  return (
    <Card variant="outlined" padding="md" className="hover:border-primary transition-colors">
      <div className="flex items-start gap-3">
        {/* Route visualization */}
        <div className="flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-0.5 h-10 bg-gray-300" />
          <div className="w-2 h-2 bg-accent" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
        </div>

        {/* Locations */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-dark font-medium truncate">
            {trip.pickup.address || 'Pickup location'}
          </p>
          <div className="h-4" />
          <p className="text-sm text-dark truncate">
            {trip.dropoff.address || 'Dropoff location'}
          </p>
        </div>

        {/* Trip info */}
        <div className="text-right">
          <p className="text-lg font-bold text-primary">${trip.estimatedFare.toFixed(2)}</p>
          <p className="text-xs text-gray-500">{trip.distance.toFixed(1)} km</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Navigation size={14} />
            {calculatePickupDistance(trip)} away
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {getTimeAgo(trip.createdAt)}
          </span>
        </div>
        <Button size="sm" onClick={onBid}>
          Place Bid
        </Button>
      </div>
    </Card>
  );
}

function calculatePickupDistance(trip: NearbyTrip): string {
  // This would calculate distance from driver's current location
  // For now, return a placeholder
  return '1.2 km';
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 120) return '1 min ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  return 'Long ago';
}
