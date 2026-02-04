'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  MapPin, 
  Home,
  Briefcase,
  Star,
  Plus,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import type { RootState } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 safe-area-top shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <ArrowLeft size={20} className="text-dark" />
            </button>
            <h1 className="text-xl font-semibold text-dark">Saved Places</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <Card className="p-4 bg-danger/10 border-danger/20 mb-4">
            <p className="text-danger text-sm">{error}</p>
          </Card>
        )}

        {/* Home & Work */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-medium text-gray-500 px-1">FAVORITES</h3>
          
          <LocationCard
            icon={<Home size={20} className="text-primary" />}
            title="Home"
            address={homeLocation?.address}
            onEdit={() => {}}
            onDelete={homeLocation ? () => handleDelete(homeLocation.id) : undefined}
            onAdd={!homeLocation ? () => setShowAddModal(true) : undefined}
          />
          
          <LocationCard
            icon={<Briefcase size={20} className="text-accent" />}
            title="Work"
            address={workLocation?.address}
            onEdit={() => {}}
            onDelete={workLocation ? () => handleDelete(workLocation.id) : undefined}
            onAdd={!workLocation ? () => setShowAddModal(true) : undefined}
          />
        </div>

        {/* Other Saved Places */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 px-1">OTHER PLACES</h3>
          
          {otherLocations.length === 0 ? (
            <Card className="p-6 text-center">
              <MapPin size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No other saved places</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} className="mr-1" /> Add Place
              </Button>
            </Card>
          ) : (
            otherLocations.map(location => (
              <LocationCard
                key={location.id}
                icon={<Star size={20} className="text-gray-400" />}
                title={location.name}
                address={location.address}
                onEdit={() => {}}
                onDelete={() => handleDelete(location.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Add Modal (simplified) */}
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

function LocationCard({
  icon,
  title,
  address,
  onEdit,
  onDelete,
  onAdd,
}: {
  icon: React.ReactNode;
  title: string;
  address?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-medium text-dark">{title}</p>
          {address ? (
            <p className="text-sm text-gray-500 truncate">{address}</p>
          ) : (
            <button 
              onClick={onAdd}
              className="text-sm text-primary font-medium"
            >
              + Add address
            </button>
          )}
        </div>
        {address && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button onClick={onEdit} className="p-2 hover:bg-gray-100 rounded-full">
                <Edit2 size={16} className="text-gray-400" />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="p-2 hover:bg-gray-100 rounded-full">
                <Trash2 size={16} className="text-danger" />
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
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
      latitude: 0, // TODO: Geocode address
      longitude: 0,
    });
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl p-6 safe-area-bottom animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-dark">Add Saved Place</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="flex gap-2">
              {(['home', 'work', 'other'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 px-4 rounded-lg border capitalize ${
                    type === t ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Gym, Mom's House"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <Button type="submit" fullWidth disabled={isLoading || !name || !address}>
            {isLoading ? 'Saving...' : 'Save Place'}
          </Button>
        </form>
      </div>
    </div>
  );
}
