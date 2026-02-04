'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SessionProvider } from 'next-auth/react';
import { store, persistor } from '@/store';
import { LoadingScreen } from '@/components/ui/loading';
import { MapProvider } from '@/components/map/map-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <MapProvider>
            {children}
          </MapProvider>
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
}
