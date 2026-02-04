'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Plus, ChevronRight } from 'lucide-react';
import type { RootState } from '@/store';
import { LoadingScreen } from '@/components/ui/loading';
import { driverService, Vehicle } from '@/lib/services';

export default function DriverVehiclesPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (userType === 'rider') { router.replace('/rider'); return; }
    loadVehicles();
  }, [isAuthenticated, userType, router]);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const data = await driverService.getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getVehicleIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'economy': return '🚗';
      case 'comfort': return '🚙';
      case 'premium': return '🚘';
      case 'xl': return '🚐';
      default: return '🚗';
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 pt-14 pb-4 safe-area-top">
        <button onClick={() => router.back()} className="text-black font-medium">← Back</button>
        <h1 className="text-xl font-semibold text-black mt-4">My Vehicles</h1>
        <p className="text-gray-500 mt-1">Manage your registered vehicles</p>
      </div>

      <div className="px-6 flex-1">
        {vehicles.length === 0 ? (
          <div className="bg-gray-100 rounded-xl p-8 text-center">
            <span className="text-5xl">🚗</span>
            <h3 className="text-lg font-semibold text-black mt-4">No Vehicles Yet</h3>
            <p className="text-gray-500 mt-2">Add your first vehicle to start accepting rides</p>
            <button onClick={() => router.push('/driver/vehicles/add')} className="mt-6 py-3 px-6 bg-primary text-white font-semibold rounded-xl">
              Add Vehicle
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gray-100 rounded-xl overflow-hidden mb-4">
              {vehicles.map((vehicle, index) => (
                <button
                  key={vehicle.id}
                  onClick={() => router.push(`/driver/vehicles/${vehicle.id}`)}
                  className={`w-full flex items-center gap-4 p-4 ${index > 0 ? 'border-t border-gray-200' : ''}`}
                >
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
                    <span className="text-2xl">{getVehicleIcon(vehicle.type)}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-black">{vehicle.make} {vehicle.model}</p>
                    <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.color}</p>
                    <p className="text-sm text-gray-500">{vehicle.licensePlate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${vehicle.isActive ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                      {vehicle.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </button>
              ))}
            </div>

            <button onClick={() => router.push('/driver/vehicles/add')} className="w-full flex items-center justify-center gap-2 py-4 bg-gray-100 rounded-xl text-primary font-medium">
              <Plus size={20} />
              Add Another Vehicle
            </button>
          </>
        )}
      </div>

      <div className="px-6 py-8">
        <div className="bg-gray-100 rounded-xl p-4">
          <h4 className="font-medium text-black mb-2">Vehicle Requirements</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2"><span>✓</span> Vehicle must be 2015 or newer</li>
            <li className="flex items-center gap-2"><span>✓</span> Four-door vehicle in good condition</li>
            <li className="flex items-center gap-2"><span>✓</span> Valid registration and insurance</li>
            <li className="flex items-center gap-2"><span>✓</span> No commercial branding or logos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
