'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
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
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.registerDriver({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: 'driver',
        vehicleType: formData.vehicleType,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: Number(formData.vehicleYear),
        vehiclePlate: formData.vehiclePlate.toUpperCase(),
        vehicleColor: formData.vehicleColor,
        licenseNumber: formData.licenseNumber.toUpperCase(),
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
    <div className="min-h-screen bg-white flex flex-col px-6 safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="pt-12 pb-4">
        <Image
          src="/logo.png"
          alt="Hande"
          width={80}
          height={80}
          className="mx-auto"
          priority
        />
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-semibold text-black mb-1">
          Become a Driver
        </h1>
        <p className="text-gray-400 text-sm">
          No commission. Just <span className="text-accent font-bold">$1</span>/day
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`w-16 h-1.5 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`w-16 h-1.5 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500 mb-2">Step 1: Personal Info</p>
            
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                required
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3.5 pr-12 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all mt-4"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Vehicle Info */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500 mb-2">Step 2: Vehicle Info</p>
            
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
            >
              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="vehicleMake"
                placeholder="Make (Toyota)"
                value={formData.vehicleMake}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                required
              />
              <input
                type="text"
                name="vehicleModel"
                placeholder="Model (Corolla)"
                value={formData.vehicleModel}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                name="vehicleYear"
                placeholder="Year"
                value={formData.vehicleYear}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                required
              />
              <input
                type="text"
                name="vehicleColor"
                placeholder="Color"
                value={formData.vehicleColor}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                required
              />
            </div>

            <input
              type="text"
              name="vehiclePlate"
              placeholder="Plate number"
              value={formData.vehiclePlate}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              required
            />

            <input
              type="text"
              name="licenseNumber"
              placeholder="Driver's license number"
              value={formData.licenseNumber}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              required
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-4 bg-gray-100 text-black font-semibold rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft size={20} />
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? 'Registering...' : 'Complete'}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Bottom */}
      <div className="py-6">
        <p className="text-center text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
