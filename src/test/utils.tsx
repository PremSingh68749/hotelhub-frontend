import { ReactElement } from 'react';
import {
  render,
  RenderOptions,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authSlice from '@/lib/slices/authSlice';
import hotelSlice from '@/lib/slices/hotelSlice';
import { ReactNode } from 'react';
import { RootState } from '../lib/store';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authSlice,
  hotel: hotelSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof configureStore>;
}

/**
 * Custom render function that wraps components with Redux Provider
 * Usage:
 * render(<YourComponent />, {
 *   preloadedState: { auth: { user: null } }
 * })
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {} as RootState,
    store = configureStore({
      reducer: persistedReducer,
      preloadedState: preloadedState as any,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
            ignoredPaths: ['register'],
          },
        }),
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        {children}
      </Provider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
