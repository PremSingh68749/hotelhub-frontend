import configureMockStore from 'redux-mock-store';
import { RootState } from '../../lib/store';

/**
 * Create a mock Redux store for testing
 * Usage in tests:
 * const store = createMockStore({
 *   auth: { user: { id: '1' }, token: 'test-token' }
 * })
 */
const mockStore = configureMockStore();

export function createMockStore(
  preloadedState: Partial<RootState>
) {
  return mockStore(preloadedState);
}

/**
 * Get mock store dispatch actions for assertion
 * Usage:
 * const store = createMockStore(initialState);
 * // ... perform action ...
 * const actions = store.getActions();
 */
export { mockStore };
