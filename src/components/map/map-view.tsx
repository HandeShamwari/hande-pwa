'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { useMapContext } from './map-provider';
import type { Location } from '@/store/slices/tripSlice';

// Map container style
const containerStyle = {
  width: '100%',
  height: '100%',
};

// Map styling - clean, minimal look
const mapStyles = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

// Default center (Harare, Zimbabwe)
const defaultCenter = {
  lat: -17.8292,
  lng: 31.0522,
};

// Map options
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: mapStyles,
  clickableIcons: false,
};

interface MapViewProps {
  center: Location;
  pickupLocation?: Location | null;
  dropoffLocation?: Location | null;
  driverLocation?: Location | null;
  nearbyDrivers?: Location[];
  showRoute?: boolean;
  onMapClick?: (location: Location) => void;
}

// Pickup marker icon (green circle)
const pickupIcon = {
  path: 0, // google.maps.SymbolPath.CIRCLE
  scale: 10,
  fillColor: '#7ED957',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 3,
};

// Dropoff marker icon (gold arrow)
const dropoffIcon = {
  path: 4, // google.maps.SymbolPath.BACKWARD_CLOSED_ARROW
  scale: 6,
  fillColor: '#FFB800',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2,
};

// Car icon for drivers
const carIconUrl = '/icons/car-marker.svg';

export function MapView({
  center,
  pickupLocation,
  dropoffLocation,
  driverLocation,
  nearbyDrivers = [],
  showRoute = false,
  onMapClick,
}: MapViewProps) {
  const { isLoaded, loadError } = useMapContext();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  // Store map reference
  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Handle map click
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (onMapClick && e.latLng) {
      onMapClick({
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng(),
      });
    }
  }, [onMapClick]);

  // Calculate and display route when pickup and dropoff are set
  useEffect(() => {
    if (!isLoaded || !showRoute || !pickupLocation || !dropoffLocation) {
      setDirections(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: { lat: pickupLocation.latitude, lng: pickupLocation.longitude },
        destination: { lat: dropoffLocation.latitude, lng: dropoffLocation.longitude },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
        } else {
          console.error('Directions request failed:', status);
          setDirections(null);
        }
      }
    );
  }, [isLoaded, showRoute, pickupLocation, dropoffLocation]);

  // Pan to center when it changes
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.panTo({ lat: center.latitude, lng: center.longitude });
    }
  }, [center]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-danger font-medium">Failed to load map</p>
          <p className="text-gray-500 text-sm mt-1">Please check your internet connection</p>
        </div>
      </div>
    );
  }

  const mapCenter = center 
    ? { lat: center.latitude, lng: center.longitude }
    : defaultCenter;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={mapOptions}
    >
      {/* Pickup Marker */}
      {pickupLocation && (
        <Marker
          position={{ lat: pickupLocation.latitude, lng: pickupLocation.longitude }}
          icon={pickupIcon}
          title="Pickup"
        />
      )}

      {/* Dropoff Marker */}
      {dropoffLocation && (
        <Marker
          position={{ lat: dropoffLocation.latitude, lng: dropoffLocation.longitude }}
          icon={dropoffIcon}
          title="Dropoff"
        />
      )}

      {/* Driver Marker */}
      {driverLocation && (
        <Marker
          position={{ lat: driverLocation.latitude, lng: driverLocation.longitude }}
          icon={{
            url: carIconUrl,
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20),
          }}
          title="Driver"
        />
      )}

      {/* Nearby Drivers */}
      {nearbyDrivers.map((driver, index) => (
        <Marker
          key={`driver-${index}`}
          position={{ lat: driver.latitude, lng: driver.longitude }}
          icon={{
            url: carIconUrl,
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16),
          }}
          title={`Driver ${index + 1}`}
        />
      ))}

      {/* Route */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#7ED957',
              strokeWeight: 5,
              strokeOpacity: 0.8,
            },
          }}
        />
      )}
    </GoogleMap>
  );
}
