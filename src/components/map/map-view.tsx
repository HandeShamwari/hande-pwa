'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
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

export function MapView({
  center,
  pickupLocation,
  dropoffLocation,
  driverLocation,
  nearbyDrivers = [],
  showRoute = false,
  onMapClick,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMounted) return;
    
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    loader.load().then(() => {
      if (mapRef.current && !mapInstance.current) {
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: { lat: center.latitude, lng: center.longitude },
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        });

        directionsRenderer.current = new google.maps.DirectionsRenderer({
          map: mapInstance.current,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#7ED957',
            strokeWeight: 5,
          },
        });

        if (onMapClick) {
          mapInstance.current.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onMapClick({
                latitude: e.latLng.lat(),
                longitude: e.latLng.lng(),
              });
            }
          });
        }

        setIsLoaded(true);
      }
    });

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, [isMounted]);

  // Update markers
  useEffect(() => {
    if (!mapInstance.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Pickup marker (green)
    if (pickupLocation) {
      const marker = new google.maps.Marker({
        position: { lat: pickupLocation.latitude, lng: pickupLocation.longitude },
        map: mapInstance.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#7ED957',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 3,
        },
        title: 'Pickup',
      });
      markersRef.current.push(marker);
    }

    // Dropoff marker (gold)
    if (dropoffLocation) {
      const marker = new google.maps.Marker({
        position: { lat: dropoffLocation.latitude, lng: dropoffLocation.longitude },
        map: mapInstance.current,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#FFB800',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: 'Dropoff',
      });
      markersRef.current.push(marker);
    }

    // Driver marker (car icon)
    if (driverLocation) {
      const marker = new google.maps.Marker({
        position: { lat: driverLocation.latitude, lng: driverLocation.longitude },
        map: mapInstance.current,
        icon: {
          url: '/icons/car-marker.svg',
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20),
        },
        title: 'Driver',
      });
      markersRef.current.push(marker);
    }

    // Nearby drivers
    nearbyDrivers.forEach((driver, i) => {
      const marker = new google.maps.Marker({
        position: { lat: driver.latitude, lng: driver.longitude },
        map: mapInstance.current,
        icon: {
          url: '/icons/car-marker.svg',
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16),
        },
        title: `Driver ${i + 1}`,
      });
      markersRef.current.push(marker);
    });

  }, [pickupLocation, dropoffLocation, driverLocation, nearbyDrivers, isLoaded]);

  // Draw route
  useEffect(() => {
    if (!mapInstance.current || !directionsRenderer.current || !isLoaded) return;

    if (showRoute && pickupLocation && dropoffLocation) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: pickupLocation.latitude, lng: pickupLocation.longitude },
          destination: { lat: dropoffLocation.latitude, lng: dropoffLocation.longitude },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            directionsRenderer.current?.setDirections(result);
          }
        }
      );
    } else if (directionsRenderer.current) {
      // Clear directions by setting map to null and back
      directionsRenderer.current.setMap(null);
      directionsRenderer.current.setMap(mapInstance.current);
    }
  }, [pickupLocation, dropoffLocation, showRoute, isLoaded]);

  // Pan to center when it changes
  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.panTo({ lat: center.latitude, lng: center.longitude });
    }
  }, [center]);

  return (
    <div ref={mapRef} className="w-full h-full bg-gray-100" suppressHydrationWarning>
      {!isMounted || !isLoaded ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading map...</div>
        </div>
      ) : null}
    </div>
  );
}
