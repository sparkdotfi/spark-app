import { useSuspenseQuery } from '@tanstack/react-query'

interface UseTimestampOptions {
  refreshIntervalInMs?: number
  stopRefetching?: boolean
}

export interface UseTimestampResults {
  timestamp: number
  timestampInMs: number
  updateTimestamp: () => void
}

// returns the current timestamp that does not change during the component lifecycle
// can be used to make calculations that depend on the current timestamp consistent over the whole app
export function useTimestamp({ refreshIntervalInMs, stopRefetching }: UseTimestampOptions = {}): UseTimestampResults {
  const now = Date.now()

  const { data, refetch } = useSuspenseQuery({
    queryKey: ['timestamp', refreshIntervalInMs],
    queryFn: () => {
      const timestampInMs = Date.now()
      return {
        timestampInMs,
        timestamp: Math.floor(timestampInMs / 1000),
      }
    },
    initialData: {
      timestamp: Math.floor(now / 1000),
      timestampInMs: now,
    },
    refetchOnWindowFocus: true, // recalculate timestamp when user returns to the app
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: stopRefetching ? false : refreshIntervalInMs,
  })

  return {
    timestamp: data.timestamp,
    timestampInMs: data.timestampInMs,
    updateTimestamp: refetch,
  }
}
