'use client';

import { useLoadScript, Libraries } from '@react-google-maps/api';
import { createContext, useContext, ReactNode } from 'react';

// Libraries to load - declare outside component to prevent reloads
const libraries: Libraries = ['places', 'geometry'];

interface MapContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const MapContext = createContext<MapContextType>({
  isLoaded: false,
  loadError: undefined,
});

export function useMapContext() {
  return useContext(MapContext);
}

interface MapProviderProps {
  children: ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  return (
    <MapContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </MapContext.Provider>
  );
}
