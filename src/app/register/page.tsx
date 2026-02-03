'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { setCredentials } from '@/store/slices/authSlice';
import authApi from '@/api/auth';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    name: '',
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
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'rider',
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
    <div className="min-h-screen bg-gray-bg flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom">
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-2xl font-bold">H</span>
        </div>
        <h1 className="text-xl font-bold text-dark">Create Account</h1>
        <p className="text-gray-500 text-sm mt-1">Join Hande as a rider</p>
      </div>

      {/* Register Form */}
      <Card variant="elevated" className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={<Lock size={20} />}
            required
          />

          {error && (
            <p className="text-danger text-sm text-center">{error}</p>
          )}

          <Button type="submit" fullWidth isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/register/driver" className="text-accent font-medium hover:underline">
            Want to drive? Register as a driver
          </Link>
        </div>
      </Card>
    </div>
  );
}
