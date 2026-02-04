'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { setCredentials } from '@/store/slices/authSlice';
import authApi from '@/api/auth';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle NextAuth session (Google sign-in)
  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      dispatch(setCredentials({
        user: session.user as any,
        token: session.accessToken,
        rider: undefined,
        driver: undefined,
      }));
      
      if (session.userType === 'driver') {
        router.push('/driver');
      } else {
        router.push('/rider');
      }
    }
  }, [session, status, dispatch, router]);

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
      
      // Redirect based on userType
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
    <div className="min-h-screen bg-gray-bg flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-3xl font-bold">H</span>
        </div>
        <h1 className="text-2xl font-bold text-dark">Welcome to Hande</h1>
        <p className="text-gray-500 mt-1">
          Rides at <span className="price-highlight">$1</span>/day
        </p>
      </div>

      {/* Login Form */}
      <Card variant="elevated" className="w-full max-w-md">
        {/* Google Sign In */}
        <GoogleSignInButton mode="signin" />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={20} />}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {error && (
            <p className="text-danger text-sm text-center">{error}</p>
          )}

          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/register/driver" className="text-accent font-medium hover:underline">
            Become a Driver - <span className="price-highlight">$1</span>/day
          </Link>
        </div>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-400">
        By continuing, you agree to our Terms & Privacy Policy
      </p>
    </div>
  );
}
