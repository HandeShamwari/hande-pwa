'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { setCredentials } from '@/store/slices/authSlice';
import authApi from '@/api/auth';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: 'rider',
      });

      dispatch(setCredentials({
        user: response.user,
        token: response.token,
        rider: response.rider,
        driver: response.driver,
      }));

      router.push('/rider');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 safe-area-top safe-area-bottom">
      {/* Header with Logo */}
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

      {/* Welcome Text */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-black mb-1">
          Create Account
        </h1>
        <p className="text-gray-400 text-sm">
          Join Hande as a rider
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3 flex-1">
        {/* Name Row */}
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

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          required
        />

        {/* Phone */}
        <input
          type="tel"
          name="phone"
          placeholder="Phone number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
        />

        {/* Password */}
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

        {/* Confirm Password */}
        <input
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full px-4 py-3.5 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          required
        />

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google */}
        <GoogleSignInButton mode="signup" />
      </form>

      {/* Bottom Section */}
      <div className="py-6 space-y-3">
        {/* Sign In */}
        <p className="text-center text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold">
            Sign In
          </Link>
        </p>

        {/* Driver CTA */}
        <Link 
          href="/register/driver" 
          className="block text-center py-4 bg-black text-white font-semibold rounded-xl"
        >
          Become a Driver — <span className="text-accent">$1</span>/day
        </Link>
      </div>
    </div>
  );
}
