'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    <div className="min-h-screen bg-white flex flex-col safe-area-top safe-area-bottom">
      {/* Top Section - Brand */}
      <div className="flex-1 flex flex-col justify-end pb-8 px-6">
        <div className="space-y-2">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
            <span className="text-white text-xl font-bold">H</span>
          </div>
          <h1 className="text-4xl font-bold text-dark tracking-tight">
            Welcome<br />back
          </h1>
          <p className="text-gray-400 text-lg">
            Sign in to continue
          </p>
        </div>
      </div>

      {/* Bottom Section - Form */}
      <div className="flex-[2] bg-gray-50 rounded-t-[32px] px-6 pt-8 pb-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 ml-1">Email</label>
            <div 
              className={`relative bg-white rounded-2xl border-2 transition-all duration-200 ${
                focusedField === 'email' 
                  ? 'border-primary shadow-lg shadow-primary/10' 
                  : 'border-transparent'
              }`}
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Mail size={20} className={focusedField === 'email' ? 'text-primary' : 'text-gray-300'} />
              </div>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="w-full pl-12 pr-4 py-4 bg-transparent text-dark placeholder:text-gray-300 focus:outline-none text-base"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 ml-1">Password</label>
            <div 
              className={`relative bg-white rounded-2xl border-2 transition-all duration-200 ${
                focusedField === 'password' 
                  ? 'border-primary shadow-lg shadow-primary/10' 
                  : 'border-transparent'
              }`}
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock size={20} className={focusedField === 'password' ? 'text-primary' : 'text-gray-300'} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full pl-12 pr-12 py-4 bg-transparent text-dark placeholder:text-gray-300 focus:outline-none text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button type="button" className="text-sm text-primary font-medium">
              Forgot password?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-danger/10 text-danger text-sm text-center py-3 px-4 rounded-xl">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <Button 
            type="submit" 
            fullWidth 
            isLoading={isLoading}
            className="!py-4 !rounded-2xl !text-base font-semibold shadow-lg shadow-primary/30 !mt-6"
          >
            Sign In
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-gray-50 text-gray-400 text-sm">or</span>
          </div>
        </div>

        {/* Google Sign In */}
        <GoogleSignInButton mode="signin" />

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-semibold">
            Sign Up
          </Link>
        </p>

        {/* Driver CTA */}
        <Link 
          href="/register/driver" 
          className="mt-6 flex items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 group hover:from-primary/20 hover:to-accent/20 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Car size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-dark font-semibold text-sm">Become a Driver</p>
              <p className="text-gray-500 text-xs">
                Earn with just <span className="text-accent font-bold">$1</span>/day
              </p>
            </div>
          </div>
          <ArrowRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our{' '}
          <span className="text-gray-500">Terms</span> &{' '}
          <span className="text-gray-500">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
