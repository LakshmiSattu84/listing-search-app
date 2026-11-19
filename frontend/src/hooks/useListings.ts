import { useEffect, useState } from 'react';
import { fetchListings } from '../api';
import type { Filters, SearchResponse } from '../types';

export function useListings(filters: Filters, page: number) {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchListings(filters, page, controller.signal)
      .then(setData)
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setData(null);
          setError(err instanceof Error ? err.message : 'Unable to load listings.');
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filters, page]);

  return { data, loading, error };
}
