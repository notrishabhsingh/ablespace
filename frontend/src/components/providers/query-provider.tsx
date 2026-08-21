'use client';

import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

/**
 * Wraps the app in a React Query client. The client is created lazily in state
 * so it is instantiated once per browser session (not re-created on re-render,
 * and not shared across requests on the server).
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh briefly to avoid refetch storms while navigating.
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
