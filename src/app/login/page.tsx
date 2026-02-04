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

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      dispatch(setCredentials({
        user: response.user,
        token: response.token,
        rider: response.rider,
        driver: response.driver,
      }));
      
      if (response.user.userType === 'driver') {
        router.push('/driver');
      } else {
        router.push('/rider');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 safe-area-top safe-area-bottom">
      {/* Header with Logo */}
      <div className="pt-16 pb-6">
        <Image
          src="/logo.png"
          alt="Hande"
          width={120}
          height={120}
          className="mx-auto"
          priority
        />
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-black mb-1">
          Welcome Back
        </h1>
        <p className="text-gray-400 text-sm">
          Sign in to your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        {/* Email */}
        <div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-4 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
            required
          />
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-4 pr-12 bg-gray-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
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

        {/* Forgot Password */}
        <div className="text-right">
          <button type="button" className="text-sm text-primary font-medium">
            Forgot password?
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google */}
        <GoogleSignInButton mode="signin" />
      </form>

      {/* Bottom Section */}
      <div className="py-8 space-y-4">
        {/* Sign Up */}
        <p className="text-center text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-semibold">
            Sign Up
          </Link>
        </p>

        {/* Driver CTA */}
        <Link 
          href="/register/driver" 
          className="block text-center py-4 bg-black text-white font-semibold rounded-xl"
        >
          Become a Driver — <span className="text-accent">$1</span>/day
        </Link>

        {/* Terms */}
        <p className="text-center text-xs text-gray-400">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
