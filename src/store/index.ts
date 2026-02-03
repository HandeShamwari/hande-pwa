import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import tripReducer from './slices/tripSlice';
import locationReducer from './slices/locationSlice';
import driverReducer from './slices/driverSlice';

const persistConfig = {
  key: 'hande',
  storage,
  whitelist: ['auth'], // Only persist auth
};

const rootReducer = combineReducers({
  auth: authReducer,
  trip: tripReducer,
  location: locationReducer,
  driver: driverReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
