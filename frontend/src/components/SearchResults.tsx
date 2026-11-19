import type { SearchResponse } from '../types';
import ListingCard from './ListingCard';
import Pagination from './Pagination';

type Props = {
  data: SearchResponse | null;
  loading: boolean;
  error: string;
  hasBudget: boolean;
  page: number;
  onPageChange: (page: number) => void;
};

export default function SearchResults({ data, loading, error, hasBudget, page, onPageChange }: Props) {
  return (
    <section className="results" aria-live="polite">
      <div className="results-header">
        <h2>Search results</h2>
        {data && !loading && !error && <span>{data.total} listings found</span>}
      </div>
      {error && <div className="message error" role="alert">{error}</div>}
      {loading && <div className="message" role="status">Loading listings…</div>}
      {!loading && !error && data?.results.length === 0 && (
        <div className="message">No listings match your filters. Try broadening your search.</div>
      )}
      {!loading && !error && data?.results.map(listing => (
        <ListingCard key={`${listing.source}:${listing.id}`} listing={listing} hasBudget={hasBudget} />
      ))}
      {!loading && !error && data && (
        <Pagination page={data.page} totalPages={data.totalPages} onPageChange={onPageChange} />
      )}
    </section>
  );
}
