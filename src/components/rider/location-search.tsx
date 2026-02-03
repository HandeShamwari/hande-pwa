'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Navigation, Clock, Star, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { Location } from '@/store/slices/tripSlice';
import { Input } from '@/components/ui/input';

interface LocationSearchProps {
  onLocationSelected: (type: 'pickup' | 'dropoff', location: Location & { address: string }) => void;
  onClose: () => void;
  pickupLocation?: Location | null;
  dropoffLocation?: Location | null;
}

export function LocationSearch({
  onLocationSelected,
  onClose,
  pickupLocation,
  dropoffLocation,
}: LocationSearchProps) {
  const [activeField, setActiveField] = useState<'pickup' | 'dropoff'>('dropoff');
  const [pickupQuery, setPickupQuery] = useState(pickupLocation?.address || 'Current location');
  const [dropoffQuery, setDropoffQuery] = useState(dropoffLocation?.address || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  const { savedLocations, recentAddresses } = useSelector((state: RootState) => state.location);

  useEffect(() => {
    if (typeof google !== 'undefined') {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      const mapDiv = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(mapDiv);
    }
  }, []);

  const searchPlaces = async (query: string) => {
    if (!query || query.length < 2 || !autocompleteService.current) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    autocompleteService.current.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'zw' }, // Zimbabwe
      },
      (predictions, status) => {
        setIsLoading(false);
        if (status === 'OK' && predictions) {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
        }
      }
    );
  };

  const selectPlace = (placeId: string, description: string) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      { placeId, fields: ['geometry', 'formatted_address'] },
      (place, status) => {
        if (status === 'OK' && place?.geometry?.location) {
          const location = {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            address: place.formatted_address || description,
          };

          onLocationSelected(activeField, location);

          if (activeField === 'pickup') {
            setPickupQuery(location.address);
            setActiveField('dropoff');
          } else {
            setDropoffQuery(location.address);
          }
          setSuggestions([]);
        }
      }
    );
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current location',
          };
          onLocationSelected('pickup', location);
          setPickupQuery('Current location');
          setActiveField('dropoff');
        },
        (error) => console.error('Location error:', error)
      );
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-dark">Where are you going?</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X size={24} className="text-gray-500" />
        </button>
      </div>

      {/* Location Inputs */}
      <div className="space-y-3 mb-4">
        {/* Pickup */}
        <div 
          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
            activeField === 'pickup' ? 'border-primary bg-primary/5' : 'border-gray-200'
          }`}
          onClick={() => setActiveField('pickup')}
        >
          <div className="w-3 h-3 rounded-full bg-primary" />
          <input
            type="text"
            placeholder="Pickup location"
            value={pickupQuery}
            onChange={(e) => {
              setPickupQuery(e.target.value);
              searchPlaces(e.target.value);
            }}
            onFocus={() => setActiveField('pickup')}
            className="flex-1 bg-transparent outline-none text-dark placeholder:text-gray-400"
          />
        </div>

        {/* Connector line */}
        <div className="flex items-center gap-3 pl-4">
          <div className="w-0.5 h-6 bg-gray-300 ml-1" />
        </div>

        {/* Dropoff */}
        <div 
          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
            activeField === 'dropoff' ? 'border-accent bg-accent/5' : 'border-gray-200'
          }`}
          onClick={() => setActiveField('dropoff')}
        >
          <div className="w-3 h-3 bg-accent" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
          <input
            type="text"
            placeholder="Where to?"
            value={dropoffQuery}
            onChange={(e) => {
              setDropoffQuery(e.target.value);
              searchPlaces(e.target.value);
            }}
            onFocus={() => setActiveField('dropoff')}
            className="flex-1 bg-transparent outline-none text-dark placeholder:text-gray-400"
            autoFocus
          />
        </div>
      </div>

      {/* Quick Actions */}
      {suggestions.length === 0 && (
        <div className="space-y-2 mb-4">
          <button
            onClick={useCurrentLocation}
            className="w-full flex items-center gap-3 p-3 bg-gray-bg rounded-xl hover:bg-gray-100"
          >
            <Navigation size={20} className="text-primary" />
            <span className="text-dark">Use current location</span>
          </button>

          {/* Saved Places */}
          {savedLocations.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mt-4 mb-2">Saved places</p>
              {savedLocations.map((place) => (
                <button
                  key={place.id}
                  onClick={() => onLocationSelected(activeField, { ...place, address: place.address || '' })}
                  className="w-full flex items-center gap-3 p-3 bg-gray-bg rounded-xl hover:bg-gray-100"
                >
                  <Star size={20} className="text-accent" />
                  <div className="text-left">
                    <p className="text-dark font-medium">{place.name}</p>
                    <p className="text-sm text-gray-500 truncate">{place.address}</p>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Recent */}
          {recentAddresses.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mt-4 mb-2">Recent</p>
              {recentAddresses.slice(0, 3).map((addr, i) => (
                <button
                  key={i}
                  onClick={() => onLocationSelected(activeField, { ...addr, address: addr.address || '' })}
                  className="w-full flex items-center gap-3 p-3 bg-gray-bg rounded-xl hover:bg-gray-100"
                >
                  <Clock size={20} className="text-gray-400" />
                  <p className="text-dark truncate">{addr.address || `${addr.latitude}, ${addr.longitude}`}</p>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading && (
            <p className="text-center text-gray-400 py-4">Searching...</p>
          )}
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => selectPlace(suggestion.place_id, suggestion.description)}
              className="w-full flex items-center gap-3 p-3 bg-gray-bg rounded-xl hover:bg-gray-100"
            >
              <MapPin size={20} className="text-gray-400 flex-shrink-0" />
              <div className="text-left overflow-hidden">
                <p className="text-dark font-medium truncate">
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {suggestion.structured_formatting?.secondary_text || ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
