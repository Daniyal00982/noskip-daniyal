import { QueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Default fetcher for react-query  
export const defaultQueryFn = async (context: { queryKey: readonly unknown[] }) => {
  const [url] = context.queryKey;
  return apiRequest(url as string);
};

// Set default query function
queryClient.setQueryDefaults([], {
  queryFn: defaultQueryFn,
});

export { apiRequest };