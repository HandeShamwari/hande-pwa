'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <Loader2 className={`animate-spin text-primary ${sizes[size]} ${className}`} />
  );
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="mb-4">
        <svg width="80" height="80" viewBox="0 0 100 100" className="animate-pulse">
          <circle cx="50" cy="50" r="45" fill="#7ED957" />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            fill="white"
            fontSize="24"
            fontWeight="bold"
            fontFamily="Roboto, sans-serif"
          >
            H
          </text>
        </svg>
      </div>
      <LoadingSpinner size="md" />
      <p className="mt-4 text-dark font-medium">Loading...</p>
    </div>
  );
}

export function LoadingOverlay({ message = 'Please wait...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-dark font-medium">{message}</p>
      </div>
    </div>
  );
}
