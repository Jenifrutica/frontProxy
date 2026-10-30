import { useEffect, useState } from 'react';

export interface PollingState<T> {
  data: T | null;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Polls a fetcher every intervalMs. Requests never overlap: the next one is
 * scheduled after the previous one finishes. Polling pauses on a hidden tab.
 */
export function usePolling<T>(fetcher: () => Promise<T>, intervalMs: number): PollingState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    let timer = 0;

    const tick = async () => {
      if (document.hidden) {
        timer = window.setTimeout(tick, intervalMs);
        return;
      }
      try {
        const value = await fetcher();
        if (!active) {
          return;
        }
        setData(value);
        setError(null);
        setLastUpdated(new Date());
      } catch (cause) {
        if (!active) {
          return;
        }
        setError(cause instanceof Error ? cause.message : 'Error de red');
      }
      if (active) {
        timer = window.setTimeout(tick, intervalMs);
      }
    };

    void tick();

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [fetcher, intervalMs]);

  return { data, error, lastUpdated };
}
