'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Car,
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import type { RootState } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading';
import { driverService, Vehicle } from '@/lib/services';

export default function DriverVehiclesPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (userType === 'rider') {
      router.replace('/rider');
      return;
    }
    loadVehicles();
  }, [isAuthenticated, userType, router]);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const data = await driverService.getVehicles();
      setVehicles(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vehicle?')) return;
    try {
      await driverService.deleteVehicle(id);
      setVehicles(vehicles.filter(v => v.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await driverService.setActiveVehicle(id);
      setVehicles(vehicles.map(v => ({ ...v, isActive: v.id === id })));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to set active vehicle');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

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
            <h1 className="text-xl font-semibold text-dark">My Vehicles</h1>
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

        {vehicles.length === 0 ? (
          <Card className="p-8 text-center">
            <Car size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-dark mb-2">No vehicles</h3>
            <p className="text-gray-500 text-sm mb-4">Add a vehicle to start accepting rides</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={18} className="mr-2" /> Add Vehicle
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onSetActive={() => handleSetActive(vehicle.id)}
                onDelete={() => handleDelete(vehicle.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <VehicleModal
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            try {
              const newVehicle = await driverService.createVehicle(data);
              setVehicles([...vehicles, newVehicle]);
              setShowAddModal(false);
            } catch (err: any) {
              alert(err.response?.data?.message || 'Failed to add vehicle');
            }
          }}
        />
      )}
    </div>
  );
}

function VehicleCard({
  vehicle,
  onSetActive,
  onDelete,
}: {
  vehicle: Vehicle;
  onSetActive: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className={`p-4 ${vehicle.isActive ? 'ring-2 ring-primary' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${vehicle.isActive ? 'bg-primary/10' : 'bg-gray-100'}`}>
          <Car size={28} className={vehicle.isActive ? 'text-primary' : 'text-gray-400'} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-dark">{vehicle.make} {vehicle.model}</h3>
            {vehicle.isActive && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Active</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.color}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-medium text-dark bg-gray-100 px-2 py-1 rounded">{vehicle.plate}</span>
            <span className="text-sm text-gray-500 capitalize">{vehicle.type}</span>
            {vehicle.isVerified ? (
              <CheckCircle size={16} className="text-primary" />
            ) : (
              <AlertCircle size={16} className="text-accent" />
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        {!vehicle.isActive && (
          <Button size="sm" variant="outline" className="flex-1" onClick={onSetActive}>
            Set Active
          </Button>
        )}
        <button onClick={onDelete} className="p-2 hover:bg-gray-100 rounded-lg">
          <Trash2 size={18} className="text-danger" />
        </button>
      </div>
    </Card>
  );
}

function VehicleModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');
  const [type, setType] = useState<'sedan' | 'suv' | 'van' | 'motorcycle'>('sedan');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !model || !year || !color || !plate) return;
    
    setIsLoading(true);
    await onSave({ make, model, year: parseInt(year), color, plate, type });
    setIsLoading(false);
  };

  const vehicleTypes = ['sedan', 'suv', 'van', 'motorcycle'] as const;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl p-6 safe-area-bottom animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-dark">Add Vehicle</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
            <div className="grid grid-cols-4 gap-2">
              {vehicleTypes.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-lg border capitalize text-sm ${
                    type === t ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Toyota"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Camry"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2020"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="White"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="ABC 1234"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <Button 
            type="submit" 
            fullWidth 
            disabled={isLoading || !make || !model || !year || !color || !plate}
          >
            {isLoading ? 'Adding...' : 'Add Vehicle'}
          </Button>
        </form>
      </div>
    </div>
  );
}
