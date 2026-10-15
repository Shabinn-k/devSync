import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        return failureCount < 1 && (status === undefined || status >= 500);
      },
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default queryClient;
