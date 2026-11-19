import type { Filters, SearchResponse } from './types';

export async function fetchListings(filters: Filters, page: number, signal?: AbortSignal): Promise<SearchResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value.trim()) params.set(key, value.trim());
  });
  params.set('page', String(page));
  const response = await fetch(`/api/listings/?${params}`, { signal });
  const payload: unknown = await response.json();
  if (!response.ok) {
    const data = payload as { errors?: Record<string, string[] | string> };
    const message = Object.entries(data.errors ?? {})
      .map(([field, detail]) => `${field}: ${Array.isArray(detail) ? detail.join(', ') : detail}`)
      .join(' | ');
    throw new Error(message || `Request failed (${response.status})`);
  }
  return payload as SearchResponse;
}
