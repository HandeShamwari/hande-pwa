'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { LoadingScreen } from '@/components/ui/loading';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on user type
      router.replace(userType === 'driver' ? '/driver' : '/rider');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, userType, router]);

  return <LoadingScreen />;
}
