'use client';

import dynamic from 'next/dynamic';
import type { Location } from '@/store/slices/tripSlice';

interface MapViewProps {
  center: Location;
  pickupLocation?: Location | null;
  dropoffLocation?: Location | null;
  driverLocation?: Location | null;
  nearbyDrivers?: Location[];
  showRoute?: boolean;
  onMapClick?: (location: Location) => void;
}

// Loading placeholder
function MapLoading() {
  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Loading map...</div>
    </div>
  );
}

// Dynamically import MapView with SSR disabled
const MapViewNoSSR = dynamic(
  () => import('./map-view').then((mod) => mod.MapView),
  { 
    ssr: false,
    loading: () => <MapLoading />
  }
);

export function DynamicMap(props: MapViewProps) {
  return <MapViewNoSSR {...props} />;
}
