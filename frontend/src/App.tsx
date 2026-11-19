import { useState, type SyntheticEvent } from 'react';
import SearchFilters from './components/SearchFilters';
import SearchResults from './components/SearchResults';
import { useListings } from './hooks/useListings';
import { defaultFilters, validateFilters } from './utils/filters';
import type { Filters } from './types';
import './styles.css';

export default function App() {
  const [draft, setDraft] = useState<Filters>({ ...defaultFilters });
  const [applied, setApplied] = useState<Filters>({ ...defaultFilters });
  const [page, setPage] = useState(1);
  const [validationError, setValidationError] = useState('');

  const { data, loading, error } = useListings(applied, page);

  function search(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    const issue = validateFilters(draft);
    if (issue) {
      setValidationError(issue);
      return;
    }

    setValidationError('');
    setPage(1);
    setApplied({ ...draft });
  }

  function clear() {
    setDraft({ ...defaultFilters });
    setApplied({ ...defaultFilters });
    setPage(1);
    setValidationError('');
  }

  return (
    <main className="container">
      <header>
        <p className="eyebrow">MLS PROPERTY DISCOVERY</p>
        <h1>Find your next home</h1>
        <p className="subtitle">
          Search properties across multiple listing feeds.
        </p>
      </header>

      <SearchFilters
        filters={draft}
        onChange={setDraft}
        onSearch={search}
        onClear={clear}
      />

      <SearchResults
        data={data}
        loading={loading}
        error={validationError || error}
        hasBudget={Boolean(applied.targetBudget.trim())}
        page={page}
        onPageChange={setPage}
      />
    </main>
  );
}
