import type { SyntheticEvent } from 'react';
import type { Filters } from '../types';

const fields: { key: keyof Filters; label: string; placeholder: string; type?: string }[] = [
  { key: 'city', label: 'City', placeholder: 'e.g. Springfield' },
  { key: 'keyword', label: 'Keyword in description', placeholder: 'e.g. fenced yard' },
  { key: 'minPrice', label: 'Minimum price ($)', placeholder: 'Any', type: 'number' },
  { key: 'maxPrice', label: 'Maximum price ($)', placeholder: 'Any', type: 'number' },
  { key: 'minBedrooms', label: 'Minimum bedrooms', placeholder: 'Any', type: 'number' },
  { key: 'targetBudget', label: 'Target budget ($)', placeholder: 'e.g. 500000', type: 'number' },
];

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onSearch: (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => void;
  onClear: () => void;
};

export default function SearchFilters({ filters, onChange, onSearch, onClear }: Props) {
  function update(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <form className="filters" onSubmit={onSearch} aria-label="Property search filters">
      <div className="fields">
        {fields.map(({ key, label, placeholder, type }) => (
          <label key={key}>
            {label}
            <input
              type={type ?? 'text'}
              min={type === 'number' ? (key === 'targetBudget' ? 1 : 0) : undefined}
              step={key === 'minBedrooms' ? 1 : undefined}
              value={filters[key]}
              placeholder={placeholder}
              onChange={event => update(key, event.target.value)}
            />
          </label>
        ))}
        <label>
          Results per page
          <select value={filters.pageSize} onChange={event => update('pageSize', event.target.value)}>
            {[3, 5, 10, 20].map(size => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      </div>
      <div className="actions">
        <button type="submit">Search listings</button>
        <button type="button" className="secondary" onClick={onClear}>Clear filters</button>
      </div>
    </form>
  );
}
