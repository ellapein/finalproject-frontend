import { useCallback, useEffect, useRef, useState } from 'react';
import { friendlyError } from '../services/authService';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Runs an async loader whenever `deps` change and exposes loading / error / data states. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const latest = useRef(0);

  useEffect(() => {
    const id = ++latest.current;
    setLoading(true);
    setError(null);
    loader()
      .then((result) => {
        if (id === latest.current) setData(result);
      })
      .catch((err) => {
        if (id === latest.current) setError(friendlyError(err));
      })
      .finally(() => {
        if (id === latest.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}
