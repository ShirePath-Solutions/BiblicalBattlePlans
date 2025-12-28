import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (keep cached data longer for persistence)
      retry: 2, // Retry twice on failure
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
      refetchOnWindowFocus: true, // Refresh data when user returns to tab
      networkMode: 'offlineFirst', // Don't fail immediately if offline
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
})

// Persister to save cache to localStorage
export const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'biblical-battle-plans-cache',
})
