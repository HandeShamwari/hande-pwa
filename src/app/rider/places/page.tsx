'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { LoadingScreen } from '@/components/ui/loading';
import { riderService, SavedLocation } from '@/lib/services';

export default function RiderPlacesPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'driver') {
      router.replace('/driver');
      return;
    }
    loadLocations();
  }, [isAuthenticated, userType, router]);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const data = await riderService.getSavedLocations();
      setLocations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load saved places');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this saved place?')) return;
    try {
      await riderService.deleteSavedLocation(id);
      setLocations(locations.filter(l => l.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const homeLocation = locations.find(l => l.type === 'home');
  const workLocation = locations.find(l => l.type === 'work');
  const otherLocations = locations.filter(l => l.type === 'other');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 safe-area-top flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="text-black font-medium">
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-black mt-4">Saved Places</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-primary font-medium"
        >
          + Add
        </button>
      </div>

      {/* Content */}
      <div className="px-6 flex-1">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Home & Work */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-500">Favorites</p>
          
          <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-black">Home</p>
              {homeLocation?.address ? (
                <p className="text-sm text-gray-500 truncate max-w-[200px]">{homeLocation.address}</p>
              ) : (
                <button onClick={() => setShowAddModal(true)} className="text-sm text-primary">+ Add</button>
              )}
            </div>
            {homeLocation && (
              <button onClick={() => handleDelete(homeLocation.id)} className="text-sm text-red-500">Delete</button>
            )}
          </div>
          
          <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-black">Work</p>
              {workLocation?.address ? (
                <p className="text-sm text-gray-500 truncate max-w-[200px]">{workLocation.address}</p>
              ) : (
                <button onClick={() => setShowAddModal(true)} className="text-sm text-primary">+ Add</button>
              )}
            </div>
            {workLocation && (
              <button onClick={() => handleDelete(workLocation.id)} className="text-sm text-red-500">Delete</button>
            )}
          </div>
        </div>

        {/* Other Places */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Other Places</p>
          
          {otherLocations.length === 0 ? (
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <p className="text-gray-500">No other saved places</p>
            </div>
          ) : (
            otherLocations.map(location => (
              <div key={location.id} className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">{location.name}</p>
                  <p className="text-sm text-gray-500 truncate max-w-[200px]">{location.address}</p>
                </div>
                <button onClick={() => handleDelete(location.id)} className="text-sm text-red-500">Delete</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="h-8" />

      {/* Add Modal */}
      {showAddModal && (
        <AddLocationModal 
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            try {
              const newLocation = await riderService.createSavedLocation(data);
              setLocations([...locations, newLocation]);
              setShowAddModal(false);
            } catch (err: any) {
              alert(err.response?.data?.message || 'Failed to save');
            }
          }}
        />
      )}
    </div>
  );
}

function AddLocationModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: Omit<SavedLocation, 'id'>) => void;
}) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<'home' | 'work' | 'other'>('other');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    
    setIsLoading(true);
    await onSave({
      name,
      address,
      type,
      latitude: 0,
      longitude: 0,
    });
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl p-6 safe-area-bottom">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black">Add Saved Place</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {(['home', 'work', 'other'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-3 rounded-xl border capitalize ${
                  type === t ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g., Gym)"
            className="w-full px-4 py-4 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="w-full px-4 py-4 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button 
            type="submit" 
            disabled={isLoading || !name || !address}
            className="w-full py-4 bg-primary text-white font-semibold rounded-xl disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Place'}
          </button>
        </form>
      </div>
    </div>
  );
}
