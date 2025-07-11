'use client';

import { clientEnv } from '@/env/client';
import { ThemeProvider } from 'next-themes';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';

const isPosthogEnabled =
  !!clientEnv.NEXT_PUBLIC_POSTHOG_KEY && !!clientEnv.NEXT_PUBLIC_POSTHOG_HOST;

if (typeof window !== 'undefined' && clientEnv.NEXT_PUBLIC_POSTHOG_KEY && clientEnv.NEXT_PUBLIC_POSTHOG_HOST) {
  posthog.init(clientEnv.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: 'always',
  });
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [posthogLoaded, setPosthogLoaded] = useState(false);

  useEffect(() => {
    if (isPosthogEnabled) {
      setPosthogLoaded(true);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          {isPosthogEnabled && posthogLoaded ? (
            <PostHogProvider client={posthog}>{children}</PostHogProvider>
          ) : (
            children
          )}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
