'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { Mail, Lock, User, Phone, Car, CreditCard, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { setCredentials, setUserType } from '@/store/slices/authSlice';
import authApi from '@/api/auth';

const VEHICLE_TYPES = ['sedan', 'hatchback', 'suv', 'van', 'truck'];

export default function DriverRegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    // Personal
    name: '',
    email: '',
    phone: '',
    password: '',
    // Vehicle
    vehicleType: 'sedan',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear(),
    vehiclePlate: '',
    vehicleColor: '',
    licenseNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.registerDriver({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'driver',
        vehicleType: formData.vehicleType,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear,
        vehiclePlate: formData.vehiclePlate,
        vehicleColor: formData.vehicleColor,
        licenseNumber: formData.licenseNumber,
      });

      dispatch(setCredentials({
        user: response.user,
        token: response.token,
        rider: response.rider,
        driver: response.driver,
      }));
      dispatch(setUserType('driver'));

      router.push('/driver');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-bg flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom">
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
          <Car className="text-white" size={32} />
        </div>
        <h1 className="text-xl font-bold text-dark">Become a Driver</h1>
        <p className="text-gray-500 text-sm mt-1">
          Earn on your terms - just <span className="price-highlight">$1</span>/day
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`w-8 h-2 rounded-full transition-colors ${
              s <= step ? 'bg-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Register Form */}
      <Card variant="elevated" className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-dark mb-4">Personal Information</h2>
              
              <Input
                label="Full Name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                icon={<User size={20} />}
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail size={20} />}
                required
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="+263 7X XXX XXXX"
                value={formData.phone}
                onChange={handleChange}
                icon={<Phone size={20} />}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  icon={<Lock size={20} />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Vehicle Info */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-dark mb-4">Vehicle Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Make"
                  name="vehicleMake"
                  placeholder="Toyota"
                  value={formData.vehicleMake}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Model"
                  name="vehicleModel"
                  placeholder="Corolla"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Year"
                  name="vehicleYear"
                  type="number"
                  placeholder="2020"
                  value={formData.vehicleYear}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Color"
                  name="vehicleColor"
                  placeholder="White"
                  value={formData.vehicleColor}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Plate Number"
                name="vehiclePlate"
                placeholder="ABC 1234"
                value={formData.vehiclePlate}
                onChange={handleChange}
                icon={<Car size={20} />}
                required
              />

              <Input
                label="License Number"
                name="licenseNumber"
                placeholder="Enter your driver's license number"
                value={formData.licenseNumber}
                onChange={handleChange}
                icon={<CreditCard size={20} />}
                required
              />
            </div>
          )}

          {error && (
            <p className="text-danger text-sm text-center mt-4">{error}</p>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft size={20} className="mr-1" />
                Back
              </Button>
            )}
            
            {step < 2 ? (
              <Button type="button" onClick={handleNext} className="flex-1">
                Next
                <ChevronRight size={20} className="ml-1" />
              </Button>
            ) : (
              <Button type="submit" isLoading={isLoading} className="flex-1">
                Complete Registration
              </Button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </Card>

      {/* $1/day highlight */}
      <div className="mt-6 bg-accent/10 rounded-xl p-4 w-full max-w-md text-center">
        <p className="text-dark">
          <span className="font-bold price-highlight text-lg">$1/day</span> subscription fee
        </p>
        <p className="text-sm text-gray-500 mt-1">
          No commissions. Keep 100% of your fares.
        </p>
      </div>
    </div>
  );
}
