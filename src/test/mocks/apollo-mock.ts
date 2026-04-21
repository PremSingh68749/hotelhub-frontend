import { MockedResponse } from '@apollo/client/testing';
import { ReactNode, ReactElement } from 'react';

export interface MockApolloProps {
  mocks?: readonly MockedResponse[];
  children: ReactNode;
}

/**
 * Simple wrapper for testing without Apollo Provider
 * Usage in tests:
 * render(
 *   <MockApollo mocks={[mockQuery]}>
 *     <YourComponent />
 *   </MockApollo>
 * )
 */
export function MockApollo({
  mocks = [],
  children,
}: MockApolloProps) {
  // For now, just return children since we're not using Apollo for file uploads
  // This can be enhanced later if needed
  return children as ReactElement;
}

/**
 * Helper to create a mock GraphQL response
 * Usage:
 * const mockLoginMutation = createMockResponse(
 *   LOGIN_MUTATION,
 *   { login: { token: 'test-token', user: { id: '1' } } }
 * )
 */
export function createMockResponse(
  query: any,
  result: any,
  variables?: Record<string, any>
): MockedResponse {
  return {
    request: {
      query,
      variables,
    },
    result: {
      data: result,
    },
  };
}

/**
 * Helper to create a mock GraphQL error response
 */
export function createMockErrorResponse(
  query: any,
  error: string,
  variables?: Record<string, any>
): MockedResponse {
  return {
    request: {
      query,
      variables,
    },
    error: new Error(error),
  };
}
